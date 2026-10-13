// Integration test operates ONLY in a disposable temp repo fixture. Never alters production.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import assert from "node:assert/strict";
import {execFileSync} from "node:child_process";
const root=process.cwd();
const temp=fs.mkdtempSync(path.join(os.tmpdir(),"hi-factory-test-"));
function run(script){return execFileSync(process.execPath,[script],{cwd:temp,encoding:"utf8"});}
try{
 fs.cpSync(path.join(root,"scripts"),path.join(temp,"scripts"),{recursive:true});
 fs.cpSync(path.join(root,"data"),path.join(temp,"data"),{recursive:true});
 fs.cpSync(path.join(root,"tests"),path.join(temp,"tests"),{recursive:true});
 fs.copyFileSync(path.join(root,"CNAME"),path.join(temp,"CNAME"));
 fs.mkdirSync(path.join(temp,"content/incoming"),{recursive:true});
 const plan=JSON.parse(fs.readFileSync(path.join(temp,"data/editorial-plan.json"),"utf8"));
 // Reset only the disposable fixture, never the actual production registry.
 // This allows the same 0-to-2 integration case to run after 2, 20 or 298
 // real posts have already been published.
 const fixturePublished=plan.items.filter(row=>row.status==="PUBLISHED");
 for(const item of fixturePublished){item.status="PLANNED";item.datePublished=null;}
 fs.writeFileSync(path.join(temp,"data/editorial-plan.json"),JSON.stringify(plan,null,2)+"\n");
 const statePath=path.join(temp,"data/factory-state.json"),fixtureState=JSON.parse(fs.readFileSync(statePath,"utf8"));
 fixtureState.publishedCount=0;
 fixtureState.checkpoint={lastArticleId:null,lastBatch:null,updatedAt:null};
 fixtureState.claimed=[];
 fixtureState.transactionPending=false;
 fs.writeFileSync(statePath,JSON.stringify(fixtureState,null,2)+"\n");
 const matrixPath=path.join(temp,"data/seo-master-matrix.json"),matrix=JSON.parse(fs.readFileSync(matrixPath,"utf8"));
 const previouslyPublishedPaths=new Set(fixturePublished.map(row=>row.outputPath));
 fs.writeFileSync(matrixPath,JSON.stringify(matrix.filter(item=>!previouslyPublishedPaths.has(item.slug)),null,2)+"\n");
 const row1=plan.items[0],row2=plan.items[1];
 const gearSentences=[
  "सड़क की हालत और मौसम देखकर वाहन चुनना जरूरी है ताकि अचानक ब्रेक लगाने की नौबत आने पर सुरक्षित नियंत्रण बना रहे।",
  "सवार को अपनी पहले की सवारी के अनुभव का आकलन करना चाहिए और अपरिचित तकनीक पर व्यस्त सड़क में अभ्यास नहीं करना चाहिए।",
  "जाँच के समय टायर के घिसने और हवा की सही स्थिति के साथ ब्रेक के दोनों नियंत्रणों पर ध्यान दिया जाना चाहिए।",
  "किराये की अवधि लिखित रूप में तय करने से वाहन लौटाने का समय और जिम्मेदारी दोनों पक्षों के लिए स्पष्ट रहती है।",
  "सवारी शुरू करने से पहले दोनों शीशों और सामने तथा पीछे के संकेतकों की काम करने की स्थिति परखना उपयोगी रहता है।",
  "ट्रैफ़िक संकेत पढ़कर गति को परिवेश के अनुसार रखना और दूसरे वाहन से पर्याप्त दूरी बनाए रखना आवश्यक है।",
  "निर्णय करते समय कीमत के साथ सुरक्षा जमा और उससे संबंधित वापसी की शर्तों को अलग से समझ लेना चाहिए।",
  "असुविधा या तकनीकी समस्या आने पर जोखिम उठाकर आगे बढ़ने के बजाय संबंधित सेवा से संपर्क करने की योजना होनी चाहिए।",
  "गियर के विकल्पों का इस्तेमाल उसी व्यक्ति को करना चाहिए जिसने वाहन की सही तकनीक का अभ्यास और प्रशिक्षण पाया हो।",
  "हल्के यातायात में नियंत्रित अभ्यास करके सवार ब्रेक और स्टीयरिंग से जुड़ी प्रतिक्रिया को बेहतर ढंग से पहचान सकता है।",
  "आवश्यक दस्तावेज़ों की वैधता वाहन श्रेणी पर निर्भर कर सकती है इसलिए वर्तमान आधिकारिक नियम समझने चाहिए।",
  "सुरक्षा उपकरणों का चुनाव आराम के साथ सही फिट पर आधारित होना चाहिए और हेलमेट ठीक से लगाना जरूरी है।",
  "यात्रा मार्ग की योजना बनाते समय पार्किंग की अनुमति तथा बड़े चौराहों और पुलों से जुड़े प्रतिबंध देखे जाने चाहिए।",
  "किराये के अनुबंध की शर्तें पढ़कर रकम का हिसाब समझना बाद में भुगतान संबंधी गलतफहमी को घटाता है।",
  "किसी अनजान रास्ते पर जाने से पहले रोशनी और मौसम का अनुमान लगाकर अपना समय व्यवस्थित रखना उपयोगी होता है।",
  "जहाँ यातायात बहुत घना हो वहाँ नए चालक को अधिक सावधानी रखनी चाहिए और अनावश्यक जल्दबाजी से बचना चाहिए।",
  "वाहन की पुरानी क्षति की फोटो सहमति से दर्ज करना लौटाने के समय स्थिति को पहचानने में मदद करता है।",
  "ईंधन और वाहन के उपकरणों की स्थिति प्रस्थान के समय जाँच लेना बीच रास्ते में परेशानी कम करने में सहायक है।",
  "यात्रा का मार्ग बदलने पर नए क्षेत्र के यातायात संकेतों को ध्यान से देखकर ही आगे बढ़ना उचित होता है।",
  "अनुभवी सवार भी दूसरे चालकों के व्यवहार का अनुमान लगाकर पर्याप्त स्थान छोड़ना और धैर्य बनाए रखना सीखते हैं।"
 ];
 const scooterSentences=[
  "स्वचालित स्कूटर चलाने वाले यात्री को सीट की ऊँचाई और पैर रखने की जगह देखकर अपनी सुविधा का निर्णय लेना चाहिए।",
  "मॉडल की तुलना करते समय केवल बाहरी रूप देखकर चयन न करें बल्कि वजन संतुलन और हैंडल की स्थिति भी जाँचें।",
  "वाहन पर अतिरिक्त सामान रखने से पहले उसके सुरक्षित रखने की व्यवस्था और अधिकतम भार से जुड़े निर्देश पूछना जरूरी है।",
  "भीड़ भरे रास्ते में अचानक दिशा बदलने से बचना और पहले से संकेत देना आसपास के लोगों के लिए अधिक सुरक्षित रहता है।",
  "स्कूटर की अलग अलग श्रेणियों के किराये में जमा राशि और समय की शर्तें समान मानना सही नहीं होता है।",
  "वाहन प्राप्त करते समय दोनों ब्रेक को पहचानना और धीरे गति पर उनके उपयोग से परिचित होना आवश्यक अभ्यास है।",
  "सवार और यात्री का संतुलन शुरू होने से पहले जाँचना चाहिए खासकर तब जब सामने की सड़क अधिक व्यस्त हो।",
  "बरसात में दृश्यता घट सकती है इसलिए गति धीमी रखकर दूरी बनाए रखना और टायर की स्थिति देखना जरूरी है।",
  "किराये की दुकान से उपलब्ध मॉडल के बारे में सीधे पूछकर किसी विज्ञापन की तस्वीर को पक्की उपलब्धता न समझें।",
  "सुरक्षा के लिए सही हेलमेट चुनकर उसकी पट्टी कसना और निकलने से पहले शीशों की स्थिति जाँचना चाहिए।",
  "बाइक का स्टैंड लगाते समय समतल और अनुमति वाले स्थान का चुनाव करने से दूसरे पैदल यात्रियों को बाधा कम होती है।",
  "ईंधन के स्तर को प्राप्ति और वापसी के समय दर्ज करना किसी अतिरिक्त भुगतान संबंधी विवाद को रोक सकता है।",
  "साप्ताहिक किराये की तुलना में दैनिक दर का साधारण गुणा हर मामले में वास्तविक देय रकम नहीं बताता है।",
  "स्कूटर की क्षमता के अनुसार अपनी दैनिक दूरी चुनकर उपयोग में आने वाली सड़कों के नियम समझना बेहतर है।",
  "किराये का अंतिम समय पहले से तय करने पर बदलाव होने की स्थिति में दुकान को समय से संदेश दिया जा सकता है।",
  "सवारी का अनुभव कम होने पर बड़े व्यस्त चौराहों के बजाय वैकल्पिक यात्रा का चुनाव करना अधिक उपयुक्त हो सकता है।",
  "वाहन में किसी असामान्य आवाज या चेतावनी का संकेत मिले तो उसे नजरअंदाज करने के बजाय सेवा से सलाह लेनी चाहिए।",
  "अनुबंध पर हस्ताक्षर से पहले जमा वापसी और नुकसान की जिम्मेदारी से जुड़े नियम को ध्यान से समझना आवश्यक है।",
  "खुले वाहन पर मौसम का प्रभाव अधिक हो सकता है इसलिए अपने मार्ग में रुकने और आराम करने की संभावना भी देखें।",
  "उपयुक्त श्रेणी के दस्तावेज़ और लाइसेंस का सवाल चालक और वाहन के संयोजन के अनुसार अलग हो सकता है।"
 ];
 const make=(r)=>{
   const sentences=r.id==="HI0001"?gearSentences:scooterSentences;
   return {id:r.id,title:r.title,language:"hi-IN",
    description:r.title+" के बारे में हनोई के यात्री के लिए स्पष्ट संदर्भ, वाहन जाँच, स्थानीय स्थिति और अनुबंध समझने के उपयोगी सवाल दिए गए हैं।",
    sections:Array.from({length:6},(_,i)=>({
      heading:r.title+" — खंड "+(i+1),
      paragraphs:Array.from({length:2},(_,k)=>{
        const p=i*2+k;
        const selection=Array.from({length:10},(_,z)=>sentences[(p+z*2)%sentences.length]);
        return r.title+" के विषय में विचार "+(p+1)+"। "+selection.join(" ");
      })
    })),
    sources:[{url:"https://chinhphu.vn/test-fixture-government",title:"Government test fixture only"},{url:"https://mps.gov.vn/test-fixture-other",title:"Other government test fixture"}],
    relatedPaths:[r.parentSilo,r.parentHub],
    editorialChecks:{factsReviewed:true,hindiReviewed:true,originalWriting:true}
   };
 };
 const site=JSON.parse(fs.readFileSync(path.join(temp,"data/site.json"),"utf8"));
 const mod=await import("../scripts/factory-core.mjs");
 const valid1=mod.validateDraft(make(row1),row1,site);
 assert.equal(valid1.pass,true,"valid test authoring should pass: "+JSON.stringify(valid1.errors));
 const badSource=make(row1);
 badSource.sources[1].url="https://www.example.com/not-a-source";
 const badSourceCheck=mod.validateDraft(badSource,row1,site);
 assert.ok(badSourceCheck.errors.some(x=>x.includes("placeholder example source")),"placeholder source should be refused");
 const boiler=make(row1);
 boiler.sections[0].paragraphs[1]=boiler.sections[0].paragraphs[0];
 const boilerCheck=mod.validateDraft(boiler,row1,site);
 assert.ok(boilerCheck.errors.some(x=>x.includes("duplicate or boilerplate")),"copied paragraph should be refused");
 const write=(row,v)=>fs.writeFileSync(path.join(temp,"content/incoming",row.id+".json"),JSON.stringify(v));
 write(row1,make(row1));
 const bad=make(row2);bad.sections=bad.sections.slice(0,1);write(row2,bad);
 run("scripts/factory-publish.mjs");
 assert.equal(JSON.parse(fs.readFileSync(path.join(temp,"data/factory-state.json"))).publishedCount,0,"bad pair must be atomic");
 assert.ok(!fs.existsSync(path.join(temp,"content/published",row1.id+".json")),"never partial pair");
 write(row2,make(row2));
 const result=run("scripts/factory-publish.mjs");
 console.log("PUBLISH_TEST_RESULT:",result);console.log("PUBLISH_TEST_REPORT:",fs.readFileSync(path.join(temp,"reports/factory-last-run.json"),"utf8"));
 const state=JSON.parse(fs.readFileSync(path.join(temp,"data/factory-state.json")));
 assert.equal(state.publishedCount,2);
 assert.equal(state.checkpoint.lastArticleId,row2.id);
 assert.ok(fs.existsSync(path.join(temp,"content/published",row1.id+".json")));
 assert.ok(fs.existsSync(path.join(temp,"content/published",row2.id+".json")));
 assert.ok(!fs.existsSync(path.join(temp,"content/incoming",row1.id+".json")));
 assert.ok(!fs.existsSync(path.join(temp,"content/incoming",row2.id+".json")));
 assert.equal(JSON.parse(fs.readFileSync(path.join(temp,"data/editorial-plan.json"))).items.filter(x=>x.status==="PUBLISHED").length,2);
 run("scripts/factory-preflight.mjs");
 run("scripts/build.mjs");
 run("tests/qa.mjs");
 const built=fs.readFileSync(path.join(temp,row1.outputPath.slice(1)+"index.html"),"utf8");
 assert.ok(built.includes('<h1>'+row1.title+'</h1>'),"Hindi article H1 missing");
 assert.ok(built.includes('"@type":"Article"'),"Article JSON-LD missing");
 const sitemap=fs.readFileSync(path.join(temp,"sitemap.xml"),"utf8");
 assert.ok(sitemap.includes("https://hi.rentbikehanoi.com"+row1.outputPath),"Article URL missing sitemap");
 run("scripts/factory-publish.mjs");
 assert.equal(JSON.parse(fs.readFileSync(path.join(temp,"data/factory-state.json"))).publishedCount,2,"idempotent retry");
 const reviewPlan=JSON.parse(fs.readFileSync(path.join(temp,"data/editorial-plan.json"),"utf8"));
 reviewPlan.items[2].status="REVIEW";
 fs.writeFileSync(path.join(temp,"data/editorial-plan.json"),JSON.stringify(reviewPlan,null,2));
 const beforeReview=fs.readFileSync(path.join(temp,"data/factory-state.json"),"utf8");
 const reviewResult=run("scripts/factory-publish.mjs");
 assert.ok(reviewResult.includes("MANUAL_REVIEW_REQUIRED"),"REVIEW must never autopublish");
 assert.equal(fs.readFileSync(path.join(temp,"data/factory-state.json"),"utf8"),beforeReview,"REVIEW must not mutate factory state");
 console.log("INTEGRATION PASS: bad pair held, valid pair published, canonical and sitemap generated, duplicate prose rejected, REVIEW blocked, retry idempotent");
}finally{process.chdir(root);fs.rmSync(temp,{recursive:true,force:true});}

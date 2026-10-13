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
 fs.mkdirSync(path.join(temp,"content/incoming"),{recursive:true});
 const plan=JSON.parse(fs.readFileSync(path.join(temp,"data/editorial-plan.json"),"utf8"));
 const row1=plan.items[0],row2=plan.items[1];
 const make=(r)=>({
   id:r.id,title:r.title,language:"hi-IN",
   description:r.title+" के बारे में हनोई के यात्री के लिए स्पष्ट संदर्भ, वाहन जाँच, स्थानीय स्थिति और अनुबंध समझने के उपयोगी सवाल दिए गए हैं।",
   sections:Array.from({length:6},(_,i)=>({
      heading:r.title+" — खंड "+(i+1),
      paragraphs:Array.from({length:2},(_,k)=>Array.from({length:9},(_,n)=>
         r.title+" हेतु यात्रा योजना में "+["सुरक्षा","अनुभव","वाहन","निर्णय","समझौता","निर्देश"][i]+" और व्यावहारिक परीक्षण पर ध्यान दें तथा जानकारी जाँचें। क्रम "+(n+1)+"।"
      ).join(" "))
   })),
   sources:[{url:"https://www.example.org/first",title:"Test only source"},{url:"https://www.example.com/second",title:"Test source two"}],
   relatedPaths:[r.parentSilo,r.parentHub],
   editorialChecks:{factsReviewed:true,hindiReviewed:true,originalWriting:true}
 });
 const write=(row,v)=>fs.writeFileSync(path.join(temp,"content/incoming",row.id+".json"),JSON.stringify(v));
 write(row1,make(row1));
 const bad=make(row2);bad.sections=bad.sections.slice(0,1);write(row2,bad);
 run("scripts/factory-publish.mjs");
 assert.equal(JSON.parse(fs.readFileSync(path.join(temp,"data/factory-state.json"))).publishedCount,0,"bad pair must be atomic");
 assert.ok(!fs.existsSync(path.join(temp,"content/published",row1.id+".json")),"never partial pair");
 write(row2,make(row2));
 const result=run("scripts/factory-publish.mjs");
 const state=JSON.parse(fs.readFileSync(path.join(temp,"data/factory-state.json")));
 assert.equal(state.publishedCount,2);
 assert.equal(state.checkpoint.lastArticleId,row2.id);
 assert.ok(fs.existsSync(path.join(temp,"content/published",row1.id+".json")));
 assert.ok(fs.existsSync(path.join(temp,"content/published",row2.id+".json")));
 assert.ok(!fs.existsSync(path.join(temp,"content/incoming",row1.id+".json")));
 assert.ok(!fs.existsSync(path.join(temp,"content/incoming",row2.id+".json")));
 assert.equal(JSON.parse(fs.readFileSync(path.join(temp,"data/editorial-plan.json"))).items.filter(x=>x.status==="PUBLISHED").length,2);
 run("scripts/factory-preflight.mjs");
 run("scripts/factory-publish.mjs");
 assert.equal(JSON.parse(fs.readFileSync(path.join(temp,"data/factory-state.json"))).publishedCount,2,"idempotent retry");
 console.log("INTEGRATION PASS: failed pair held; valid pair committed; checkpoint exact; retry idempotent");
}finally{process.chdir(root);fs.rmSync(temp,{recursive:true,force:true});}

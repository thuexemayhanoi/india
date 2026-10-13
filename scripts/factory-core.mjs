import fs from "node:fs";
import path from "node:path";

export const readJSON = file => JSON.parse(fs.readFileSync(file,"utf8"));
export const writeJSON = (file,obj) => {fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(obj,null,2)+"\n");};
export const normalize = s => String(s||"").normalize("NFKC").toLocaleLowerCase("hi-IN").replace(/[\p{P}\p{S}\s]+/gu," ").trim();
export const wordCount = s => String(s).trim().split(/\s+/u).filter(Boolean).length;
export const plain = a => (a.sections||[]).flatMap(s=>[s.heading,...(s.paragraphs||[]),...(s.subsections||[]).flatMap(t=>[t.heading,...(t.paragraphs||[])])]).join("\n");
export const slugText = s => String(s).normalize("NFKC").toLocaleLowerCase("hi-IN").replace(/[^\p{L}\p{M}\p{N}]+/gu,"-").replace(/^-|-$/g,"");
export function sitePlan(){
 const site=readJSON("data/site.json"),plan=readJSON("data/editorial-plan.json"),state=readJSON("data/factory-state.json");
 return {site,plan,state};
}
export function publishedRecords(){
 const folder="content/published";
 if(!fs.existsSync(folder))return [];
 return fs.readdirSync(folder).filter(x=>/^HI\d{4}\.json$/.test(x)).sort().map(f=>readJSON(path.join(folder,f)));
}
export function assertPlan(site,plan,articles=[]){
 const groups=new Map(site.groups.map(g=>[g.path,g])),idSet=new Set(),urlSet=new Set(site.groups.map(g=>g.path)),titles=new Map(site.groups.map(g=>[normalize(g.title),g.path])),errors=[];
 if(plan.items.length>300||plan.targetArticleCap!==300)errors.push("300 cap mismatch");
 if(plan.items.length!==300)errors.push("expected 300 topic rows");
 for(let n=0;n<plan.items.length;n++){
  const row=plan.items[n],expectedId="HI"+String(n+1).padStart(4,"0");
  if(row.id!==expectedId)errors.push("id order "+row.id);
  if(idSet.has(row.id))errors.push("duplicate id "+row.id);idSet.add(row.id);
  if(row.batch!=="B"+String(Math.floor(n/50)+1).padStart(2,"0"))errors.push("batch order "+row.id);
  if(!groups.has(row.parentSilo)||groups.get(row.parentSilo).role!=="SILO")errors.push("invalid SILO "+row.id);
  if(groups.get(row.parentSilo)?.parent!==row.parentHub)errors.push("wrong Hub "+row.id);
  if(!row.outputPath.startsWith(row.parentSilo)||!row.outputPath.endsWith("/"))errors.push("invalid output "+row.id);
  if(urlSet.has(row.outputPath))errors.push("duplicate output "+row.id);urlSet.add(row.outputPath);
  const title=normalize(row.title);
  if(titles.has(title))errors.push("duplicate normalized intent "+row.id+" collides "+titles.get(title));
  titles.set(title,row.id);
  if(!["PLANNED","REVIEW","PUBLISHED"].includes(row.status))errors.push("bad status "+row.id);
 }
 const publishedSet=new Set();
 for(const a of articles){
  if(publishedSet.has(a.id))errors.push("duplicate published "+a.id);publishedSet.add(a.id);
  const p=plan.items.find(x=>x.id===a.id);
  if(!p||p.status!=="PUBLISHED"||a.path!==p.outputPath)errors.push("published drift "+a.id);
 }
 for(const row of plan.items)if(row.status==="PUBLISHED"&&!publishedSet.has(row.id))errors.push("PUBLISHED row without file "+row.id);
 if(errors.length)throw new Error(errors.slice(0,15).join("; ")+(errors.length>15?"; +"+(errors.length-15)+" more":""));
 return {planned:plan.items.length,published:publishedSet.size,remaining:plan.items.length-publishedSet.size};
}
function gramSet(s,n=5){
 const w=normalize(s).split(" ").filter(x=>x.length>2),grams=new Set();
 for(let i=0;i<=w.length-n;i++)grams.add(w.slice(i,i+n).join(" "));
 return grams;
}
export function similarity(a,b){
 const A=gramSet(a),B=gramSet(b);
 if(!A.size||!B.size)return 0;
 let same=0;for(const x of A)if(B.has(x))same++;
 return same/Math.min(A.size,B.size);
}
function officialURL(u){try{const h=new URL(u).hostname.toLowerCase();return h.endsWith(".gov.vn")||h==="gov.vn"||h.endsWith(".chinhphu.vn")||h==="chinhphu.vn"||h.endsWith(".moj.gov.vn")||h.endsWith(".mps.gov.vn");}catch{return false;}}
export function validateDraft(article,row,site,published=[]){
 const errors=[];const warn=[];
 if(article.id!==row.id)errors.push("id mismatch");
 if(article.title!==row.title)errors.push("title must equal editorial plan");
 if(article.language!=="hi-IN")errors.push("language must be hi-IN");
 if(article.outputPath && article.outputPath!==row.outputPath)errors.push("URL change forbidden");
 if(!article.description||article.description.trim().length<85||article.description.length>205)errors.push("meta description 85-205 chars");
 if(!Array.isArray(article.sections)||article.sections.length<6)errors.push("minimum 6 unique H2 sections");
 const sections=Array.isArray(article.sections)?article.sections:[],heads=new Set(),text=[];
 for(const sec of sections){
  if(!sec?.heading||!Array.isArray(sec.paragraphs)||sec.paragraphs.length<2)errors.push("each H2 needs heading + >=2 paragraphs");
  const key=normalize(sec.heading);if(heads.has(key))errors.push("duplicate H2");heads.add(key);
  for(const p of sec.paragraphs||[]){if(typeof p!=="string"||p.trim().length<75)errors.push("paragraph too short");else text.push(p);}
  for(const ss of sec.subsections||[]){if(!ss.heading||!Array.isArray(ss.paragraphs))errors.push("invalid H3");else text.push(...ss.paragraphs);}
 }
 const normParagraphs=text.map(normalize);
 if(new Set(normParagraphs).size!==normParagraphs.length)errors.push("duplicate or boilerplate paragraphs");
 for(const paragraph of text){
   const tokens=normalize(paragraph).split(" ").filter(Boolean),f=new Map();
   for(let i=0;i+7<tokens.length;i++){
     const gram=tokens.slice(i,i+8).join(" "),repeat=(f.get(gram)||0)+1;f.set(gram,repeat);
     if(repeat>=4){errors.push("repeated eight-word phrase within paragraph");break;}
   }
 }
 const body=text.join("\n"),wc=wordCount(body);
 if(wc<850)errors.push("Hindi body word count "+wc+" < 850");
 const devanagari=(body.match(/[\u0900-\u097f]/gu)||[]).length;
 if(devanagari<Math.max(950,body.replace(/\s/g,"").length*.30))errors.push("insufficient Hindi Devanagari writing");
 const urls=(article.sources||[]).map(s=>s?.url).filter(Boolean);
 if(new Set(urls).size<2)errors.push("minimum two distinct sources");
 const sourceHosts=new Set();
 for(const source of article.sources||[]){
   if(!source || typeof source.url!=="string" || typeof source.title!=="string" || source.title.trim().length<5)errors.push("source requires title and URL");
   try{
     const host=new URL(source.url).hostname.toLowerCase();
     if(/(^|\.)example\.(com|org|net)$/.test(host))errors.push("placeholder example source forbidden");
     sourceHosts.add(host.replace(/^www\./,""));
   }catch{}
 }
 if(sourceHosts.size<2)errors.push("sources should be from at least two independent hostnames");
 for(const u of urls){try{const z=new URL(u);if(z.protocol!=="https:"||z.username||z.password)errors.push("invalid HTTPS source "+u);}catch{errors.push("bad source URL")}}
 if(row.requiresOfficialSources&&!urls.some(officialURL))errors.push("official VN source needed for regulatory topic");
 const links=article.relatedPaths||[];
 if(new Set(links).size<2)errors.push("at least two relevant internal links");
 for(const x of links)if(!site.groups.some(g=>g.path===x)||x===row.outputPath)errors.push("invalid related path "+x);
 const check=article.editorialChecks||{};
 if(check.factsReviewed!==true||check.hindiReviewed!==true||check.originalWriting!==true)errors.push("external writer must attest fact, language and originality review");
 const claims=/हम (?:बिना जमा|बिना डिपॉजिट|मुफ्त डिलीवरी)|गारंटी से (?:टॉप|सबसे सस्ता)|24\/7 (?:डिलीवरी|सहायता)/u;
 if(claims.test(body))errors.push("unverified business guarantee");
 for(const past of published){const sim=similarity(body,plain(past));if(sim>.67){errors.push("semantic duplication likely with "+past.id+" score "+sim.toFixed(2));break;}}
 const score=(wc>=900?30:wc>=850?25:0)+(sections.length>=6?15:0)+(urls.length>=2?15:0)+(devanagari>=950?15:0)+(links.length>=2?10:0)+(check.factsReviewed&&check.hindiReviewed&&check.originalWriting?15:0);
 if(score<80)errors.push("quality/SEO score "+score+" below 80");
 return {pass:!errors.length,score,wordCount:wc,errors,warnings:warn};
}
export function publicArticle(row,article,at){
 return {...article,id:row.id,title:row.title,path:row.outputPath,parent:row.parentSilo,parentSilo:row.parentSilo,parentHub:row.parentHub,role:"SUPPORT",lead:article.description,publishedAt:at};
}

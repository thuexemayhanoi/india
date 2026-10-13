// Transactional publisher. Writes working tree ONLY. GitHub Actions does a single atomic commit/push.
import fs from "node:fs";
import path from "node:path";
import {sitePlan,publishedRecords,assertPlan,readJSON,writeJSON,validateDraft,publicArticle} from "./factory-core.mjs";
const {site,plan,state}=sitePlan();
if(state.enabled!==true||state.autoPublish!==true)throw Error("Publisher is disabled");
if(state.transactionPending)throw Error("Unfinished transaction: stop and investigate");
const existing=publishedRecords();assertPlan(site,plan,existing);
const incoming="content/incoming";
const maxFiles=10;
if(!fs.existsSync(incoming)){console.log("No incoming directory; 0 articles published");process.exit(0);}
const files=fs.readdirSync(incoming).filter(f=>/^HI\d{4}\.json$/.test(f)).sort();
if(files.length>maxFiles)throw Error("Maximum ten incoming article files per workflow run");
const filesById=new Map(files.map(f=>[f.slice(0,-5),f]));
const batch=plan.items.find(x=>x.status!=="PUBLISHED")?.batch;
if(!batch){console.log("ALL 300 PUBLISHED");process.exit(0);}
const candidates=plan.items.filter(r=>r.batch===batch && r.status!=="PUBLISHED").slice(0,10);
const accepted=[],blocked=[];
for(let i=0;i<candidates.length;i+=2){
 const pair=candidates.slice(i,i+2);
 if(pair.length<2)break;
 if(!pair.every(r=>filesById.has(r.id))){ // Never skip an earlier pair.
  blocked.push({ids:pair.map(x=>x.id),reason:"WAIT_FOR_CONSECUTIVE_PAIR"});
  break;
 }
 const publishedInPair=[];
 for(const row of pair){
  try{
   const raw=readJSON(path.join(incoming,filesById.get(row.id)));
   const checked=validateDraft(raw,row,site,[...existing,...accepted.map(x=>x.content),...publishedInPair.map(x=>x.content)]);
   if(!checked.pass)blocked.push({ids:[row.id],reason:"QA_REVIEW",score:checked.score,issues:checked.errors});
   else publishedInPair.push({row,raw,checked,content:raw});
  }catch(err){blocked.push({ids:[row.id],reason:"JSON_INVALID",message:String(err)});}
 }
 if(publishedInPair.length!==pair.length)break;
 accepted.push(...publishedInPair);
}
if(accepted.length){
 const timestamp=new Date().toISOString();
 for(const {row,raw,checked} of accepted){
  const destination=path.join("content/published",row.id+".json");
  if(fs.existsSync(destination)||row.status==="PUBLISHED")throw Error("Published file immutable "+row.id);
  const file=publicArticle(row,raw,timestamp);
  writeJSON(destination,file);
  fs.unlinkSync(path.join(incoming,filesById.get(row.id)));
  row.status="PUBLISHED";row.datePublished=timestamp;
 }
 state.publishedCount+=accepted.length;
 state.checkpoint={lastArticleId:accepted.at(-1).row.id,lastBatch:batch,updatedAt:timestamp};
 state.updatedAt=timestamp;
 const matrix=readJSON("data/seo-master-matrix.json");
 for(const {row} of accepted)matrix.push({url:site.baseUrl+row.outputPath,slug:row.outputPath,language:"hi-IN",keyword:row.title,role:"SUPPORT",parent:row.parentSilo,searchIntent:row.searchIntent,status:"PUBLISHED",decision:"KEEP",published:true,gscEvidence:null,collisionStatus:"PASSED_AUTOMATED_QA",nextAction:"MONITOR_PERFORMANCE"});
 writeJSON("data/seo-master-matrix.json",matrix);
 writeJSON("data/editorial-plan.json",plan);
 writeJSON("data/factory-state.json",state);
}
writeJSON("reports/factory-last-run.json",{batch,accepted:accepted.map(x=>({id:x.row.id,score:x.checked.score,words:x.checked.wordCount})),blocked,remaining:plan.items.filter(x=>x.status!=="PUBLISHED").length,at:new Date().toISOString()});
console.log(JSON.stringify({batch,published:accepted.length,ids:accepted.map(x=>x.row.id),blocked},null,2));

import fs from "node:fs";
import {execFileSync} from "node:child_process";
import {sitePlan} from "./factory-core.mjs";
// Only import requested IDs from untrusted writer-inbox; nothing else is executed.
const {plan}=sitePlan(),batch=plan.items.find(x=>x.status!=="PUBLISHED")?.batch;
if(!batch){console.log("All 300 already published");process.exit(0);}
const expected=plan.items.filter(x=>x.batch===batch&&x.status!=="PUBLISHED").slice(0,10).map(x=>x.id);
const paths=execFileSync("git",["ls-tree","-r","--name-only","origin/writer-inbox","--","content/incoming/"],{encoding:"utf8"}).trim().split("\n").filter(Boolean);
for(const name of paths)if(!/^content\/incoming\/HI\d{4}\.json$/.test(name))throw Error("Unexpected writer path: "+name);
const allowed=new Set(paths);fs.mkdirSync("content/incoming",{recursive:true});
let imported=[];
for(const id of expected){
 const file="content/incoming/"+id+".json";
 if(!allowed.has(file))continue;
 const text=execFileSync("git",["show","origin/writer-inbox:"+file],{encoding:"utf8",maxBuffer:250000});
 if(Buffer.byteLength(text,"utf8")>220000)throw Error("Oversized writer file "+id);
 fs.writeFileSync(file,text);imported.push(id);
}
console.log(JSON.stringify({batch,expected,imported,mode:"SAFE_EXTERNAL_INBOX"},null,2));

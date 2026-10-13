// Deterministic READ-ONLY plan / repo guard, also runs before publisher.
import fs from "node:fs";
import assert from "node:assert/strict";
import {sitePlan,publishedRecords,assertPlan,normalize} from "./factory-core.mjs";
const {site,plan,state}=sitePlan();
const pub=publishedRecords();
const status=assertPlan(site,plan,pub);
assert.equal(site.groups.filter(p=>p.role==="PILLAR").length,1);
assert.equal(site.groups.filter(p=>p.role==="HUB").length,6);
assert.equal(site.groups.filter(p=>p.role==="SILO").length,24);
assert.deepEqual(new Set(site.nav),new Set(site.groups.filter(p=>p.role==="HUB").map(p=>p.path)));
assert.equal(state.publishedCount,pub.length,"checkpoint count drift");
if(state.publishedCount>0)assert.ok(state.checkpoint.lastArticleId,"Missing last article checkpoint");
if(state.publishedCount===0)assert.equal(state.checkpoint.lastArticleId,null,"Unexpected checkpoint at zero");
assert.equal(state.immutablePublishedUrls,true);
assert.equal(state.transactionPending,false);
const matrix=JSON.parse(fs.readFileSync("data/seo-master-matrix.json","utf8"));
assert.deepEqual(new Set(matrix.map(m=>m.slug)),new Set([...site.groups.map(p=>p.path),...pub.map(p=>p.path)]),"matrix drift");
const claimed=new Set();
for(const x of state.claimed||[]){
 const id=typeof x==="string"?x:x?.id;
 assert.ok(typeof id==="string"&&/^HI\d{4}$/.test(id),"invalid writer claim entry");
 assert.ok(plan.items.some(r=>r.id===id&&r.status!=="PUBLISHED"),"claim "+id+" is already PUBLISHED");
 assert.ok(!claimed.has(id),"duplicate writer claim");claimed.add(id);
 if(typeof x==="object"&&x.claimedAt!=null){const ts=Date.parse(x.claimedAt);assert.ok(!Number.isNaN(ts),"claim "+id+" claimedAt must be ISO 8601");assert.ok(ts<=Date.now()+60000,"claim "+id+" claimedAt is in the future");}
}
console.log(JSON.stringify({phase:state.phase,writerEnabled:state.writerEnabled,autoPublish:state.autoPublish,topics:plan.items.length,...status,hubs:6,silos:24,mode:"READ_ONLY"},null,2));

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
assert.equal(state.immutablePublishedUrls,true);
assert.equal(state.transactionPending,false);
const matrix=JSON.parse(fs.readFileSync("data/seo-master-matrix.json","utf8"));
assert.deepEqual(new Set(matrix.map(m=>m.slug)),new Set([...site.groups.map(p=>p.path),...pub.map(p=>p.path)]),"matrix drift");
const claimed=new Set();
for(const x of state.claimed||[]){assert.ok(!claimed.has(x),"duplicate writer claim");claimed.add(x);}
console.log(JSON.stringify({phase:state.phase,writerEnabled:state.writerEnabled,autoPublish:state.autoPublish,topics:plan.items.length,...status,hubs:6,silos:24,mode:"READ_ONLY"},null,2));

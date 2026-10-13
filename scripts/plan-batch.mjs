// DRY RUN batch summary without any writes.
import assert from "node:assert/strict";
import {sitePlan,assertPlan,publishedRecords} from "./factory-core.mjs";
const {site,plan,state}=sitePlan();
const id=process.argv.find(a=>/^B0[1-6]$/.test(a))||"B01";
assertPlan(site,plan,publishedRecords());
const rows=plan.items.filter(x=>x.batch===id);
assert.equal(rows.length,50);
const totals=Object.fromEntries(["PLANNED","REVIEW","PUBLISHED"].map(s=>[s,rows.filter(x=>x.status===s).length]));
console.log(JSON.stringify({mode:"READ_ONLY",batch:id,rows:50,...totals,checkpoint:state.checkpoint},null,2));

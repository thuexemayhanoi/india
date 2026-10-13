import assert from "node:assert/strict";
import {sitePlan,publishedRecords,assertPlan,normalize,similarity,validateDraft} from "../scripts/factory-core.mjs";
const {site,plan,state}=sitePlan(),pub=publishedRecords();
const status=assertPlan(site,plan,pub);
assert.equal(plan.items.length,300);
assert.equal(status.published,pub.length);
assert.equal(state.publishedCount,pub.length);
assert.equal(plan.items.filter(x=>x.batch==="B06").length,50);
const seen=new Set();
for(const row of plan.items){
 assert.ok(!seen.has(row.outputPath));seen.add(row.outputPath);
 assert.ok(row.outputPath.startsWith(row.parentSilo));
 assert.equal(row.slug, row.outputPath.slice(row.parentSilo.length,-1));
 assert.ok(row.title.match(/[\u0900-\u097f]/u));
}
assert.ok(similarity("हनोई में मोटरबाइक सुरक्षित चलाने का तरीका","हनोई में मोटरबाइक सुरक्षित चलाने का तरीका")>.95);
assert.ok(similarity("गियर बाइक के ब्रेक और टायर की जाँच","स्कूटर के किराये में जमा और अनुबंध")<.5);
console.log("Factory unit QA PASS",plan.items.length,"topics, published:",pub.length);

// Read-only batch planner, no claims, no transaction writes, no AI calls.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const plan=JSON.parse(fs.readFileSync('data/editorial-plan.json','utf8'));
const state=JSON.parse(fs.readFileSync('data/factory-state.json','utf8'));
const batchId=process.argv.find(x=>/^B\d{2}$/.test(x))||'B01';
const index=plan.batchIds.indexOf(batchId);
assert.ok(index>=0,'unknown batch '+batchId);
assert.equal(plan.targetArticleCap,300);
assert.equal(plan.batchSize,50);
assert.equal(state.writerEnabled,false);
assert.equal(state.autoPublish,false);
const rows=plan.items.filter(x=>x.batch===batchId);
assert.ok(rows.length<=plan.batchSize,'batch cap exceeded');
assert.equal(new Set(rows.map(x=>x.id)).size,rows.length,'duplicate article id');
assert.equal(new Set(rows.map(x=>x.outputPath)).size,rows.length,'duplicate output path');
for(const item of rows){assert.ok(item.primaryIntent&&item.parentHub&&item.sourcesVerified&&item.uniqueValue,'unverified item '+item.id);}
const result={mode:'DRY_RUN_READ_ONLY',batch:batchId,batchNumber:index+1,batchCap:50,planned:rows.length,queueSize:0,writersActive:false,productionUnchanged:true,articlesReady:rows.filter(x=>x.approved===true).length,checkpoint:state.checkpoint,nextStep:rows.length===0?'RESEARCH_AND_APPROVE_EDITORIAL_PLAN':'MANUAL_REVIEW_QUEUE'};
console.log(JSON.stringify(result,null,2));

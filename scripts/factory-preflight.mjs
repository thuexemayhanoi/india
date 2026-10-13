// Phase 1/2 bridge: READ-ONLY taxonomy/editorial collision gate. Does not publish or write files.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const site=JSON.parse(fs.readFileSync('data/site.json','utf8'));
const plan=JSON.parse(fs.readFileSync('data/editorial-plan.json','utf8'));
const states=JSON.parse(fs.readFileSync('data/factory-state.json','utf8'));
const matrix=JSON.parse(fs.readFileSync('data/seo-master-matrix.json','utf8'));
const policy=JSON.parse(fs.readFileSync('data/content-collision-spec.json','utf8'));
const index=new Map(site.groups.map(p=>[p.path,p]));
const registry=new Map();
function clean(s){return String(s||'').normalize('NFKC').toLocaleLowerCase('hi-IN').trim().replace(/[\\p{P}\\p{S}\\s]+/gu,' ');}
for(const p of site.groups){
 assert.ok(p.path.startsWith('/')&&p.path.endsWith('/'),'invalid route '+p.path);
 assert.ok(!registry.has(p.path),'duplicate route');
 registry.set(p.path,p);
 if(p.parent)assert.equal(index.get(p.parent)?.role,'HUB','Silo parent must be Hub: '+p.path);
}
assert.equal(site.groups.filter(p=>p.role==='PILLAR').length,1);
assert.equal(site.nav.length,site.groups.filter(p=>p.role==='HUB').length);
assert.deepEqual(new Set(matrix.map(x=>x.slug)),new Set(site.groups.map(x=>x.path)));
assert.equal(plan.targetArticleCap,300);
assert.ok(plan.items.length<=plan.targetArticleCap,'article cap exceeded');
assert.equal(states.writerEnabled,false,'writer activation requires explicit approval');
assert.equal(states.autoPublish,false,'automatic publish blocked');
assert.equal(states.enabled,false,'factory must remain disabled');
const used=new Map();for(const p of site.groups)used.set(clean(p.title),p.path);
const decisions=[];
for(const item of plan.items){
 assert.ok(item.id&&item.title&&item.parentHub&&item.outputPath&&item.primaryIntent,'malformed topic');
 assert.ok(index.has(item.parentHub),'unknown Hub '+item.parentHub);
 const path=String(item.outputPath);
 const key=clean(item.title);
 let decision='ALLOW_CREATE', reason='';
 if(registry.has(path)){decision='REJECT_DUPLICATE';reason='existing route';}
 else if(used.has(key)){decision='REVIEW_COLLISION';reason='title normalized collision with '+used.get(key);}
 else if(!item.sourcesVerified||!item.uniqueValue){decision='REVIEW_COLLISION';reason='insufficient evidence/unique value';}
 if(item.parentSilo&&!index.has(item.parentSilo)){decision='REVIEW_COLLISION';reason='unknown parent Silo';}
 decisions.push({id:item.id,decision,reason});
 used.set(key,path);
}
if(decisions.some(x=>x.decision!=='ALLOW_CREATE')){console.error(JSON.stringify(decisions,null,2));process.exitCode=1;}
console.log(JSON.stringify({mode:'READ_ONLY',siteRoutes:site.groups.length,hubs:site.groups.filter(p=>p.role==='HUB').length,silos:site.groups.filter(p=>p.role==='SILO').length,planned:plan.items.length,targetCap:plan.targetArticleCap,writerEnabled:false,decisions},null,2));

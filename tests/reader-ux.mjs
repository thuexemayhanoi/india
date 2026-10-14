// Reader features regression: only published data and same-SILO neighbors.
import fs from "node:fs";
import assert from "node:assert/strict";
const site=JSON.parse(fs.readFileSync("data/site.json","utf8"));
const pub=fs.readdirSync("content/published").filter(x=>/^HI\d{4}\.json$/.test(x)).sort().map(x=>JSON.parse(fs.readFileSync("content/published/"+x,"utf8")));
const flags=site.features||{};
const index=JSON.parse(fs.readFileSync("assets/search/index.json","utf8"));
assert.equal(index.language,"hi-IN");
assert.equal(index.count,pub.length);
assert.equal(index.e.length,pub.length);
assert.equal(new Set(index.e.map(x=>x.u)).size,pub.length,"Duplicate search URL");
const paths=new Set(pub.map(x=>x.path));
for(const row of index.e){
 assert.ok(paths.has(row.u),"Draft or missing route in search index: "+row.u);
 assert.ok(row.t&&row.d&&row.k&&Array.isArray(row.h),"Incomplete index record");
 const item=pub.find(x=>x.path===row.u);
 const headings=(item.sections||[]).flatMap(s=>[s.heading,...(s.subsections||[]).map(a=>a.heading)]).filter(Boolean);
 assert.deepEqual(row.h,headings,"H2/H3 index drift: "+row.u);
}
const groups=new Map();
for(const item of pub){const list=groups.get(item.parentSilo)||[];list.push(item);groups.set(item.parentSilo,list)}
for(const page of pub){
 const html=fs.readFileSync(page.path.slice(1)+"index.html","utf8");
 const siblings=groups.get(page.parentSilo),pos=siblings.findIndex(x=>x.id===page.id);

 assert.ok(!html.includes('<span aria-current="page">undefined</span>'),"Article breadcrumb undefined: "+page.id);
 const safeTitle=page.title.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
 assert.ok(html.includes('<span aria-current="page">'+safeTitle+'</span>'),"Article breadcrumb title mismatch: "+page.id);
 const schemaMatch=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
 assert.ok(schemaMatch,"Missing schema: "+page.id);
 const breadcrumb=JSON.parse(schemaMatch[1])["@graph"].find(x=>x["@type"]==="BreadcrumbList");
 assert.ok(breadcrumb&&breadcrumb.itemListElement.length>=2,"Missing BreadcrumbList: "+page.id);
 assert.ok(breadcrumb.itemListElement.every(x=>typeof x.name==="string"&&x.name.trim()),"Breadcrumb schema label missing: "+page.id);
 assert.equal(breadcrumb.itemListElement.at(-1).name,page.title,"Article breadcrumb schema title mismatch: "+page.id);

 if(flags.previousNext!==false){
  const previous=siblings[pos-1],next=siblings[pos+1];
  assert.equal((html.match(/class="article-prev-next"/g)||[]).length,siblings.length>1?1:0);
  assert.equal((html.match(/rel="prev"/g)||[]).length,previous?1:0);
  assert.equal((html.match(/rel="next"/g)||[]).length,next?1:0);
  if(previous)assert.ok(html.includes('rel="prev" href="'+previous.path+'"'));
  if(next)assert.ok(html.includes('rel="next" href="'+next.path+'"'));
 }
 if(flags.authorBox!==false){
  assert.ok(html.includes('class="article-publisher"'));
  assert.ok(html.includes(site.brand));
  assert.ok(html.includes(site.contact.phone));
  assert.ok(html.includes(site.publisher.logoText));
 }
 if(flags.smartSearch!==false){
  assert.ok(html.includes('id="site-search-toggle"'));
  assert.ok(html.includes('id="site-search-panel"'));
 }
}
const root=fs.readFileSync("index.html","utf8");
assert.equal(root.includes('id="site-search-toggle"'),flags.smartSearch!==false);
assert.equal(root.includes('id="site-search-panel"'),flags.smartSearch!==false);
const frontend=fs.readFileSync("assets/js/site-search.js","utf8");
assert.match(frontend,/fetch\("\/assets\/search\/index.json"/,"Search index must load only from user-open action");
assert.ok(frontend.indexOf("function open()")<frontend.indexOf("button.addEventListener"),"Search handler missing");
assert.ok(!root.includes('<script src="/assets/chat/search-index.json"'),"Chatbot data must not be preloaded");
assert.ok(!frontend.includes("innerHTML"),"Search results must be safely rendered with textContent");
assert.ok(root.includes('id="menu-toggle"')&&root.includes('id="chat-fab"')===false,"Floating widgets must remain lazy-loaded");
console.log("Reader UX PASS:",pub.length,"indexed published articles, author boxes and safe silo navigation");

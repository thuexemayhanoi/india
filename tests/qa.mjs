import fs from "node:fs";import path from "node:path";import assert from "node:assert/strict";
const data=JSON.parse(fs.readFileSync("data/site.json","utf8"));const ps=data.groups;const pubFolder="content/published";
const published=fs.existsSync(pubFolder)?fs.readdirSync(pubFolder).filter(f=>/^HI\d{4}\.json$/.test(f)).map(f=>JSON.parse(fs.readFileSync(path.join(pubFolder,f),"utf8"))):[];
const paths=new Set([...ps,...published].map(p=>p.path));assert.equal(paths.size,ps.length,"duplicate URL");
assert.equal(ps.filter(p=>p.path==="/").length,1);assert.equal(ps.filter(p=>p.role==="PILLAR").length,1);
for(const p of ps){if(p.parent)assert.ok(paths.has(p.parent),p.path+" parent missing");const f=p.path==="/"? "index.html":p.path.slice(1)+"index.html";assert.ok(fs.existsSync(f),f);let s=fs.readFileSync(f,"utf8");assert.match(s,/<html lang="hi-IN">/);assert.ok(s.includes('<link rel="canonical" href="'+data.baseUrl+p.path+'"'));assert.ok(s.includes('type="application/ld+json"'));assert.ok(s.includes('<h1>'));assert.ok(s.includes('href="/assets/site.css"'));assert.ok(s.includes('href="/संपर्क/"'));assert.ok(!s.includes("Lorem ipsum"));}
for(const p of ps){const f=p.path==="/"? "index.html":p.path.slice(1)+"index.html";const s=fs.readFileSync(f,"utf8");for(const [,href] of s.matchAll(/href="(\/[^"#?]+)"/g)){if(href.startsWith("/assets/"))continue;assert.ok(paths.has(href),f+" broken internal link "+href)}}
const sitemap=fs.readFileSync("sitemap.xml","utf8");assert.equal((sitemap.match(/<loc>/g)||[]).length,ps.length+published.length);assert.equal(fs.readFileSync("CNAME","utf8").trim(),"hi.rentbikehanoi.com");assert.ok(fs.readFileSync("robots.txt","utf8").includes(data.baseUrl+"/sitemap.xml"));
console.log("PASS",ps.length,"Hindi pages; links, canonical, sitemap, CNAME, schema and architecture.");


const hubs=ps.filter(p=>p.role==="HUB"),silos=ps.filter(p=>p.role==="SILO");
assert.equal(data.nav.length,hubs.length,"menu must cover all Hub pages");
for(const hub of hubs){
 assert.ok(data.nav.includes(hub.path),"missing nav Hub "+hub.path);
 assert.ok(silos.some(p=>p.parent===hub.path),"Hub must have at least one Silo: "+hub.path);
}
const homepage=fs.readFileSync("index.html","utf8");
assert.ok(homepage.includes("nav-taxonomy"),"missing taxonomy menu");
assert.ok(homepage.includes("footer-grid--taxonomy"),"missing taxonomy footer");
const nodes=[...data.nav,...silos.map(s=>s.path)];
for(const url of nodes){
 const needle='href="'+url+'"';
 assert.ok(homepage.includes(needle),"homepage header/footer missing "+url);
}
const currentSeo=JSON.parse(fs.readFileSync("data/seo-master-matrix.json","utf8"));
assert.equal(currentSeo.length,ps.length+published.length,"matrix and routes drift");
assert.equal(new Set(currentSeo.map(m=>m.slug)).size,ps.length+published.length,"matrix URL collision");
const plan=JSON.parse(fs.readFileSync("data/editorial-plan.json","utf8"));
assert.equal(plan.targetArticleCap,300);
assert.equal(plan.items.length,300,"approved 300-topic plan required");
const deployed=ps.filter(x=>x.role==="SILO").length;
console.log("Taxonomy PASS:",hubs.length,"hubs,",deployed,"silos; menu, footer, matrix, plan.");

for(const a of published){
 const file=a.path.slice(1)+"index.html",source=fs.readFileSync(file,"utf8");
 assert.ok(source.includes('rel="canonical" href="'+data.baseUrl+a.path+'"'));
 assert.ok(source.includes('"@type":"Article"'));
 assert.ok(sitemap.includes(data.baseUrl+a.path));
 assert.ok(!source.includes('<script>alert('));
 assert.ok(source.includes('href="'+a.parentSilo+'"'));
}
console.log("Published Article checks PASS:",published.length);

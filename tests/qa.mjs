import fs from "node:fs";import path from "node:path";import assert from "node:assert/strict";
const data=JSON.parse(fs.readFileSync("data/site.json","utf8"));const googleVerification='<meta name="google-site-verification" content="4Q_SglVzw-B7lnk_qs1yXOuMAL1zu6bSSmFsDuaOkuQ" />';const googleVerificationAdditional='<meta name="google-site-verification" content="HwLeUnxn5y1nBbGQD-54b3hR_dw10qMQ12wfmuDPfBg" />';assert.equal(data.googleSiteVerificationAdditional,"HwLeUnxn5y1nBbGQD-54b3hR_dw10qMQ12wfmuDPfBg","Additional verification content drift");assert.equal(data.googleSiteVerification,"4Q_SglVzw-B7lnk_qs1yXOuMAL1zu6bSSmFsDuaOkuQ","Google verification content drift");const ps=data.groups;const pubFolder="content/published";
const published=fs.existsSync(pubFolder)?fs.readdirSync(pubFolder).filter(f=>/^HI\d{4}\.json$/.test(f)).map(f=>JSON.parse(fs.readFileSync(path.join(pubFolder,f),"utf8"))):[];
const paths=new Set([...ps,...published].map(p=>p.path));assert.equal(paths.size,ps.length+published.length,"duplicate URL");
assert.equal(ps.filter(p=>p.path==="/").length,1);assert.equal(ps.filter(p=>p.role==="PILLAR").length,1);
for(const p of ps){if(p.parent)assert.ok(paths.has(p.parent),p.path+" parent missing");const f=p.path==="/"? "index.html":p.path.slice(1)+"index.html";assert.ok(fs.existsSync(f),f);let s=fs.readFileSync(f,"utf8");assert.match(s,/<html lang="hi-IN">/);assert.equal(s.split(googleVerification).length-1,1,"verification meta missing or duplicated "+f);if(p.path==="/")assert.equal(s.split(googleVerificationAdditional).length-1,1,"additional verification missing or duplicated on homepage");assert.ok(s.includes('<link rel="canonical" href="'+data.baseUrl+p.path+'"'));assert.ok(s.includes('type="application/ld+json"'));assert.ok(s.includes('<h1>'));assert.ok(s.includes('href="/assets/site.css"'));assert.ok(s.includes('href="/संपर्क/"'));assert.ok(!s.includes("Lorem ipsum"));}
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
 if(a.role!=="SUPPORT" || !paths.has(a.parentSilo))throw Error("invalid published article ownership");
 const file=a.path.slice(1)+"index.html",source=fs.readFileSync(file,"utf8");
 assert.ok(source.includes('rel="canonical" href="'+data.baseUrl+a.path+'"'));assert.equal(source.split(googleVerification).length-1,1,"future article verification meta missing or duplicated");
 assert.ok(source.includes('"@type":"Article"'));
 assert.ok(sitemap.includes(data.baseUrl+a.path));
 assert.ok(!source.includes('<script>alert('));
 assert.ok(source.includes('href="'+a.parentSilo+'"'));
 for(const [,href] of source.matchAll(/href="(\/[^"#?]+)"/g)) {
   if(href.startsWith("/assets/"))continue;
   assert.ok(paths.has(href),file+" broken internal link "+href);
 }
 assert.ok(source.includes('"@type":"BreadcrumbList"'),"Missing breadcrumb JSON-LD");
 assert.ok(source.includes("<h1>"),"Missing article H1");
}
console.log("Published Article checks PASS:",published.length);


/* Reader-facing English translation link (never creates an English SEO URL). */
const translateHref = path => "https://translate.google.com/translate?sl=hi&amp;tl=en&amp;hl=en&amp;u="+encodeURIComponent(data.baseUrl+path);
for(const page of [...ps,...published]){
 const filename=page.path==="/"?"index.html":page.path.slice(1)+"index.html";
 const source=fs.readFileSync(filename,"utf8");
 const expected='class="language-pill" href="'+translateHref(page.path)+'"';
 assert.ok(source.includes(expected),"English translator must target current URL: "+filename);
 assert.equal((source.match(/class="language-pill"/g)||[]).length,1,"One language control per page");
 assert.ok(source.includes('target="_blank" rel="noopener noreferrer" lang="en"'),"Accessible translator link");
 assert.ok(source.includes('id="menu-toggle"'),"Mobile menu toggle preserved");
 assert.ok(!source.includes("translate_a/element.js"),"Unsupported free Google Translate widget forbidden");
}
const css=fs.readFileSync("assets/site.css","utf8");
assert.ok(css.includes(".language-pill")&&css.includes("@media(max-width:620px)"),"Responsive translator CSS missing");
console.log("English switch QA PASS:",ps.length+published.length,"pages, canonical preserved and dynamic target URL");

/* Keep VND amounts unchanged in the English translation service. */
const homePrices=fs.readFileSync("index.html","utf8"),priceGuide=fs.readFileSync("किराया-और-कीमतें/index.html","utf8");
assert.ok(homePrices.includes("150,000 VND")&&homePrices.includes("2,000,000–3,000,000 VND"),"Homepage currency mismatch");
assert.ok(homePrices.includes('class="money-value notranslate" translate="no"'),"Homepage currency must be untranslatable");
assert.ok(priceGuide.includes("3,000,000 VND")&&priceGuide.includes('class="money-value notranslate" translate="no"'),"Price table currency missing");
assert.ok(fs.readFileSync("assets/site.js","utf8").includes('holder.classList.toggle("notranslate",isVnd)'),"Rental period selector must protect currency");
console.log("VND machine-translation safety PASS");

const homeFAQ = fs.readFileSync("index.html","utf8");
assert.ok(homeFAQ.includes("2,000,000–5,000,000 VND"),"Homepage FAQ deposit amount must stay VND");
assert.ok(homeFAQ.includes('class="money-value notranslate" translate="no">2,000,000–5,000,000 VND</span>'),"Homepage FAQ deposit must not be translated into euros");
console.log("Homepage FAQ VND QA PASS");

/* Contextual internal-link graph: only existing core pages are modified. */
const graphFile="reports/india-nonpost-internal-link-graph.json";
const graphCsv="reports/india-nonpost-internal-link-graph.csv";
assert.ok(fs.existsSync(graphFile),"core-page internal-link graph missing");
assert.ok(fs.existsSync(graphCsv),"core-page link graph CSV missing");
const linkGraph=JSON.parse(fs.readFileSync(graphFile,"utf8"));
assert.equal(linkGraph.counts.nonPost,ps.length,"non-post graph coverage drift");
assert.equal(linkGraph.counts.publishedPosts,published.length,"support source graph coverage drift");
assert.equal(linkGraph.nodes.length,ps.length,"one graph row per existing non-Post URL");
const graphMap=new Map(linkGraph.nodes.map(x=>[x.URL,x]));
assert.equal(graphMap.size,ps.length,"duplicate URL graph nodes");
for(const page of ps){
 const row=graphMap.get(data.baseUrl+page.path);
 assert.ok(row,"missing graph node "+page.path);
 assert.ok(Array.isArray(row.outgoingLinks)&&Array.isArray(row.incomingLinks));
 assert.ok(Array.isArray(row.anchorText)&&Array.isArray(row.recommendedLink));
 const file=page.path==="/"?"index.html":page.path.slice(1)+"index.html";
 const html=fs.readFileSync(file,"utf8");
 if(page.path!=="/"){
  assert.ok(html.includes('class="article-section internal-context-links"'),"contextual links missing "+page.path);
  const panel=html.match(/<section class="article-section internal-context-links"[\s\S]*?<\/section>/)?.[0];
  assert.ok(panel,"missing semantic link panel "+page.path);
  assert.ok(!panel.includes('href="/"'),"unrelated contextual homepage link "+page.path);
  const recs=row.recommendedLink;
  assert.ok(recs.length>=2&&recs.length<=4,"bounded contextual links "+page.path);
  for(const link of recs){assert.equal(link.status,"IMPLEMENTED","recommended link not implemented "+page.path+" → "+link.url);}
 }
}
assert.ok(linkGraph.nodes.some(n=>n.counts.incomingSupport>0),"support-to-silo inbound graph absent");
assert.ok(fs.readFileSync(graphCsv,"utf8").startsWith('"URL","Outgoing Links","Incoming Links","Anchor Text","Cluster","Recommended Link"'),"CSV columns drift");
console.log("Contextual Graph PASS:",linkGraph.counts.nonPost,"non-Post URLs,",linkGraph.counts.publishedPosts,"Support Posts,",linkGraph.counts.mainContentEdges,"main-content edges");

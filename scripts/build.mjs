// Hindi SSG, Node.js standard library only. Generated HTML is committed for static hosting.
import fs from "node:fs";import path from "node:path";
const config=JSON.parse(fs.readFileSync(new URL("../data/site.json",import.meta.url),"utf8"));
const DOMAIN=config.baseUrl;const all=config.groups;const BIKES=config.bikes;const FAQ=config.faq;const NAV=config.nav;
const pubFolder="content/published";
const articles=fs.existsSync(pubFolder)?fs.readdirSync(pubFolder).filter(f=>/^HI\d{4}\.json$/.test(f)).sort().map(f=>JSON.parse(fs.readFileSync(path.join(pubFolder,f),"utf8"))):[];
const byPath=Object.fromEntries([...all,...articles].map(p=>[p.path,p]));
function e(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

function url(path){return DOMAIN+path;}
function displayVnd(v){
 return String(v).replace(/(\d+)\s*[–-]\s*(\d+)\s*मिलियन\s*₫/gu,(_,a,b)=>a+",000,000–"+b+",000,000 VND")
  .replace(/(\d+)\s*मिलियन\s*₫/gu,(_,a)=>a+",000,000 VND").replace(/₫/gu,"VND");
}
function moneyCell(v){return String(v).includes("₫")?'<span class="money-value notranslate" translate="no">'+e(displayVnd(v))+'</span>':e(v);}
function priceSafeText(v){return e(displayVnd(v)).replace(/(\d[\d,–-]*\s+VND)/gu,'<span class="money-value notranslate" translate="no">$1</span>');}
function translateUrl(path){return "https://translate.google.com/translate?sl=hi&amp;tl=en&amp;hl=en&amp;u="+encodeURIComponent(url(path));}

function a(path,label,cls=""){return `<a href="${e(path)}"${cls?` class="${cls}"`:""}>${e(label)}</a>`;}

function bikeSvg(){return `<svg viewBox="0 0 620 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="हनोई शहर और मोटरबाइक का चित्र"><circle cx="460" cy="92" r="64" fill="#ffcd68" opacity=".95"/><g fill="#507c85" opacity=".38"><path d="M10 246V162h54v84zm64 0V121h58v125zm72 0V89h42v157zm53 0V149h63v97zm77 0V111h65v135zm80 0V154h73v92zm90 0V112h60v134z"/><path d="M19 157h35v-31H19zm150-76h10V53h-10zm139 31V84h25v28z"/></g><path d="M0 249h620v75H0z" fill="#22404c"/><path d="M0 285h620" stroke="#ffcf77" stroke-width="4" stroke-dasharray="27 22"/><ellipse cx="300" cy="310" rx="205" ry="17" fill="#0a2a35" opacity=".45"/><circle cx="174" cy="274" r="60" fill="#172b37" stroke="#d9e4e5" stroke-width="12"/><circle cx="174" cy="274" r="32" fill="#718e94" stroke="#172b37" stroke-width="10"/><circle cx="446" cy="274" r="60" fill="#172b37" stroke="#d9e4e5" stroke-width="12"/><circle cx="446" cy="274" r="32" fill="#718e94" stroke="#172b37" stroke-width="10"/><path d="m188 273 98-91 77 4 77 83-37 13-62-51-111-3-30 52z" fill="#ffad38"/><path d="m208 223 70-38 48 0 28 25-122 23z" fill="#ffd15b"/><path d="m290 187 67 0 36-58 33 0-43 79-74 3" fill="none" stroke="#162b34" stroke-width="14" stroke-linecap="round"/><path d="m412 128 56 0" stroke="#162b34" stroke-width="10" stroke-linecap="round"/><path d="m223 221-23-45 77-2 24 19" fill="#17333d"/><path d="m338 206 27-64 28-12" stroke="#17333d" stroke-width="12" stroke-linecap="round" fill="none"/><path d="m162 250 43-40" stroke="#ffb83f" stroke-width="11" stroke-linecap="round"/><path d="m423 247 19-45" stroke="#ffb83f" stroke-width="12" stroke-linecap="round"/><path d="m377 220 63 5" stroke="#f6e9c7" stroke-width="11" stroke-linecap="round"/><path d="m256 170 18-8" stroke="#ffd15b" stroke-width="8" stroke-linecap="round"/></svg>`;}

function schema(p){
 const common=[{"@type":"Organization","@id":"https://thuexemaynguyentu.com/#organization","name":"Cho Thuê Xe Máy Nguyễn Tú","url":"https://thuexemaynguyentu.com/","telephone":"+84 942 467 674","address":{"@type":"PostalAddress","streetAddress":"112 Nguyễn Văn Cừ","addressLocality":"Bồ Đề, Long Biên, Hà Nội","addressCountry":"VN"}}];
 const web={"@type":"WebSite","@id":DOMAIN+"/#website","url":DOMAIN+"/","name":"हनोई मोटरबाइक रेंटल गाइड","inLanguage":"hi-IN","publisher":{"@id":"https://thuexemaynguyentu.com/#organization"}};
 const graph=[...common,web,{"@type":"WebPage","@id":url(p.path)+"#webpage","url":url(p.path),"name":p.title,"inLanguage":"hi-IN","isPartOf":{"@id":DOMAIN+"/#website"}}];
 if(p.role==="SUPPORT")graph.push({"@type":"Article","@id":url(p.path)+"#article","headline":p.title,"description":p.lead,"datePublished":p.publishedAt,"inLanguage":"hi-IN","mainEntityOfPage":{"@id":url(p.path)+"#webpage"},"publisher":{"@id":"https://thuexemaynguyentu.com/#organization"}});
 const crumbs=[];let curr=p; while(curr){crumbs.unshift(curr);curr=curr.parent?byPath[curr.parent]:null;}
 if(p.path!=="/" && crumbs[0]?.path!=="/")crumbs.unshift(byPath["/"]);
 if(p.path!=="/")graph.push({"@type":"BreadcrumbList","itemListElement":crumbs.map((c,i)=>({"@type":"ListItem","position":i+1,"name":c.label,"item":url(c.path)}))});
 return `<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@graph":graph}).replace(/</g,"\\u003c")}</script>`;
}

function head(p){let description=(p.lead+" | Cho Thuê Xe Máy Nguyễn Tú").slice(0,195);
return `<!doctype html><html lang="hi-IN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b2632"><meta name="google-site-verification" content="${e(config.googleSiteVerification)}" /><meta name="google-site-verification" content="HwLeUnxn5y1nBbGQD-54b3hR_dw10qMQ12wfmuDPfBg" /><title>${e(p.title)} | Nguyễn Tú</title><meta name="description" content="${e(description)}"><link rel="canonical" href="${e(url(p.path))}"><meta property="og:type" content="website"><meta property="og:locale" content="hi_IN"><meta property="og:title" content="${e(p.title)}"><meta property="og:description" content="${e(description)}"><meta property="og:url" content="${e(url(p.path))}"><link rel="stylesheet" href="/assets/site.css">${schema(p)}</head><body><a class="skip-link" href="#main">मुख्य सामग्री पर जाएँ</a>`;
}

function header(p){
 const menu=NAV.map((hubPath,i)=>{
 const hub=byPath[hubPath],children=all.filter(p=>p.parent===hubPath);
 return `<div class="nav-group"><div class="nav-group-main">${a(hub.path,hub.label,"nav-hub-link")}<button class="nav-subtoggle" type="button" aria-expanded="false" aria-controls="nav-child-${i}" aria-label="${e(hub.label)}: उपविषय दिखाएँ">⌄</button></div><div class="nav-panel" id="nav-child-${i}"><a class="nav-panel-all" href="${e(hub.path)}">सभी ${e(hub.label)} →</a>${children.map(p=>a(p.path,p.label,"nav-child-link")).join("")}</div></div>`;
 }).join("");
 return `<header class="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="हनोई मोटरबाइक किराया - मुख्य पृष्ठ"><span class="brand-icon">↗</span><span><strong>HANOI<span class="accent">RIDE</span></strong><small>Nguyễn Tú · हिन्दी गाइड</small></span></a><nav id="main-nav" class="nav nav-taxonomy" aria-label="मुख्य नेविगेशन">${menu}${a("/संपर्क/","संपर्क करें","nav-cta")}</nav><div class="header-actions notranslate" translate="no"><a class="language-pill" href="${translateUrl(p.path)}" target="_blank" rel="noopener noreferrer" lang="en" aria-label="Automatically translate this page into English with Google Translate (opens a new tab)" title="Translate current page into English"><span class="lang-globe" aria-hidden="true">🌐</span><span class="lang-full">English</span><span class="lang-short">EN</span></a><button id="menu-toggle" class="menu-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="मेन्यू खोलें">☰</button></div></div></header>`;
}

function footer(){
 const footGroups=NAV.map(path=>{
 const hub=byPath[path],children=all.filter(p=>p.parent===path);
 return `<section class="footer-topic" aria-label="${e(hub.label)}"><h3>${a(hub.path,hub.label)}</h3>${children.map(c=>a(c.path,c.label,"footer-silo")).join("")}</section>`;
 }).join("");
 const utility=["/अक्सर-पूछे-जाने-वाले-सवाल/","/हमारे-बारे-में/","/संपर्क/","/गोपनीयता-नीति/","/नियम-और-शर्तें/"].map(x=>a(x,byPath[x].label)).join("");
 return `<footer class="footer"><div class="container footer-grid footer-grid--taxonomy"><div class="footer-summary"><a class="brand footer-brand" href="/"><span class="brand-icon">↗</span><span><strong>HANOI<span class="accent">RIDE</span></strong><small>Nguyễn Tú</small></span></a><p>हनोई में मोटरबाइक किराये के लिए हिन्दी जानकारी। मॉडल, कीमत और जमा की पुष्टि करें।</p><p><strong>112 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội</strong></p><p>हर विषय का अपना Hub और संबंधित गाइड लिंक है।</p></div>${footGroups}<section class="footer-topic footer-resources"><h3>महत्वपूर्ण पृष्ठ</h3>${utility}<h3>संपर्क</h3><a href="tel:+84942467674">+84 942 467 674</a><a href="https://maps.google.com/maps?cid=7448790013669858019" rel="noopener noreferrer">Google Maps ↗</a><span>प्रतिदिन 09:00–21:00</span></section></div><div class="container footer-bottom"><span>© 2026 Cho Thuê Xe Máy Nguyễn Tú</span><span>हिन्दी · Vietnam (VND)</span></div></footer><a class="sticky-call" href="tel:+84942467674" aria-label="किराये के लिए फ़ोन करें">☎ <span>कॉल करें</span></a><script src="/assets/site.js" defer></script></body></html>`;
}

function breadcrumbs(p){const arr=[];let cur=p;while(cur){arr.unshift(cur);cur=cur.parent?byPath[cur.parent]:null;}if(arr[0]?.path!=="/")arr.unshift(byPath["/"]);return `<nav class="breadcrumbs" aria-label="ब्रेडक्रंब">${arr.map((x,i)=>i===arr.length-1?`<span aria-current="page">${e(x.label)}</span>`:a(x.path,x.label)).join('<span aria-hidden="true">›</span>')}</nav>`;}

function categoryCards(paths){return `<div class="topic-grid">${paths.map(path=>{const p=byPath[path];return `<a class="topic-card" href="${e(p.path)}"><span class="topic-arrow" aria-hidden="true">↗</span><h3>${e(p.label)}</h3><p>${e(p.lead)}</p><span class="topic-link">अधिक जानें →</span></a>`;}).join("")}</div>`;}

function bikeCards(){return `<div class="bike-grid" id="bike-grid">${BIKES.map((b,i)=>`<article class="bike-card" data-type="${e(b.type)}" data-day="${e(displayVnd(b.day))}" data-week="${e(displayVnd(b.week))}" data-month="${e(displayVnd(b.month))}"><div class="bike-art art-${i%3}"><span class="bike-symbol" aria-hidden="true">◉━━━━◉</span><span class="bike-kind">${e(b.name)}</span></div><div class="bike-info"><div class="bike-top"><h3>${e(b.title)}</h3><span class="available-label">संदर्भ दर</span></div><p class="deposit">जमा: ${moneyCell(b.deposit)}</p><div class="bike-bottom"><div><small class="price-term">प्रति दिन</small><strong class="price-value">${moneyCell(b.day)}</strong></div>${a(b.link,"विवरण ↗","text-link")}</div></div></article>`).join("")}</div><p class="muted-note" id="price-note">मूल्य संदर्भ के लिए हैं, अंतिम किराया और जमा बुकिंग से पहले पुष्टि करें।</p>`;}

function homePage(p){
const topics=["/बाइक-के-प्रकार/","/किराया-और-कीमतें/","/जमा-और-बुकिंग/","/हनोई-के-इलाके/","/किराये-की-गाइड/","/सुझाए-गए-रूट/"];
return `<main id="main"><section class="hero"><div class="container hero-grid"><div class="hero-copy"><div class="eyebrow">🇻🇳 हनोई, वियतनाम · हिन्दी में गाइड</div><h1>${e(p.title)}<span class="hero-highlight"> अपनी यात्रा, अपने तरीके से।</span></h1><p>${e(p.lead)}</p><div class="hero-points"><span>✓ दिन / सप्ताह / महीना</span><span>✓ स्पष्ट जमा जानकारी</span><span>✓ हिंदी में सहायता गाइड</span></div><a class="hero-link" href="#बाइक-खोजें">बाइक विकल्प देखें <span>↘</span></a></div><div class="hero-illustration">${bikeSvg()}<div class="floating-note"><strong>हनोई राइड गाइड</strong><span>बाइक चुनें • कीमत समझें • संपर्क करें</span></div></div></div></section><div class="container"><form id="bike-finder" class="finder" aria-label="बाइक और अवधि चुनें"><div class="finder-field"><label for="bike-type">बाइक का प्रकार</label><select id="bike-type" name="type"><option value="all">सभी प्रकार</option><option value="gear">गियर बाइक</option><option value="scooter">ऑटोमैटिक स्कूटर</option><option value="50cc">50cc स्कूटर</option><option value="electric">इलेक्ट्रिक बाइक</option></select></div><div class="finder-field"><label for="rental-term">किराये की अवधि</label><select id="rental-term" name="term"><option value="day">प्रतिदिन</option><option value="week">प्रति सप्ताह</option><option value="month">प्रति महीना</option></select></div><button class="btn btn-primary" type="submit">विकल्प देखें →</button></form></div><section class="section" id="बाइक-खोजें"><div class="container"><div class="section-head"><div><span class="section-kicker">बाइक की तुलना</span><h2>अपनी सवारी चुनें</h2><p>संदर्भ दरें और मॉडल; कोई लाइव उपलब्धता या ऑनलाइन बुकिंग का दावा नहीं।</p></div>${a("/बाइक-के-प्रकार/","सभी बाइक देखें ↗","section-link")}</div>${bikeCards()}</div></section><section class="section section-tint"><div class="container"><div class="section-head"><div><span class="section-kicker">विषय के अनुसार</span><h2>जानकारी, जो आपकी यात्रा आसान बनाए</h2><p>वास्तविक सवालों पर आधारित विषय समूह। 300 लेखों का विस्तार बाद के चरण में होगा।</p></div></div>${categoryCards(topics)}</div></section><section class="section"><div class="container split"><div><span class="section-kicker">स्पष्ट किराया</span><h2>बजट बनाते समय जमा भी देखें</h2><p>किराये की दैनिक, साप्ताहिक और मासिक दर मॉडल के अनुसार बदलती है। उदाहरण के लिए Honda Wave की दैनिक संदर्भ दर <span class="money-value notranslate" translate="no">150,000 VND</span> है; सुरक्षा जमा <span class="money-value notranslate" translate="no">2,000,000–3,000,000 VND</span> हो सकता है।</p><p>अंतिम कीमत, अवधि, वाहन की स्थिति और डिलीवरी शुल्क अनुबंध से पहले तय करें।</p>${a("/किराया-और-कीमतें/","पूरी किराया गाइड →","btn btn-dark")}</div><div class="info-panel"><div class="panel-mark notranslate" translate="no">VND</div><strong>कीमतें VND में</strong><p>वियतनामी डोंग में संदर्भ किराया। भारतीय रुपये में अनुमानित रूपांतरण यहाँ नहीं दिखाया गया है।</p><hr><strong>सुरक्षा जमा</strong><p>मॉडल के अनुसार <span class="money-value notranslate" translate="no">2,000,000–5,000,000 VND</span>; वापसी अनुबंध की शर्तों पर आधारित।</p></div></div></section><section class="section section-tint"><div class="container"><div class="section-head"><div><span class="section-kicker">सामान्य सवाल</span><h2>किराये से पहले जान लें</h2></div>${a("/अक्सर-पूछे-जाने-वाले-सवाल/","सभी सवाल ↗","section-link")}</div><div class="faqs">${FAQ.slice(0,4).map(([q,a])=>`<details><summary>${e(q)}</summary><p>${priceSafeText(a)}</p></details>`).join("")}</div></div></section><section class="contact-strip"><div class="container contact-strip-inner"><div><span>यात्रा की योजना तैयार है?</span><h2>मॉडल, तारीख और अवधि बताकर कीमत पूछें</h2><p>Nguyễn Tú · Long Biên, Hà Nội</p></div><a class="btn btn-light" href="tel:+84942467674">☎ +84 942 467 674</a></div></section></main>`;
}

function regularPage(p){
const children=all.filter(x=>x.parent===p.path);
const siblings=p.parent?all.filter(x=>x.parent===p.parent&&x.path!==p.path).slice(0,4):[];
let pathParts=children.length?children.map(x=>x.path):siblings.map(x=>x.path);
if(!pathParts.length)pathParts=NAV.slice(0,3);
const content=p.sections.map(([h,paragraph])=>`<section class="article-section"><h2>${e(h)}</h2><p>${priceSafeText(paragraph)}</p></section>`).join("");
const faqs=p.path==="/अक्सर-पूछे-जाने-वाले-सवाल/"?`<div class="faqs">${FAQ.map(([q,ans])=>`<details><summary>${e(q)}</summary><p>${priceSafeText(ans)}</p></details>`).join("")}</div>`:"";
const prices=p.path==="/किराया-और-कीमतें/"?`<section class="article-section"><h2>प्रमुख मॉडलों की संदर्भ कीमतें</h2><div class="price-table-wrap"><table class="price-table"><thead><tr><th>मॉडल</th><th>दैनिक</th><th>साप्ताहिक</th><th>मासिक</th><th>जमा</th></tr></thead><tbody>${BIKES.map(b=>`<tr><th scope="row">${e(b.title)}</th><td>${moneyCell(b.day)}</td><td>${moneyCell(b.week)}</td><td>${moneyCell(b.month)}</td><td>${moneyCell(b.deposit)}</td></tr>`).join("")}</tbody></table></div><p class="muted-note">ये प्रकाशित संदर्भ दरें हैं; अंतिम दर की पुष्टि सीधे करें।</p></section>`:"";
const articleLinks=p.role==="SILO"?articles.filter(a=>a.parentSilo===p.path):[];
const publishedCards=articleLinks.length?`<section class="article-section"><h2>इस विषय के प्रकाशित लेख</h2><div class="topic-grid">${articleLinks.map(a=>`<a class="topic-card" href="${e(a.path)}"><h3>${e(a.title)}</h3><p>${e(a.lead)}</p><span class="topic-link">पूरा लेख पढ़ें →</span></a>`).join("")}</div></section>`:"";
const contact=p.path==="/संपर्क/"?`<div class="info-panel"><p><strong>Cho Thuê Xe Máy Nguyễn Tú</strong></p><p>112 Nguyễn Văn Cừ, Bồ Đề, Long Biên, Hà Nội, Việt Nam</p><p>09:00–21:00 · प्रतिदिन</p><p><a href="tel:+84942467674">+84 942 467 674</a> · <a href="https://maps.google.com/maps?cid=7448790013669858019" rel="noopener noreferrer">मानचित्र देखें ↗</a></p></div>`:"";
return `<main id="main"><section class="page-hero"><div class="container">${breadcrumbs(p)}<span class="section-kicker">हनोई मोटरबाइक रेंटल · ${e(p.role)}</span><h1>${e(p.title)}</h1><p>${e(p.lead)}</p></div></section><section class="section"><div class="container content-layout"><article class="article-body">${content}${prices}${faqs}${contact}${publishedCards}${children.length?`<section class="article-section"><h2>इस विषय के हिस्से</h2>${categoryCards(children.map(x=>x.path))}</section>`:""}<section class="article-section"><h2>अगला कदम</h2><p>किराया, उपलब्धता, जमा और लेने या लौटाने की शर्तें मॉडल तथा अवधि के अनुसार पहले पुष्टि करें। यह वेबसाइट बुकिंग की पुष्टि करने वाला सिस्टम नहीं है।</p><a class="btn btn-primary" href="/संपर्क/">संपर्क जानकारी देखें →</a></section></article><aside class="sidebar"><div class="sidebar-box"><h2>संबंधित विषय</h2>${pathParts.map(x=>a(x,byPath[x].label+" ↗")).join("")}</div><div class="sidebar-box sidebar-cta"><strong>मॉडल चुनना है?</strong><p>फ़ोन पर वर्तमान कीमत और उपलब्धता की पुष्टि करें।</p><a href="tel:+84942467674">+84 942 467 674 →</a></div></aside></div></section></main>`;
}

function articlePage(p){
const sections=(p.sections||[]).map(section=>{
 const subsections=(section.subsections||[]).map(x=>`<section class="article-subsection"><h3>${e(x.heading)}</h3>${(x.paragraphs||[]).map(t=>`<p>${priceSafeText(t)}</p>`).join("")}</section>`).join("");
 return `<section class="article-section"><h2>${e(section.heading)}</h2>${(section.paragraphs||[]).map(t=>`<p>${priceSafeText(t)}</p>`).join("")}${subsections}</section>`;
}).join("");
const sources=(p.sources||[]).map(s=>`<li><a href="${e(s.url)}" rel="noopener noreferrer nofollow" target="_blank">${e(s.title||s.url)}</a></li>`).join("");
const related=(p.relatedPaths||[]).filter(x=>byPath[x]).map(x=>`<li><a href="${e(x)}">${e(byPath[x].label||byPath[x].title)}</a></li>`).join("");
return `<main id="main"><section class="page-hero"><div class="container">${breadcrumbs(p)}<span class="section-kicker">हनोई यात्रा गाइड · प्रकाशित लेख</span><h1>${e(p.title)}</h1><p>${e(p.lead)}</p><p class="article-date"><time datetime="${e(p.publishedAt)}">${e(p.publishedAt.slice(0,10))}</time></p></div></section><div class="container section content-layout"><article class="article-body">${sections}<section class="article-section"><h2>संदर्भ और स्रोत</h2><p>संदर्भ स्रोतों की स्वतंत्र पुष्टि करें; कीमतें और नियम बदल सकते हैं।</p><ul>${sources}</ul></section><section class="article-section"><h2>संबंधित गाइड</h2><ul>${related}</ul><p><a href="${e(p.parentSilo)}">विषय सूची पर लौटें →</a></p></section></article><aside class="sidebar"><div class="sidebar-box"><h2>मुख्य विषय</h2><a href="${e(p.parentHub)}">${e(byPath[p.parentHub].label)} ↗</a><a href="${e(p.parentSilo)}">${e(byPath[p.parentSilo].label)} ↗</a></div></aside></div></main>`;
}

function outputPath(path){return path==="/"?"index.html":path.slice(1)+"index.html";}

// Local Hindi search index: only currently PUBLISHED site data, never draft content.
function localChatIndex(){
 const visible=all.filter(p=>!["/नियम-और-शर्तें/","/गोपनीयता-नीति/"].includes(p.path)).concat(articles);
 const rows=visible.map(p=>{
   const raw=p.sections||[];
   const pairs=raw.map(sec=>Array.isArray(sec)?{h:String(sec[0]||""),p:[String(sec[1]||"")]}:{h:String(sec.heading||""),p:(sec.paragraphs||[]).map(String)});
   const parts=pairs.filter(x=>x.h&&x.p.length).slice(0,9).map(x=>({h:x.h,p:x.p.filter(Boolean).slice(0,2).map(t=>t.slice(0,360))}));
   if(!parts.length)parts.push({h:p.label||p.title,p:[String(p.lead||"").slice(0,360)]});
   return {u:p.path,t:p.title,head:parts.map(x=>x.h),s:parts};
 });
 return JSON.stringify({version:"hi-published-"+articles.length,site:DOMAIN,e:rows})+"\n";
}

function buildSite(){
const files={};
for(const p of all)files[outputPath(p.path)]=head(p)+header(p)+(p.path==="/"?homePage(p):regularPage(p))+footer();
for(const a of articles)files[outputPath(a.path)]=head(a)+header(a)+articlePage(a)+footer();
files["assets/chat/search-index.json"]=localChatIndex();
files["sitemap.xml"]='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+[...all,...articles].map(p=>`<url><loc>${e(url(p.path))}</loc></url>`).join("")+"</urlset>\n";
files["robots.txt"]="User-agent: *\nAllow: /\nSitemap: "+DOMAIN+"/sitemap.xml\n";
files[".nojekyll"]="";
return files;
}
const generated=buildSite();for(const [relative,html] of Object.entries(generated)){const file=path.resolve(process.cwd(),relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html)}
console.log("Built",Object.keys(generated).length,"static files");

// Deterministic HTML-based internal-link graph for the 36 core and taxonomy URLs.
// Edges are extracted from <main> only: navigation/footer are deliberately excluded.
// Includes incoming edges from all published Support articles without editing the posts.
export function generateLinkGraph({groups,articles,files,domain,recommend}){
  const source=[...groups,...articles],corePaths=new Set(groups.map(p=>p.path));
  const byPath=new Map(source.map(p=>[p.path,p]));
  const inbound=new Map(groups.map(p=>[p.path,[]])),outbound=new Map(groups.map(p=>[p.path,[]]));
  const allEdges=[];const globalSeen=new Set();
  const decode=s=>String(s).replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ");
  const filename=p=>p==="/"?"index.html":p.slice(1)+"index.html";
  for(const src of source){
    const html=files[filename(src.path)];
    if(typeof html!=="string")throw Error("Graph source missing: "+src.path);
    const main=html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i)?.[0];
    if(!main)throw Error("Main landmark missing: "+src.path);
    const matched=[...main.matchAll(/<a\b[^>]*\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
    for(const m of matched){
      const target=decode(m[1]).split(/[?#]/)[0];
      if(!target.startsWith("/")||!byPath.has(target)||target===src.path)continue;
      const anchor=decode(m[2].replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()).replace(/\s+/g," ").trim();
      if(!anchor)continue;
      const key=src.path+"|"+target+"|"+anchor;
      if(globalSeen.has(key))continue;globalSeen.add(key);
      const dest=byPath.get(target);
      const edge={sourceUrl:domain+src.path,targetUrl:domain+target,anchorText:anchor,sourceRole:src.role,targetRole:dest.role};
      allEdges.push(edge);
      if(corePaths.has(src.path))outbound.get(src.path).push({url:edge.targetUrl,anchorText:anchor,role:dest.role});
      if(corePaths.has(target))inbound.get(target).push({url:edge.sourceUrl,anchorText:anchor,role:src.role});
    }
  }
  const nodes=groups.map(p=>{
    const outgoingLinks=outbound.get(p.path),incomingLinks=inbound.get(p.path);
    const proposed=recommend(p).map(([target,anchor])=>({url:domain+target,anchorText:anchor,status:outgoingLinks.some(x=>x.url===domain+target)?"IMPLEMENTED":"PENDING"}));
    const cluster=p.role==="SILO"?p.parent:(p.role==="HUB"?p.path:"CORE-PAGES");
    return {URL:domain+p.path,role:p.role,cluster,outgoingLinks,incomingLinks,anchorText:outgoingLinks.map(x=>x.anchorText),recommendedLink:proposed,counts:{outgoing:outgoingLinks.length,incoming:incomingLinks.length,incomingSupport:incomingLinks.filter(x=>x.role==="SUPPORT").length}};
  });
  const csvEscape=s=>'"'+String(s).replace(/"/g,'""')+'"';
  const csvRows=[["URL","Outgoing Links","Incoming Links","Anchor Text","Cluster","Recommended Link","Role","Incoming Support"]];
  for(const row of nodes){
    csvRows.push([row.URL,row.outgoingLinks.map(x=>x.anchorText+" → "+x.url).join("\n"),row.incomingLinks.map(x=>x.anchorText+" ← "+x.url).join("\n"),row.anchorText.join(" | "),row.cluster,row.recommendedLink.map(x=>x.anchorText+" → "+x.url+" ["+x.status+"]").join("\n"),row.role,row.counts.incomingSupport]);
  }
  return {json:{repository:"thuexemayhanoi/india",production:domain+"/",scope:"36 existing non-Post routes",method:"Extract main-content links from the generated HTML of 36 non-Post pages and 300 published Posts; header, footer, JS links and external URLs excluded.",counts:{nonPost:groups.length,publishedPosts:articles.length,mainContentEdges:allEdges.length,toNonPost:allEdges.filter(x=>corePaths.has(x.targetUrl.slice(domain.length))).length},nodes},csv:csvRows.map(row=>row.map(csvEscape).join(",")).join("\n")+"\n"};
}

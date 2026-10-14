/* On-demand, published-only, zero-dependency site search. */
(()=>{"use strict";
 const button=document.getElementById("site-search-toggle");
 const panel=document.getElementById("site-search-panel");
 if(!button||!panel)return;
 const closeButton=document.getElementById("site-search-close");
 const input=document.getElementById("site-search-input");
 const results=document.getElementById("site-search-results");
 const status=document.getElementById("site-search-status");
 let data=null,loading=null;
 const normalize=value=>String(value||"").normalize("NFKC").toLocaleLowerCase("hi").replace(/\s+/g," ").trim();
 const clear=()=>{results.replaceChildren()};
 function rank(item,q){
  const parts=q.split(/\s+/).filter(Boolean).slice(0,12);
  const fields=[normalize(item.t),normalize(item.k),normalize((item.h||[]).join(" ")),normalize(item.d)];
  if(!parts.every(term=>fields.some(field=>field.includes(term))))return 0;
  let score=0;
  for(const term of parts){for(let i=0;i<fields.length;i++)if(fields[i].includes(term))score+=[12,9,5,2][i]}
  if(fields[0].includes(q))score+=30;
  if(fields[1].includes(q))score+=18;
  return score;
 }
 function render(){
  clear();
  const query=normalize(input.value);
  if(!query){status.textContent="शीर्षक, कीवर्ड या लेख का विषय लिखें।";return}
  if(!data){status.textContent="सूची लोड हो रही है…";return}
  const matches=data.e.map(item=>({item,score:rank(item,query)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.item.t.localeCompare(b.item.t,"hi"));
  status.textContent=matches.length+" लेख मिले"+(matches.length>30?" · पहले 30 दिखाए गए":"");
  for(const match of matches.slice(0,30)){
   const li=document.createElement("li"),a=document.createElement("a");
   a.href=match.item.u;
   const title=document.createElement("strong"),desc=document.createElement("span");
   title.textContent=match.item.t;desc.textContent=match.item.d;
   a.append(title,desc);li.append(a);results.append(li);
  }
 }
 function load(){
  if(loading)return loading;
  status.textContent="प्रकाशित लेख सूची लोड हो रही है…";
  loading=fetch("/assets/search/index.json",{cache:"force-cache"}).then(response=>{
   if(!response.ok)throw Error("Search index HTTP "+response.status);
   return response.json();
  }).then(payload=>{
   if(!payload||!Array.isArray(payload.e))throw Error("Invalid search index");
   data=payload;render();
  }).catch(()=>{
   loading=null;
   status.textContent="अभी खोज उपलब्ध नहीं है। कृपया थोड़ी देर में दोबारा प्रयास करें।";
  });
  return loading;
 }
 function open(){
  panel.hidden=false;button.setAttribute("aria-expanded","true");
  document.body.classList.add("site-search-open");
  const menu=document.getElementById("main-nav"),toggle=document.getElementById("menu-toggle");
  menu?.classList.remove("open");toggle?.setAttribute("aria-expanded","false");
  input.focus();if(!data)load();else render();
 }
 function close(){
  panel.hidden=true;button.setAttribute("aria-expanded","false");
  document.body.classList.remove("site-search-open");button.focus();
 }
 button.addEventListener("click",()=>panel.hidden?open():close());
 closeButton.addEventListener("click",close);
 input.addEventListener("input",render);
 panel.addEventListener("click",event=>{if(event.target===panel)close()});
 document.addEventListener("keydown",event=>{
  if(panel.hidden)return;
  if(event.key==="Escape"){event.preventDefault();event.stopPropagation();close()}
  if(event.key==="Tab"){
   const f=[closeButton,input,...results.querySelectorAll("a")];
   if(event.shiftKey&&document.activeElement===f[0]){event.preventDefault();f[f.length-1].focus()}
   if(!event.shiftKey&&document.activeElement===f[f.length-1]){event.preventDefault();f[0].focus()}
  }
 },true);
})();

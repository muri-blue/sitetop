const THEMES=[
 ['escuro','Escuro','#121218','#1d202a','#6c86ff'],
 ['claro','Claro','#f6f6f7','#ffffff','#3451b2'],
 ['meianoite','Meia-noite','#070b16','#0e1526','#4cc2ff'],
 ['roxo','Roxo','#16111f','#211a30','#b58cff'],
 ['verde','Verde','#0f1713','#17231c','#4ade80'],
 ['laranja','Laranja','#18130f','#241c15','#ff9f4a']
];
// >>> EDITE AQUI: seu usuário/repositório e a branch publicada
const REPO='muri-blue/sitetop',BRANCH='main';
const ADMIN_PAGE=document.body.dataset.admin==='1',BASE=ADMIN_PAGE?'../':'';
let TOKEN='';try{TOKEN=sessionStorage.getItem('gh')||''}catch{}
const API='https://api.github.com/repos/'+REPO+'/contents/links.json';
const gh=(q='',o={})=>fetch(API+'?ref='+BRANCH+q,{...o,headers:{Authorization:'Bearer '+TOKEN,Accept:'application/vnd.github+json','Content-Type':'application/json',...(o.headers||{})}});
let data={categories:[]},admin=false,sel='all',query='';

const h=(t,a={},...c)=>{const e=document.createElement(t);
 for(const[k,v]of Object.entries(a)){if(k==='class')e.className=v;else if(k.startsWith('on'))e.addEventListener(k.slice(2),v);else if(v!==false&&v!=null)e.setAttribute(k,v)}
 for(const x of c.flat().filter(x=>x!==false&&x!=null))e.append(x.nodeType?x:document.createTextNode(x));return e};
const uid=()=>Math.random().toString(36).slice(2,10);
const dom=u=>{try{return new URL(u).hostname.replace(/^www\./,'')}catch{return u}};

function applyTheme(id){
 if(!THEMES.some(t=>t[0]===id))id='escuro';
 document.documentElement.dataset.theme=id;
 try{localStorage.setItem('theme',id)}catch{}
}
function loadTheme(){let t='escuro';try{t=localStorage.getItem('theme')||t}catch{}applyTheme(t)}

async function save(){
 const g=await gh();
 if(g.status===401||g.status===403||g.status===404){forget();render();return false}
 if(!g.ok){alert('Não foi possível salvar.');return false}
 const sha=(await g.json()).sha;
 const content=btoa(unescape(encodeURIComponent(JSON.stringify(data,null,2))));
 const r=await fetch(API,{method:'PUT',headers:{Authorization:'Bearer '+TOKEN,Accept:'application/vnd.github+json','Content-Type':'application/json'},
  body:JSON.stringify({message:'Atualiza links',content,sha,branch:BRANCH})});
 if(r.status===409||r.status===422){alert('O arquivo mudou no GitHub. Recarregue a página e tente de novo.');return false}
 if(!r.ok){alert('Erro ao salvar ('+r.status+').');return false}
 return true;
}
function forget(){try{sessionStorage.removeItem('gh')}catch{};TOKEN='';admin=false}

async function copy(url,btn){
 try{await navigator.clipboard.writeText(url)}catch{
  const t=h('textarea',{},url);document.body.append(t);t.select();document.execCommand('copy');t.remove()}
 btn.textContent='Copiado!';setTimeout(()=>btn.textContent='Copiar',1500);
}

function form(title,fields,ok){
 const d=document.getElementById('dlg');d.replaceChildren();
 const f=h('form',{class:'f',method:'dialog'},h('h3',{},title),
  ...fields.map(x=>h('label',{},x.label,
   x.opts?h('select',{name:x.k},...x.opts.map(o=>h('option',{value:o[0],selected:o[0]===x.v},o[1]))):
   x.area?h('textarea',{name:x.k,rows:3},x.v||''):
   h('input',{name:x.k,value:x.v||'',required:x.req,placeholder:x.ph}))),
  h('div',{class:'acts'},h('button',{type:'button',class:'btn',onclick:()=>d.close()},'Cancelar'),h('button',{class:'btn pri'},'Salvar')));
 f.addEventListener('submit',async e=>{e.preventDefault();if(await ok(Object.fromEntries(new FormData(f))))d.close()});
 d.append(f);d.showModal();
}

function linkForm(l,catId){
 const cats=data.categories.map(c=>[c.id,c.name]);
 form(l?'Editar link':'Novo link',[
  {k:'title',label:'Título',v:l&&l.title,req:true},
  {k:'url',label:'URL',v:l&&l.url,req:true,ph:'https://'},
  {k:'desc',label:'Descrição',v:l&&l.desc,area:true},
  {k:'cat',label:'Categoria',v:catId,opts:cats}
 ],async v=>{
  if(!/^https?:\/\//i.test(v.url.trim())){alert('A URL precisa começar com http:// ou https://');return false}
  const nl={id:l?l.id:uid(),title:v.title.trim(),url:v.url.trim(),desc:v.desc.trim()};
  const dest=data.categories.find(c=>c.id===v.cat);
  if(l&&v.cat===catId){const i=dest.links.findIndex(x=>x.id===l.id);dest.links[i]=nl}
  else{if(l){const old=data.categories.find(c=>c.id===catId);old.links=old.links.filter(x=>x.id!==l.id)}dest.links.push(nl)}
  const ok=await save();render();return ok;
 });
}
function catForm(c){
 form(c?'Renomear categoria':'Nova categoria',[{k:'name',label:'Nome',v:c&&c.name,req:true}],async v=>{
  if(c)c.name=v.name.trim();else{const n={id:uid(),name:v.name.trim(),links:[]};data.categories.push(n);sel=n.id}
  const ok=await save();render();return ok;
 });
}
function themesDialog(){
 const d=document.getElementById('dlg');d.replaceChildren();
 const cur=document.documentElement.dataset.theme;
 d.append(h('div',{class:'f'},h('h3',{},'Temas'),
  h('div',{class:'themes'},...THEMES.map(t=>h('button',{class:'th'+(t[0]===cur?' on':''),type:'button',onclick:()=>{applyTheme(t[0]);themesDialog()}},
   h('span',{class:'sw'},h('i',{style:'background:'+t[2]}),h('i',{style:'background:'+t[3]}),h('i',{style:'background:'+t[4]})),
   h('b',{},t[1])))),
  h('div',{class:'acts'},h('button',{class:'btn pri',type:'button',onclick:()=>d.close()},'Fechar'))));
 if(!d.open)d.showModal();
}

function renderLogin(){
 const err=h('div',{class:'err'});
 const pw=h('input',{type:'password',placeholder:'Token de acesso',required:true,autofocus:true,class:'search',style:'width:100%'});
 const f=h('form',{class:'login',onsubmit:async e=>{
  e.preventDefault();TOKEN=pw.value.trim();
  const r=await fetch('https://api.github.com/repos/'+REPO,{headers:{Authorization:'Bearer '+TOKEN}});
  if(r.ok&&(await r.json()).permissions?.push){
   try{sessionStorage.setItem('gh',TOKEN)}catch{}
   admin=true;await loadData();render();
  }else{TOKEN='';err.textContent='Token inválido ou sem permissão neste repositório.'}
 }},h('h2',{},'Admin'),pw,err,h('button',{class:'btn pri',style:'width:100%'},'Entrar'));
 document.getElementById('app').replaceChildren(h('header',{},h('div',{class:'logo'},'Megathread'),h('button',{class:'btn',onclick:themesDialog},'Temas')),f);
}

function render(){
 if(ADMIN_PAGE&&!admin)return renderLogin();
 const q=query.toLowerCase();
 const match=l=>!q||(l.title+' '+l.url+' '+(l.desc||'')).toLowerCase().includes(q);
 const cats=data.categories.filter(c=>sel==='all'||c.id===sel);

 const header=h('header',{},
  h('div',{class:'logo'},'Megathread',admin&&h('span',{class:'badge'},'Admin')),
  h('input',{class:'search',placeholder:'Buscar…',value:query,oninput:e=>{query=e.target.value;renderCards()}}),
  h('button',{class:'btn',onclick:themesDialog},'Temas'),
  admin&&h('button',{class:'btn',onclick:()=>{forget();render()}},'Sair'));

 const side=h('aside',{},h('h4',{},'Categorias'),
  h('a',{class:sel==='all'?'on':'',onclick:()=>{sel='all';render()}},'Todas'),
  ...data.categories.map(c=>h('a',{class:sel===c.id?'on':'',onclick:()=>{sel=c.id;render()}},c.name)),
  admin&&h('button',{class:'btn',onclick:()=>catForm()},'+ Categoria'));

 const main=h('main',{},h('h1',{},'Megathread'),h('p',{class:'sub'},'Links organizados por categoria. Copie ou clique para acessar.'),h('div',{id:'cards'}));
 document.getElementById('app').replaceChildren(header,h('div',{class:'wrap'},side,main));

 function renderCards(){
  const box=document.getElementById('cards');box.replaceChildren();
  let any=false;
  for(const c of cats){
   const ls=c.links.filter(match);
   if(q&&!ls.length)continue;any=true;
   box.append(h('section',{class:'card'},
    h('div',{class:'ch'},h('b',{},c.name),
     admin&&h('button',{class:'btn',onclick:()=>linkForm(null,c.id)},'+ Link'),
     admin&&h('button',{class:'btn',onclick:()=>catForm(c)},'Renomear'),
     admin&&h('button',{class:'btn danger',onclick:async()=>{if(confirm('Apagar a categoria "'+c.name+'" e todos os links dela?')){data.categories=data.categories.filter(x=>x!==c);if(sel===c.id)sel='all';await save();render()}}},'Apagar'),
     h('span',{class:'n'},ls.length+(ls.length===1?' link':' links'))),
    !ls.length&&h('div',{class:'empty'},'Nenhum link ainda.'),
    ...ls.map(l=>{const cb=h('button',{class:'btn',onclick:()=>copy(l.url,cb)},'Copiar');
     return h('div',{class:'row'},
      h('div',{class:'info'},h('a',{href:l.url,target:'_blank',rel:'noopener noreferrer'},l.title),h('div',{class:'dom'},dom(l.url)),l.desc&&h('div',{class:'desc'},l.desc)),
      h('div',{class:'acts'},cb,
       admin&&h('button',{class:'btn',onclick:()=>linkForm(l,c.id)},'Editar'),
       admin&&h('button',{class:'btn danger',onclick:async()=>{if(confirm('Apagar "'+l.title+'"?')){c.links=c.links.filter(x=>x!==l);await save();render()}}},'Apagar')))})));
  }
  if(!any)box.append(h('div',{class:'empty'},q?'Nada encontrado.':'Nenhuma categoria ainda.'));
 }
 renderCards();
}

async function loadData(){
 try{
  const r=admin?await gh('',{headers:{Accept:'application/vnd.github.raw+json'}}):await fetch(BASE+'links.json?'+Date.now());
  data=await r.json();
 }catch{}
}
(async()=>{
 loadTheme();
 if(ADMIN_PAGE&&TOKEN){
  try{const r=await fetch('https://api.github.com/repos/'+REPO,{headers:{Authorization:'Bearer '+TOKEN}});
   admin=r.ok&&(await r.json()).permissions?.push}catch{}
  if(!admin)forget();
 }
 await loadData();render();
})();


export function canonical(value){
 if(value===null||typeof value!=='object')return JSON.stringify(value);
 if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';
 return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';
}
export async function digest(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function groupKey(frame){return digest(canonical(Object.fromEntries(['captureSchemaVersion','screenId','width','height','viewport','region','crop','prototypeRevision','variantId','brandBundleId','rendererBundleId','tree'].map(k=>[k,frame[k]]))));}
export function evaluate(rule,events,state={},answers={}){
 if(!rule)return false;
 if(rule.all)return rule.all.every(r=>evaluate(r,events,state,answers));
 if(rule.any)return rule.any.some(r=>evaluate(r,events,state,answers));
 if(rule.state)return Object.entries(rule.state).every(([k,v])=>state[k]===v);
 if(rule.answer)return answers[rule.answer.questionId]===rule.answer.equals;
 if(rule.event){const r=rule.event;return events.some(e=>e.type===r.type&&(!r.screenId||e.screenId===r.screenId)&&(!r.actionId||e.payload?.actionId===r.actionId)&&Object.entries(r.where||{}).every(([k,v])=>e.payload?.[k]===v));}
 return false;
}
const SAFE_TAGS=new Set('div span p h1 h2 h3 h4 h5 h6 small strong b i em s u section article aside header footer nav main form a img figure figcaption blockquote code pre table thead tbody tfoot tr th td caption colgroup col ul ol li dl dt dd button label fieldset legend br hr'.split(' '));
const HIDDEN_TAGS=new Set(['input','textarea','select','option']);
const BLOCKED_ATTRIBUTES=/^(?:on|src|href|srcset|style|action|formaction|method|target|value|name|contenteditable)/i;
export function sanitizeTree(tree,policy={},assets=[]){
 let count=0;
 const texts=new Set(policy.staticTextAllowlist||[]),classes=new Set(policy.allowedClasses||[]);
 const images=new Set((assets||[]).filter(asset=>asset.kind==='image').map(asset=>asset.assetId));
 const masked=box=>{
  const out={tag:'span',attrs:{class:'utr-masked'},children:[{text:'Campo ocultado'}]};
  if(box&&typeof box==='object'){
   out.box={};
   for(const key of ['width','height','marginTop','marginRight','marginBottom','marginLeft'])if(Number.isFinite(box[key]))out.box[key]=Math.round(Math.max(key.startsWith('margin')?-512:0,Math.min(key.startsWith('margin')?512:10000,box[key]))*100)/100;
   out.box.display=box.display==='block'?'block':'inline-block';
  }
  return out;
 };
 function walk(n,depth){
  if(++count>1800||depth>30)throw Error('Limite de complexidade da captura.');
  if(!n||typeof n!=='object'||n.exclude)return null;
  if(Array.isArray(n))throw Error('Nó inválido.');
  if(n.mask||HIDDEN_TAGS.has(n.tag)||n.tag==='span'&&n.attrs?.class==='utr-masked')return masked(n.box);
  if(typeof n.text==='string'){
   const clean=n.text.trim();
   return {text:!clean?n.text:texts.has(clean)?n.text:'[Ocultado]'};
  }
  if(!SAFE_TAGS.has(n.tag))return null;
  if(n.tag==='img'&&!images.has(n.assetId))return masked(n.box);
  // Preserve form/a and other layout semantics. Behavioral attributes are
  // removed; the renderer separately blocks interaction, submission and network.
  const out={tag:n.tag,attrs:{},children:[]},attrs=n.attrs||{};
  if(n.tag==='img')out.assetId=n.assetId;
  if(typeof attrs.id==='string'&&(policy.allowedIds||[]).includes(attrs.id))out.attrs.id=attrs.id;
  if(typeof attrs.class==='string'){
   const approved=attrs.class.split(/\s+/).filter(name=>classes.has(name));
   if(approved.length)out.attrs.class=approved.join(' ');
  }
  for(const key of ['role','aria-label','alt'])if(typeof attrs[key]==='string'&&texts.has(attrs[key]))out.attrs[key]=attrs[key];
  if(attrs.hidden===true||attrs.hidden==='')out.attrs.hidden=true;
  if(attrs.disabled===true||attrs.disabled==='')out.attrs.disabled=true;
  for(const key of ['width','height','colspan','rowspan']){
   const value=attrs[key];
   if(typeof value==='string'&&/^\d{1,5}$/.test(value)&&Number(value)<=10000)out.attrs[key]=value;
  }
  for(const [key,values]of Object.entries(policy.allowedAttributes||{})){
   if(!/^[a-z][a-z0-9-]*$/.test(key)||BLOCKED_ATTRIBUTES.test(key))continue;
   if(Array.isArray(values)&&typeof attrs[key]==='string'&&values.includes(attrs[key]))out.attrs[key]=attrs[key];
  }
  for(const key of ['scrollTop','scrollLeft'])if(Number.isFinite(n[key]))out[key]=Math.max(0,Math.min(100000,Math.round(n[key])));
  for(const child of Array.isArray(n.children)?n.children:[]){const clean=walk(child,depth+1);if(clean)out.children.push(clean);}
  return out;
 }
 return walk(tree,0);
}
export function observedState(config,state){return Object.fromEntries(config.prototype.allowedStateKeys.map(k=>[k,state[k]===true]));}
export function summarize(sessions,results,tasks){
 return tasks.map(task=>{const first=new Map();for(const result of results.filter(r=>r.taskId===task.taskId))if(!first.has(result.sessionId))first.set(result.sessionId,result);const rows=[...first.values()];const started=sessions.filter(s=>s.startedTasks?.includes(task.taskId)).length;const verified=rows.filter(r=>r.outcome==='observed_success').length;const times=rows.filter(r=>r.outcome==='observed_success').map(r=>r.visibleExecutionMs).sort((a,b)=>a-b);const mid=Math.floor(times.length/2),m=times.length?(times.length%2?times[mid]:(times[mid-1]+times[mid])/2):null;return {taskId:task.taskId,title:task.title,started,verified,finished:rows.length,medianMs:m};});
}

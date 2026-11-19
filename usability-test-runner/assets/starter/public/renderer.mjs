const nonce=crypto.randomUUID();
const imageAssets=new Map(CFG.brand.assets.filter(asset=>asset.kind==='image').map(asset=>[asset.assetId,asset]));
let assetReadiness=null;
function approvedImagesReady(){
 if(!assetReadiness)assetReadiness=Promise.all([...imageAssets.values()].map(asset=>{const image=new Image();image.src=asset.dataUrl;return image.decode();}));
 return assetReadiness;
}
let nodeCount=0,generation=0,currentFrameId=null,ready=false,pending=null,overlay=null;
function makeNode(record,scrolls){
 if(++nodeCount>1800)throw Error('Limite de exibição.');
 if(typeof record.text==='string')return document.createTextNode(record.text);
 const element=document.createElement(record.tag);
 for(const [key,value]of Object.entries(record.attrs||{}))element.setAttribute(key,value===true?'':value);
 if(record.tag==='img'){
  const asset=imageAssets.get(record.assetId);
  if(!asset)throw Error('Imagem não pertence ao bundle aprovado.');
  element.src=asset.dataUrl;element.loading='eager';element.draggable=false;
 }
 if(record.box){
  element.style.display=record.box.display;
  for(const key of ['width','height','marginTop','marginRight','marginBottom','marginLeft'])if(Number.isFinite(record.box[key]))element.style[key]=record.box[key]+'px';
  element.style.overflow='hidden';element.style.verticalAlign='middle';
 }
 for(const child of record.children||[])element.append(makeNode(child,scrolls));
 if(record.scrollTop||record.scrollLeft)scrolls.push([element,record.scrollTop||0,record.scrollLeft||0]);
 return element;
}
function drawPoints({frame,points=[],mode}){
 if(!overlay)return;
 const context=overlay.getContext('2d');context.clearRect(0,0,overlay.width,overlay.height);
 for(const point of mode==='heat'?points:points.slice(-1)){
  if(!Number.isFinite(point.x)||!Number.isFinite(point.y)||point.x<0||point.y<0||point.x>frame.width||point.y>frame.height)continue;
  if(mode==='heat'){
   const gradient=context.createRadialGradient(point.x,point.y,2,point.x,point.y,24);
   gradient.addColorStop(0,'#ff56217a');gradient.addColorStop(1,'#ffbf0000');
   context.fillStyle=gradient;context.fillRect(point.x-24,point.y-24,48,48);
  }else{
   context.fillStyle='#e86628c0';context.beginPath();context.arc(point.x,point.y,11,0,Math.PI*2);context.fill();
   context.strokeStyle='white';context.lineWidth=2;context.stroke();
  }
 }
}
const nextFrame=()=>new Promise(resolve=>requestAnimationFrame(resolve));
async function render(data){
 const frame=data.frame;
 if(!frame||frame.prototypeRevision!==CFG.prototypeRevision||frame.rendererBundleId!==CFG.visual.rendererBundleId||frame.brandBundleId!==CFG.brand.bundleId||frame.captureSchemaVersion!==CFG.visual.captureSchemaVersion)throw Error('Revisão incompatível.');
 const geometry=normalizeGeometry(frame);
 if(window.innerWidth!==geometry.viewport.width||window.innerHeight!==geometry.viewport.height)throw Error('Janela de reprodução incompatível.');
 pending=data;
 if(currentFrameId===frame.frameId){if(ready)drawPoints(pending);return;}
 const version=++generation;currentFrameId=frame.frameId;ready=false;overlay=null;
 const tree=sanitizeTree(frame.tree,CFG.visual.privacy,CFG.brand.assets),scrolls=[];nodeCount=0;
 const root=makeNode(tree,scrolls);root.id=CFG.prototype.rootSelector.slice(1);root.classList.add('prototype-root');
 root.style.width=geometry.width+'px';root.style.height=geometry.height+'px';root.style.boxSizing='border-box';root.style.margin='0';root.style.border='0';root.style.borderRadius='0';root.style.position='absolute';root.style.left=geometry.region.left+'px';root.style.top=geometry.region.top+'px';root.inert=true;
 document.body.replaceChildren(root);
 let timeout;
 try{
  await Promise.race([
   (async()=>{await approvedImagesReady();await Promise.all([...root.querySelectorAll('img')].map(image=>image.decode()));root.getBoundingClientRect();await document.fonts.ready;if([...document.fonts].some(font=>font.status==='error'))throw Error('Fonte indisponível.');await nextFrame();await nextFrame();})(),
   new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('Assets não ficaram disponíveis.')),15000);})
  ]);
 }catch(error){if(version!==generation)return;throw error;}
 finally{clearTimeout(timeout);}
 if(version!==generation)return;
 for(const [element,top,left]of scrolls){element.scrollTop=top;element.scrollLeft=left;}
 overlay=document.createElement('canvas');overlay.width=frame.width;overlay.height=frame.height;
 overlay.style.cssText='position:absolute;pointer-events:none;z-index:99';overlay.style.left=geometry.region.left+'px';overlay.style.top=geometry.region.top+'px';document.body.append(overlay);
 ready=true;drawPoints(pending);
}
// Keep semantic elements for CSS fidelity; disable behavior independently.
for(const type of ['click','submit','dragstart'])document.addEventListener(type,event=>event.preventDefault(),true);
window.addEventListener('message',event=>{
 if(event.source!==parent)return;
 if(event.data?.type==='usability-renderer-init'){parent.postMessage({type:'usability-renderer-ready',nonce},'*');return;}
 if(event.data?.type!=='usability-frame'||event.data.nonce!==nonce)return;
 render(event.data).catch(()=>{generation++;currentFrameId=null;ready=false;overlay=null;document.body.textContent='Não foi possível reconstruir esta captura com seus assets.';});
});
parent.postMessage({type:'usability-renderer-ready',nonce},'*');

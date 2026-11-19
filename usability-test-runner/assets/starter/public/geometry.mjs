// CSS-pixel geometry shared by capture, receiver and isolated renderer.
// No coordinates here identify a device or a physical location.
const precision=value=>Math.round(value*100)/100;
function finite(value,min,max,name){
 if(!Number.isFinite(value)||value<min||value>max)throw Error('Geometria inválida: '+name);
 return precision(value);
}
function dimension(value,min,max,name){
 if(!Number.isInteger(value))throw Error('Dimensão inválida: '+name);
 return finite(value,min,max,name);
}
export function normalizeGeometry(frame){
 const width=dimension(frame.width,160,2048,'produto.width');
 const height=dimension(frame.height,160,4096,'produto.height');
 const viewport={
  width:dimension(frame.viewport?.width,160,7680,'janela.width'),
  height:dimension(frame.viewport?.height,160,7680,'janela.height')
 };
 const visible=frame.viewport.visual;
 if(!visible)throw Error('Área visual da janela ausente.');
 viewport.visual={
  left:finite(visible.left,0,viewport.width,'visual.left'),
  top:finite(visible.top,0,viewport.height,'visual.top'),
  width:finite(visible.width,0.01,viewport.width,'visual.width'),
  height:finite(visible.height,0.01,viewport.height,'visual.height'),
  scale:finite(visible.scale,0.1,10,'visual.scale')
 };
 // Tolerate subpixel rounding at the right/bottom edge, not arbitrary cropping.
 if(viewport.visual.left+viewport.visual.width>viewport.width+0.05||viewport.visual.top+viewport.visual.height>viewport.height+0.05)throw Error('Área visual fora da janela.');
 const region={
  left:finite(frame.region?.left,-100000,100000,'produto.left'),
  top:finite(frame.region?.top,-100000,100000,'produto.top')
 };
 const left=Math.max(region.left,viewport.visual.left),top=Math.max(region.top,viewport.visual.top);
 const right=Math.min(region.left+width,viewport.visual.left+viewport.visual.width);
 const bottom=Math.min(region.top+height,viewport.visual.top+viewport.visual.height);
 if(right<=left||bottom<=top)throw Error('O produto não está visível na janela.');
 // Recompute crop on the server; a client-supplied crop is never authoritative.
 const crop={x:precision(left-region.left),y:precision(top-region.top),width:precision(right-left),height:precision(bottom-top)};
 if(crop.width<=0||crop.height<=0)throw Error('Recorte vazio.');
 return {width,height,viewport,region,crop};
}

export function measureGeometry(root){
 const rect=root.getBoundingClientRect(),width=window.innerWidth,height=window.innerHeight;
 const view=window.visualViewport;
 const visual={left:view?.offsetLeft||0,top:view?.offsetTop||0,width:view?.width||width,height:view?.height||height,scale:view?.scale||1};
 // Browser rounding and transient keyboard/zoom events must not expand the
 // recorded visible rectangle beyond the recorded layout viewport.
 visual.left=Math.max(0,Math.min(width,visual.left));visual.top=Math.max(0,Math.min(height,visual.top));
 visual.width=Math.min(visual.width,width-visual.left);visual.height=Math.min(visual.height,height-visual.top);
 const region={left:rect.left+root.clientLeft,top:rect.top+root.clientTop};
 if(Math.min(region.left+root.clientWidth,visual.left+visual.width)<=Math.max(region.left,visual.left)||Math.min(region.top+root.clientHeight,visual.top+visual.height)<=Math.max(region.top,visual.top))return null;
 return normalizeGeometry({width:root.clientWidth,height:root.clientHeight,viewport:{width,height,visual},region});
}

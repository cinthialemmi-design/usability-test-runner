import {readFileSync,realpathSync} from 'node:fs';
import {resolve,sep} from 'node:path';
import {createHash} from 'node:crypto';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

const TYPES={
 '.png':['image','image/png'],'.jpg':['image','image/jpeg'],'.jpeg':['image','image/jpeg'],
 '.webp':['image','image/webp'],'.gif':['image','image/gif'],'.avif':['image','image/avif'],
 '.svg':['image','image/svg+xml'],'.woff':['font','font/woff'],'.woff2':['font','font/woff2'],
 '.ttf':['font','font/ttf'],'.otf':['font','font/otf']
};
const ORIGIN='https://study.invalid';
function cssText(value){
 return value.replace(/\\([0-9a-f]{1,6}\s?|[^\r\n\f])/gi,(_,escaped)=>{
  if(/^[0-9a-f]/i.test(escaped)){
   const point=parseInt(escaped.trim(),16);
   return point>0&&point<=0x10ffff?String.fromCodePoint(point):'\ufffd';
  }
  return escaped;
 });
}
function localPath(reference,base){
 const url=new URL(cssText(reference),ORIGIN+base);
 if(url.origin!==ORIGIN||url.username||url.password)throw Error('Recurso externo: copie o arquivo para public e registre sua aprovação.');
 // Query strings commonly used for font cache busting do not change frozen bytes.
 return url.pathname;
}
function assertBytes(extension,bytes){
 const head=bytes.subarray(0,16),ascii=head.toString('ascii');
 const matches={
  '.png':head.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
  '.jpg':head[0]===255&&head[1]===216&&head[2]===255,
  '.jpeg':head[0]===255&&head[1]===216&&head[2]===255,
  '.gif':/^GIF8[79]a/.test(ascii),'.webp':ascii.startsWith('RIFF')&&ascii.slice(8,12)==='WEBP',
  '.avif':ascii.slice(4,8)==='ftyp'&&['avif','avis'].includes(ascii.slice(8,12)),
  '.woff':ascii.startsWith('wOFF'),'.woff2':ascii.startsWith('wOF2'),
  '.ttf':head.subarray(0,4).equals(Buffer.from([0,1,0,0]))||ascii.startsWith('true'),'.otf':ascii.startsWith('OTTO')
 };
 if(extension==='.svg'){
  // Static SVG files are images, never inserted as live SVG markup. Reject a
  // conservative subset of active/reference features before freezing the bytes.
  const svg=bytes.toString('utf8').replace(/^\uFEFF/,'').replace(/^\s*<\?xml[^?]*\?>/i,'').trim();
  if(!/^<svg\b/i.test(svg)||!/<\/svg>\s*$/i.test(svg)||/[&]|<!|<\?|<\s*(?:script|foreignObject|iframe|object|embed|style|a|image|use|animate\w*|set)\b|\s(?:on[\w:-]+|(?:xlink:)?href|src|style)\s*=|url\s*\(/i.test(svg))throw Error('SVG não pertence ao subconjunto estático aprovado. Use paths/formas sem referências ou converta para PNG/WebP.');
 }else if(!matches[extension])throw Error('Conteúdo do asset incompatível com sua extensão.');
}

export function compileAssets(publicDirectory,brand){
 const root=realpathSync(publicDirectory),records=[],byPath=new Map(),byId=new Set();
 let totalBytes=0,cssBytes=0,compiledBytes=0;
 const inside=path=>{
  if(!path.startsWith('/')||path.includes('\\'))throw Error('Use um caminho local absoluto em public.');
  const file=realpathSync(resolve(root,'.'+path));
  if(!file.startsWith(root+sep))throw Error('Recurso fora de public.');
  return file;
 };
 for(const entry of brand.assets||[]){
  if(byId.has(entry.assetId)||byPath.has(entry.path))throw Error('Asset duplicado no registro.');
  const extension=entry.path.slice(entry.path.lastIndexOf('.')).toLowerCase(),type=TYPES[extension];
  if(!type||type[0]!==entry.kind)throw Error('Tipo de imagem/fonte não suportado: '+entry.path);
  const bytes=readFileSync(inside(entry.path));totalBytes+=bytes.length;
  if(bytes.length>4*1024*1024||totalBytes>16*1024*1024)throw Error('Orçamento de assets excedido: 4 MiB por arquivo, 16 MiB no total.');
  assertBytes(extension,bytes);
  const record={assetId:entry.assetId,path:entry.path,kind:entry.kind,mime:type[1],sha256:createHash('sha256').update(bytes).digest('hex'),dataUrl:'data:'+type[1]+';base64,'+bytes.toString('base64')};
  records.push(record);byPath.set(entry.path,record);byId.add(entry.assetId);
 }
 const compiled=new Map(),visiting=new Set();
 const significant=nodes=>nodes.filter(node=>!['space','comment'].includes(node.type));
 function resource(node,base,kind){
  const parts=significant(node.nodes||[]);
  if(parts.length!==1||!['word','string'].includes(parts[0].type))throw Error('url() precisa conter um caminho estático.');
  if(parts[0].value.startsWith('data:')){const frozen=records.find(asset=>asset.dataUrl===parts[0].value);if(!frozen||kind&&frozen.kind!==kind)throw Error('data: precisa corresponder a um asset aprovado.');return;}
  const path=localPath(parts[0].value,base),asset=byPath.get(path);
  if(!asset||kind&&asset.kind!==kind)throw Error('Recurso não aprovado no registro: '+path);
  if(asset.kind==='image'&&new URL(cssText(parts[0].value),ORIGIN+base).hash)throw Error('Fragmentos de imagem exigem um arquivo estático separado.');
  node.nodes=[{type:'string',quote:'"',value:asset.dataUrl}];node.before='';node.after='';
 }
 function inlineValues(nodes,base,kind){
  for(const node of nodes){
   if(node.type!=='function')continue;
   const name=cssText(node.value).toLowerCase();
   if(name==='url'){resource(node,base,kind);continue;}
   if(['image-set','-webkit-image-set'].includes(name)){
    for(const child of node.nodes)if(child.type==='string'){
     const asset=child.value.startsWith('data:')?records.find(asset=>asset.dataUrl===child.value):byPath.get(localPath(child.value,base));
     if(!asset||asset.kind!=='image')throw Error('Imagem de image-set não aprovada.');
     if(!child.value.startsWith('data:')&&new URL(cssText(child.value),ORIGIN+base).hash)throw Error('Fragmentos de imagem exigem um arquivo estático separado.');
     child.value=asset.dataUrl;
    }
   }
   inlineValues(node.nodes||[],base,kind);
  }
 }
 function fontSources(ast){
  const groups=[[]];
  for(const node of ast.nodes){if(node.type==='div'&&node.value===',')groups.push([]);else groups.at(-1).push(node);}
  const kept=groups.filter(group=>!significant(group).some(node=>node.type==='function'&&cssText(node.value).toLowerCase()==='local'));
  if(!kept.length||!kept.every(group=>significant(group).some(node=>node.type==='function'&&cssText(node.value).toLowerCase()==='url')))throw Error('@font-face precisa de um arquivo de fonte aprovado, não apenas local().');
  ast.nodes=kept.flatMap((group,index)=>index?[{type:'div',value:',',before:'',after:' '},...group]:group);
 }
 function stylesheet(path){
  if(visiting.has(path))throw Error('@import circular: '+path);
  if(compiled.has(path))return compiled.get(path);
  if(!path.toLowerCase().endsWith('.css')||compiled.size+visiting.size>=64)throw Error('Importação CSS inválida ou limite de 64 arquivos atingido.');
  const text=readFileSync(inside(path),'utf8');cssBytes+=Buffer.byteLength(text);
  if(cssBytes>2*1024*1024)throw Error('Orçamento de CSS excedido: 2 MiB.');
  visiting.add(path);
  const tree=postcss.parse(text,{from:path});
  tree.walkComments(comment=>comment.remove());
  tree.walkAtRules(rule=>{
   const name=cssText(rule.name).toLowerCase();
   if(name==='charset'){rule.remove();return;}
   if(name!=='import')return;
   const ast=valueParser(rule.params),parts=significant(ast.nodes),first=parts[0];
   let reference;
   if(first?.type==='string')reference=first.value;
   else if(first?.type==='function'&&cssText(first.value).toLowerCase()==='url'){
    const values=significant(first.nodes);if(values.length===1)reference=values[0].value;
   }
   if(typeof reference!=='string')throw Error('@import exige um caminho CSS estático.');
   const importedCSS=stylesheet(localPath(reference,path));
   if(Buffer.byteLength(importedCSS)>32*1024*1024)throw Error('CSS incorporado excede 32 MiB.');
   const imported=postcss.parse(importedCSS);
   let tail=ast.nodes.slice(ast.nodes.indexOf(first)+1);
   while(tail[0]?.type==='space')tail.shift();
   const wrappers=[];
   if(tail[0]&&cssText(tail[0].value).toLowerCase()==='layer'){
    const layer=tail.shift();wrappers.push({name:'layer',params:layer.type==='function'?valueParser.stringify(layer.nodes):''});
    while(tail[0]?.type==='space')tail.shift();
   }
   if(tail[0]?.type==='function'&&cssText(tail[0].value).toLowerCase()==='supports'){
    const supports=tail.shift();wrappers.push({name:'supports',params:'('+valueParser.stringify(supports.nodes)+')'});
   }
   const media=valueParser.stringify(tail).trim();if(media)wrappers.push({name:'media',params:media});
   let nodes=imported.nodes.map(node=>node.clone());
   for(const wrapper of wrappers.reverse()){const outer=postcss.atRule(wrapper);outer.append(nodes);nodes=[outer];}
   rule.replaceWith(...nodes);
  });
  tree.walkDecls(declaration=>{
   const font=declaration.parent.type==='atrule'&&cssText(declaration.parent.name).toLowerCase()==='font-face'&&declaration.prop.toLowerCase()==='src';
   const ast=valueParser(declaration.value);
   if(font)fontSources(ast);
   inlineValues(ast.nodes,path,font?'font':null);declaration.value=ast.toString();
  });
  const css=tree.toString();
  compiledBytes+=Buffer.byteLength(css);
  if(Buffer.byteLength(css)>32*1024*1024||compiledBytes>64*1024*1024)throw Error('CSS incorporado excede o orçamento de memória.');
  if(/<\//.test(css))throw Error('CSS não pode conter fechamento de elemento HTML no bundle.');
  visiting.delete(path);compiled.set(path,css);return css;
 }
 const styles=brand.stylesheets.map(stylesheet).join('\n');
 if(Buffer.byteLength(styles)>32*1024*1024)throw Error('Bundle de CSS excede 32 MiB.');
 return {
  styles,stylesheets:compiled,
  manifest:records.map(({dataUrl,...asset})=>asset),
  rendererAssets:records,
  files:Object.fromEntries(records.map(asset=>[asset.path,{body:asset.dataUrl.split(',')[1],encoding:'base64',mime:asset.mime}]))
 };
}

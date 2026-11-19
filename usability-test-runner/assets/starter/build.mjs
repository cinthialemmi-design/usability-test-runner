import {readFileSync, mkdirSync, readdirSync, writeFileSync, existsSync, realpathSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve, relative, sep} from 'node:path';
import {createHash} from 'node:crypto';
import {assertProfile} from './server/profile.mjs';
import {compileAssets} from './server/assets.mjs';

export const ROOT = fileURLToPath(new URL('./', import.meta.url));
export function buildStudy() {
  const cfg = JSON.parse(readFileSync(resolve(ROOT,'study.config.json'),'utf8'));
  assertProfile(cfg);
  const publicDir = resolve(ROOT,'public'), out = resolve(ROOT,'dist');
  const inside = p => { const path = realpathSync(p); if (!path.startsWith(realpathSync(publicDir)+sep)) throw Error('Asset fora de public.'); return path; };
  const resources=compileAssets(publicDir,cfg.brand),styles=resources.styles;
  cfg.brand.assets=resources.manifest;
  if (!existsSync(inside(resolve(publicDir,cfg.prototype.adapter)))) throw Error('Adaptador não encontrado.');
  const core = readFileSync(resolve(publicDir,'core.mjs'),'utf8').replaceAll('export ','');
  const player = readFileSync(resolve(publicDir,'renderer.mjs'),'utf8');
  const stamp = createHash('sha256').update(JSON.stringify(cfg)+styles+core+player).digest('hex').slice(0,24);
  cfg.brand.bundleId = 'brand-'+stamp;
  cfg.visual.rendererBundleId = 'renderer-'+stamp;
  cfg.visual.rendererBundle = 'replay/'+stamp+'.html';
  const renderConfig = {prototypeRevision:cfg.prototypeRevision,brand:{...cfg.brand,assets:resources.rendererAssets},prototype:{rootSelector:cfg.prototype.rootSelector},visual:cfg.visual};
  const encoded = JSON.stringify(renderConfig).replaceAll('<','\\u003c');
  const renderer = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'none'; form-action 'none'; base-uri 'none'; img-src data:; font-src data:"><title>Reconstrução do protótipo</title><style>${styles}\nhtml,body{margin:0;padding:0;overflow:hidden;background:var(--surface)}.prototype-root{margin:0;border:0;border-radius:0;pointer-events:none}*{animation:none!important;transition:none!important;caret-color:transparent!important}</style><body><script>const CFG=${encoded};\n${core}\n${player}</script></body></html>`;
  const files = {};
  function visit(dir) {
    for (const entry of readdirSync(dir,{withFileTypes:true})) {
      if (entry.isSymbolicLink()) throw Error('Links simbólicos não são empacotados.');
      const path = resolve(dir,entry.name);
      if (entry.isDirectory()) visit(path);
      else if (/\.(html|css|mjs)$/.test(entry.name) && entry.name !== 'renderer.mjs') {
        const name = '/'+relative(publicDir,path).split(sep).join('/');
        files[name] = {body:readFileSync(path,'utf8'),mime:entry.name.endsWith('.html')?'text/html; charset=utf-8':entry.name.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8'};
      }
    }
  }
  visit(publicDir);
  Object.assign(files,resources.files);
  for(const [path,body]of resources.stylesheets)files[path]={body,mime:'text/css; charset=utf-8'};
  files['/'] = files['/index.html'];
  files['/'+cfg.visual.rendererBundle] = {body:renderer,mime:'text/html; charset=utf-8'};
  mkdirSync(out,{recursive:true});
  writeFileSync(resolve(out,'files.json'),JSON.stringify(files));
  writeFileSync(resolve(out,'config.json'),JSON.stringify(cfg,null,2)+'\n');
  return {config:cfg,files};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  buildStudy(); process.stdout.write('Pacote gerado. Isso não verifica execução, privacidade ou coleta.\n');
}

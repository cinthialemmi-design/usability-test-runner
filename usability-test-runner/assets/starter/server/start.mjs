import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {buildStudy,ROOT} from '../build.mjs';
import {handleAPI} from './api.mjs';
import {createResearcherAuth} from './auth.mjs';

const port = Number(process.env.PORT || 4783), host = process.env.HOST || '127.0.0.1';
const origin = new URL(process.env.PUBLIC_ORIGIN || `http://127.0.0.1:${port}`);
if (!['http:','https:'].includes(origin.protocol) || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) throw Error('PUBLIC_ORIGIN precisa conter somente esquema, host e porta.');
if (origin.protocol !== 'https:' && !['127.0.0.1','localhost','[::1]'].includes(origin.hostname)) throw Error('Hospedagem pública requer PUBLIC_ORIGIN HTTPS.');
const auth = createResearcherAuth(process.env.RESEARCHER_TOKEN,origin.protocol === 'https:');
const {config:CONFIG,files} = buildStudy();
const dataDir = resolve(ROOT,process.env.DATA_DIR || '.data'); mkdirSync(dataDir,{recursive:true,mode:0o700});
const sqlite = new DatabaseSync(resolve(dataDir,'study.sqlite'));
sqlite.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;');
sqlite.exec('CREATE TABLE IF NOT EXISTS _metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL); CREATE TABLE IF NOT EXISTS _migrations(name TEXT PRIMARY KEY);');
// A changed study must never silently reinterpret existing participant records.
const fingerprint = createHash('sha256').update(JSON.stringify(CONFIG)).digest('hex');
const existing = sqlite.prepare('SELECT value FROM _metadata WHERE key=?').get('configHash');
if (existing && existing.value !== fingerprint) throw Error('Configuração diferente neste banco. Preserve o banco/bundle anterior e use outro DATA_DIR para a nova revisão ou ambiente.');
for (const name of readdirSync(resolve(ROOT,'migrations')).filter(n=>/^\d+.*\.sql$/.test(n)).sort()) {
  if (sqlite.prepare('SELECT name FROM _migrations WHERE name=?').get(name)) continue;
  sqlite.exec('BEGIN IMMEDIATE');
  try { sqlite.exec(readFileSync(resolve(ROOT,'migrations',name),'utf8')); sqlite.prepare('INSERT INTO _migrations(name) VALUES(?)').run(name); sqlite.exec('COMMIT'); }
  catch (error) { sqlite.exec('ROLLBACK'); throw error; }
}
sqlite.prepare('INSERT OR IGNORE INTO _metadata(key,value) VALUES(?,?)').run('configHash',fingerprint);
const DB = {
  prepare(sql) {
    let args=[];
    const statement = {bind(...values){args=values;return statement;},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return statement.runSync();},runSync(){return sqlite.prepare(sql).run(...args);}};
    return statement;
  },
  async batch(statements) {
    // No await inside the transaction: other HTTP requests cannot interleave SQLite work.
    sqlite.exec('BEGIN IMMEDIATE');
    try {const result=statements.map(s=>s.runSync());sqlite.exec('COMMIT');return result;}
    catch(error){sqlite.exec('ROLLBACK');throw error;}
  }
};
const sweep = () => sqlite.prepare('DELETE FROM sessions WHERE created_at < ?').run(new Date(Date.now()-CONFIG.consent.retentionDays*86400000).toISOString());
sweep(); const cleanup = setInterval(sweep,3600000); cleanup.unref();
const limits = new Map();
function allow(key,max) {
  const now=Date.now();
  for (const [k,v] of limits) if (v.until<=now) limits.delete(k);
  let item=limits.get(key); if (!item) { if(limits.size>=10000)return false;item={count:0,until:now+60000};limits.set(key,item); }
  return ++item.count<=max;
}
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8',...headers}});
const csp="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'";
const server=http.createServer(async(req,res)=>{
  let response;
  try {
    const target=new URL(req.url,origin); if(target.origin!==origin.origin)throw Error('Origem inválida.');
    const ip=req.socket.remoteAddress || 'unknown';
    if(!allow('all:'+ip,1200)) {res.writeHead(429,{'Retry-After':'60'});res.end();return;}
    if(req.headers.origin && req.headers.origin!==origin.origin) {res.writeHead(403);res.end();return;}
    if(!['GET','HEAD'].includes(req.method) && req.headers.origin!==origin.origin) {res.writeHead(403);res.end();return;}
    if(['POST','PUT','PATCH','DELETE'].includes(req.method) && !String(req.headers['content-type']||'').includes('application/json')) {res.writeHead(415);res.end();return;}
    if((target.pathname==='/api/login'||target.pathname==='/api/sessions')&&req.method==='POST'&&!allow(target.pathname+':'+ip,target.pathname.endsWith('login')?10:30)) {res.writeHead(429,{'Retry-After':'60'});res.end();return;}
    let size=0;const chunks=[];
    for await (const chunk of req) {size+=chunk.length;if(size>262144){res.writeHead(413);res.end();return;}chunks.push(chunk);}
    const body=Buffer.concat(chunks).toString('utf8');
    const request=new Request(target,{method:req.method,headers:new Headers(req.headers),body:['GET','HEAD'].includes(req.method)?undefined:body});
    if(target.pathname==='/api/login'&&req.method==='POST') {
      let input;try{input=JSON.parse(body);}catch{input={};}
      const cookie=auth.login(input?.token);response=cookie?json({authenticated:true},200,{'Set-Cookie':cookie}):json({error:'Acesso não autorizado.'},401);
    } else if(target.pathname==='/api/logout'&&req.method==='POST') response=json({authenticated:false},200,{'Set-Cookie':auth.logout()});
    else response=await handleAPI(request,{DB,CONFIG,isResearcher:auth.authenticated});
    if(!response) {
      const file=files[target.pathname];
      response=file&&['GET','HEAD'].includes(req.method)?new Response(req.method==='HEAD'?null:file.body,{headers:{'Content-Type':file.mime}}):json({error:'Página não encontrada.'},404);
    }
    const headers=Object.fromEntries(response.headers);
    headers['Cache-Control']='no-store'; headers['X-Content-Type-Options']='nosniff'; headers['Referrer-Policy']='no-referrer';
    headers['Permissions-Policy']='camera=(), microphone=(), geolocation=()';
    // Renderer has its own restrictive CSP and is framed with an opaque sandbox origin.
    if(!target.pathname.startsWith('/replay/')) headers['Content-Security-Policy']=csp;
    res.writeHead(response.status,headers);res.end(req.method==='HEAD'?undefined:Buffer.from(await response.arrayBuffer()));
  } catch {res.writeHead(500,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'Não foi possível processar esta solicitação.'}));}
});
server.requestTimeout=30000;server.headersTimeout=15000;
server.listen(port,host,()=>process.stdout.write(`Estudo: ${origin.origin}/\nPainel: ${origin.origin}/resultados.html\nAmbiente: ${CONFIG.environment}. Verificação de execução pendente.\n`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{clearInterval(cleanup);server.close(()=>{sqlite.close();process.exit(0);});});

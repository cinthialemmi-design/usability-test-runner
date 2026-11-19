import {canonical,digest,evaluate,sanitizeTree,groupKey,summarize} from '../public/core.mjs';
import {participantConfig} from './profile.mjs';

const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function fail(status,message){throw Object.assign(Error(message),{status});}
const id=x=>{if(typeof x!=='string'||!/^[a-zA-Z0-9_.:-]{1,100}$/.test(x))fail(400,'Identificador inválido.');return x;};
const number=(x,min=0,max=604800000)=>{if(!Number.isFinite(x)||x<min||x>max)fail(400,'Número inválido.');return x;};
const rows=async q=>(await q.all()).results;
const authToken=r=>(r.headers.get('Authorization')||'').replace(/^Bearer /,'');
// Identity is supplied by this server, never by client-controlled hosting headers.
const researcher=(r,env)=>{if(!env.isResearcher?.(r))fail(401,'Entre com o acesso de pesquisador para consultar os resultados.');};
const cleanInput=async r=>{if(!r.headers.get('Content-Type')?.includes('application/json'))fail(415,'Use JSON.');const text=await r.text();if(new TextEncoder().encode(text).length>262144)fail(413,'Lote muito grande.');let x;try{x=JSON.parse(text);}catch{fail(400,'JSON inválido.');}if(!x||typeof x!=='object'||Array.isArray(x))fail(400,'Objeto obrigatório.');return x;};
export async function handleAPI(request,env){
 const url=new URL(request.url);if(!url.pathname.startsWith('/api/'))return null;
 const path=url.pathname.slice(4),db=env.DB,cfg=env.CONFIG;
 try{
  if(request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)fail(403,'Origem não autorizada.');
  const q=(sql,...values)=>db.prepare(sql).bind(...values);
  const cutoff=new Date(Date.now()-cfg.consent.retentionDays*86400000).toISOString();
  await q('DELETE FROM sessions WHERE created_at < ?',cutoff).run();
  const all=async(session,kind)=>rows(q('SELECT * FROM records WHERE session_id = ? AND kind = ? ORDER BY seq, id',session,kind));
  const parsed=items=>items.map(r=>JSON.parse(r.data));
  const taskFor=taskId=>{const task=cfg.tasks.find(t=>t.taskId===taskId);if(!task)fail(400,'Tarefa desconhecida.');return task;};
  async function sessionAuth(sessionId){const s=await q('SELECT * FROM sessions WHERE id = ? AND token_hash = ?',id(sessionId),await digest(authToken(request))).first();if(!s)fail(401,'Sessão não autorizada.');return s;}
  const shape=s=>({id:s.id,alias:s.alias,status:s.status,createdAt:s.created_at,variantId:s.variant,prototypeRevision:s.revision,studyId:cfg.studyId,studyRevision:cfg.studyRevision,environment:cfg.environment,consentVersion:s.consent_version,visualCaptureVersion:s.consent,captureIncomplete:!!s.capture_incomplete});
  async function ensureAttempt(s,taskId,attemptId){taskFor(taskId);const started=await q("SELECT id FROM records WHERE session_id=? AND task_id=? AND attempt_id=? AND kind='event' AND json_extract(data,'$.type')='task_started'",s.id,taskId,attemptId).first();if(!started)fail(400,'Tentativa não iniciada.');}
  function eventBarrier(raw){
   if(!raw||!Number.isInteger(raw.count)||!Number.isInteger(raw.lastSequence))fail(400,'Confirmação de evidências obrigatória.');
   number(raw.count,0,1000000);number(raw.lastSequence,0,1000000);
   return {count:raw.count,lastSequence:raw.lastSequence};
  }
  function verifyBarrier(events,barrier){
   const last=events.reduce((max,event)=>Math.max(max,event.sequence),0);
   if(events.length!==barrier.count||last!==barrier.lastSequence)fail(409,'Há eventos pendentes antes de finalizar. Reenvie as evidências.');
  }
  function context(item,s){
   const task=taskFor(item.taskId),screen=cfg.prototype.screens.find(x=>x.screenId===item.screenId);
   if(!screen)fail(400,'Tela desconhecida.');
   id(item.attemptId);number(item.sequence,1,1000000);if(!Number.isInteger(item.sequence))fail(400,'Sequência inválida.');
   return {taskId:task.taskId,attemptId:item.attemptId,screenId:screen.screenId,sequence:item.sequence};
  }
  async function existingRecord(s,key,data){const old=await q('SELECT data FROM records WHERE session_id=? AND id=?',s.id,key).first();if(!old)return false;if(old.data!==canonical(data))fail(409,'O mesmo identificador já tem outro conteúdo.');return true;}
  async function insertRecords(s,items,budget={frames:0,points:0,bytes:0}){
   const pending=[];
   for(const item of items)if(!await existingRecord(s,item.id,item.data))pending.push(item);
   if(pending.length&&s.status!=='active')fail(409,'Esta sessão foi encerrada.');
   if(!pending.length)return;
   const commands=[];
   if(budget.frames||budget.points||budget.bytes)commands.push(q('UPDATE sessions SET frame_count=frame_count+?,point_count=point_count+?,tree_bytes=tree_bytes+? WHERE id=?',budget.frames,budget.points,budget.bytes,s.id));
   for(const item of pending)commands.push(q('INSERT INTO records(session_id,id,kind,task_id,attempt_id,seq,data) VALUES(?,?,?,?,?,?,?)',s.id,item.id,item.kind,item.data.taskId,item.data.attemptId,item.data.sequence,canonical(item.data)));
   try{await db.batch(commands);}catch(error){
    // A concurrent exact resend may win first. Reconcile immutable records.
    let duplicate=true;for(const item of pending)if(!await existingRecord(s,item.id,item.data))duplicate=false;
    if(!duplicate)fail(409,/CHECK/.test(error.message)?'Limite da captura atingido.':'Conflito ao receber o lote.');
   }
  }
  if(path==='/config'&&request.method==='GET')return json(participantConfig(cfg));
  if(path==='/sessions'&&request.method==='POST'){
   const body=await cleanInput(request);
   if(body.consent!==true||body.consentVersion!==cfg.consent.version||body.visualCaptureVersion!==cfg.consent.visualCaptureVersion)fail(400,'É necessário aceitar o aviso de coleta atual.');
   const sessionId=id(body.creationId),writeToken=body.writeToken;if(typeof writeToken!=='string'||!/^[a-f0-9]{64}$/.test(writeToken))fail(400,'Credencial de criação inválida.');
   const tokenHash=await digest(writeToken),existing=await q('SELECT * FROM sessions WHERE id=?',sessionId).first();
   if(existing){if(existing.token_hash!==tokenHash)fail(409,'Criação pertence a outra participação.');return json({session:shape(existing),writeToken});}
   const alias='P-'+sessionId.slice(0,6).toUpperCase();
   const variant=cfg.assignment.variantId||cfg.variants[0].variantId,limits=cfg.visual.limits;
   try{await q('INSERT INTO sessions(id,alias,token_hash,created_at,revision,variant,consent,consent_version,max_frames,max_points,max_tree_bytes) VALUES(?,?,?,?,?,?,?,?,?,?,?)',sessionId,alias,tokenHash,new Date().toISOString(),cfg.prototypeRevision,variant,cfg.consent.visualCaptureVersion,cfg.consent.version,limits.maxFrames,limits.maxPoints,limits.maxTreeBytes).run();}
   catch(error){const raced=await q('SELECT * FROM sessions WHERE id=?',sessionId).first();if(!raced||raced.token_hash!==tokenHash)fail(409,'Conflito ao criar participação.');return json({session:shape(raced),writeToken});}
   return json({session:{id:sessionId,alias,status:'active',variantId:variant},writeToken});
  }
  let match=path.match(/^\/sessions\/([^/]+)(?:\/(events|visuals|results|finish|stop))?$/);
  if(match){
   const s=await sessionAuth(match[1]),action=match[2];
   if(!action&&request.method==='GET')return json({session:shape(s),events:parsed(await all(s.id,'event')),results:parsed(await all(s.id,'result'))});
   if(request.method!=='POST')fail(405,'Método não permitido.');
   const body=await cleanInput(request);
   if(action==='events'){
    if(!Array.isArray(body.items)||body.items.length>50)fail(400,'Lote de eventos inválido.');
    const batch=[];
    for(const raw of body.items){
     const ctx=context(raw,s);id(raw.id);if(!['task_started','screen_view','action','state_change','visibility_changed','pause','resume'].includes(raw.type))fail(400,'Evento não permitido.');
     const payload={};
     if(raw.type==='action'){if(!cfg.prototype.allowedActionIds.includes(raw.payload?.actionId))fail(400,'Ação desconhecida.');payload.actionId=raw.payload.actionId;for(const field of cfg.prototype.allowedEventFields)if(typeof raw.payload?.[field]==='boolean')payload[field]=raw.payload[field];}
     if(raw.type==='state_change')for(const field of cfg.prototype.allowedStateKeys)if(typeof raw.payload?.[field]==='boolean')payload[field]=raw.payload[field];
     if(raw.type==='task_started')payload.assistedSetup=raw.payload?.assistedSetup===true;
     if(raw.type==='visibility_changed')payload.visible=raw.payload?.visible===true;
     const data={id:raw.id,...ctx,type:raw.type,payload,timelineMs:number(raw.timelineMs)};
     if(!await existingRecord(s,raw.id,data)&&await q("SELECT id FROM records WHERE session_id=? AND attempt_id=? AND kind='result'",s.id,ctx.attemptId).first())fail(409,'Esta tentativa já foi respondida.');
     if(raw.type!=='task_started'){
      const localStart=batch.some(i=>i.data.type==='task_started'&&i.data.attemptId===ctx.attemptId&&i.data.taskId===ctx.taskId);
      if(!localStart)await ensureAttempt(s,ctx.taskId,ctx.attemptId);
     }
     batch.push({id:raw.id,kind:'event',data});
    }
    if(new Set(batch.map(x=>x.id)).size!==batch.length)fail(400,'IDs repetidos no lote.');
    await insertRecords(s,batch);return json({receivedIds:batch.map(x=>x.id)});
   }
   if(action==='visuals'){
    if(!cfg.visual.enabled)fail(403,'Captura visual desabilitada.');
    if(s.consent!==cfg.consent.visualCaptureVersion)fail(403,'Aceite visual desatualizado.');
    if(!Array.isArray(body.frames)||!Array.isArray(body.points)||body.frames.length>2||body.points.length>50)fail(400,'Lote visual inválido.');
    const batch=[],frames=new Map(),budget={frames:0,points:0,bytes:0};
    for(const raw of body.frames){
     const ctx=context(raw,s);await ensureAttempt(s,ctx.taskId,ctx.attemptId);id(raw.frameId);
     for(const [key,value]of Object.entries({prototypeRevision:s.revision,variantId:s.variant,brandBundleId:cfg.brand.bundleId,rendererBundleId:cfg.visual.rendererBundleId,captureSchemaVersion:cfg.visual.captureSchemaVersion}))if(raw[key]!==value)fail(400,'Revisão visual incompatível.');
     const width=number(raw.width,160,2048),height=number(raw.height,160,4096);if(!Number.isInteger(width)||!Number.isInteger(height))fail(400,'Geometria inválida.');
     const tree=sanitizeTree(raw.tree,cfg.visual.privacy,cfg.brand.assets);if(!tree)fail(400,'Árvore inválida.');
     const data={...ctx,frameId:raw.frameId,width,height,tree,prototypeRevision:s.revision,variantId:s.variant,brandBundleId:cfg.brand.bundleId,rendererBundleId:cfg.visual.rendererBundleId,captureSchemaVersion:cfg.visual.captureSchemaVersion,timelineMs:number(raw.timelineMs),segmentId:id(raw.segmentId)};
     data.layoutKey=await groupKey(data);const bytes=new TextEncoder().encode(canonical(tree)).length;if(bytes>80000)fail(413,'Captura grande demais.');
     if(!await existingRecord(s,raw.frameId,data)){budget.frames++;budget.bytes+=bytes;}
     batch.push({id:raw.frameId,kind:'frame',data});frames.set(raw.frameId,data);
    }
    for(const raw of body.points){
     const ctx=context(raw,s);id(raw.pointId);id(raw.frameId);
     let frame=frames.get(raw.frameId);if(!frame){const row=await q("SELECT data FROM records WHERE session_id=? AND id=? AND kind='frame'",s.id,raw.frameId).first();frame=row&&JSON.parse(row.data);}
     if(!frame||frame.attemptId!==ctx.attemptId||frame.taskId!==ctx.taskId||frame.screenId!==ctx.screenId||frame.segmentId!==raw.segmentId)fail(400,'Ponto sem captura correspondente.');
     const data={...ctx,pointId:raw.pointId,frameId:raw.frameId,x:number(raw.x,0,frame.width),y:number(raw.y,0,frame.height),kind:raw.kind==='tap'?'tap':'click',timelineMs:number(raw.timelineMs),segmentId:id(raw.segmentId)};
     if(!await existingRecord(s,raw.pointId,data))budget.points++;
     batch.push({id:raw.pointId,kind:'point',data});
    }
    if(new Set(batch.map(x=>x.id)).size!==batch.length)fail(400,'IDs visuais repetidos.');
    await insertRecords(s,batch,budget);return json({receivedFrameIds:body.frames.map(x=>x.frameId),receivedPointIds:body.points.map(x=>x.pointId)});
   }
   if(action==='results'){
    const task=taskFor(body.taskId);id(body.id);id(body.attemptId);number(body.sequence,1,1000000);if(!Number.isInteger(body.sequence))fail(400,'Sequência inválida.');await ensureAttempt(s,body.taskId,body.attemptId);
    if(!['self_reported','gave_up'].includes(body.status))fail(400,'Resultado inválido.');
    if(body.status==='gave_up'&&task.allowGiveUp===false)fail(400,'Desistência não habilitada nesta tarefa.');
    if(body.status==='self_reported'&&task.allowSelfReportedCompletion===false)fail(400,'Declaração não habilitada nesta tarefa.');
    const elapsedMs=number(body.elapsedMs),visibleExecutionMs=number(body.visibleExecutionMs,0,elapsedMs),answers={};
    for(const question of task.postTaskQuestions||[]){const value=body.answers?.[question.questionId];if(value===undefined||value===null||value===''){if(question.required)fail(400,'Responda as perguntas obrigatórias.');continue;}if(question.type==='scale'){number(value,question.min,question.max);if(!Number.isInteger(value))fail(400,'Escala inválida.');answers[question.questionId]=value;}else {if(typeof value!=='string'||value.length>1000)fail(400,'Texto inválido.');answers[question.questionId]=value;}}
    const input={id:body.id,taskId:body.taskId,attemptId:body.attemptId,sequence:body.sequence,status:body.status,elapsedMs,visibleExecutionMs,answers,eventBarrier:eventBarrier(body.eventBarrier)};
    const old=await q("SELECT data FROM records WHERE session_id=? AND id=? AND kind='result'",s.id,body.id).first();if(old){const data=JSON.parse(old.data);if(canonical(data.input)!==canonical(input))fail(409,'Resposta já recebida com conteúdo diferente.');return json(data);}
    const events=parsed(await all(s.id,'event')).filter(e=>e.taskId===task.taskId&&e.attemptId===body.attemptId).sort((a,b)=>a.sequence-b.sequence),start=events.find(e=>e.type==='task_started');
    verifyBarrier(events,input.eventBarrier);
    if(events.some(e=>e.sequence<start.sequence||e.sequence>=body.sequence))fail(409,'Ordem de evidências inválida.');
    const evidence=events;
    const state=Object.assign({},...evidence.filter(e=>e.type==='state_change').map(e=>e.payload));
    const outcome=body.status==='gave_up'?'gave_up':evaluate(task.successCriterion,evidence,state,answers)?'observed_success':'self_reported';
    const data={...input,input,outcome,criterionVersion:cfg.studyRevision,evidenceIds:evidence.map(e=>e.id),captureIncomplete:body.captureIncomplete===true};
    await insertRecords(s,[{id:body.id,kind:'result',data}]);return json(data);
   }
   if(action==='finish'||action==='stop'){
    const results=parsed(await all(s.id,'result'));
    verifyBarrier(parsed(await all(s.id,'event')),eventBarrier(body.eventBarrier));
    if(action==='finish'&&!cfg.tasks.every(t=>results.some(r=>r.taskId===t.taskId)))fail(409,'Há tarefas sem resposta.');
    const status=action==='finish'?'completed':'stopped';if(s.status==='active')await q('UPDATE sessions SET status=?,capture_incomplete=MAX(capture_incomplete,?) WHERE id=?',status,body.captureIncomplete===true?1:0,s.id).run();return json({status:s.status==='active'?status:s.status});
   }
  }
  if((path==='/report'||path==='/export')&&request.method==='GET'){
   researcher(request,env);const sessions=await rows(q('SELECT * FROM sessions ORDER BY created_at DESC, id'));const shaped=[],results=[];
   for(const s of sessions){const events=parsed(await all(s.id,'event')),saved=parsed(await all(s.id,'result'));results.push(...saved.map(r=>({...r,sessionId:s.id})));shaped.push({...shape(s),startedTasks:[...new Set(events.filter(e=>e.type==='task_started').map(e=>e.taskId))],results:saved,notes:await rows(q('SELECT task_id taskId,verdict,note,at FROM notes WHERE session_id=?',s.id))});}
   const page=Math.max(1,Math.floor(Number(url.searchParams.get('page'))||1)),detailLimit=50;
   return json({studyId:cfg.studyId,studyRevision:cfg.studyRevision,prototypeRevision:cfg.prototypeRevision,environment:cfg.environment,pilot:cfg.environment==='pilot',sessions:path==='/export'?shaped:shaped.slice((page-1)*detailLimit,page*detailLimit),tasks:summarize(shaped,results,cfg.tasks),totalSessions:shaped.length,completedSessions:shaped.filter(s=>s.status==='completed').length,detailLimit,page,pages:Math.max(1,Math.ceil(shaped.length/detailLimit)),studyConfig:cfg,exportedAt:path==='/export'?new Date().toISOString():undefined});
  }
  const deletion=path.match(/^\/participants\/([^/]+)$/);
  if(deletion&&request.method==='DELETE'){researcher(request,env);await q('DELETE FROM sessions WHERE id=?',id(deletion[1])).run();return json({deleted:true});}
  if(path.startsWith('/replay/')&&request.method==='GET'){
   if(!cfg.visual.replay)fail(404,'Replay desabilitado.');
   researcher(request,env);const sessionId=id(path.slice(8));const s=await q('SELECT id,alias,capture_incomplete FROM sessions WHERE id=?',sessionId).first();if(!s)fail(404,'Sessão não encontrada.');const events=parsed(await all(sessionId,'event')).filter(e=>['pause','resume','visibility_changed'].includes(e.type));const results=parsed(await all(sessionId,'result'));return json({session:s,frames:parsed(await all(sessionId,'frame')),points:parsed(await all(sessionId,'point')),events,captureIncomplete:!!s.capture_incomplete||results.some(r=>r.captureIncomplete)});
  }
  if(path==='/heatmap'&&request.method==='GET'){
   if(!cfg.visual.heatmaps)fail(404,'Mapas desabilitados.');
   researcher(request,env);const taskId=url.searchParams.get('taskId'),screenId=url.searchParams.get('screenId'),sessionId=url.searchParams.get('sessionId');taskFor(taskId);if(!cfg.prototype.screens.some(s=>s.screenId===screenId))fail(400,'Tela desconhecida.');
   let query="SELECT session_id,data FROM records WHERE kind='frame' AND task_id=? AND json_extract(data,'$.screenId')=?",args=[taskId,screenId];if(sessionId){query+=' AND session_id=?';args.push(id(sessionId));}
   const frames=await rows(q(query,...args)),groups=new Map();let totalPoints=0;
   for(const row of frames){const frame=JSON.parse(row.data),points=parsed(await rows(q("SELECT data FROM records WHERE session_id=? AND kind='point' AND json_extract(data,'$.frameId')=?",row.session_id,frame.frameId)));if(!points.length)continue;let g=groups.get(frame.layoutKey);if(!g){g={layoutKey:frame.layoutKey,frame,points:[],sessionIds:new Set(),totalPoints:0};groups.set(frame.layoutKey,g);}g.points.push(...points);g.totalPoints+=points.length;g.sessionIds.add(row.session_id);totalPoints+=points.length;}
   return json({totalPoints,groups:[...groups.values()].map(g=>({...g,sessionIds:undefined,sessions:g.sessionIds.size,points:g.points.slice(0,3000)})),truncated:[...groups.values()].some(g=>g.points.length>3000)});
  }
  if(path==='/notes'&&request.method==='POST'){
   researcher(request,env);const b=await cleanInput(request);taskFor(b.taskId);const sessionId=id(b.sessionId);if(!await q('SELECT id FROM sessions WHERE id=?',sessionId).first())fail(404,'Sessão não encontrada.');
   if(!['success','assisted','failed','not_evaluable'].includes(b.verdict))fail(400,'Avaliação inválida.');const note=typeof b.note==='string'?b.note.slice(0,1000):'';
   await q('INSERT INTO notes(session_id,task_id,verdict,note,author,at) VALUES(?,?,?,?,?,?) ON CONFLICT(session_id,task_id) DO UPDATE SET verdict=excluded.verdict,note=excluded.note,author=excluded.author,at=excluded.at',sessionId,b.taskId,b.verdict,note,'study-owner',new Date().toISOString()).run();return json({received:true});
  }
  return json({error:'Rota não encontrada.'},404);
 }catch(error){return json({error:error.status?error.message:'Não foi possível processar a solicitação.'},error.status||500);}
}

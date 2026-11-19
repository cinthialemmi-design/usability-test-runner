const $ = selector => document.querySelector(selector);
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let cfg,report,page=1,heatGroups=[],replay=null,frames=[],points=[];
let time=0,start=0,end=0,playing=false,tickId,lastTick=0;
const stageStates=new Map();
async function api(path,method='GET',body) {
  const response=await fetch('/api'+path,{method,cache:'no-store',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
  const data=await response.json();
  if (!response.ok) {if(response.status===401)clearPrivateView();throw Object.assign(Error(data.error||'Falha de comunicação.'),{status:response.status});}
  return data;
}
function clearPrivateView() {
  stop();cfg=null;report=null;replay=null;frames=[];points=[];heatGroups=[];stageStates.clear();
  $('#results-panel').hidden=true;$('#login-panel').hidden=false;$('#logout').hidden=true;
  for(const id of ['#report','#sessions'])$(id).replaceChildren();
  for(const iframe of document.querySelectorAll('iframe'))iframe.removeAttribute('src');
  $('#replay-section').hidden=true;$('#heat-stage').hidden=true;
}
function stage(id,frame,dots,mode) {
  const host=$(id),iframe=host.querySelector('iframe');let state=stageStates.get(iframe);
  if (!state) {state={nonce:null,data:null};stageStates.set(iframe,state);}
  host.hidden=!frame;state.data=frame?{frame,points:dots,mode}:null;if(!frame)return;
  const width=Math.min(host.parentElement.clientWidth,430,frame.width),scale=width/frame.width;
  host.style.width=width+'px';host.style.height=frame.height*scale+'px';
  iframe.style.width=frame.width+'px';iframe.style.height=frame.height+'px';iframe.style.transformOrigin='top left';iframe.style.transform='scale('+scale+')';
  if(state.nonce)iframe.contentWindow.postMessage({type:'usability-frame',nonce:state.nonce,...state.data},'*');
  else iframe.contentWindow.postMessage({type:'usability-renderer-init'},'*');
}
window.addEventListener('message',event=>{
  if(event.origin!=='null'||event.data?.type!=='usability-renderer-ready'||typeof event.data.nonce!=='string')return;
  for(const [iframe,state]of stageStates)if(event.source===iframe.contentWindow){
    state.nonce=event.data.nonce;
    if(state.data)iframe.contentWindow.postMessage({type:'usability-frame',nonce:state.nonce,...state.data},'*');
  }
});
function initStages() {
  for(const iframe of document.querySelectorAll('iframe')) {
    const src='/'+cfg.visual.rendererBundle;
    if(iframe.getAttribute('src')!==src){stageStates.set(iframe,{nonce:null,data:null});iframe.src=src;}
  }
}
const outcomes={observed_success:'Conclusão observada',self_reported:'Conclusão declarada',gave_up:'Não conseguiu'};
function render() {
  $('#report-title').textContent=cfg.title;
  $('#report-environment').textContent=(report.pilot?'Piloto · dados separados da pesquisa real':'Pesquisa')+' · revisão '+report.studyRevision;
  $('#report').innerHTML=`<div class="metrics"><div class="metric"><strong>${report.totalSessions}</strong><span>participações</span></div><div class="metric"><strong>${report.completedSessions}</strong><span>finalizadas</span></div><div class="metric"><strong>${cfg.tasks.length}</strong><span>tarefas</span></div></div>
    <section class="report-section"><h2>Resultados por tarefa</h2><table><thead><tr><th>Tarefa</th><th>Observadas / iniciadas</th><th>Mediana do tempo visível</th></tr></thead><tbody>${report.tasks.map(t=>`<tr><td>${esc(t.title)}</td><td>${t.verified} / ${t.started}</td><td>${t.medianMs===null?'Sem dados':(t.medianMs/1000).toFixed(1)+' s'}</td></tr>`).join('')}</tbody></table>
    <p class="note">Todas as tentativas iniciadas entram no denominador, incluindo as que não têm resposta final. O tempo usa somente conclusões observadas e exclui pausas, perguntas, segundo plano e telas excluídas na configuração. Declaração e avaliação humana são separadas.</p></section>`;
  $('#sessions').innerHTML=report.sessions.length?report.sessions.map(s=>{
    const tasks=s.results.map(r=>{
      const task=cfg.tasks.find(t=>t.taskId===r.taskId);
      return `<section><h3>${esc(task?.title||r.taskId)}</h3><p>${esc(outcomes[r.outcome]||r.outcome)} · ${(r.visibleExecutionMs/1000).toFixed(1)} s${r.captureIncomplete?' · captura parcial':''}</p>${(task?.postTaskQuestions||[]).map(q=>`<p><strong>${esc(q.prompt)}</strong><br>${esc(r.answers[q.questionId]??'Não respondida')}</p>`).join('')}${task?.moderatorRubric?`<p class="note">Rubrica da equipe: ${esc(task.moderatorRubric)}</p>`:''}</section>`;
    }).join('');
    const notes=(s.notes||[]).map(n=>`<p class="note">${esc(n.taskId)} · ${esc(n.verdict)} · ${esc(n.at)}: ${esc(n.note)}</p>`).join('');
    return `<details class="session" data-session="${esc(s.id)}"><summary>${esc(s.alias)} · ${esc({active:'Em andamento',completed:'Finalizada',stopped:'Encerrada'}[s.status])} · ${s.results.length} respostas</summary><div class="session-body">${cfg.visual.replay?`<button data-replay="${esc(s.id)}">Ver replay visual</button>`:''}${tasks}<label>Tarefa<select data-note-task>${cfg.tasks.map(t=>`<option value="${esc(t.taskId)}">${esc(t.title)}</option>`).join('')}</select></label><label>Avaliação da equipe<select data-note-verdict><option value="success">Concluiu sem ajuda</option><option value="assisted">Concluiu com ajuda</option><option value="failed">Não concluiu</option><option value="not_evaluable">Não avaliável</option></select></label><label>Observação<textarea data-note maxlength="1000"></textarea></label><button data-save-note="${esc(s.id)}">Salvar avaliação</button><button data-delete="${esc(s.id)}">Excluir os dados desta participação</button><p data-note-status class="note" role="status"></p>${notes}</div></details>`;
  }).join(''):'<p class="empty">Ainda não há participações nesta página. Nenhum dado foi inventado.</p>';
  $('#page-status').textContent=`Página ${report.page} de ${report.pages}`;
  $('#page-prev').disabled=report.page<=1;$('#page-next').disabled=report.page>=report.pages;
  $('#heat-section').hidden=!cfg.visual.heatmaps;
  $('#heat-task').innerHTML=cfg.tasks.map(t=>`<option value="${esc(t.taskId)}">${esc(t.title)}</option>`).join('');
  $('#heat-screen').innerHTML=cfg.prototype.screens.map(s=>`<option value="${esc(s.screenId)}">${esc(s.label)}</option>`).join('');
  $('#heat-session').innerHTML='<option value="">Todas as participações</option>'+report.sessions.map(s=>`<option value="${esc(s.id)}">${esc(s.alias)}</option>`).join('');
}
async function refresh() {
  try {
    $('#report-status').textContent='Consultando registros recebidos…';
    report=await api('/report?page='+page);cfg=report.studyConfig;
    $('#results-panel').hidden=false;$('#login-panel').hidden=true;$('#logout').hidden=false;
    initStages();render();$('#report-status').textContent='Atualizado às '+new Date().toLocaleTimeString('pt-BR')+'. As exportações incluem todas as páginas deste ambiente.';
  } catch(error) {$('#report-status').textContent=error.message;}
}
$('#login-form').onsubmit=async event=>{
  event.preventDefault();const input=$('#researcher-token'),token=input.value;input.value='';
  try{await api('/login','POST',{token});page=1;await refresh();}catch(error){$('#report-status').textContent=error.message;}
};
$('#logout').onclick=async()=>{try{await api('/logout','POST',{});clearPrivateView();$('#report-status').textContent='Acesso encerrado.';}catch(error){$('#report-status').textContent=error.message;}};
$('#refresh').onclick=refresh;
$('#page-prev').onclick=()=>{page=Math.max(1,page-1);refresh();};
$('#page-next').onclick=()=>{page++;refresh();};
$('#sessions').onclick=async event=>{
  const button=event.target.closest('button');if(!button)return;
  try {
    if(button.dataset.replay){
      stop();replay=await api('/replay/'+button.dataset.replay);$('#replay-section').hidden=false;
      $('#replay-title').textContent='Replay · '+replay.session.alias;
      $('#replay-task').innerHTML='<option value="">Todas as tarefas</option>'+cfg.tasks.map(t=>`<option value="${esc(t.taskId)}">${esc(t.title)}</option>`).join('');
      filterReplay();$('#replay-section').scrollIntoView({behavior:'auto',block:'start'});
    }
    if(button.dataset.saveNote){
      const host=button.closest('details');
      await api('/notes','POST',{sessionId:button.dataset.saveNote,taskId:host.querySelector('[data-note-task]').value,verdict:host.querySelector('[data-note-verdict]').value,note:host.querySelector('[data-note]').value});
      host.querySelector('[data-note-status]').textContent='Avaliação recebida pelo servidor.';
    }
    if(button.dataset.delete&&confirm('Excluir permanentemente eventos, respostas, notas, capturas e pontos desta participação?')){
      await api('/participants/'+button.dataset.delete,'DELETE',{});stop();replay=null;frames=[];points=[];
      $('#replay-section').hidden=true;$('#heat-stage').hidden=true;heatGroups=[];await refresh();
    }
  } catch(error){$('#report-status').textContent=error.message;}
};
$('#load-heat').onclick=async()=>{
  try {
    $('#heat-status').textContent='Carregando pontos…';
    const query=new URLSearchParams({taskId:$('#heat-task').value,screenId:$('#heat-screen').value,...($('#heat-session').value?{sessionId:$('#heat-session').value}:{})});
    const data=await api('/heatmap?'+query);heatGroups=data.groups;
    $('#heat-group').innerHTML=heatGroups.map((g,i)=>`<option value="${i}">Visualização ${i+1} · ${g.frame.width} × ${g.frame.height} · ${g.totalPoints} pontos · ${g.sessions} participações</option>`).join('');
    $('#heat-status').textContent=data.totalPoints?data.totalPoints+' pontos recebidos.'+(data.truncated?' Exibindo até 3.000 pontos por visualização; totais completos preservados.':''):'Nenhum ponto recebido neste filtro. Isso também pode indicar captura ausente ou parcial.';
    drawHeat();
  } catch(error){$('#heat-status').textContent=error.message;}
};
function drawHeat(){const g=heatGroups[Number($('#heat-group').value)||0];stage('#heat-stage',g?.frame,g?.points||[],'heat');}
$('#heat-group').onchange=drawHeat;
function stop(){playing=false;cancelAnimationFrame(tickId);$('#replay-play').textContent='Reproduzir';}
function filterReplay(){
  stop();const task=$('#replay-task').value;
  frames=replay.frames.filter(f=>!task||f.taskId===task).sort((a,b)=>a.sequence-b.sequence);
  const ids=new Set(frames.map(f=>f.frameId));points=replay.points.filter(p=>ids.has(p.frameId));
  start=frames[0]?.timelineMs||0;end=Math.max(start,...frames.map(f=>f.timelineMs),...points.map(p=>p.timelineMs),...(replay.events||[]).filter(e=>!task||e.taskId===task).map(e=>e.timelineMs));time=start;
  $('#replay-time').min=start;$('#replay-time').max=end;drawReplay();
}
function drawReplay(){
  let frame=null;for(const f of frames){if(f.timelineMs<=time)frame=f;else break;}
  const dots=frame?points.filter(p=>p.frameId===frame.frameId&&p.timelineMs<=time):[];
  stage('#replay-stage',frame,dots,'replay');$('#replay-time').value=time;
  const markers=(replay.events||[]).filter(e=>e.timelineMs<=time&&(!$('#replay-task').value||e.taskId===$('#replay-task').value));const marker=markers.at(-1);const gap=marker&&(marker.type==='pause'||marker.type==='visibility_changed'&&!marker.payload.visible);
  $('#replay-status').textContent=frame?`${((time-start)/1000).toFixed(1)} / ${((end-start)/1000).toFixed(1)} s · ${cfg.prototype.screens.find(s=>s.screenId===frame.screenId)?.label||frame.screenId} · ${frames.length} capturas · ${points.length} pontos · segmento ${frame.segmentId.slice(0,8)}${gap?' · pausa ou segundo plano':''}${replay.captureIncomplete?' · captura parcial':''}`:'Sem captura visual para esta tarefa ou participação.';
  $('#replay-play').disabled=!frames.length||end<=start;
}
$('#replay-task').onchange=filterReplay;
$('#replay-time').oninput=event=>{stop();time=Number(event.target.value);drawReplay();};
$('#replay-play').onclick=()=>{
  if(playing){stop();return;}if(time>=end)time=start;playing=true;lastTick=performance.now();$('#replay-play').textContent='Pausar';
  const run=now=>{if(!playing)return;time=Math.min(end,time+(now-lastTick)*Number($('#replay-speed').value));lastTick=now;drawReplay();if(time>=end)stop();else tickId=requestAnimationFrame(run);};
  tickId=requestAnimationFrame(run);
};
$('#replay-prev').onclick=()=>{stop();time=[...frames].reverse().find(f=>f.timelineMs<time)?.timelineMs??start;drawReplay();};
$('#replay-next').onclick=()=>{stop();time=frames.find(f=>f.timelineMs>time)?.timelineMs??end;drawReplay();};
function download(name,text,type){const link=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type}));link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#export-json').onclick=async()=>{try{const data=await api('/export');download(cfg.studyId+'-'+cfg.environment+'.json',JSON.stringify(data,null,2),'application/json');}catch(error){$('#report-status').textContent=error.message;}};
$('#export-csv').onclick=async()=>{
  try {
    const data=await api('/export');
    const cell=value=>{let text=String(value??'');if(/^[\s\uFEFF]*[=+@\-\t\r]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
    const questions=[...new Set(cfg.tasks.flatMap(t=>(t.postTaskQuestions||[]).map(q=>q.questionId)))];
    const rows=[['estudo','revisao','ambiente','participacao','tarefa','resultado_automatico','tempo_visivel_ms','tempo_total_ms','captura_parcial',...questions,'avaliacao_humana','nota_humana']];
    for(const session of data.sessions)for(const taskId of session.startedTasks){
      const result=session.results.find(r=>r.taskId===taskId),note=session.notes.find(n=>n.taskId===taskId);
      rows.push([data.studyId,data.studyRevision,data.environment,session.alias,taskId,result?.outcome||'incomplete',result?.visibleExecutionMs,result?.elapsedMs,result?.captureIncomplete,...questions.map(q=>result?.answers[q]),note?.verdict,note?.note]);
    }
    download(cfg.studyId+'-'+cfg.environment+'.csv','\ufeff'+rows.map(r=>r.map(cell).join(',')).join('\r\n'),'text/csv;charset=utf-8');
  } catch(error){$('#report-status').textContent=error.message;}
};
await refresh();

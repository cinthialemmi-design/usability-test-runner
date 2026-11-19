import {initial,selectRoom,reserve,cancel,rooms} from './rooms.mjs';
const esc=x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function createAdapter(root,{config}){
 let listener=()=>{};const notify=event=>listener(event);
 let state=initial(),confirming=false;
 const selected=()=>rooms.find(r=>r.id===state.selectedRoomId)||rooms[0];
 const header=()=>'<header class="product-header"><img class="brand-mark" src="/prototype/assets/rooms-mark.svg" width="36" height="36" alt="Marca do exemplo de salas"><span class="brand">'+esc(config.brand.label||config.title)+'</span><span>Espaços para boas conversas.</span></header><nav class="product-nav"><button data-go="rooms" class="'+(state.screenId==='rooms'?'active':'')+'">Salas</button><button data-go="reservations" class="'+(['reservations','confirmed','cancelled'].includes(state.screenId)?'active':'')+'">Minhas reservas</button></nav>';
 const schedule=()=>'<div class="schedule"><span>Amanhã (exemplo)</span><span>14:00 — 15:00</span></div>';
 const roomMeta=r=>'<p class="room-meta">'+r.capacity+' pessoas · '+(r.video?'Vídeo e tela':'Tela')+'</p>';
 const summary=()=>'<div class="summary"><h3>'+esc(selected().name)+'</h3>'+schedule()+(state.booking?.title?'<p data-user-content title="'+esc(state.booking.title)+'">'+esc(state.booking.title)+'</p>':'')+'</div>';
 function render(){
  const r=selected();let html=header();
  if(state.screenId==='rooms')html+='<section class="space"><p class="eyebrow">ENCONTRE SEU ESPAÇO</p><h2>Encontre seu espaço.</h2><p>Uma mesa, boas ideias.</p>'+schedule()+'<div class="room-list">'+rooms.map(room=>'<article class="room-card"><div class="room-plan '+room.className+'" aria-hidden="true"></div><div class="room-copy"><h3>'+room.name+'</h3>'+roomMeta(room)+'<p class="room-meta">'+room.floor+'</p><button data-select="'+room.id+'">Ver sala</button></div></article>').join('')+'</div></section>';
  if(state.screenId==='details')html+='<section class="space"><button class="link" data-go="rooms">Voltar</button><h2>'+r.name+'</h2><p>'+r.description+'</p><div class="room-plan room-hero '+r.className+'" aria-hidden="true"></div><div class="detail-list"><div><small>Detalhes</small>'+r.capacity+' pessoas</div><div><small>Disponível</small>'+(r.video?'Vídeo e tela':'Tela')+'</div></div>'+schedule()+'<button class="primary" data-go="booking">Reservar esta sala</button></section>';
  if(state.screenId==='booking')html+='<section class="space"><button class="link" data-go="details">Voltar</button><h2>Sua próxima reunião.</h2>'+summary()+'<form id="booking-form"><label class="field">Título da reunião (opcional)<input id="meeting-title" maxlength="80" autocomplete="off" placeholder="Dê um título fictício" value="'+esc(state.draftTitle||'')+'"></label><button class="primary" type="submit">Confirmar reserva</button></form></section>';
  if(state.screenId==='confirmed')html+='<section class="space center"><div class="status-icon" aria-hidden="true"></div><h2>Reserva confirmada</h2><p>Seu espaço está reservado.</p>'+summary()+'<button class="primary" data-go="reservations">Ver minhas reservas</button><button class="link" data-go="rooms">Ver salas</button></section>';
  if(state.screenId==='reservations')html+='<section class="space"><h2>Minhas reservas</h2>'+(state.booking?.status==='confirmed'?summary()+'<button class="cancel" data-action="ask-cancel">Cancelar reserva</button>':'<p>Nenhuma reserva por aqui.</p><button class="primary" data-go="rooms">Ver salas</button>')+(confirming?'<section class="confirm-panel"><h3>Liberar este espaço?</h3><p>A reserva será cancelada e a sala ficará disponível.</p><button class="secondary" data-action="keep">Manter reserva</button><button class="cancel" data-action="cancel">Sim, cancelar</button></section>':'')+'</section>';
  if(state.screenId==='cancelled')html+='<section class="space center"><div class="status-icon" aria-hidden="true"></div><h2>Reserva cancelada</h2><p>O espaço está livre novamente.</p><button class="primary" data-go="rooms">Ver salas</button></section>';
  root.innerHTML=html;root.scrollTop=0;root.dataset.screen=state.screenId;
 }
 function changed(actionId,ok=true){render();notify({type:'screen_view',screenId:state.screenId,payload:{}});if(actionId)notify({type:'action',screenId:state.screenId,payload:{actionId,ok}});notify({type:'state_change',screenId:state.screenId,payload:getState()});}
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.select){state=selectRoom(state,b.dataset.select);changed('room-selected',state.suitableSelected);}
  else if(b.dataset.go){state.screenId=b.dataset.go;changed();}
  else if(b.dataset.action==='ask-cancel'){confirming=true;changed();}
  else if(b.dataset.action==='keep'){confirming=false;changed();}
  else if(b.dataset.action==='cancel'){state=cancel(state);confirming=false;changed('reservation-cancelled');}
 });
 root.addEventListener('submit',e=>{if(e.target.id!=='booking-form')return;e.preventDefault();state=reserve(state,root.querySelector('#meeting-title').value);changed('reservation-created');});
 root.addEventListener('input',e=>{if(e.target.id==='meeting-title')state.draftTitle=e.target.value;});
 function getState(){return {suitableSelected:state.suitableSelected,reservationCreated:state.reservationCreated,reservationCancelled:state.reservationCancelled};}
 return {render,getState,
  subscribe(fn){listener=fn;return ()=>{listener=()=>{};};},
  getSnapshot(){const snapshot=structuredClone(state);delete snapshot.draftTitle;if(snapshot.booking)delete snapshot.booking.title;return snapshot;},
  restore(snapshot){state=structuredClone(snapshot);render();},getScreen:()=>state.screenId,
  prepare(task){let assistedSetup=false;
   const fixture=config.scenarios.find(s=>s.scenarioId===task.entry.scenarioId)?.fixtureKey;
   if(!['empty','booked'].includes(fixture))throw Error('Fixture não implementada no adaptador de exemplo.');
   if(task.entry.continuity==='reset'){state=initial();if(fixture==='booked')state=reserve(selectRoom(state,'luz'),'');}else if(!state.selectedRoomId){state=selectRoom(initial(),'luz');assistedSetup=true;}
   if(task.entry.screenId==='confirmed'&&!state.booking){state=reserve(state,'');assistedSetup=true;}
   state.screenId=task.entry.screenId;confirming=false;render();return {assistedSetup};},
  reset(task){return this.prepare({...task,entry:{...task.entry,continuity:'reset'}});},
  start(){root.inert=false;},stop(){root.inert=true;}
 };
}

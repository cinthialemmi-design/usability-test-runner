export function ackResult(state,result,total){
 const results=state.results.some(r=>r.id===result.id)?state.results:[...state.results,result];
 const next={...state,results,pendingResult:null,taskIndex:state.taskIndex+1,nextTaskPending:true,phase:'preparing'};
 if(next.taskIndex>=total){next.finishPending=true;next.phase='sync';}
 return next;
}
export function finalizeLocal(state,phase){return {...state,phase,snapshot:null,events:[],frames:[],points:[],results:[],pendingResult:null,finishPending:false,stopPending:false};}
export async function recoverSession(saved,load){
 const snapshot=structuredClone(saved.snapshot??null),server=await load(saved.session.id);
 const state={...saved,snapshot,session:{...saved.session,...server.session}};
 if(server.session.status==='completed')return finalizeLocal(state,'finished');
 if(server.session.status==='stopped')return finalizeLocal(state,'stopped');
 state.phase=state.stopPending||state.finishPending||state.pendingResult?'sync':state.phase==='ready'?'ready':'paused';
 return state;
}
export function visibleClock(now,initialVisible=true){
 let last=now(),visible=initialVisible;
 const sample=running=>{const current=now(),delta=running&&visible?Math.max(0,current-last):0;last=current;return delta;};
 return {sample,setVisible(next,running){const delta=sample(running);visible=next;return delta;}};
}

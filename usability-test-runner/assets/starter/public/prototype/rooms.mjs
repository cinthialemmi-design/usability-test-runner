export const rooms=[
 {id:'luz',name:'Luz',capacity:6,video:true,floor:'1º andar',description:'Uma mesa, boas ideias.',className:'room-luz'},
 {id:'patio',name:'Pátio',capacity:4,video:false,floor:'1º andar',description:'Conforto para conversas menores.',className:'room-patio'},
 {id:'horizonte',name:'Horizonte',capacity:10,video:true,floor:'2º andar',description:'Espaço para reunir a equipe.',className:'room-horizonte'}
];
export function initial(){return {screenId:'rooms',selectedRoomId:null,suitableSelected:false,reservationCreated:false,reservationCancelled:false,booking:null};}
export function selectRoom(state,id){const room=rooms.find(r=>r.id===id);if(!room)throw Error('Sala inexistente.');return {...state,selectedRoomId:id,suitableSelected:room.capacity>=6&&room.video,screenId:'details'};}
export function reserve(state,title=''){
 if(state.booking?.status==='confirmed')return state;
 if(!rooms.some(r=>r.id===state.selectedRoomId))throw Error('Escolha uma sala.');
 return {...state,screenId:'confirmed',reservationCreated:true,reservationCancelled:false,booking:{id:crypto.randomUUID(),roomId:state.selectedRoomId,title:String(title).slice(0,80),status:'confirmed'}};
}
export function cancel(state){if(!state.booking)throw Error('Não há reserva.');return {...state,screenId:'cancelled',reservationCancelled:true,booking:{...state.booking,status:'cancelled'}};}

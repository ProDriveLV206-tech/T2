const db = firebase.database(); const auth = firebase.auth();
async function sendAdminChat(text){
  const u = auth.currentUser;
  if(!u) { alert('Sign in'); return; }
  // check role server-side ideally; client checks roles
  const roleSnap = await db.ref('roles/'+u.uid).once('value');
  const r = roleSnap.exists()? roleSnap.val().role : null;
  if(!r || (r !== 'admin' && r !== 'owner' && r !== 'mod')) { alert('Admins only'); return; }
  await db.ref('admin_chat').push({uid:u.uid, name:u.displayName||u.email, msg:text, ts:Date.now()});
}
db.ref('admin_chat').limitToLast(200).on('child_added', snap=>{
  const w = document.getElementById('adminChatWindow');
  if(!w) return;
  const m = snap.val();
  const d = document.createElement('div');
  d.textContent = new Date(m.ts).toLocaleString() + ' — ' + (m.name||m.uid) + ': ' + m.msg;
  w.appendChild(d); w.scrollTop = w.scrollHeight;
});
window.sendAdminChat = sendAdminChat;
window.addEventListener('load', ()=>{ const btn=document.getElementById('adminChatSend'); if(btn){ btn.onclick=()=>{ const t=document.getElementById('adminChatInput').value.trim(); if(!t) return; sendAdminChat(t); document.getElementById('adminChatInput').value=''; }}});
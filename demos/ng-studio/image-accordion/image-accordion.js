(function(){
function init(root){
 if(root.dataset.ngspIa)return;root.dataset.ngspIa='1';
 var panels=Array.prototype.slice.call(root.querySelectorAll('.ngsp-ia__panel'));
 if(!panels.length)return;
 function activate(p){panels.forEach(function(x){x.classList.toggle('ngsp-ia__panel--active',x===p);x.setAttribute('aria-expanded',x===p?'true':'false');});}
 panels.forEach(function(p,i){
  p.setAttribute('role','button');
  p.setAttribute('aria-expanded',i===0?'true':'false');
  p.setAttribute('aria-label',(p.querySelector('.ngsp-ia__title')||{textContent:''}).textContent+(p.getAttribute('data-open-label')?' - '+p.getAttribute('data-open-label'):''));
  if(i===0)p.classList.add('ngsp-ia__panel--active');
  p.addEventListener('click',function(e){if(e.target.closest('a'))return;activate(p);});
  p.addEventListener('keydown',function(e){
   if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(p);}
   else if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();var n=panels[(panels.indexOf(p)+1)%panels.length];n.focus();activate(n);}
   else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();var v=panels[(panels.indexOf(p)-1+panels.length)%panels.length];v.focus();activate(v);}
  });
 });
}
document.querySelectorAll('.ngsp-ia').forEach(init);
})();

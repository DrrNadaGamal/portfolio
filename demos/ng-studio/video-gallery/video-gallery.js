(function(){
function init(root){
 if(root.dataset.ngspVg)return;root.dataset.ngspVg='1';
 var dialog=root.querySelector('.ngsp-vg__dialog');if(!dialog)return;
 var video=dialog.querySelector('.ngsp-vg__video'),cap=dialog.querySelector('.ngsp-vg__bigcap');
 var cards=Array.prototype.slice.call(root.querySelectorAll('.ngsp-vg__item')).filter(function(it){return it.getAttribute('data-video');});
 var idx=-1,lastFocus=null;
 function show(i){
  if(!cards.length)return;
  idx=(i+cards.length)%cards.length;
  var it=cards[idx];
  video.src=it.getAttribute('data-video');
  cap.textContent=it.getAttribute('data-title')||'';
 }
 cards.forEach(function(it){
  var btn=it.querySelector('.ngsp-vg__open');if(!btn)return;
  btn.addEventListener('click',function(){
   lastFocus=btn;show(cards.indexOf(it));
   if(typeof dialog.showModal==='function'){dialog.showModal();}
   video.play().catch(function(){});
  });
 });
 function close(){video.pause();video.removeAttribute('src');video.load();dialog.close();if(lastFocus)lastFocus.focus();}
 dialog.querySelector('.ngsp-vg__close').addEventListener('click',close);
 dialog.addEventListener('cancel',function(){video.pause();video.removeAttribute('src');video.load();});
 dialog.addEventListener('click',function(e){if(e.target===dialog)close();});
 dialog.querySelector('.ngsp-vg__prev').addEventListener('click',function(){show(idx-1);video.play().catch(function(){});});
 dialog.querySelector('.ngsp-vg__next').addEventListener('click',function(){show(idx+1);video.play().catch(function(){});});
 var multi=cards.length>1;
 dialog.querySelector('.ngsp-vg__prev').hidden=!multi;
 dialog.querySelector('.ngsp-vg__next').hidden=!multi;
}
document.querySelectorAll('.ngsp-vg').forEach(init);
})();

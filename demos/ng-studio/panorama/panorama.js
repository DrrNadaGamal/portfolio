(function(){
function init(root){
 if(root.dataset.ngspPano)return;root.dataset.ngspPano='1';
 var view=root.querySelector('.ngsp-pano__view'),img=root.querySelector('.ngsp-pano__img');
 if(!view||!img)return;
 var hint=root.querySelector('.ngsp-pano__hint');
 var pos=0.5,min=0,max=0;
 function measure(){
  img.style.height='100%';
  var over=img.offsetWidth-view.clientWidth,h=100;
  while(over<40&&h<220){h+=30;img.style.height=h+'%';over=img.offsetWidth-view.clientWidth;}
  max=0;min=-Math.max(0,over);
  apply();
 }
 function apply(){
  var x=min+(max-min)*pos;
  img.style.transform='translateX('+x+'px)';
 }
 function setPos(p){pos=Math.min(1,Math.max(0,p));apply();}
 function ready(){measure();setPos(parseFloat(root.getAttribute('data-start')||'50')/100);
  root.querySelectorAll('.ngsp-pano__btn').forEach(function(b){b.hidden=false;});}
 if(img.complete&&img.naturalWidth)ready();else img.addEventListener('load',ready);
 window.addEventListener('resize',measure);
 if('ResizeObserver' in window){new ResizeObserver(function(){measure();}).observe(view);}
 setTimeout(measure,500);
 var dragging=false,startX=0,startPos=0,moved=false;
 view.addEventListener('pointerdown',function(e){dragging=true;moved=false;startX=e.clientX;startPos=pos;view.setPointerCapture(e.pointerId);});
 view.addEventListener('pointermove',function(e){
  if(!dragging)return;
  var range=Math.abs(min)||1;
  var dx=(e.clientX-startX)/range;
  if(Math.abs(e.clientX-startX)>4){moved=true;if(hint)hint.classList.add('ngsp-pano__hint--gone');}
  setPos(startPos+dx);
 });
 function up(){dragging=false;}
 view.addEventListener('pointerup',up);view.addEventListener('pointercancel',up);
 view.addEventListener('keydown',function(e){
  var step=0.06;
  if(e.key==='ArrowLeft'){e.preventDefault();setPos(pos-(document.dir==='rtl'?-step:step));}
  else if(e.key==='ArrowRight'){e.preventDefault();setPos(pos+(document.dir==='rtl'?-step:step));}
 });
 var prev=root.querySelector('.ngsp-pano__prev'),next=root.querySelector('.ngsp-pano__next');
 if(prev)prev.addEventListener('click',function(){setPos(pos-0.15);});
 if(next)next.addEventListener('click',function(){setPos(pos+0.15);});
 setTimeout(function(){if(hint)hint.classList.add('ngsp-pano__hint--gone');},6000);
}
document.querySelectorAll('.ngsp-pano').forEach(init);
})();

'use strict';
(()=>{const root=document.querySelector('.ng-v9');if(!root)return;
const links=[...root.querySelectorAll('.ng-mini-nav a[href^="#"]')];
function active(){let current='';links.forEach(a=>{const el=document.querySelector(a.hash);if(el&&el.getBoundingClientRect().top<150)current=a.hash});links.forEach(a=>{if(a.hash===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')})}
window.addEventListener('scroll',active,{passive:true});active();
root.querySelectorAll('iframe').forEach(frame=>{
 function fit(){try{const doc=frame.contentDocument,wrap=doc.querySelector('.wrap');if(!wrap)return;const pad=parseFloat(getComputedStyle(doc.body).paddingTop)+parseFloat(getComputedStyle(doc.body).paddingBottom);frame.style.height=Math.ceil(wrap.getBoundingClientRect().height+pad+4)+'px'}catch(e){}}
 frame.addEventListener('load',()=>{fit();const wrap=frame.contentDocument?.querySelector('.wrap');if(wrap)new ResizeObserver(fit).observe(wrap)});
 if(frame.contentDocument?.readyState==='complete')fit();
 window.addEventListener('resize',fit,{passive:true});
});
root.querySelectorAll('[data-compare]').forEach(button=>button.addEventListener('click',()=>{const box=button.closest('.v9-comparison'),state=button.dataset.compare;box.dataset.state=state;box.querySelectorAll('[data-version]').forEach(im=>im.hidden=im.dataset.version!==state);box.querySelectorAll('[data-compare]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));box.querySelector('[role=status]').textContent='Showing '+(state==='before'?'v0.14.0':'v0.15.0')+' defaults.'}));
})();

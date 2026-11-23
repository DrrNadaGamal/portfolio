'use strict';
// Optional presentation controls. Actual plugin demonstrations are not implemented here.
(() => {
 const root=document.querySelector('.ng-v9');
 if(!root)return;
 const gallery=root.querySelector('.ng-gallery');
 const figures=[...gallery.querySelectorAll('figure')];
 const categories=[['All captures',()=>true],['Content & layout',f=>!/ng-pack9|ng-pack10|ng-mobile|ng-pack5-mobile|ng-pack5-rtl|ng-instagram/.test(f.querySelector('a').href)],['Data & commerce',f=>/ng-pack9|ng-pack10/.test(f.querySelector('a').href)],['Mobile & RTL',f=>/ng-mobile|ng-pack5-mobile|ng-pack5-rtl|ng-instagram/.test(f.querySelector('a').href)]];
 const bar=document.createElement('div');bar.className='ng-gallery-filters';bar.setAttribute('role','group');bar.setAttribute('aria-label','Filter widget captures');
 const status=document.createElement('p');status.className='ng-gallery-status';status.setAttribute('role','status');
 categories.forEach(([label,accept],index)=>{
  const button=document.createElement('button');button.type='button';button.textContent=label;button.setAttribute('aria-pressed',String(index===0));
  button.addEventListener('click',()=>{
   bar.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   let visible=0;figures.forEach(f=>{f.hidden=!accept(f);if(!f.hidden)visible++});
   const more=gallery.querySelector('.ng-more-images');if(index!==0)more.open=true;
   status.textContent=`${visible} captures shown. ${label}.`;
  });bar.append(button);
 });
 gallery.querySelector('.case-gallery-grid').before(bar,status);
 const dialog=document.createElement('dialog');dialog.className='ng-image-viewer';dialog.setAttribute('aria-label','Widget capture viewer');
 const close=document.createElement('button');close.type='button';close.className='ng-viewer-close';close.textContent='Close ×';
 const image=document.createElement('img');const caption=document.createElement('p');
 dialog.append(close,image,caption);document.body.append(dialog);
 let previous;
 function dismiss(){dialog.close();if(previous)previous.focus()}
 close.addEventListener('click',dismiss);
 dialog.addEventListener('click',e=>{if(e.target===dialog)dismiss()});
 gallery.querySelectorAll('figure>a').forEach(link=>link.addEventListener('click',e=>{
  if(e.ctrlKey||e.metaKey||e.shiftKey||e.altKey)return;
  e.preventDefault();previous=link;image.src=link.href;image.alt=link.querySelector('img').alt;caption.textContent=link.closest('figure').querySelector('figcaption').textContent;dialog.showModal();close.focus();
 }));
 // Active-section state is a viewing aid, not a scroll controller.
 const navLinks=[...root.querySelectorAll('.ng-mini-nav a[href^="#"]')];
 function updateSection(){
  let current='';
  navLinks.forEach(a=>{const section=document.querySelector(a.hash);if(section&&section.getBoundingClientRect().top<=140)current=a.hash});
  navLinks.forEach(a=>{if(a.hash===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 }
 window.addEventListener('scroll',updateSection,{passive:true});updateSection();
})();

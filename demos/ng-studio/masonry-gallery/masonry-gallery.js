(function(){
function init(root){
 if(root.dataset.ngspMg)return;root.dataset.ngspMg='1';
 var filters=root.querySelector('.ngsp-mg__filters');if(!filters)return;
 filters.hidden=false;
 var items=Array.prototype.slice.call(root.querySelectorAll('.ngsp-mg__item'));
 var empty=root.querySelector('.ngsp-mg__empty');
 filters.addEventListener('click',function(e){
  var btn=e.target.closest('.ngsp-mg__filter');if(!btn)return;
  filters.querySelectorAll('.ngsp-mg__filter').forEach(function(b){b.setAttribute('aria-pressed',b===btn?'true':'false');});
  var cat=btn.getAttribute('data-category'),shown=0;
  items.forEach(function(it){var show=!cat||it.getAttribute('data-category')===cat;it.hidden=!show;if(show)shown++;});
  if(empty)empty.hidden=shown>0;
 });
}
document.querySelectorAll('.ngsp-mg').forEach(init);
})();

/* Fade sections in as they scroll into view. Without JS or IntersectionObserver, nothing is hidden. */
(function(){
  if(!('IntersectionObserver' in window)) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els=document.querySelectorAll('main section:not(.hero):not(.phead) .wrap > *');
  var io=new IntersectionObserver(function(es){
    es.forEach(function(x){ if(x.isIntersecting){ x.target.classList.add('in'); io.unobserve(x.target); } });
  },{rootMargin:'0px 0px -8% 0px'});
  [].forEach.call(els,function(e,i){
    var r=e.getBoundingClientRect();
    if(r.top<window.innerHeight) return; // already on screen: leave it alone
    e.classList.add('reveal');
    e.style.transitionDelay=(e.previousElementSibling?'.15s':'0s');
    io.observe(e);
  });
})();

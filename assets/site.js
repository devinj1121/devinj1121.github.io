// Home hero: three slides (Immigration, Patents, Workflows) fade every 8 s.
// No controls. With reduced motion, the first slide stays.
(function(){
  var sl=document.querySelectorAll('.file .slide');
  if(sl.length<2)return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var k=0;
  setInterval(function(){
    sl[k].classList.remove('is-on'); sl[k].setAttribute('aria-hidden','true');
    k=(k+1)%sl.length;
    sl[k].classList.add('is-on'); sl[k].setAttribute('aria-hidden','false');
  },8000);
})();

// Quote form: tabs, file list, checks, and the "Received" ticket.
// Front end only. Nothing is sent until the backend exists.
(function(){
  if(!document.querySelector('.order'))return;
  var tabs=[].slice.call(document.querySelectorAll('.order [role=tab]'));
  var sides=[].slice.call(document.querySelectorAll('[data-for]'));
  var ticket=document.querySelector('.ticket');
  var forms=[].slice.call(document.querySelectorAll('.order form'));

  // Tabs
  function show(id,focus){
    tabs.forEach(function(t){
      var on=t.id===id;
      t.setAttribute('aria-selected',String(on));
      t.tabIndex=on?0:-1;
      document.getElementById(t.getAttribute('aria-controls')).hidden=!on;
      if(on&&focus)t.focus();
    });
    var kind=id==='tab-s'?'S':'T';
    sides.forEach(function(s){s.hidden=s.getAttribute('data-for')!==kind;});
    ticket.hidden=true;
  }
  function fromHash(){ if(location.hash==='#software')show('tab-s'); else if(location.hash==='#translation')show('tab-t'); }
  window.addEventListener('hashchange',fromHash);
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){show(t.id);});
    t.addEventListener('keydown',function(e){
      var n=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;
      if(!n)return;
      e.preventDefault();
      show(tabs[(i+n+tabs.length)%tabs.length].id,true);
    });
  });
  show(tabs[0].id); fromHash();

  // Files
  var drop=document.getElementById('drop'), input=document.getElementById('t-files'), list=document.getElementById('list'), picked=[];
  function size(b){return b>1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';}
  function add(files){
    [].slice.call(files).forEach(function(f){
      var dup=picked.some(function(p){return p.name===f.name&&p.size===f.size;});
      if(!dup)picked.push(f);
    });
    render();
  }
  function render(){
    list.innerHTML='';
    picked.forEach(function(f,i){
      var li=document.createElement('li'), a=document.createElement('span'), b=document.createElement('span'), x=document.createElement('button');
      a.className='fn'; a.textContent=f.name;
      b.className='fs'; b.textContent=size(f.size);
      x.type='button'; x.textContent='Remove'; x.setAttribute('aria-label','Remove '+f.name);
      x.addEventListener('click',function(){picked.splice(i,1);render();input.focus();});
      li.appendChild(a); li.appendChild(b); li.appendChild(x); list.appendChild(li);
    });
  }
  input.addEventListener('change',function(){add(input.files);input.value='';});
  ['dragenter','dragover'].forEach(function(e){drop.addEventListener(e,function(ev){ev.preventDefault();drop.classList.add('over');});});
  ['dragleave','drop'].forEach(function(e){drop.addEventListener(e,function(ev){ev.preventDefault();drop.classList.remove('over');});});
  drop.addEventListener('drop',function(ev){if(ev.dataTransfer&&ev.dataTransfer.files)add(ev.dataTransfer.files);});

  // Checks
  function mark(el,msg){
    var box=el.closest('.box'), err=box.querySelector('.err');
    if(!err){err=document.createElement('span');err.className='err';err.id=el.id+'-err';box.appendChild(err);}
    err.textContent=msg;
    box.classList.add('bad');
    el.setAttribute('aria-invalid','true');
    el.setAttribute('aria-describedby',err.id);
  }
  function clear(el){
    var box=el.closest('.box'); if(!box)return;
    var err=box.querySelector('.err'); if(err)err.remove();
    box.classList.remove('bad');
    el.removeAttribute('aria-invalid');
    el.removeAttribute('aria-describedby');
  }

  // Submit
  function row(dl,k,v){if(!v)return;var dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=k;dd.textContent=v;dl.appendChild(dt);dl.appendChild(dd);}
  forms.forEach(function(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var name=form.querySelector('[name=name]'), email=form.querySelector('[name=email]'), first=null;
      clear(name); clear(email);
      if(!name.value.trim()){mark(name,'Add your name.');first=name;}
      if(!/^\S+@\S+\.\S+$/.test(email.value.trim())){mark(email,'Add an email we can reply to.');first=first||email;}
      if(first){first.focus();return;}

      var fd=new FormData(form), k=form.dataset.kind, dl=ticket.querySelector('dl');
      dl.innerHTML='';
      if(k==='T'){
        row(dl,'Ordering as',fd.get('who'));
        row(dl,'Languages',fd.get('pair'));
        row(dl,'For',fd.get('use'));
        row(dl,'Files',picked.length?picked.length+' attached':'None yet');
        row(dl,'Degree evaluation',fd.get('eval')?'Yes':'');
        var n=(fd.get('notes')||'').trim();
        row(dl,'Notes',n.length>120?n.slice(0,120)+'…':n);
      }else{
        row(dl,'Type',fd.get('what'));
        var d=(fd.get('desc')||'').trim();
        row(dl,'Summary',d.length>120?d.slice(0,120)+'…':d);
      }
      row(dl,'Reply to',fd.get('email').trim());
      var t=new Date(), s=String(t.getFullYear()).slice(2)+String(t.getMonth()+1).padStart(2,'0')+String(t.getDate()).padStart(2,'0');
      ticket.querySelector('.ref').textContent='Reference SEN-'+k+'-'+s+'-'+Math.floor(1000+Math.random()*9000);
      ticket.querySelector('.next-msg').textContent=k==='T'
        ?'Next: pages are counted and you get a fixed quote and delivery date by email. You pay after you approve it.'
        :'Next: Devin reads it and replies by email with questions. If it fits, you get a written scope and price.';
      form.parentNode.hidden=true; ticket.hidden=false; ticket.focus();
    });
    [].slice.call(form.querySelectorAll('input,textarea')).forEach(function(el){
      el.addEventListener('input',function(){clear(el);});
    });
  });
  ticket.querySelector('[data-reset]').addEventListener('click',function(){
    forms.forEach(function(f){f.reset();});
    picked=[]; render();
    var sel=document.querySelector('.order [role=tab][aria-selected=true]');
    show(sel.id,true);
  });
})();

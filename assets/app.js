document.documentElement.classList.add('js');
const navWrap=document.getElementById('navWrap');
const menuBtn=document.getElementById('menuBtn');
const mobileMenu=document.getElementById('mobileMenu');
if(navWrap){const update=()=>navWrap.classList.toggle('scrolled',scrollY>20);update();addEventListener('scroll',update,{passive:true})}
if(menuBtn&&mobileMenu){menuBtn.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open))});mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{mobileMenu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){mobileMenu.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}})}
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}}),{threshold:.05});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('in'))}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const form=document.getElementById('contactForm');
if(form){
 const params=new URLSearchParams(location.search);
 const requested=(params.get('request')||'').trim().slice(0,140);
 if(requested){document.getElementById('topic').value='Покупка MB Suite';document.getElementById('message').value='Интересует модуль MB Suite: '+requested+'. Прошу уточнить условия приобретения.'}
 const status=document.getElementById('formStatus');
 const submitButton=document.getElementById('submitContact');
 const originalButtonContent=submitButton.innerHTML;
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  if(submitButton.disabled)return;
  submitButton.disabled=true;
  submitButton.textContent='Отправляем…';
  form.setAttribute('aria-busy','true');
  status.className='status show pending';
  status.textContent='Отправляем заявку. Пожалуйста, не закрывайте страницу.';
  const controller=new AbortController();
  const deadline=setTimeout(()=>controller.abort(),20000);
  try{
   const payload=Object.fromEntries(new FormData(form).entries());
   const response=await fetch(form.action,{
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify(payload),
    signal:controller.signal
   });
   let result;
   try{result=await response.json()}catch(_){throw new Error('invalid-response')}
   if(!response.ok||!(result&& (result.success===true||result.success==='true'))){throw new Error('submit-failed')}
   status.className='status show success';
   status.textContent='Спасибо! Заявка отправлена. Мы свяжемся с вами по указанным контактным данным.';
   form.reset();
  }catch(error){
   status.className='status show error';
   status.textContent=error.name==='AbortError'
    ? 'Не удалось дождаться ответа сервиса. Проверьте интернет-соединение и попробуйте ещё раз. Если письмо уже отправилось, возможен повтор заявки.'
    : 'Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз. При необходимости свяжитесь с нами через Telegram.';
  }finally{
   clearTimeout(deadline);
   submitButton.disabled=false;
   submitButton.innerHTML=originalButtonContent;
   form.removeAttribute('aria-busy');
  }
 });
}


// Cinematic, unobtrusive page transitions. Hash links, external sites,
// modified clicks and new-tab links use the browser's default behavior.
const chromeMotionReduced=window.matchMedia('(prefers-reduced-motion: reduce)');
let pageNavigationInProgress=false;
const pageRoot=document.documentElement;
if(pageRoot.classList.contains('page-arriving')){
  window.setTimeout(()=>pageRoot.classList.remove('page-arriving'),760);
}
document.addEventListener('click',event=>{
  if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||chromeMotionReduced.matches)return;
  const anchor=event.target.closest('a[href]');
  if(!anchor||anchor.hasAttribute('download')||(anchor.target&&anchor.target!=='_self'))return;
  let destination;
  try{destination=new URL(anchor.href,location.href)}catch(_){return}
  if(destination.origin!==location.origin||!['http:','https:','file:'].includes(destination.protocol))return;
  // Preserve immediate, native scrolling to anchors on the current page.
  if(destination.pathname===location.pathname&&destination.search===location.search)return;
  event.preventDefault();
  if(pageNavigationInProgress)return;
  pageNavigationInProgress=true;
  try{sessionStorage.setItem('mf-page-transition',JSON.stringify({to:destination.pathname+destination.search,at:Date.now()}))}catch(_){}
  pageRoot.classList.add('page-leaving');
  window.setTimeout(()=>location.assign(destination.href),380);
});
// A back/forward-cache restoration must never keep the outgoing overlay.
window.addEventListener('pageshow',event=>{
  pageRoot.classList.remove('page-leaving');
  pageNavigationInProgress=false;
  if(event.persisted&& !chromeMotionReduced.matches){
    pageRoot.classList.add('page-arriving');
    window.setTimeout(()=>pageRoot.classList.remove('page-arriving'),760);
  }
});

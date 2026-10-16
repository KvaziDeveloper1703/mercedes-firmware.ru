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
  if(requested){
    document.getElementById('topic').value='Покупка MB Suite';
    document.getElementById('message').value='Интересует модуль MB Suite: '+requested+'. Прошу уточнить условия приобретения.';
  }

  const status=document.getElementById('formStatus');
  const sendButton=document.getElementById('submitContact');
  const fallbackButton=document.getElementById('fallbackSend');
  const originalButtonHTML=sendButton.innerHTML;
  const endpoint=form.action;

  // FormSubmit uses success as a string: "true" or "false", including for HTTP 200 errors.
  const isAccepted=result=>result&&(result.success===true||result.success==='true');
  const setStatus=(kind,message)=>{
    status.className='status show '+kind;
    status.textContent=message;
  };
  const explainRejection=(message)=>{
    const m=message.toLowerCase();
    if(/activat|confirm|actived|verification|verify/.test(m)){
      return 'Отправка пока не активирована администратором сайта. Необходимо подтвердить адрес почты в FormSubmit. Пожалуйста, попробуйте позже или свяжитесь с нами через Telegram.';
    }
    if(/web server|html files|referer|referrer|origin/.test(m)){
      return 'FormSubmit не распознал источник заявки. Откройте сайт по опубликованному HTTPS-адресу, а не как локальный HTML-файл. Если проблема повторяется, используйте резервную отправку.';
    }
    if(/captcha|spam|rate limit|too many/.test(m)){
      return 'Сервис защиты от спама не принял заявку. Попробуйте позже или воспользуйтесь резервной отправкой.';
    }
    return 'FormSubmit не принял заявку. '+(message?('Ответ сервиса: '+message):'Попробуйте резервный способ отправки.');
  };

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    if(!form.reportValidity()||sendButton.disabled)return;
    sendButton.disabled=true;
    sendButton.textContent='Отправляем…';
    form.setAttribute('aria-busy','true');
    fallbackButton.hidden=true;
    setStatus('pending','Проверяем отправку заявки. Пожалуйста, подождите.');
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(Object.fromEntries(new FormData(form).entries())),
        signal:controller.signal
      });
      const raw=await response.text();
      let result;
      try{result=JSON.parse(raw)}catch(_){
        throw new Error('Сервис вернул неожиданный ответ вместо подтверждения отправки.');
      }
      if(!response.ok||!isAccepted(result)){
        const reason=String(result&&result.message||'');
        console.warn('Mercedes Firmware / FormSubmit: submission rejected',response.status,reason);
        setStatus('error',explainRejection(reason));
        // If activation is missing, re-submitting will not help until the owner confirms it.
        if(!/activat|confirm|actived|verification|verify/i.test(reason))fallbackButton.hidden=false;
        return;
      }
      setStatus('success','Спасибо! Заявка принята сервисом отправки. Мы свяжемся с вами по указанным контактным данным.');
      form.reset();
    }catch(error){
      console.warn('Mercedes Firmware / FormSubmit: network or response error',error);
      setStatus('error',error&&error.name==='AbortError'
        ? 'FormSubmit не ответил за 20 секунд. Статус заявки неизвестен. Перед повторной отправкой проверьте, не поступило ли письмо.'
        : 'Не удалось получить подтверждение от FormSubmit. Возможно, запрос заблокирован браузером или соединением. Можно попробовать стандартную отправку через FormSubmit.');
      fallbackButton.hidden=false;
    }finally{
      clearTimeout(timeout);
      sendButton.disabled=false;
      sendButton.innerHTML=originalButtonHTML;
      form.removeAttribute('aria-busy');
    }
  });

  // Deliberately opt-in fallback: avoids silent duplicate submissions when a fetch times out.
  fallbackButton.addEventListener('click',()=>{
    if(!form.reportValidity())return;
    const nativeEndpoint=new URL(endpoint);
    nativeEndpoint.pathname=nativeEndpoint.pathname.replace(/^\/ajax\//,'/');
    form.action=nativeEndpoint.href;
    HTMLFormElement.prototype.submit.call(form);
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

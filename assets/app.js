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
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  const name=document.getElementById('name').value.trim();
  const contact=document.getElementById('contactValue').value.trim();
  const topic=document.getElementById('topic').value;
  const message=document.getElementById('message').value.trim();
  if(!name||!contact||!message){form.reportValidity();return}
  const msg=`Заявка с сайта Mercedes Firmware\n\nИмя: ${name}\nКонтакт: ${contact}\nТема: ${topic}\n\nСообщение:\n${message}`;
  // Open Telegram directly on user gesture, preventing delayed-popup blocking.
  const windowRef=window.open('https://t.me/Foreverinever','_blank');
  if(windowRef)windowRef.opener=null;
  let copied=false;
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(msg);copied=true}else{const el=document.createElement('textarea');el.value=msg;el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.select();copied=document.execCommand('copy');el.remove()}}catch(_){copied=false}
  status.replaceChildren();status.classList.add('show');
  const info=document.createElement('div');info.textContent=copied?'Заявка скопирована. Вставьте текст в Telegram и отправьте его @Foreverinever.':'Если заявка не скопировалась, выделите и скопируйте текст ниже вручную.';status.appendChild(info);
  if(!copied){const textarea=document.createElement('textarea');textarea.readOnly=true;textarea.value=msg;textarea.setAttribute('aria-label','Подготовленная заявка');status.appendChild(textarea)}
  const link=document.createElement('a');link.href='https://t.me/Foreverinever';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Открыть Telegram';status.appendChild(link);
 });
}

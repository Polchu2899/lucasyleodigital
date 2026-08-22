// Deferred non-critical JavaScript for YouWhole landing page

// === ANIMATIONS (Low Priority) ===
function createAnimatedBackground(){
  const bg=document.getElementById('animatedBg');
  if(!bg)return;

  const createParticles=()=>{
    for(let i=0;i<24;i++){
      const particle=document.createElement('div');
      particle.className='particle';
      particle.style.left=Math.random()*100+'%';
      particle.style.animationDuration=(Math.random()*20+15)+'s';
      particle.style.animationDelay=Math.random()*10+'s';
      bg.appendChild(particle);
    }
  };

  const createLines=()=>{
    for(let i=0;i<8;i++){
      const line=document.createElement('div');
      line.className='circuit-line';
      line.style.top=Math.random()*100+'%';
      line.style.width=Math.random()*50+30+'%';
      line.style.animationDuration=(Math.random()*4+6)+'s';
      line.style.animationDelay=Math.random()*5+'s';
      bg.appendChild(line);
    }
  };

  const createOrbs=()=>{
    const colors=['rgba(14,124,140,0.12)','rgba(240,166,60,0.1)'];
    for(let i=0;i<3;i++){
      const orb=document.createElement('div');
      orb.className='glow-orb';
      orb.style.left=Math.random()*100+'%';
      orb.style.top=Math.random()*100+'%';
      orb.style.width=Math.random()*300+200+'px';
      orb.style.height=orb.style.width;
      orb.style.background=colors[i%2];
      orb.style.animationDuration=(Math.random()*10+15)+'s';
      orb.style.animationDelay=i*3+'s';
      bg.appendChild(orb);
    }
  };

  if('requestIdleCallback' in window){
    requestIdleCallback(()=>createParticles());
    requestIdleCallback(()=>createLines(),{timeout:1000});
    requestIdleCallback(()=>createOrbs(),{timeout:2000});
  }else{
    setTimeout(createParticles,0);
    setTimeout(createLines,500);
    setTimeout(createOrbs,1000);
  }
}

// === SCROLL OPTIMIZATIONS (Throttled) ===
let scrollTicking=false;
const throttledScroll=()=>{
  if(scrollTicking)return;
  scrollTicking=true;
  requestAnimationFrame(()=>{
    const header=document.getElementById('header');
    if(header){
      if(window.pageYOffset>50)header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    scrollTicking=false;
  });
};
window.addEventListener('scroll',throttledScroll,{passive:true});

// === CARD SCROLL REVEAL ===
function initCardAnimations(){
  const observerOptions={threshold:0.1,rootMargin:'0px 0px -100px 0px'};
  const observer=new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.style.opacity='1';
        entry.target.style.transform='translateY(0)';
      }
    });
  },observerOptions);

  document.querySelectorAll('.card').forEach(card=>{
    card.style.opacity='0';
    card.style.transform='translateY(30px)';
    card.style.transition='all 0.8s ease-out';
    observer.observe(card);
  });
}

// === SMOOTH SCROLL ANCHORS ===
function initSmoothScroll(){
  document.querySelectorAll('a[href^="#"]').forEach(anchor=>{
    anchor.addEventListener('click',function(e){
      const targetId=this.getAttribute('href');
      const target=document.querySelector(targetId);
      if(target){
        e.preventDefault();
        const headerHeight=80;
        const targetPosition=target.getBoundingClientRect().top+window.pageYOffset-headerHeight;
        window.scrollTo({top:targetPosition,behavior:'smooth'});
      }
    });
  });
}

// === IMAGE ERROR HANDLING ===
function initImageErrorHandler(){
  document.querySelectorAll('img').forEach(img=>{
    img.addEventListener('error',function(){
      this.style.opacity='0.3';
    });
  });
}

// === CHAT FUNCTIONALITY ===
function initChat(){
  const btn=document.getElementById('chatBtn');
  const panel=document.getElementById('chatPanel');
  const closeBtn=document.getElementById('chatClose');
  const messages=document.getElementById('chatMessages');
  const input=document.getElementById('chatInput');
  const sendBtn=document.getElementById('chatSend');
  const suggsEl=document.getElementById('chatSuggestions');

  if(!btn)return;

  let loading=false;

  btn.addEventListener('click',function(){
    panel.classList.toggle('open');
    if(panel.classList.contains('open'))setTimeout(()=>input.focus(),300);
  });

  closeBtn.addEventListener('click',function(){
    panel.classList.remove('open');
  });

  function addMsg(text,type){
    const el=document.createElement('div');
    el.className='chat-msg '+type;
    el.innerHTML=text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
    messages.appendChild(el);
    messages.scrollTop=messages.scrollHeight;
  }

  function respuestaLocal(text){
    const msg=text.toLowerCase();
    if(msg.includes('verifactu')){
      return 'VeriFactu is the Spanish Tax Agency\'s new system for verifying invoices in real time 🧾. YouWhole generates the chained hash, the XAdES signature and the QR code for every invoice, and sends it to the AEAT automatically. Nothing manual required.';
    }else if(msg.includes('price')||msg.includes('cost')){
      return 'YouWhole has 4 plans: **Free** (€0), **Starter** (€29/mo), **Pro** (€79/mo, the most popular) and **Enterprise** (€199/mo) 💳. You can start free and move up a plan whenever you need, with no lock-in.';
    }else if(msg.includes('freelanc')||msg.includes('self-employed')||msg.includes('sole trader')){
      return 'Yes, YouWhole is also built for Spanish freelancers 🇪🇸. It automatically calculates IRPF withholding on your invoices and generates the quarterly Form 130 with prior deductions already applied.';
    }else if(msg.includes('sign up')||msg.includes('register')||msg.includes('get started')||msg.includes('try')){
      return 'Signing up is free and takes less than 2 minutes 🚀. Click "Start Free" or "Start Free Now" on this very page and create your account directly.';
    }else if(msg.includes('different')||msg.includes('why youwhole')){
      return 'YouWhole was built with VeriFactu integrated from day one, and includes GPS time tracking and a client portal with no extra paid modules 💡. Everything designed so you can run your business without friction.';
    }else if(msg.includes('language')||msg.includes('currenc')||msg.includes('international')){
      return 'YouWhole works in 5 languages (Spanish, Catalan, Basque, Galician and English) and supports more than 20 currencies with ECB exchange rates 🌍. Ideal if you also invoice outside Spain.';
    }else if(msg.includes('time track')||msg.includes('clock')||msg.includes('employee')){
      return 'The time tracking module lets you clock in/out with GPS, clock in by QR, see automatic overtime and manage vacation requests from an employee portal 🕒.';
    }else if(msg.includes('contact')||msg.includes('talk')||msg.includes('call')||msg.includes('whatsapp')){
      return 'You can email us at info@lucasyleodigital.com or on WhatsApp via the green button on this page 📞. We reply within 24h.';
    }else if(msg.includes('hi')||msg.includes('hello')||msg.includes('hey')){
      return 'Hi! 👋 What can I help you with? I can tell you about VeriFactu, pricing, features or how to sign up for YouWhole.';
    }else{
      return 'Good question! For a more specific answer, the best thing is to email us at info@lucasyleodigital.com or on WhatsApp 🎯. You can also explore the sections on this page: Features, VeriFactu and Pricing.';
    }
  }

  function sendMessage(text){
    if(!text.trim()||loading)return;
    loading=true;
    sendBtn.disabled=true;
    if(suggsEl)suggsEl.style.display='none';
    addMsg(text,'user');
    input.value='';

    const typing=document.createElement('div');
    typing.className='chat-msg bot typing';
    typing.innerHTML='<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop=messages.scrollHeight;

    setTimeout(()=>{
      typing.remove();
      const reply=respuestaLocal(text);
      addMsg(reply,'bot');
      loading=false;
      sendBtn.disabled=false;
    },700+Math.random()*400);
  }

  sendBtn.addEventListener('click',()=>sendMessage(input.value));
  input.addEventListener('keydown',(e)=>{
    if(e.key==='Enter'){
      e.preventDefault();
      sendMessage(input.value);
    }
  });

  window.sendSuggestion=function(el){
    const text=el.textContent;
    panel.classList.add('open');
    input.value=text;
    setTimeout(()=>sendBtn.click(),150);
  };
}

// === CHAT BUBBLE LABEL (Mobile) ===
function initChatBubbleLabel(){
  if(window.innerWidth<=768)return;
  const label=document.querySelector('.chat-bubble-label');
  const trigger=document.getElementById('funcionalidades');
  if(!label||!trigger)return;
  let mostrado=false;

  function mostrarBocadillo(){
    if(mostrado)return;
    mostrado=true;
    label.classList.add('visible');
    setTimeout(()=>{
      label.classList.remove('visible');
      setTimeout(()=>{mostrado=false;},30000);
    },3000);
  }

  const obs=new IntersectionObserver((entries)=>{
    entries.forEach((e)=>{
      if(e.isIntersecting)mostrarBocadillo();
    });
  },{threshold:0.2});
  obs.observe(trigger);
}

// === MODALS ===
function initModals(){
  window.abrirModal=function(id){
    cerrarTodosModales();
    const modal=document.getElementById(id);
    const overlay=document.getElementById('modal-overlay');
    if(modal&&overlay){
      overlay.classList.add('visible');
      modal.classList.add('visible');
      document.body.style.overflow='hidden';
    }
  };

  window.cerrarModal=function(id){
    const modal=document.getElementById(id);
    const overlay=document.getElementById('modal-overlay');
    if(modal)modal.classList.remove('visible');
    if(overlay)overlay.classList.remove('visible');
    document.body.style.overflow='';
  };

  window.cerrarTodosModales=function(){
    ['modal-privacidad','modal-legal','modal-cookies'].forEach(id=>{
      const m=document.getElementById(id);
      if(m)m.classList.remove('visible');
    });
    const overlay=document.getElementById('modal-overlay');
    if(overlay)overlay.classList.remove('visible');
    document.body.style.overflow='';
  };

  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape')cerrarTodosModales();
  });
}

// === MOBILE MENU ===
function initMobileMenu(){
  function abrirMenuMovil(){
    document.getElementById('navMobile').classList.add('open');
    document.getElementById('mobileMenuBtn').classList.add('open');
    document.body.style.overflow='hidden';
  }
  function cerrarMenuMovil(){
    document.getElementById('navMobile').classList.remove('open');
    document.getElementById('mobileMenuBtn').classList.remove('open');
    document.body.style.overflow='';
  }
  window.cerrarMenuMovil=cerrarMenuMovil;

  const menuBtn=document.getElementById('mobileMenuBtn');
  const navClose=document.getElementById('navMobileClose');

  if(menuBtn){
    menuBtn.addEventListener('click',()=>{
      document.getElementById('navMobile').classList.contains('open')?cerrarMenuMovil():abrirMenuMovil();
    });
  }
  if(navClose)navClose.addEventListener('click',cerrarMenuMovil);

  document.addEventListener('keydown',(e)=>{
    if(e.key==='Escape')cerrarMenuMovil();
  });
}

// === COOKIES & GOOGLE ANALYTICS ===
function initCookiesAndAnalytics(){
  const consentKey='lucas_leo_cookies';
  const consent=localStorage.getItem(consentKey);

  if(!consent){
    setTimeout(()=>{
      const banner=document.getElementById('cookie-banner');
      if(banner)banner.classList.add('visible');
    },1000);
  }else if(consent==='aceptar'){
    activarGoogleAnalytics();
  }

  window.gestionarCookies=function(decision){
    localStorage.setItem('lucas_leo_cookies',decision);
    const banner=document.getElementById('cookie-banner');
    if(banner){
      banner.style.opacity='0';
      banner.style.transform='translateY(100%)';
      banner.style.transition='all 0.4s ease';
      setTimeout(()=>banner.classList.remove('visible'),400);
    }
    if(decision==='aceptar')activarGoogleAnalytics();
  };

  function activarGoogleAnalytics(){
    if(document.querySelector('script[src*="googletagmanager.com/gtag"]'))return;
    const s=document.createElement('script');
    s.async=true;
    s.src='https://www.googletagmanager.com/gtag/js?id=G-V5FVMTW270';
    document.head.appendChild(s);
    window.gtag('js',new Date());
    window.gtag('config','G-V5FVMTW270');
  }
}

// === INITIALIZATION ===
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initAll);
}else{
  initAll();
}

function initAll(){
  if('requestIdleCallback' in window){
    requestIdleCallback(()=>createAnimatedBackground());
    requestIdleCallback(()=>initCardAnimations(),{timeout:1000});
    requestIdleCallback(()=>initSmoothScroll(),{timeout:1000});
    requestIdleCallback(()=>initImageErrorHandler(),{timeout:1500});
    requestIdleCallback(()=>initChat(),{timeout:2500});
    requestIdleCallback(()=>initChatBubbleLabel(),{timeout:3000});
    requestIdleCallback(()=>initModals(),{timeout:300});
    requestIdleCallback(()=>initMobileMenu(),{timeout:300});
    requestIdleCallback(()=>initCookiesAndAnalytics(),{timeout:500});
  }else{
    setTimeout(createAnimatedBackground,0);
    setTimeout(initCardAnimations,500);
    setTimeout(initSmoothScroll,500);
    setTimeout(initImageErrorHandler,750);
    setTimeout(initChat,1250);
    setTimeout(initChatBubbleLabel,1500);
    setTimeout(initModals,150);
    setTimeout(initMobileMenu,150);
    setTimeout(initCookiesAndAnalytics,250);
  }
}

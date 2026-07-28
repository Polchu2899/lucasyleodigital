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
      return 'VeriFactu es el nuevo sistema de la Agencia Tributaria para verificar facturas en tiempo real 🧾. YouWhole genera el hash encadenado, la firma XAdES y el QR de cada factura, y la envía a la AEAT automáticamente. No tienes que hacer nada manual.';
    }else if(msg.includes('precio')||msg.includes('cuesta')||msg.includes('coste')){
      return 'YouWhole tiene 4 planes: **Free** (0€), **Starter** (29€/mes), **Pro** (79€/mes, el más elegido) y **Enterprise** (199€/mes) 💳. Puedes empezar gratis y subir de plan cuando lo necesites, sin permanencia.';
    }else if(msg.includes('autónomo')||msg.includes('autonomo')){
      return 'Sí, YouWhole está pensado también para autónomos españoles 🇪🇸. Calcula automáticamente el IRPF en tus facturas y genera el Modelo 130 trimestral con las deducciones previas ya aplicadas.';
    }else if(msg.includes('alta')||msg.includes('registr')||msg.includes('empezar')||msg.includes('probar')){
      return 'Darte de alta es gratis y tarda menos de 2 minutos 🚀. Pulsa en "Probar Gratis" o "Empezar Gratis Ahora" en esta misma página y crea tu cuenta directamente.';
    }else if(msg.includes('diferencia')||msg.includes('por qué youwhole')||msg.includes('por que youwhole')){
      return 'YouWhole nace con VeriFactu integrado desde el primer día, e incluye control horario con GPS y portal de cliente sin módulos de pago adicionales 💡. Todo pensado para que gestiones tu negocio sin fricción.';
    }else if(msg.includes('idioma')||msg.includes('divisa')||msg.includes('internacional')){
      return 'YouWhole funciona en 5 idiomas (español, catalán, euskera, gallego e inglés) y soporta más de 20 divisas con tipo de cambio del BCE 🌍. Ideal si facturas también fuera de España.';
    }else if(msg.includes('horario')||msg.includes('fichaje')||msg.includes('emplead')){
      return 'El módulo de control horario permite fichar entrada/salida con GPS, fichar por QR, ver horas extra automáticas y gestionar vacaciones desde un portal de empleado 🕒.';
    }else if(msg.includes('contact')||msg.includes('hablar')||msg.includes('llamar')||msg.includes('whatsapp')){
      return 'Puedes escribirnos a info@lucasyleodigital.com o por WhatsApp desde el botón verde de esta página 📞. Te respondemos en menos de 24h.';
    }else if(msg.includes('hola')||msg.includes('buenas')||msg.includes('hey')){
      return '¡Hola! 👋 ¿En qué puedo ayudarte? Puedo contarte sobre VeriFactu, precios, funcionalidades o cómo darte de alta en YouWhole.';
    }else{
      return '¡Buena pregunta! Para una respuesta más concreta, lo mejor es escribirnos a info@lucasyleodigital.com o por WhatsApp 🎯. También puedes explorar las secciones de esta página: Funcionalidades, VeriFactu y Precios.';
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

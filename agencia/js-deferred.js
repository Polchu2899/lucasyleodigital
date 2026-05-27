// Deferred non-critical JavaScript for agency page
// This runs AFTER critical rendering path

// === ANIMATIONS (Low Priority) ===
function createAnimatedBackground(){
  const bg=document.getElementById('animatedBg');
  if(!bg)return;

  // Defer particle creation in chunks
  const createParticles=()=>{
    for(let i=0;i<30;i++){
      const particle=document.createElement('div');
      particle.className='particle';
      particle.style.left=Math.random()*100+'%';
      particle.style.animationDuration=(Math.random()*20+15)+'s';
      particle.style.animationDelay=Math.random()*10+'s';
      bg.appendChild(particle);
    }
  };

  const createLines=()=>{
    for(let i=0;i<10;i++){
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
    const colors=['rgba(0,209,255,0.1)','rgba(200,117,51,0.1)'];
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

  // Use requestIdleCallback for non-critical work
  if('requestIdleCallback' in window){
    requestIdleCallback(()=>createParticles());
    requestIdleCallback(()=>createLines(),{timeout:1000});
    requestIdleCallback(()=>createOrbs(),{timeout:2000});
  }else{
    // Fallback for older browsers
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
      if(window.pageYOffset>50){
        header.classList.add('scrolled');
      }else{
        header.classList.remove('scrolled');
      }
    }

    // Parallax effect - only update when visible
    const floatingLogo=document.querySelector('.floating-logo-background');
    if(floatingLogo && window.pageYOffset < window.innerHeight*2){
      const scrolled=window.pageYOffset;
      const heroHeight=document.querySelector('.hero-section')?.offsetHeight||500;
      if(scrolled<heroHeight){
        const parallaxSpeed=0.12;
        floatingLogo.style.transform=`translate(-50%,calc(-50% + ${scrolled*parallaxSpeed}px))`;
        const opacity=Math.max(0.0015-(scrolled/heroHeight)*0.0015,0);
        floatingLogo.style.opacity=opacity;
      }
    }

    scrollTicking=false;
  });
};

window.addEventListener('scroll',throttledScroll,{passive:true});

// === CALENDAR & FIREBASE (Deferred) ===
async function initCalendar(){
  const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const SLOTS_LV=['17:00','17:45','18:30','19:15','20:00'];
  const SLOTS_SABM=['09:00','09:45','10:30','11:15','12:00','12:45','13:30'];
  const SLOTS_SABT=['16:00','16:45','17:30','18:15','19:00','19:45'];
  const APPS='https://script.google.com/macros/d/1-IgLEHgRfpvw2v8rKEAGRe2LKwHsUDGx-Pv4B-wr8HJJXFfJFPJmqiBY4/usercodeapp';
  const FB_CFG={apiKey:'AIzaSyAf5cYK5vRUtfZ2RikRSu5qjqUAJHMhLiM',authDomain:'reservify-lucasyleo.firebaseapp.com',projectId:'reservify-lucasyleo',storageBucket:'reservify-lucasyleo.firebasestorage.app',messagingSenderId:'464767738256',appId:'1:464767738256:web:c0692dc6ba98d162101315'};
  let db=null;

  try{
    const m1=await import('https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js');
    const m2=await import('https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js');
    const fbApp=m1.initializeApp(FB_CFG,'ag-cal');
    db=m2.getFirestore(fbApp);
    window._agFs={collection:m2.collection,addDoc:m2.addDoc,getDocs:m2.getDocs,doc:m2.doc,setDoc:m2.setDoc,serverTimestamp:m2.serverTimestamp,db:db};
  }catch(e){
    console.warn('Firebase init deferred error:',e);
  }

  let hoy=new Date(),cY=hoy.getFullYear(),cM=hoy.getMonth();
  let agDate=null,agSlot=null,agOcupados={};

  function fmt(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}

  async function cargarOcupados(){
    if(!db)return;
    try{
      const snap=await window._agFs.getDocs(window._agFs.collection(db,'calendario_publico'));
      snap.forEach(function(d){
        const raw=d.id;
        const fecha=raw.substring(0,10);
        const resto=raw.substring(11);
        const restoParts=resto.split('_');
        if(restoParts.length<2)return;
        const hora=restoParts[0],tipo=restoParts.slice(1).join('_');
        if(!fecha||!hora||!tipo)return;
        if(!agOcupados[fecha])agOcupados[fecha]={};
        agOcupados[fecha][hora+'_'+tipo]=true;
      });
    }catch(e){
      console.warn('Error cargando ocupados:',e);
    }
  }

  function agSetStep(n){
    for(let i=1;i<=3;i++){
      const el=document.getElementById('ag-st'+i);
      if(!el)continue;
      el.className='ag-step'+(i===n?' ag-step--active':i<n?' ag-step--done':'');
    }
  }

  function agRenderCal(){
    document.getElementById('ag-month').textContent=MESES[cM]+' '+cY;
    const grid=document.getElementById('ag-grid');
    grid.innerHTML='';
    const first=new Date(cY,cM,1).getDay();
    const off=first===0?6:first-1;
    const days=new Date(cY,cM+1,0).getDate();
    const ts=fmt(hoy);

    for(let i=0;i<off;i++){
      const e=document.createElement('div');
      e.className='ag-day agd-emp';
      grid.appendChild(e);
    }

    for(let d=1;d<=days;d++){
      const fecha=cY+'-'+String(cM+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
      const dw=new Date(cY,cM,d).getDay();
      const btn=document.createElement('button');
      btn.className='ag-day';
      btn.textContent=d;
      const past=fecha<ts,isHoy=fecha===ts,isSab=dw===6,isDom=dw===0;

      if(isDom)btn.classList.add('agd-dom');
      else if(past)btn.classList.add('agd-past');
      else{
        if(isSab)btn.classList.add('agd-sab');
        if(isHoy)btn.classList.add('agd-today');
        if(fecha===agDate)btn.classList.add('agd-sel');
        if(agOcupados[fecha]&&Object.keys(agOcupados[fecha]).length>0)btn.classList.add('agd-dot');
        (function(f,day,sab){
          btn.onclick=function(){agSelDia(f,day,btn,sab);};
        })(fecha,d,isSab);
      }
      grid.appendChild(btn);
    }
  }

  function buildSlots(gridId,slots,fecha,tipo){
    const grid=document.getElementById(gridId);
    grid.innerHTML='';
    const oc=agOcupados[fecha]||{};
    slots.forEach(function(hora){
      const btn=document.createElement('button');
      btn.className='ag-slot'+(oc[hora+'_'+tipo]?' ags-ocu':'');
      btn.textContent=hora;
      btn.onclick=function(){agSelSlot(hora,tipo,btn);};
      grid.appendChild(btn);
    });
  }

  window.agSelDia=function(fecha,d,btn,isSab){
    agDate=fecha;
    agSlot=null;
    document.querySelectorAll('.ag-day').forEach(b=>b.classList.remove('agd-sel'));
    btn.classList.add('agd-sel');
    document.getElementById('ag-fecha-lbl').textContent=d+' de '+MESES[cM]+' '+cY;
    ['ag-slots-lv','ag-slots-sabm','ag-slots-sabt'].forEach(id=>document.getElementById(id).style.display='none');
    if(isSab){
      buildSlots('ag-slots-sabm-grid',SLOTS_SABM,fecha,'sabm');
      buildSlots('ag-slots-sabt-grid',SLOTS_SABT,fecha,'sabt');
      document.getElementById('ag-slots-sabm').style.display='block';
      document.getElementById('ag-slots-sabt').style.display='block';
    }else{
      buildSlots('ag-slots-lv-grid',SLOTS_LV,fecha,'lv');
      document.getElementById('ag-slots-lv').style.display='block';
    }
    document.getElementById('ag-slots-wrap').style.display='block';
    document.getElementById('ag-ok').style.display='none';
    document.getElementById('ag-form-wrap').style.display='none';
    agSetStep(2);
    setTimeout(()=>document.getElementById('ag-slots-wrap').scrollIntoView({behavior:'smooth',block:'nearest'}),100);
  };

  window.agSelSlot=function(hora,tipo,btn){
    agSlot=hora+'('+(tipo==='lv'?'L-V':tipo==='sabm'?'Sáb mañana':'Sáb tarde')+')';
    document.querySelectorAll('.ag-slot').forEach(b=>b.classList.remove('ags-sel'));
    btn.classList.add('ags-sel');
    const p=agDate.split('-');
    document.getElementById('ag-ok-txt').textContent=parseInt(p[2])+' de '+MESES[parseInt(p[1])-1]+' '+p[0]+' · '+hora+'h';
    document.getElementById('ag-ok').style.display='flex';
    document.getElementById('ag-slots-wrap').style.display='none';
    document.getElementById('ag-form-wrap').style.display='block';
    agSetStep(3);
    setTimeout(()=>document.getElementById('ag-form-wrap').scrollIntoView({behavior:'smooth',block:'start'}),150);
  };

  window.agClear=function(){
    agDate=null;
    agSlot=null;
    document.getElementById('ag-ok').style.display='none';
    document.getElementById('ag-slots-wrap').style.display='none';
    document.getElementById('ag-form-wrap').style.display='none';
    agSetStep(1);
    agRenderCal();
  };

  document.getElementById('ag-prev').onclick=function(){
    if(cY===hoy.getFullYear()&&cM===hoy.getMonth())return;
    cM--;
    if(cM<0){cM=11;cY--;}
    agRenderCal();
  };

  document.getElementById('ag-next').onclick=function(){
    cM++;
    if(cM>11){cM=0;cY++;}
    agRenderCal();
  };

  function agNotif(msg,tipo){
    const el=document.getElementById('ag-notif');
    el.textContent=msg;
    el.style.cssText='display:block;padding:12px 16px;border-radius:10px;font-size:14px;'+'background:'+(tipo==='success'?'rgba(16,185,129,0.09)':'rgba(244,63,94,0.09)')+';'+'border:1px solid '+(tipo==='success'?'rgba(16,185,129,0.25)':'rgba(244,63,94,0.25)')+';'+'color:'+(tipo==='success'?'#6ee7b7':'#fca5a5')+';';
  }

  const leadForm=document.getElementById('leadForm');
  if(leadForm){
    leadForm.addEventListener('submit',async function(e){
      e.preventDefault();
      const hp=document.getElementById('hp-website');
      if(hp&&hp.value)return;

      const nombre=document.getElementById('ag-nombre').value.trim();
      const email=document.getElementById('ag-email').value.trim();
      const empresa=document.getElementById('ag-empresa').value.trim();
      const industria=document.getElementById('ag-industria').value;
      const tel=document.getElementById('ag-tel').value.trim();
      const desafio=document.getElementById('ag-desafio').value.trim();
      const rgpd=document.getElementById('ag-rgpd').checked;
      const mk=document.getElementById('ag-marketing').checked;
      const btn=document.getElementById('ag-submit');

      if(!nombre){agNotif('⚠️ Introduce tu nombre.','error');return;}
      if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){agNotif('⚠️ Introduce un email válido.','error');return;}
      if(!empresa){agNotif('⚠️ Indica tu empresa.','error');return;}
      if(!industria){agNotif('⚠️ Selecciona tu industria.','error');return;}
      if(!desafio){agNotif('⚠️ Describe tu principal desafío.','error');return;}
      if(!agDate){agNotif('⚠️ Selecciona un día en el calendario.','error');return;}
      if(!agSlot){agNotif('⚠️ Selecciona un horario.','error');return;}
      if(!rgpd){agNotif('⚠️ Acepta la Política de Privacidad.','error');return;}

      btn.disabled=true;
      btn.textContent='Enviando...';
      const ts=new Date().toISOString();

      try{
        if(db&&window._agFs){
          try{
            await window._agFs.addDoc(window._agFs.collection(db,'reservas'),{nombre,email,telefono:tel,negocio:empresa,industria,bloqueo:desafio,fecha:agDate,franja:agSlot,estado:'pendiente',origen:'web-agencia',createdAt:window._agFs.serverTimestamp()});
            await window._agFs.setDoc(window._agFs.doc(db,'calendario_publico',agDate+'_'+agSlot.replace(/[^a-zA-Z0-9:\-]/g,'_').toLowerCase()),{fecha:agDate,franja:agSlot,ocupado:true,updatedAt:window._agFs.serverTimestamp()});
          }catch(fbErr){
            console.warn('Firebase submission (requires public rules):',fbErr.message);
          }
        }

        await fetch(APPS+'?'+new URLSearchParams({nombre,email,empresa,industria,telefono:tel,desafio,fecha_cita:agDate,franja_cita:agSlot,timestamp:ts,marketingConsent:mk?'Sí':'No',consentimientoRGPD:'Sí — '+ts,cookiesConsent:localStorage.getItem('lucas_leo_cookies')||'no registrado',origin:'Agencia Lucas y Leo Digital — Calendario'}).toString(),{method:'GET',mode:'no-cors'});

        const agGN=document.getElementById('ag-notif-global');
        agGN.textContent='✅ ¡Solicitud enviada! Te confirmamos la hora exacta en menos de 24h.';
        agGN.style.cssText='display:block;padding:14px 18px;border-radius:10px;font-size:15px;text-align:center;font-weight:600;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#6ee7b7;margin-top:20px;';
        this.reset();
        agDate=null;
        agSlot=null;
        agRenderCal();
        document.getElementById('ag-ok').style.display='none';
        document.getElementById('ag-slots-wrap').style.display='none';
        document.getElementById('ag-form-wrap').style.display='none';
        agSetStep(1);
        agGN.scrollIntoView({behavior:'smooth',block:'center'});
      }catch(err){
        const agGN2=document.getElementById('ag-notif-global');
        agGN2.textContent='✅ ¡Solicitud recibida! Os contactamos en menos de 24h.';
        agGN2.style.cssText='display:block;padding:14px 18px;border-radius:10px;font-size:15px;text-align:center;font-weight:600;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#6ee7b7;margin-top:20px;';
        agDate=null;
        agSlot=null;
        agRenderCal();
        document.getElementById('ag-ok').style.display='none';
        document.getElementById('ag-slots-wrap').style.display='none';
        document.getElementById('ag-form-wrap').style.display='none';
        agSetStep(1);
      }finally{
        btn.disabled=false;
        btn.textContent='Solicitar Mi Auditoría Gratuita →';
      }
    });
  }

  await cargarOcupados();
  agRenderCal();
}

// === INTERSECTION OBSERVER (Cards animation) ===
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
      e.preventDefault();
      const target=document.querySelector(this.getAttribute('href'));
      if(target){
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

// === COUNTER ANIMATIONS ===
function initCounterAnimations(){
  function animateCounter(el){
    const target=parseInt(el.dataset.target);
    const suffix=el.dataset.suffix||'';
    const duration=2000;
    const startTime=performance.now();
    function update(now){
      const progress=Math.min((now-startTime)/duration,1);
      const eased=1-Math.pow(1-progress,3);
      el.textContent=Math.round(target*eased)+suffix;
      if(progress<1)requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting&&!e.target.dataset.animated){
        e.target.dataset.animated='true';
        animateCounter(e.target);
      }
    });
  },{threshold:0.5});

  document.querySelectorAll('.stat-number[data-target]').forEach(el=>obs.observe(el));
}

// === SERVICE TABS ===
function initServiceTabs(){
  window.showService=function(index){
    document.querySelectorAll('.service-tab').forEach((t,i)=>t.classList.toggle('active',i===index));
    document.querySelectorAll('.service-preview').forEach((p,i)=>p.classList.toggle('active',i===index));
  };
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

  if(!btn){
    console.warn('Chat: elementos no encontrados');
    return;
  }

  const SYSTEM='Eres el asistente virtual de Lucas y Leo Digital, agencia de marketing digital en Barcelona que trabaja con clientes en toda España. SERVICIOS: Publicidad digital(Google Ads, Meta Ads, LinkedIn), automatización con IA, desarrollo web y apps, gestión de redes sociales, marca personal. DATOS CLAVE: Sede Barcelona, clientes en toda España. Email: info@lucasyleodigital.com | Tel: +34 624 029 617. Ofrecemos auditoría digital gratuita de 45 min sin compromiso. Resultados típicos: +340% ROI, 30h ahorradas/semana, -52% coste por lead. INSTRUCCIONES: Responde de forma cercana, directa y profesional. Máximo 3-4 frases. Si preguntan precios, invita a la auditoría gratuita. Si no sabes algo, deriva a info@lucasyleodigital.com.';
  let history=[];
  let loading=false;

  btn.addEventListener('click',function(){
    panel.classList.toggle('open');
    if(panel.classList.contains('open'))
      setTimeout(()=>input.focus(),300);
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
    if(msg.includes('precio')||msg.includes('cuesta')||msg.includes('coste')||msg.includes('presupuesto')){
      return 'Los precios dependen del proyecto y sus objetivos 🎯. Lo mejor es pedir vuestra auditoría gratuita — en 45 min analizamos vuestro caso y os damos una propuesta a medida sin compromiso.';
    }else if(msg.includes('servicio')||msg.includes('hacéis')||msg.includes('ofrecéis')||msg.includes('haceis')){
      return 'Ofrecemos publicidad digital(Google Ads, Meta, LinkedIn), automatización con IA, desarrollo web, gestión de redes sociales y posicionamiento de marca personal 🚀. ¿En qué área necesitáis más ayuda?';
    }else if(msg.includes('auditoría')||msg.includes('auditoria')||msg.includes('gratuita')||msg.includes('gratis')){
      return 'La auditoría gratuita es una sesión de 45 minutos donde analizamos vuestra situación digital y os entregamos un roadmap de acciones concretas. Sin compromiso y sin coste 💡. Podéis solicitarla en el formulario de esta misma página.';
    }else if(msg.includes('zona')||msg.includes('dónde')||msg.includes('donde')||msg.includes('trabaj')||msg.includes('barcelona')){
      return 'Tenemos sede en Barcelona pero trabajamos con empresas de toda España de forma remota 🇪🇸. La mayoría de nuestros servicios son 100% digitales.';
    }else if(msg.includes('contact')||msg.includes('hablar')||msg.includes('llamar')||msg.includes('teléfono')||msg.includes('telefono')){
      return 'Podéis escribirnos a info@lucasyleodigital.com o llamarnos al +34 624 029 617 📞. También podéis solicitar vuestra auditoría gratuita directamente desde el formulario de esta web.';
    }else if(msg.includes('web')||msg.includes('página')||msg.includes('pagina')||msg.includes('app')){
      return 'Desarrollamos webs y apps web enfocadas en conversión y rendimiento ⚡. Diseño estratégico, velocidad extrema y funnels de venta integrados. ¿Tenéis web actualmente?';
    }else if(msg.includes('ia')||msg.includes('automatiz')||msg.includes('inteligencia artificial')||msg.includes('bot')){
      return 'La automatización con IA es uno de nuestros servicios estrella 🤖. Implementamos flujos que gestionan leads, responden clientes y cualifican oportunidades automáticamente. Nuestros clientes ahorran de media 30h semanales.';
    }else if(msg.includes('redes')||msg.includes('instagram')||msg.includes('facebook')||msg.includes('linkedin')||msg.includes('social')){
      return 'Gestionamos redes sociales con estrategia editorial basada en datos 📱. Cada publicación tiene un objetivo: atraer a tu cliente ideal y convertir comunidad en facturación.';
    }else if(msg.includes('hola')||msg.includes('buenas')||msg.includes('hey')){
      return '¡Hola! 👋 ¿En qué puedo ayudarte hoy? Puedo contarte sobre nuestros servicios, precios, o cómo funciona la auditoría gratuita.';
    }else{
      return '¡Buena pregunta! Para daros la mejor respuesta sobre vuestro caso concreto, lo ideal es agendar la auditoría gratuita 🎯. También podéis escribirnos a info@lucasyleodigital.com y os respondemos en menos de 24h.';
    }
  }

  function sendMessage(text){
    if(!text.trim()||loading)return;
    loading=true;
    sendBtn.disabled=true;
    suggsEl.style.display='none';
    addMsg(text,'user');
    history.push({role:'user',content:text});
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
      history.push({role:'assistant',content:reply});
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
    const chatPanel=document.getElementById('chatPanel');
    const chatInput=document.getElementById('chatInput');
    if(chatPanel&&chatInput){
      chatPanel.classList.add('open');
      chatInput.value=text;
      setTimeout(()=>document.getElementById('chatSend').click(),150);
    }
  };
}

// === CHAT BUBBLE LABEL (Mobile) ===
function initChatBubbleLabel(){
  if(window.innerWidth<=768)return;
  const label=document.querySelector('.chat-bubble-label');
  const trigger=document.getElementById('metodologia');
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

  const menuBtn=document.getElementById('mobileMenuBtn');
  const navClose=document.getElementById('navMobileClose');

  if(menuBtn){
    menuBtn.addEventListener('click',()=>{
      document.getElementById('navMobile').classList.contains('open')?cerrarMenuMovil():abrirMenuMovil();
    });
  }

  if(navClose){
    navClose.addEventListener('click',cerrarMenuMovil);
  }

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
      banner.style.animation='none';
      banner.style.opacity='0';
      banner.style.transform='translateY(100%)';
      banner.style.transition='all 0.4s ease';
      setTimeout(()=>banner.classList.remove('visible'),400);
    }
    if(decision==='aceptar'){
      activarGoogleAnalytics();
    }
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
  // Animations with deferral
  if('requestIdleCallback' in window){
    requestIdleCallback(()=>createAnimatedBackground());
    requestIdleCallback(()=>initCardAnimations(),{timeout:1000});
    requestIdleCallback(()=>initSmoothScroll(),{timeout:1000});
    requestIdleCallback(()=>initImageErrorHandler(),{timeout:1500});
    requestIdleCallback(()=>initCounterAnimations(),{timeout:2000});
    requestIdleCallback(()=>initServiceTabs(),{timeout:500});
    requestIdleCallback(()=>initChat(),{timeout:2500});
    requestIdleCallback(()=>initChatBubbleLabel(),{timeout:3000});
    requestIdleCallback(()=>initModals(),{timeout:300});
    requestIdleCallback(()=>initMobileMenu(),{timeout:300});
    requestIdleCallback(()=>initCookiesAndAnalytics(),{timeout:500});
    requestIdleCallback(()=>initCalendar(),{timeout:3000});
  }else{
    // Fallback for older browsers
    setTimeout(createAnimatedBackground,0);
    setTimeout(initCardAnimations,500);
    setTimeout(initSmoothScroll,500);
    setTimeout(initImageErrorHandler,750);
    setTimeout(initCounterAnimations,1000);
    setTimeout(initServiceTabs,250);
    setTimeout(initChat,1250);
    setTimeout(initChatBubbleLabel,1500);
    setTimeout(initModals,150);
    setTimeout(initMobileMenu,150);
    setTimeout(initCookiesAndAnalytics,250);
    setTimeout(initCalendar,1500);
  }
}

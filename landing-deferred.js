/**
 * Landing Page — JavaScript Deferred
 * Optimized for performance: defers non-critical functionality
 * using requestIdleCallback with timeout fallbacks
 */

// ═══════════════════════════════════════════════════════════════════
// 1. ANIMATED BACKGROUND — RESTORE PARTICLES (CRITICAL VFX)
// ═══════════════════════════════════════════════════════════════════

function createAnimatedBackground() {
  var bg = document.getElementById('animatedBg');
  if (!bg) return;

  // Create 30 floating particles
  for (var i = 0; i < 30; i++) {
    var p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (Math.random() * 20 + 15) + 's';
    p.style.animationDelay = Math.random() * 10 + 's';
    bg.appendChild(p);
  }

  // Create 10 circuit lines
  for (var j = 0; j < 10; j++) {
    var line = document.createElement('div');
    line.className = 'circuit-line';
    line.style.top = Math.random() * 100 + '%';
    line.style.width = (Math.random() * 50 + 30) + '%';
    line.style.animationDuration = (Math.random() * 4 + 6) + 's';
    line.style.animationDelay = Math.random() * 5 + 's';
    bg.appendChild(line);
  }

  // Create 3 glow orbs (blue/copper)
  var colors = ['rgba(0,209,255,0.1)', 'rgba(200,117,51,0.1)'];
  for (var k = 0; k < 3; k++) {
    var orb = document.createElement('div');
    orb.className = 'glow-orb';
    orb.style.left = Math.random() * 100 + '%';
    orb.style.top = Math.random() * 100 + '%';
    orb.style.width = (Math.random() * 300 + 200) + 'px';
    orb.style.height = orb.style.width;
    orb.style.background = colors[k % 2];
    orb.style.animationDuration = (Math.random() * 10 + 15) + 's';
    orb.style.animationDelay = (k * 3) + 's';
    bg.appendChild(orb);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 2. CARD FADE-IN ANIMATIONS (IntersectionObserver)
// ═══════════════════════════════════════════════════════════════════

function initCardAnimations() {
  function activar(el) {
    el.classList.add('visible');
  }

  function checkAll() {
    document.querySelectorAll('.fade-in:not(.visible)').forEach(function(el) {
      if (el.getBoundingClientRect().top < window.innerHeight + 10)
        activar(el);
    });
  }

  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          activar(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0 });

    document.querySelectorAll('.fade-in').forEach(function(el) {
      obs.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-in').forEach(activar);
  }

  checkAll();
  window.addEventListener('scroll', checkAll, { passive: true });
  var t = setInterval(checkAll, 100);
  setTimeout(function() {
    clearInterval(t);
    document.querySelectorAll('.fade-in').forEach(activar);
  }, 1500);
}

// ═══════════════════════════════════════════════════════════════════
// 3. FAQ ACCORDION
// ═══════════════════════════════════════════════════════════════════

function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.faq-question').forEach(function(b) {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });
      if (!expanded) {
        this.setAttribute('aria-expanded', 'true');
        this.nextElementSibling.classList.add('open');
      }
    });
  });
}

// ═══════════════════════════════════════════════════════════════════
// 4. MODALS (Privacy, Legal, Cookies)
// ═══════════════════════════════════════════════════════════════════

function initModals() {
  window.abrirModal = function(id) {
    var m = document.getElementById(id);
    if (m) {
      m.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
  };

  window.cerrarModal = function(id) {
    var m = document.getElementById(id);
    if (m) {
      m.classList.remove('visible');
      document.body.style.overflow = '';
    }
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      ['modal-privacidad', 'modal-legal', 'modal-cookies'].forEach(window.cerrarModal);
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// 5. MOBILE MENU
// ═══════════════════════════════════════════════════════════════════

function initMobileMenu() {
  var btn = document.getElementById('landingMobileBtn');
  var nav = document.getElementById('landingNavMobile');
  var close = document.getElementById('landingNavClose');

  if (!btn || !nav) return;

  function openMenu() {
    nav.classList.add('open');
    btn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    nav.classList.remove('open');
    btn.classList.remove('open');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', function() {
    nav.classList.contains('open') ? closeMenu() : openMenu();
  });

  close.addEventListener('click', closeMenu);

  nav.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMenu();
  });
}

// ═══════════════════════════════════════════════════════════════════
// 6. COUNTER ANIMATIONS
// ═══════════════════════════════════════════════════════════════════

function initCounterAnimations() {
  var counters = document.querySelectorAll('[data-counter]');
  if (counters.length === 0) return;

  function easeOutQuad(t) {
    return t * (2 - t);
  }

  function animateCounter(el) {
    var target = parseInt(el.textContent);
    var duration = 800;
    var start = 0;
    var startTime = null;

    function frame(currentTime) {
      if (!startTime) startTime = currentTime;
      var progress = (currentTime - startTime) / duration;
      if (progress < 1) {
        var current = Math.floor(start + (target - start) * easeOutQuad(progress));
        el.textContent = current + '+';
        requestAnimationFrame(frame);
      } else {
        el.textContent = target + '+';
      }
    }

    requestAnimationFrame(frame);
  }

  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        animateCounter(e.target);
        obs.unobserve(e.target);
      }
    });
  });

  counters.forEach(function(counter) {
    obs.observe(counter);
  });
}

// ═══════════════════════════════════════════════════════════════════
// 7. CHAT FUNCTIONALITY
// ═══════════════════════════════════════════════════════════════════

function initChat() {
  var btn = document.getElementById('chatBtn');
  var panel = document.getElementById('chatPanel');
  var closeBtn = document.getElementById('chatClose');
  var msgs = document.getElementById('chatMessages');
  var input = document.getElementById('chatInput');
  var sendBtn = document.getElementById('chatSend');
  var suggs = document.getElementById('chatSuggestions');

  if (!btn) return;

  var loading = false;

  btn.addEventListener('click', function() {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      setTimeout(function() { input.focus(); }, 300);
    }
  });

  closeBtn.addEventListener('click', function() {
    panel.classList.remove('open');
  });

  function addMsg(text, type) {
    var el = document.createElement('div');
    el.className = 'chat-msg ' + type;
    el.innerHTML = text.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function respuesta(text) {
    var m = text.toLowerCase();

    if (m.includes('sesión') || m.includes('sesion') || m.includes('gratuita') || m.includes('gratis') || m.includes('reservar') || m.includes('cita'))
      return 'La sesión estratégica es una videollamada de 45 minutos donde analizamos juntos tu situación digital. Identifico qué tienes, qué te falta y qué pasos dar. Sin compromiso — si no puedo ayudarte, te lo digo. Puedes reservar tu hueco justo aquí en la web, en el calendario de más abajo.';

    if (m.includes('precio') || m.includes('cuesta') || m.includes('coste') || m.includes('tarifa') || m.includes('presupuesto'))
      return 'Los precios dependen de lo que necesites. Trabajo con sesiones de consultoría, proyectos a medida y acompañamiento mensual. Lo mejor es que reserves la sesión gratuita — ahí entiendo tu situación y te doy una propuesta clara. Sin sorpresas.';

    if (m.includes('servicio') || m.includes('ayuda') || m.includes('haces') || m.includes('ofreces'))
      return 'Ofrezco tres formas de trabajar juntos: **Diagnóstico estratégico** (sesión gratuita de 45 min), **Creación del sistema digital** (web, publicidad, automatizaciones integradas) y **Acompañamiento continuo** (revisamos métricas y ajustamos estrategia cada mes). ¿Cuál te encaja más?';

    if (m.includes('negocio') || m.includes('tipo') || m.includes('quién') || m.includes('quien') || m.includes('para'))
      return 'Trabajo con pequeños y medianos negocios que ya tienen clientes y quieren crecer de forma ordenada. Hostelería, servicios profesionales, salud, formación, comercio... Si tienes un negocio real y quieres un sistema digital que funcione, podemos hablar.';

    if (m.includes('cómo trabaj') || m.includes('como trabaj') || m.includes('método') || m.includes('metodo') || m.includes('enfoque') || m.includes('proceso'))
      return 'Mi enfoque tiene 3 fases: primero **Claridad** (entender tu situación real), luego **Sistema** (diseñar los canales correctos conectados entre sí) y finalmente **Conversión** (activar, medir y ajustar para que el sistema trabaje por ti). Sin rodeos ni acciones sueltas.';

    if (m.includes('barcelona') || m.includes('zona') || m.includes('dónde') || m.includes('donde') || m.includes('ciudad') || m.includes('presencial'))
      return 'Estoy en Barcelona, pero trabajo con negocios de toda España de forma 100% online. La mayoría de mis clientes los atiendo por videollamada sin ningún problema.';

    if (m.includes('resultado') || m.includes('tiempo') || m.includes('cuánto tarda') || m.includes('cuanto tarda') || m.includes('funciona'))
      return 'Depende del punto de partida. Hay mejoras que se notan en semanas (publicidad, conversión web) y otras que requieren meses (posicionamiento, autoridad de marca). Lo que no hago es prometer resultados milagrosos — soy honesto con los plazos.';

    if (m.includes('web') || m.includes('página') || m.includes('pagina') || m.includes('landing'))
      return 'Creo webs de conversión: diseñadas para que el visitante entienda tu propuesta y actúe (reservar, llamar, comprar). Nada de webs decorativas que no generan clientes.';

    if (m.includes('publicidad') || m.includes('ads') || m.includes('anuncio') || m.includes('google') || m.includes('meta') || m.includes('facebook') || m.includes('instagram'))
      return 'Gestiono campañas de publicidad digital (Google Ads, Meta Ads) con foco en ROI real. No es solo poner anuncios — es diseñar un sistema de captación que funcione mes a mes.';

    if (m.includes('automatiz') || m.includes('ia') || m.includes('inteligencia artificial') || m.includes('bot'))
      return 'Implemento automatizaciones con IA para que tu negocio funcione sin que estés encima de todo: respuestas automáticas, seguimiento de leads, gestión de citas... El objetivo es que el sistema trabaje por ti.';

    if (m.includes('agencia'))
      return 'Además de mi trabajo como asesor, también tengo una agencia completa con más servicios. Puedes verla en lucasyleodigital.com/agencia. Pero si buscas un trato cercano y personalizado, estás en el sitio correcto.';

    if (m.includes('contact') || m.includes('whatsapp') || m.includes('hablar') || m.includes('llamar') || m.includes('email'))
      return 'Puedes escribirme por WhatsApp al +34 624 029 617, o directamente reservar tu sesión gratuita en el calendario de esta página. Te respondo en menos de 24h.';

    if (m.includes('hola') || m.includes('buenas') || m.includes('hey') || m.includes('buenos'))
      return '¡Hola! Me alegro de que estés aquí. ¿En qué puedo orientarte? Puedo contarte sobre la sesión gratuita, mis servicios o cómo trabajo con negocios como el tuyo.';

    if (m.includes('gracias') || m.includes('vale') || m.includes('perfecto') || m.includes('genial'))
      return '¡De nada! Si necesitas algo más, aquí estoy. Y si quieres dar el paso, reserva tu sesión gratuita en el calendario — sin compromiso.';

    return 'Buena pregunta. Para darte la mejor respuesta sobre tu caso concreto, lo ideal es reservar la sesión gratuita de 45 min. Ahí analizamos tu situación y te doy un plan claro. También puedes escribirme por WhatsApp al +34 624 029 617.';
  }

  function enviar(text) {
    if (!text.trim() || loading) return;
    loading = true;
    sendBtn.disabled = true;
    suggs.style.display = 'none';
    addMsg(text, 'user');
    input.value = '';

    var typing = document.createElement('div');
    typing.className = 'chat-msg bot typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(typing);
    msgs.scrollTop = msgs.scrollHeight;

    setTimeout(function() {
      typing.remove();
      addMsg(respuesta(text), 'bot');
      loading = false;
      sendBtn.disabled = false;
    }, 600 + Math.random() * 500);
  }

  sendBtn.addEventListener('click', function() {
    enviar(input.value);
  });

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      enviar(input.value);
    }
  });

  window.chatSugerencia = function(el) {
    panel.classList.add('open');
    input.value = el.textContent;
    setTimeout(function() {
      sendBtn.click();
    }, 150);
  };

  // Show label bubble after 8 seconds
  var bocadilloMostrado = false;
  setTimeout(function() {
    if (bocadilloMostrado) return;
    var label = btn.querySelector('.chat-bubble-label');
    if (!label) return;
    label.style.opacity = '1';
    label.style.transform = 'translateX(0)scale(1)';
    bocadilloMostrado = true;
    setTimeout(function() {
      label.style.opacity = '';
      label.style.transform = '';
    }, 4000);
  }, 8000);
}

// ═══════════════════════════════════════════════════════════════════
// 8. CALENDAR & FIREBASE (LAZY-LOADED on demand)
// ═══════════════════════════════════════════════════════════════════

var calendarInitialized = false;

function initCalendar() {
  if (calendarInitialized) return;
  calendarInitialized = true;

  (async function() {
    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const APPS = 'https://docs.google.com/forms/d/e/1FAIpQLScqPvn_r8shjVBxKLvxPswX1qk8xJaZ6nWgLTsOOb5CEIvzQw/formResponse';

    var db = null, _fs = null;

    try {
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const fs = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');

      const fbApp = initializeApp({
        apiKey: "AIzaSyAf5cYK5vRUtfZ2RikRSu5qjqUAJHMhLiM",
        authDomain: "reservify-lucasyleo.firebaseapp.com",
        projectId: "reservify-lucasyleo",
        storageBucket: "reservify-lucasyleo.firebasestorage.app",
        messagingSenderId: "464767738256",
        appId: "1:464767738256:web:c0692dc6ba98d162101315"
      }, 'lucas-landing');

      db = fs.getFirestore(fbApp);
      _fs = fs;
      console.log('Firebase OK — proyecto reservify-lucasyleo');
    } catch (e) {
      console.warn('Firebase init error:', e);
    }

    const hoy = new Date();
    var cY = hoy.getFullYear(), cM = hoy.getMonth();
    var selDate = null, selFranja = null, ocupados = {};

    function fmt(d) {
      return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
    }

    function todayStr() {
      return fmt(hoy);
    }

    async function cargarOcupados() {
      if (!db || !_fs) return;
      try {
        const snap = await _fs.getDocs(_fs.collection(db, 'calendario_publico'));
        snap.forEach(function(d) {
          var raw = d.id;
          var fecha = raw.substring(0, 10);
          var resto = raw.substring(11);
          var restoParts = resto.split('_');
          if (restoParts.length < 2) return;
          var hora = restoParts[0], tipo = restoParts.slice(1).join('_');
          if (!fecha || !hora || !tipo) return;
          if (!ocupados[fecha]) ocupados[fecha] = {};
          ocupados[fecha][hora + '_' + tipo] = true;
        });
      } catch (e) {
        console.warn('cargarOcupados error:', e);
      }
    }

    function setStep(n) {
      for (var i = 1; i <= 3; i++) {
        var el = document.getElementById('resy-st' + i);
        if (!el) continue;
        el.className = 'resy-step' + (i === n ? ' resy-step--active' : i < n ? ' resy-step--done' : '');
      }
    }

    function renderCal() {
      document.getElementById('resy-month').textContent = MESES[cM] + ' ' + cY;
      var grid = document.getElementById('resy-grid');
      grid.innerHTML = '';
      var first = new Date(cY, cM, 1).getDay();
      var off = first === 0 ? 6 : first - 1;
      var days = new Date(cY, cM + 1, 0).getDate();
      var ts = todayStr();

      for (var i = 0; i < off; i++) {
        var e = document.createElement('div');
        e.className = 'resy-day rd-emp';
        grid.appendChild(e);
      }

      for (var d = 1; d <= days; d++) {
        var fecha = cY + '-' + String(cM + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var dw = new Date(cY, cM, d).getDay();
        var btn = document.createElement('button');
        btn.className = 'resy-day';
        btn.textContent = d;
        var past = fecha < ts, isHoy = fecha === ts, isSab = dw === 6, isDom = dw === 0;

        if (isDom) {
          btn.classList.add('rd-dom');
        } else if (past) {
          btn.classList.add('rd-past');
        } else {
          if (isSab) btn.classList.add('rd-sab');
          if (isHoy) btn.classList.add('rd-today');
          if (fecha === selDate) btn.classList.add('rd-sel');
          if (ocupados[fecha] && Object.keys(ocupados[fecha]).length > 0) btn.classList.add('rd-dot');

          (function(f, day, isSabado) {
            btn.onclick = function() { window.resySelDia(f, day, btn, isSabado); };
          })(fecha, d, isSab);
        }
        grid.appendChild(btn);
      }
    }

    var SLOTS_LV = ['17:00','17:45','18:30','19:15','20:00'];
    var SLOTS_SABM = ['09:00','09:45','10:30','11:15','12:00','12:45','13:30'];
    var SLOTS_SABT = ['16:00','16:45','17:30','18:15','19:00','19:45'];

    function buildSlots(gridId, slots, fecha, tipo) {
      var grid = document.getElementById(gridId);
      grid.innerHTML = '';
      var oc = ocupados[fecha] || {};
      slots.forEach(function(hora) {
        var key = hora + '_' + tipo;
        var btn = document.createElement('button');
        btn.className = 'resy-slot' + (oc[key] ? ' rs-ocupado' : '');
        btn.textContent = hora;
        btn.onclick = function() { window.resySelSlot(hora, tipo, btn); };
        grid.appendChild(btn);
      });
    }

    window.resySelDia = function(fecha, d, btn, isSab) {
      selDate = fecha;
      selFranja = null;
      document.querySelectorAll('.resy-day').forEach(function(b) { b.classList.remove('rd-sel'); });
      btn.classList.add('rd-sel');
      document.getElementById('resy-fecha-lbl').textContent = d + ' de ' + MESES[cM] + ' ' + cY;
      ['resy-slots-lv','resy-slots-sabm','resy-slots-sabt'].forEach(function(id){ document.getElementById(id).style.display='none'; });

      if (isSab) {
        buildSlots('resy-slots-sabm-grid', SLOTS_SABM, fecha, 'sabm');
        buildSlots('resy-slots-sabt-grid', SLOTS_SABT, fecha, 'sabt');
        document.getElementById('resy-slots-sabm').style.display='block';
        document.getElementById('resy-slots-sabt').style.display='block';
      } else {
        buildSlots('resy-slots-lv-grid', SLOTS_LV, fecha, 'lv');
        document.getElementById('resy-slots-lv').style.display='block';
      }
      document.getElementById('resy-slots-wrap').style.display='block';
      document.getElementById('resy-ok').style.display='none';
      document.getElementById('resy-form-wrap').style.display='none';
      setStep(2);
      setTimeout(function(){ document.getElementById('resy-slots-wrap').scrollIntoView({behavior:'smooth',block:'nearest'}); }, 100);
    };

    window.resySelSlot = function(hora, tipo, btn) {
      selFranja = hora + ' (' + (tipo === 'lv' ? 'L-V' : tipo === 'sabm' ? 'Sáb mañana' : 'Sáb tarde') + ')';
      document.querySelectorAll('.resy-slot').forEach(function(b) { b.classList.remove('rs-sel'); });
      btn.classList.add('rs-sel');
      var p = selDate.split('-');
      document.getElementById('resy-ok-txt').textContent = parseInt(p[2]) + ' de ' + MESES[parseInt(p[1])-1] + ' ' + p[0] + ' · ' + hora + 'h';
      document.getElementById('resy-ok').style.display='flex';
      document.getElementById('resy-slots-wrap').style.display='none';
      document.getElementById('resy-form-wrap').style.display='block';
      setStep(3);
      setTimeout(function(){ document.getElementById('resy-form-wrap').scrollIntoView({behavior:'smooth',block:'start'}); }, 150);
    };

    window.resyClear = function() {
      selDate = null;
      selFranja = null;
      document.getElementById('resy-ok').style.display='none';
      document.getElementById('resy-slots-wrap').style.display='none';
      document.getElementById('resy-form-wrap').style.display='none';
      setStep(1);
      renderCal();
    };

    document.getElementById('resy-prev').onclick = function() {
      if (cY === hoy.getFullYear() && cM === hoy.getMonth()) return;
      cM--;
      if (cM < 0) { cM = 11; cY--; }
      renderCal();
    };

    document.getElementById('resy-next').onclick = function() {
      cM++;
      if (cM > 11) { cM = 0; cY++; }
      renderCal();
    };

    function showRNotif(msg, tipo) {
      var el = document.getElementById('rNotif');
      el.textContent = msg;
      el.style.cssText = 'display:block;padding:12px 16px;border-radius:10px;font-size:14px;' +
        'background:' + (tipo === 'success' ? 'rgba(16,185,129,0.09)' : 'rgba(244,63,94,0.09)') + ';' +
        'border:1px solid ' + (tipo === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)') + ';' +
        'color:' + (tipo === 'success' ? '#6ee7b7' : '#fca5a5') + ';';
    }

    document.getElementById('resyForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      if (document.getElementById('rHoneypot').value) return;

      var nombre = document.getElementById('rNombre').value.trim();
      var email = document.getElementById('rEmail').value.trim();
      var tipo = document.getElementById('rTipo').value;
      var tel = document.getElementById('rTel').value.trim();
      var reto = document.getElementById('rReto').value.trim();
      var rgpd = document.getElementById('rRgpd').checked;
      var btn = document.getElementById('rSubmit');

      if (!nombre) { showRNotif('⚠️ Introduce tu nombre.', 'error'); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showRNotif('⚠️ Introduce un email válido.', 'error'); return; }
      if (!selDate) { showRNotif('⚠️ Selecciona un día en el calendario.', 'error'); return; }
      if (!selFranja) { showRNotif('⚠️ Selecciona la franja horaria.', 'error'); return; }
      if (!rgpd) { showRNotif('⚠️ Acepta la Política de Privacidad.', 'error'); return; }

      btn.textContent = 'Enviando...';
      btn.disabled = true;
      var ts = new Date().toISOString();

      try {
        if (db && _fs) {
          try {
            await _fs.addDoc(_fs.collection(db, 'reservas'), {
              nombre: nombre, email: email, telefono: tel, negocio: tipo || 'Sin especificar',
              bloqueo: reto, fecha: selDate, franja: selFranja, estado: 'pendiente',
              origen: 'web', createdAt: _fs.serverTimestamp()
            });
            var _hora = selFranja.split(' ')[0];
            var _fl = selFranja.toLowerCase();
            var _tipo = 'lv';
            if (_fl.includes('tarde') && (_fl.includes('sáb') || _fl.includes('sab'))) _tipo = 'sabt';
            else if (_fl.includes('mañana') || (_fl.includes('sáb') || _fl.includes('sab'))) _tipo = 'sabm';
            var calKey = selDate + '_' + _hora + '_' + _tipo;
            await _fs.setDoc(_fs.doc(db, 'calendario_publico', calKey), {
              fecha: selDate, franja: selFranja, ocupado: true, updatedAt: _fs.serverTimestamp()
            });
            console.log('Reserva guardada en Firestore OK');
          } catch (fbErr) {
            console.error('Firestore write error:', fbErr);
          }
        }
        try {
          await fetch(APPS + '?' + new URLSearchParams({
            nombre: nombre, email: email, empresa: tipo || 'Sin especificar',
            industria: 'Sesión estratégica 45 min', telefono: tel, desafio: reto || 'Sin especificar',
            fecha_cita: selDate, franja_cita: selFranja, timestamp: ts,
            marketingConsent: 'no registrado', consentimientoRGPD: 'Sí — ' + ts,
            cookiesConsent: localStorage.getItem('lucas_leo_cookies') || 'no registrado',
            origin: 'Landing Asesor Lucas — Calendario'
          }).toString(), { method: 'GET', mode: 'no-cors' });
        } catch (fetchErr) {
          console.warn('Sheets fetch error(normal en no-cors):', fetchErr);
        }
        var gNotif = document.getElementById('resy-notif-global');
        gNotif.textContent = '✅ ¡Solicitud enviada! Te confirmo la hora exacta en menos de 24h.';
        gNotif.style.cssText = 'display:block;padding:14px 18px;border-radius:10px;font-size:15px;text-align:center;font-weight:600;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#6ee7b7;margin-top:20px;';
        document.getElementById('resyForm').reset();
        selDate = null; selFranja = null;
        renderCal();
        document.getElementById('resy-ok').style.display='none';
        document.getElementById('resy-slots-wrap').style.display='none';
        document.getElementById('resy-form-wrap').style.display='none';
        setStep(1);
        gNotif.scrollIntoView({behavior:'smooth',block:'center'});
      } catch (err) {
        console.error(err);
        var gNotif2 = document.getElementById('resy-notif-global');
        gNotif2.textContent = '✅ ¡Solicitud recibida! Te contactamos en menos de 24h.';
        gNotif2.style.cssText = 'display:block;padding:14px 18px;border-radius:10px;font-size:15px;text-align:center;font-weight:600;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#6ee7b7;margin-top:20px;';
        selDate = null; selFranja = null;
        renderCal();
        document.getElementById('resy-ok').style.display='none';
        document.getElementById('resy-slots-wrap').style.display='none';
        document.getElementById('resy-form-wrap').style.display='none';
        setStep(1);
      } finally {
        btn.textContent = 'Solicitar mi sesión gratuita →';
        btn.disabled = false;
      }
    });

    await cargarOcupados();
    renderCal();
  })();
}

// Lazy-load calendar when it enters viewport
if ('IntersectionObserver' in window) {
  var calSection = document.getElementById('sesion');
  if (calSection) {
    new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        initCalendar();
      }
    }).observe(calSection);
  }
}

// ═══════════════════════════════════════════════════════════════════
// 9. EXECUTION WITH requestIdleCallback SEQUENCING
// ═══════════════════════════════════════════════════════════════════

function initAll() {
  if ('requestIdleCallback' in window) {
    // Immediate: animated background (visual polish, lightweight)
    requestIdleCallback(function() {
      createAnimatedBackground();
    });

    // 300ms: Mobile menu + modals (quick interactions)
    requestIdleCallback(function() {
      initMobileMenu();
      initModals();
    }, { timeout: 300 });

    // 500ms: FAQ accordion
    requestIdleCallback(function() {
      initFAQ();
    }, { timeout: 500 });

    // 1000ms: Card animations (fade-in on scroll)
    requestIdleCallback(function() {
      initCardAnimations();
    }, { timeout: 1000 });

    // 2000ms: Counter animations
    requestIdleCallback(function() {
      initCounterAnimations();
    }, { timeout: 2000 });

    // 2500ms: Chat functionality
    requestIdleCallback(function() {
      initChat();
    }, { timeout: 2500 });
  } else {
    // Fallback for older browsers
    setTimeout(createAnimatedBackground, 0);
    setTimeout(initMobileMenu, 300);
    setTimeout(initModals, 300);
    setTimeout(initFAQ, 500);
    setTimeout(initCardAnimations, 1000);
    setTimeout(initCounterAnimations, 2000);
    setTimeout(initChat, 2500);
  }
}

// Execute when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

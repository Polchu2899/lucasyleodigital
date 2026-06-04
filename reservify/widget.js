/**
 * Reservify Widget v1.0
 * Lucas y Leo Digital — Sistema de reservas embeddable
 *
 * USO:
 * <div id="reservify-widget"></div>
 * <script src="https://www.lucasyleodigital.com/reservify/widget.js" data-client="nombre-cliente"></script>
 *
 * El widget carga la config del cliente desde /reservify/clients/[nombre].json
 * que contiene el Firebase config, colores, textos e idioma.
 */

(function() {
  'use strict';

  // ══ 1. DETECTAR SCRIPT Y LEER CONFIG ════════════════════════════
  var scriptTag = document.currentScript || document.querySelector('script[data-client]');
  if (!scriptTag) { console.error('Reservify: no se encontro el script tag'); return; }

  var clientId = scriptTag.getAttribute('data-client');
  if (!clientId) { console.error('Reservify: falta data-client'); return; }

  var widgetBase = scriptTag.src.replace(/widget\.js.*$/, '');
  var configUrl = widgetBase + 'clients/' + clientId + '.json';

  // ══ 2. CARGAR FIREBASE SDK ══════════════════════════════════════
  var FB_VERSION = '10.12.0';
  var FB_BASE = 'https://www.gstatic.com/firebasejs/' + FB_VERSION + '/';
  var fbModules = {};

  function loadScript(url) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.type = 'module';
      s.textContent = 'import * as m from "' + url + '"; window.__rfyMod = m;';
      s.onload = function() { resolve(window.__rfyMod); };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // ══ 3. INIT ═════════════════════════════════════════════════════
  async function init() {
    // Cargar config del cliente
    var resp = await fetch(configUrl);
    if (!resp.ok) { console.error('Reservify: no se pudo cargar config de ' + clientId); return; }
    var cfg = await resp.json();

    // Cargar Firebase como ES modules
    var { initializeApp, getApps } = await import(FB_BASE + 'firebase-app.js');
    var { getFirestore, collection, getDocs, getDoc, addDoc, setDoc, doc, query, where, orderBy, serverTimestamp, onSnapshot } =
      await import(FB_BASE + 'firebase-firestore.js');

    // Inicializar Firebase del cliente
    var app = getApps().length ? getApps()[0] : initializeApp(cfg.firebase);
    var db = getFirestore(app);

    // Estado
    var CAL_DATA = {};
    var tarifas = { estandar: [], ampliados: [], especiales: [], extras: [], extras_form: [] };
    var calYear = new Date().getFullYear();
    var calMonth = new Date().getMonth();
    var calSelected = null;
    var calSelectedSlot = null;
    var colors = cfg.colors || {};
    var texts = cfg.texts || {};
    var lang = cfg.lang || 'es';

    // ══ 4. ESTILOS ════════════════════════════════════════════════
    var cp = colors.primary || '#2563eb';
    var ca = colors.accent || '#f97316';
    var cg = colors.available || '#10b981';
    var cr = colors.occupied || '#ef4444';
    var cw = colors.partial || '#f59e0b';

    var style = document.createElement('style');
    style.textContent = [
      '#rfy{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;max-width:720px;margin:0 auto;color:#1a1a1a;line-height:1.5;box-sizing:border-box}',
      '#rfy *{box-sizing:border-box}',
      '#rfy .rfy-title{font-size:24px;font-weight:800;margin-bottom:4px;color:#111}',
      '#rfy .rfy-sub{font-size:14px;color:#666;margin-bottom:24px}',
      // Calendar
      '#rfy .rfy-cal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}',
      '#rfy .rfy-cal-title{font-size:16px;font-weight:700}',
      '#rfy .rfy-cal-btn{background:none;border:1px solid #ddd;border-radius:8px;padding:6px 14px;cursor:pointer;font-size:14px;color:#333;transition:all .2s}',
      '#rfy .rfy-cal-btn:hover{background:#f5f5f5;border-color:#bbb}',
      '#rfy .rfy-cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:20px}',
      '#rfy .rfy-cal-hdr{text-align:center;font-size:11px;font-weight:700;color:#999;padding:6px 0;text-transform:uppercase}',
      '#rfy .rfy-day{text-align:center;padding:10px 4px;border-radius:10px;font-size:13px;font-weight:600;cursor:default;position:relative;transition:all .2s}',
      '#rfy .rfy-day.empty{color:#ddd}',
      '#rfy .rfy-day.free{background:#f0fdf4;border:1px solid ' + cg + '33;color:#166534;cursor:pointer}',
      '#rfy .rfy-day.free:hover{background:#dcfce7;transform:translateY(-2px)}',
      '#rfy .rfy-day.partial{background:#fffbeb;border:1px solid ' + cw + '44;color:#92400e;cursor:pointer}',
      '#rfy .rfy-day.partial:hover{background:#fef3c7}',
      '#rfy .rfy-day.occ{background:#fef2f2;border:1px solid ' + cr + '33;color:#991b1b}',
      '#rfy .rfy-day.sel{background:' + cp + ';color:#fff;border:1px solid ' + cp + ';box-shadow:0 4px 12px ' + cp + '40}',
      '#rfy .rfy-day .dot{width:5px;height:5px;border-radius:50%;margin:3px auto 0;display:block}',
      '#rfy .rfy-day .dot-g{background:' + cg + '}',
      '#rfy .rfy-day .dot-w{background:' + cw + '}',
      '#rfy .rfy-day .dot-r{background:' + cr + '}',
      // Legend
      '#rfy .rfy-legend{display:flex;gap:16px;justify-content:center;margin-bottom:24px;font-size:11px;color:#888}',
      '#rfy .rfy-legend span{display:flex;align-items:center;gap:4px}',
      '#rfy .rfy-legend i{width:8px;height:8px;border-radius:50%;display:inline-block}',
      // Slots
      '#rfy .rfy-slots{margin-bottom:24px}',
      '#rfy .rfy-slots-title{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#999;margin-bottom:10px}',
      '#rfy .rfy-slots-grid{display:flex;flex-wrap:wrap;gap:8px}',
      '#rfy .rfy-slot{padding:12px 16px;border-radius:10px;border:1.5px solid #e5e7eb;cursor:pointer;font-size:13px;font-weight:600;transition:all .2s;text-align:center;min-width:120px}',
      '#rfy .rfy-slot:hover{border-color:' + cp + ';background:' + cp + '08}',
      '#rfy .rfy-slot.sel{background:' + cp + ';color:#fff;border-color:' + cp + '}',
      '#rfy .rfy-slot.occ{opacity:.4;cursor:not-allowed;text-decoration:line-through;border-color:#eee}',
      '#rfy .rfy-slot .rfy-slot-price{font-size:12px;color:#888;margin-top:2px;font-weight:500}',
      '#rfy .rfy-slot.sel .rfy-slot-price{color:rgba(255,255,255,.8)}',
      // Form
      '#rfy .rfy-form{display:none}',
      '#rfy .rfy-form.vis{display:block}',
      '#rfy .rfy-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px}',
      '#rfy .rfy-field{display:flex;flex-direction:column;gap:4px}',
      '#rfy .rfy-field.full{grid-column:1/-1}',
      '#rfy .rfy-field label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#999}',
      '#rfy .rfy-field input,#rfy .rfy-field select,#rfy .rfy-field textarea{border:1.5px solid #e5e7eb;border-radius:8px;padding:10px 14px;font-size:14px;font-family:inherit;outline:none;transition:border-color .2s;background:#fff;color:#111}',
      '#rfy .rfy-field input:focus,#rfy .rfy-field select:focus,#rfy .rfy-field textarea:focus{border-color:' + cp + '}',
      '#rfy .rfy-field textarea{resize:vertical;min-height:80px}',
      '#rfy .rfy-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}',
      '#rfy .rfy-btn-primary{background:' + cp + ';color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit}',
      '#rfy .rfy-btn-primary:hover{opacity:.9;transform:translateY(-1px);box-shadow:0 6px 20px ' + cp + '30}',
      '#rfy .rfy-btn-wa{background:#25D366;color:#fff;border:none;border-radius:10px;padding:14px 28px;font-size:14px;font-weight:700;cursor:pointer;transition:all .2s;font-family:inherit;display:inline-flex;align-items:center;gap:8px}',
      '#rfy .rfy-btn-wa:hover{opacity:.9;transform:translateY(-1px)}',
      '#rfy .rfy-toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#111;color:#fff;padding:12px 24px;border-radius:12px;font-size:14px;font-weight:600;z-index:99999;box-shadow:0 8px 32px rgba(0,0,0,.3);display:none}',
      '#rfy .rfy-toast.vis{display:block;animation:rfyToastIn .3s ease}',
      '@keyframes rfyToastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}',
      '#rfy .rfy-powered{text-align:center;margin-top:24px;font-size:11px;color:#ccc}',
      '#rfy .rfy-powered a{color:#999;text-decoration:none}',
      '#rfy .rfy-powered a:hover{color:' + cp + '}',
      '@media(max-width:640px){#rfy .rfy-form-grid{grid-template-columns:1fr}#rfy .rfy-field.full{grid-column:span 1}#rfy .rfy-slots-grid{flex-direction:column}}',
    ].join('\n');
    document.head.appendChild(style);

    // ══ 5. RENDER CONTAINER ═══════════════════════════════════════
    var root = document.getElementById('reservify-widget');
    if (!root) { root = document.createElement('div'); scriptTag.parentNode.insertBefore(root, scriptTag); }
    root.id = 'rfy';
    root.innerHTML = '<div class="rfy-title">' + (texts.title || 'Reserva tu cita') + '</div>' +
      '<div class="rfy-sub">' + (texts.subtitle || 'Selecciona fecha y horario') + '</div>' +
      '<div class="rfy-cal-head"><button class="rfy-cal-btn" id="rfy-prev">&larr;</button><span class="rfy-cal-title" id="rfy-month"></span><button class="rfy-cal-btn" id="rfy-next">&rarr;</button></div>' +
      '<div class="rfy-cal-grid" id="rfy-grid"></div>' +
      '<div class="rfy-legend"><span><i class="dot-g" style="background:' + cg + '"></i> ' + (texts.available || 'Disponible') + '</span><span><i style="background:' + cw + '"></i> Parcial</span><span><i style="background:' + cr + '"></i> ' + (texts.occupied || 'Ocupado') + '</span></div>' +
      '<div class="rfy-slots" id="rfy-slots" style="display:none"><div class="rfy-slots-title">Horarios disponibles</div><div class="rfy-slots-grid" id="rfy-slots-grid"></div></div>' +
      '<div class="rfy-form" id="rfy-form">' +
        '<div class="rfy-form-grid">' +
          '<div class="rfy-field"><label>Nombre *</label><input id="rfy-name" placeholder="Tu nombre"></div>' +
          '<div class="rfy-field"><label>Apellidos *</label><input id="rfy-surname" placeholder="Tus apellidos"></div>' +
          '<div class="rfy-field"><label>Telefono *</label><input id="rfy-phone" type="tel" placeholder="+34 600 000 000"></div>' +
          '<div class="rfy-field"><label>Email *</label><input id="rfy-email" type="email" placeholder="tu@email.com"></div>' +
          '<div class="rfy-field"><label>Tipo de evento</label><select id="rfy-type"><option value="">Seleccionar...</option><option value="Fiesta infantil">Fiesta infantil</option><option value="Fiesta adultos">Fiesta adultos</option><option value="Reunion familiar">Reunion familiar</option><option value="Reunion empresa">Reunion empresa</option><option value="Otro">Otro</option></select></div>' +
          '<div class="rfy-field"><label>Personas</label><input id="rfy-people" type="number" min="1" max="200" placeholder="Num. personas"></div>' +
          '<div class="rfy-field full"><label>Notas</label><textarea id="rfy-notes" placeholder="Cualquier detalle que quieras indicar..."></textarea></div>' +
        '</div>' +
        '<div class="rfy-btns">' +
          '<button class="rfy-btn-primary" id="rfy-submit">' + (texts.btnSubmit || 'Enviar reserva') + '</button>' +
          (cfg.phone ? '<button class="rfy-btn-wa" id="rfy-wa"><svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>' + (texts.btnWhatsapp || 'Consultar por WhatsApp') + '</button>' : '') +
        '</div>' +
      '</div>' +
      '<div class="rfy-toast" id="rfy-toast"></div>' +
      '<div class="rfy-powered">Powered by <a href="https://www.lucasyleodigital.com/reservify/" target="_blank">Reservify</a></div>';

    // ══ 6. HELPERS ════════════════════════════════════════════════
    var DAYS = ['lu','ma','mi','ju','vi','sa','do'];
    var DAY_NAMES = lang === 'ca' ? ['Dl','Dm','Dc','Dj','Dv','Ds','Dg'] : (lang === 'en' ? ['Mo','Tu','We','Th','Fr','Sa','Su'] : (lang === 'de' ? ['Mo','Di','Mi','Do','Fr','Sa','So'] : ['Lu','Ma','Mi','Ju','Vi','Sa','Do']));

    function toast(msg) {
      var t = document.getElementById('rfy-toast');
      t.textContent = msg; t.classList.add('vis');
      setTimeout(function() { t.classList.remove('vis'); }, 3000);
    }

    function parseHorario(h) {
      if (!h) return null;
      var m = h.replace(/\s/g, '').match(/(\d{1,2})(?:[h:](\d{2}))?h?[–—\-](\d{1,2})(?:[h:](\d{2}))?/);
      if (!m) return null;
      var ini = parseInt(m[1]) * 60 + parseInt(m[2] || '0');
      var fin = parseInt(m[3]) * 60 + parseInt(m[4] || '0');
      if (fin <= ini) fin += 1440;
      return { ini: ini, fin: fin };
    }

    function overlap(a, b) { return a.ini < b.fin && b.ini < a.fin; }

    function isBlocked(horario, info) {
      if (info.diaOcupado) return true;
      var sr = parseHorario(horario);
      if (!sr) return false;
      var rangos = info.rangos || [];
      if (rangos.length) return rangos.some(function(r) { return overlap(sr, r); });
      var fallback = [];
      if (info.mananaOcupada) fallback.push({ ini: 600, fin: 900 });
      if (info.tardeOcupada) fallback.push({ ini: 990, fin: 1230 });
      if (info.nocheOcupada) fallback.push({ ini: 1275, fin: 1530 });
      return fallback.some(function(r) { return overlap(sr, r); });
    }

    function getSlots(dayIdx) {
      var diaKey = DAYS[dayIdx];
      var all = [].concat(tarifas.estandar || [], tarifas.ampliados || []);
      return all.filter(function(f) {
        var v = f[diaKey]; return v !== undefined && v !== null && v !== '' && v !== '—';
      }).map(function(f) {
        return { label: f.horario, precio: f[diaKey], turno: f.turno || f.turno_es || '' };
      });
    }

    // ══ 7. CARGAR DATOS ═══════════════════════════════════════════
    async function loadTarifas() {
      try {
        var snap = await getDocs(collection(db, 'tarifas'));
        snap.forEach(function(d) {
          if (d.data().filas) tarifas[d.id] = d.data().filas;
        });
      } catch (e) { console.warn('Reservify: tarifas fallback', e); }
    }

    async function loadCalendar() {
      var hoy = new Date().toISOString().split('T')[0];
      try {
        var snap = await getDocs(collection(db, 'calendario_publico'));
        snap.forEach(function(d) {
          var fd = d.data();
          var fecha = fd.fecha || d.id;
          if (fecha >= hoy) {
            CAL_DATA[fecha] = {
              mananaOcupada: fd.mananaOcupada || false,
              tardeOcupada: fd.tardeOcupada || false,
              nocheOcupada: fd.nocheOcupada || false,
              diaOcupado: fd.diaOcupado || false,
              rangos: fd.rangos || [],
              esDiaEspecial: fd.esDiaEspecial || false,
              celebracion: fd.celebracion || null,
              precioEsp: fd.precioEsp || null,
              franjasCustom: fd.franjasCustom || null
            };
          }
        });
        // Recurrentes
        (tarifas.especiales || []).forEach(function(esp) {
          if (!esp.dia) return;
          var parts = esp.dia.split('/');
          var yr = new Date().getFullYear();
          [yr, yr + 1].forEach(function(y) {
            var ds = y + '-' + parts[1] + '-' + parts[0];
            if (ds >= hoy) {
              if (!CAL_DATA[ds]) CAL_DATA[ds] = {};
              if (!CAL_DATA[ds].esDiaEspecial) {
                CAL_DATA[ds].esDiaEspecial = true;
                CAL_DATA[ds].celebracion = esp.celebracion;
                CAL_DATA[ds].precioEsp = esp.precio;
              }
            }
          });
        });
      } catch (e) { console.warn('Reservify: calendar fallback', e); }
    }

    // ══ 8. RENDER CALENDARIO ══════════════════════════════════════
    function renderCal() {
      var now = new Date();
      var title = new Date(calYear, calMonth, 1).toLocaleString(lang === 'ca' ? 'ca-ES' : (lang === 'de' ? 'de-DE' : (lang === 'en' ? 'en-US' : 'es-ES')), { month: 'long', year: 'numeric' });
      document.getElementById('rfy-month').textContent = title.charAt(0).toUpperCase() + title.slice(1);

      var grid = document.getElementById('rfy-grid');
      var html = DAY_NAMES.map(function(d) { return '<div class="rfy-cal-hdr">' + d + '</div>'; }).join('');

      var dow = new Date(calYear, calMonth, 1).getDay();
      dow = dow === 0 ? 6 : dow - 1;
      for (var i = 0; i < dow; i++) html += '<div class="rfy-day empty"></div>';

      var days = new Date(calYear, calMonth + 1, 0).getDate();
      var todayStr = now.toISOString().split('T')[0];

      for (var d = 1; d <= days; d++) {
        var ds = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
        var isPast = new Date(ds) < new Date(now.toDateString());
        var info = CAL_DATA[ds] || {};
        var dayIdx = (new Date(ds + 'T12:00:00').getDay() + 6) % 7;
        var slots = getSlots(dayIdx);
        var diaOc = info.diaOcupado || (info.mananaOcupada && info.tardeOcupada) || false;
        var isFullOcc = diaOc || (slots.length > 0 && slots.every(function(s) { return isBlocked(s.label, info); }));
        var isPartial = !isFullOcc && (info.mananaOcupada || info.tardeOcupada || info.nocheOcupada);
        var noSlots = !isPast && slots.length === 0 && !info.esDiaEspecial;
        var isSel = ds === calSelected;

        var cls = 'rfy-day';
        var dot = '';
        if (isPast || noSlots) { cls += ' empty'; }
        else if (isFullOcc) { cls += ' occ'; dot = '<span class="dot dot-r"></span>'; }
        else if (isSel) { cls += ' sel'; }
        else if (isPartial) { cls += ' partial'; dot = '<span class="dot dot-w"></span>'; }
        else { cls += ' free'; dot = '<span class="dot dot-g"></span>'; }

        var click = (!isPast && !isFullOcc && !noSlots) ? ' onclick="window._rfySelectDate(\'' + ds + '\')"' : '';
        html += '<div class="' + cls + '"' + click + '>' + d + dot + '</div>';
      }
      grid.innerHTML = html;
    }

    // ══ 9. RENDER SLOTS ═══════════════════════════════════════════
    function renderSlots(ds) {
      var wrap = document.getElementById('rfy-slots');
      var grid = document.getElementById('rfy-slots-grid');
      var d = new Date(ds + 'T12:00:00');
      var dayIdx = (d.getDay() + 6) % 7;
      var info = CAL_DATA[ds] || {};

      var slots = getSlots(dayIdx);
      if (info.franjasCustom && info.franjasCustom.length) slots = [];

      var html = '';
      slots.forEach(function(s) {
        var blocked = isBlocked(s.label, info);
        var sel = calSelectedSlot === s.label;
        var cls = 'rfy-slot' + (blocked ? ' occ' : '') + (sel ? ' sel' : '');
        var click = blocked ? '' : ' onclick="window._rfySelectSlot(\'' + s.label + '\',' + s.precio + ')"';
        html += '<div class="' + cls + '"' + click + '><div>' + s.turno + '</div><div>' + s.label + '</div><div class="rfy-slot-price">' + s.precio + ' &euro;</div></div>';
      });

      // Custom slots for special days
      if (info.franjasCustom && info.franjasCustom.length) {
        var sorted = info.franjasCustom.slice().sort(function(a, b) { return (a.inicio || '99').localeCompare(b.inicio || '99'); });
        sorted.forEach(function(f) {
          var hor = f.horario || (f.inicio && f.fin ? f.inicio + '–' + f.fin : '');
          if (!hor) return;
          var blocked = f.bloqueada || isBlocked(hor, info);
          var sel = calSelectedSlot === hor;
          var cls = 'rfy-slot' + (blocked ? ' occ' : '') + (sel ? ' sel' : '');
          var pre = f.precio || info.precioEsp || 0;
          var click = blocked ? '' : ' onclick="window._rfySelectSlot(\'' + hor + '\',' + pre + ')"';
          html += '<div class="' + cls + '"' + click + '><div>' + (f.nombre || info.celebracion || 'Especial') + '</div><div>' + hor + '</div><div class="rfy-slot-price">' + pre + ' &euro;</div></div>';
        });
      }

      grid.innerHTML = html || '<div style="color:#999;font-size:13px;">No hay horarios disponibles para este dia</div>';
      wrap.style.display = 'block';
    }

    // ══ 10. EVENTOS ═══════════════════════════════════════════════
    window._rfySelectDate = function(ds) {
      calSelected = ds;
      calSelectedSlot = null;
      renderCal();
      renderSlots(ds);
      document.getElementById('rfy-form').classList.remove('vis');
    };

    window._rfySelectSlot = function(slot, precio) {
      calSelectedSlot = slot;
      renderSlots(calSelected);
      document.getElementById('rfy-form').classList.add('vis');
      toast(slot + ' · ' + precio + '€ — Rellena el formulario');
      setTimeout(function() {
        document.getElementById('rfy-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    };

    document.getElementById('rfy-prev').onclick = function() {
      if (calMonth === 0) { calMonth = 11; calYear--; } else calMonth--;
      renderCal();
    };
    document.getElementById('rfy-next').onclick = function() {
      if (calMonth === 11) { calMonth = 0; calYear++; } else calMonth++;
      renderCal();
    };

    // ══ 11. ENVIAR RESERVA ════════════════════════════════════════
    document.getElementById('rfy-submit').onclick = async function() {
      var name = document.getElementById('rfy-name').value.trim();
      var surname = document.getElementById('rfy-surname').value.trim();
      var phone = document.getElementById('rfy-phone').value.trim();
      var email = document.getElementById('rfy-email').value.trim();
      var type = document.getElementById('rfy-type').value;
      var people = document.getElementById('rfy-people').value;
      var notes = document.getElementById('rfy-notes').value.trim();

      if (!name || !surname || !phone || !email || !calSelected || !calSelectedSlot) {
        toast('Rellena todos los campos obligatorios');
        return;
      }

      try {
        await addDoc(collection(db, 'reservas'), {
          nombre: name + ' ' + surname,
          apellidos: surname,
          telefono: phone,
          email: email,
          servicio: type || 'Sin especificar',
          personas: people || '1',
          fecha: calSelected,
          horario: calSelectedSlot,
          notas: notes,
          estado: 'Pendiente',
          origen: 'widget',
          createdAt: serverTimestamp()
        });

        // Bloquear calendario
        var snapCal = await getDocs(query(
          collection(db, 'reservas'),
          where('fecha', '==', calSelected),
          where('estado', 'in', ['Confirmada', 'Pendiente'])
        ));
        var rangosOcupados = [];
        snapCal.docs.forEach(function(d) {
          var r = d.data();
          var h = parseHorario(r.horario);
          if (h) rangosOcupados.push({ ini: h.ini, fin: h.fin });
        });
        var frM = [{ ini: 600, fin: 840 }, { ini: 660, fin: 900 }];
        var frT = [{ ini: 990, fin: 1230 }];
        var frN = [{ ini: 1275, fin: 1530 }];
        var mOc = frM.some(function(f) { return rangosOcupados.some(function(r) { return overlap(f, r); }); });
        var tOc = frT.some(function(f) { return rangosOcupados.some(function(r) { return overlap(f, r); }); });
        var nOc = frN.some(function(f) { return rangosOcupados.some(function(r) { return overlap(f, r); }); });

        await setDoc(doc(db, 'calendario_publico', calSelected), {
          fecha: calSelected,
          mananaOcupada: mOc, tardeOcupada: tOc, nocheOcupada: nOc,
          diaOcupado: mOc && tOc,
          rangos: rangosOcupados,
          updatedAt: serverTimestamp()
        }, { merge: true });

        // Actualizar estado local
        CAL_DATA[calSelected] = CAL_DATA[calSelected] || {};
        CAL_DATA[calSelected].mananaOcupada = mOc;
        CAL_DATA[calSelected].tardeOcupada = tOc;
        CAL_DATA[calSelected].nocheOcupada = nOc;
        CAL_DATA[calSelected].rangos = rangosOcupados;

        toast(texts.success || 'Reserva enviada correctamente');

        // Reset form
        ['rfy-name', 'rfy-surname', 'rfy-phone', 'rfy-email', 'rfy-notes', 'rfy-people'].forEach(function(id) {
          var el = document.getElementById(id); if (el) el.value = '';
        });
        document.getElementById('rfy-type').selectedIndex = 0;
        calSelectedSlot = null;
        document.getElementById('rfy-form').classList.remove('vis');
        document.getElementById('rfy-slots').style.display = 'none';
        renderCal();

      } catch (e) {
        console.error('Reservify error:', e);
        toast('Error al enviar. Intentalo de nuevo.');
      }
    };

    // WhatsApp button
    var waBtn = document.getElementById('rfy-wa');
    if (waBtn && cfg.phone) {
      waBtn.onclick = function() {
        var slot = calSelectedSlot || '';
        var fecha = calSelected || '';
        var msg = encodeURIComponent('Hola! Me gustaria reservar' + (fecha ? ' el ' + fecha : '') + (slot ? ' en el horario ' + slot : '') + '. Pueden confirmarme disponibilidad?');
        window.open('https://wa.me/' + cfg.phone + '?text=' + msg, '_blank');
      };
    }

    // ══ 12. ARRANCAR ══════════════════════════════════════════════
    await loadTarifas();
    await loadCalendar();
    renderCal();
  }

  // Ejecutar cuando DOM este listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

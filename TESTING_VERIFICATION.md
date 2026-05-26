# Guía de Verificación: Optimizaciones de Velocidad y SEO
**Fecha:** 26-05-2026 | **Estado:** Listo para Testing

---

## 1. VERIFICAR OPTIMIZACIONES DE VELOCIDAD

### 1.1 Google PageSpeed Insights
URL: https://pagespeed.web.dev/

**Pasos:**
1. Accede a https://pagespeed.web.dev/
2. Introduce: `https://www.lucasyleodigital.com/`
3. Selecciona "Mobile" primero (es más crítico)
4. Espera a que se cargue el reporte

**Qué buscar después de optimización:**
```
Métricas esperadas (Mobile):
✅ LCP (Largest Contentful Paint): < 2.5s (Target: < 2.0s)
✅ FID (First Input Delay): < 100ms (Target: < 50ms)
✅ CLS (Cumulative Layout Shift): < 0.1 (Target: < 0.05)
```

**Comparación antes/después:**
- LCP: ⬇️ ~15-20% de mejora
- FCP: ⬇️ ~10-15% de mejora
- Overall Score: +5-10 puntos

### 1.2 Google Lighthouse (Chrome DevTools)
**Pasos:**
1. Abre cualquier página del sitio en Chrome
2. Presiona F12 (DevTools)
3. Vea a la pestaña "Lighthouse"
4. Selecciona "Mobile" y "Performance"
5. Clickea "Analyze page load"

**Métricas a revisar:**
```
Performance Score: 85-95+ (Target: >90)
First Contentful Paint (FCP): < 1.8s
Largest Contentful Paint (LCP): < 2.5s
Cumulative Layout Shift (CLS): < 0.1
Time to Interactive (TTI): < 3.5s
Speed Index: < 3.0s
Total Blocking Time (TBT): < 200ms
```

**Oportunidades de mejora que Lighthouse debería reportar:**
- ✅ Reducidas: "Eliminate render-blocking resources" (Google Fonts)
- ✅ Reducidas: "Reduce unused CSS"
- ✅ Reducidas: "Reduce JavaScript execution time"
- ✅ Reducidas: "Defer offscreen images"

### 1.3 WebPageTest
URL: https://webpagetest.org/

**Pasos:**
1. Accede a https://webpagetest.org/
2. Introduce: `https://www.lucasyleodigital.com/`
3. Selecciona "Chrome" como browser
4. Selecciona "4G LTE" para connectivity (simula móvil realista)
5. Clickea "Start Test"

**Qué buscar:**
```
First Byte (TTFB): < 0.6s ✅
Start Render: < 1.5s
DOM Content Loaded: < 2.0s
Fully Loaded: < 4.0s
Visually Complete: < 3.0s

Waterfall Chart:
- Google Fonts debe tener menor prioridad (no render-blocking)
- Firebase debe cargarse al final (no blocking)
- Logo/imágenes deben tener lazy="lazy"
```

### 1.4 Verificación Manual de Carga de Fonts

**En Chrome DevTools → Network:**
1. Abre DevTools (F12)
2. Vea a "Network"
3. Recarga la página
4. Filtra por "css" o "fonts"

**Qué debería ver:**
```
❌ ANTES: fonts.googleapis.com/css2?...&display=swap
   - Status: 200
   - Size: ~40-60 KB
   - Type: stylesheet
   - Request timing: Crítico (bloquea render)

✅ DESPUÉS: fonts.googleapis.com/css2?...&display=fallback
   - Status: 200
   - Size: ~30-40 KB (menos pesos de fuentes)
   - Type: stylesheet
   - Request timing: No-crítico (media=print onload)
   - Loaded después de "Finish" time
```

---

## 2. VERIFICAR OPTIMIZACIONES DE SEO

### 2.1 Schema.org Markup Validation
URL: https://schema.org/validate/

**Para Landing Page (index.html):**
1. Accede a https://schema.org/validate/
2. Click en "Buscar por URL"
3. Introduce: `https://www.lucasyleodigital.com/`
4. Clickea "Ejecutar"

**Qué buscar:**
```
✅ Person schema: VÁLIDO
   - name: "Lucas"
   - jobTitle: "Asesor Digital"
   - worksFor: "Lucas y Leo Digital"

✅ LocalBusiness schema: VÁLIDO
   - name: "Lucas y Leo Digital"
   - address: Barcelona, Spain
   - telephone: +34624029617

✅ FAQPage schema: VÁLIDO
   - 6+ preguntas estructuradas

✅ Service schemas: 3x válidos
   - Diagnóstico Estratégico
   - Creación del Sistema Digital
   - Acompañamiento Continuo

✅ BreadcrumbList: VÁLIDO

❌ ERRORES: 0 (no debe haber errores)
⚠️ WARNINGS: Mínimas (advertencias de campos opcionales)
```

**Para Blog Posts:**
1. Accede a `https://www.lucasyleodigital.com/blog/#{slug-del-articulo}`
   - Ejemplo: `https://www.lucasyleodigital.com/blog/#primeros-pasos-estrategia-digital`
2. Abre DevTools (F12)
3. Vea a "Elements" y busca `<script id="blog-post-schema">`

**Qué debería ver:**
```json
{
  "@context":"https://schema.org",
  "@type":"BlogPosting",
  "headline":"[Título del artículo]",
  "description":"[Descripción SEO]",
  "image":"[URL de imagen de portada]",
  "datePublished":"[ISO 8601 date]",
  "author":{"@type":"Person","name":"Lucas"},
  "publisher":{"@type":"Organization","name":"Lucas y Leo Digital"}
}
```

### 2.2 Verificación de Meta Tags
**En Chrome DevTools → Elements:**

1. Abre DevTools (F12)
2. Presiona Ctrl+F (o Cmd+F)
3. Busca: `<meta name="description"`

**Qué debería ver:**
```html
<!-- Landing page -->
<meta name="description" content="Asesor digital para pequeños negocios...">
<!-- ~155 caracteres ✅ -->

<!-- Blog listing -->
<meta name="description" content="Artículos prácticos sobre estrategia digital...">
<!-- ~155 caracteres ✅ -->

<!-- Blog posts (dinámico) -->
<meta name="description" content="[Descripción del post]">
<!-- Debería cambiar cuando clickeas cada post ✅ -->
```

### 2.3 Verificación de Open Graph Tags

**Herramienta:** Facebook Sharing Debugger
URL: https://developers.facebook.com/tools/debug/

1. Accede a https://developers.facebook.com/tools/debug/
2. Introduce URL: `https://www.lucasyleodigital.com/`
3. Click en "Debug"

**Qué debería ver:**
```
✅ og:title: "Lucas · Asesor Digital — Tu negocio merece un sistema..."
✅ og:description: "Ayudo a pequeños negocios..."
✅ og:image: [logo con dimensions correctas]
✅ og:url: https://www.lucasyleodigital.com/

Conexión: "Conectado" (sin errores)
```

**Para blog posts:**
1. Introduce: `https://www.lucasyleodigital.com/blog/#primeros-pasos-estrategia-digital`
2. Debería mostrar:
```
✅ og:title: [Título del artículo]
✅ og:description: [Descripción del artículo]
✅ og:image: [Portada del artículo]
✅ og:url: [URL completa del post]
```

### 2.4 Verificación de Alt Text en Imágenes

**En Chrome DevTools → Elements:**
1. Presiona Ctrl+F
2. Busca: `<img`
3. Verifica cada imagen tiene `alt="[descripción]"`

**Qué debería ver:**
```html
✅ <img src="..." alt="Lucas y Leo Digital" class="logo-img">
✅ <img src="..." alt="Lucas, asesor digital" loading="lazy">
✅ <img src="..." alt="[Título del artículo]" loading="lazy">
✅ Todas las imágenes de blog posts tienen alt text descriptivo
```

### 2.5 Verificación de Heading Hierarchy
**En Chrome DevTools → Elements:**
1. Presiona Ctrl+F
2. Busca: `<h1`, `<h2`, `<h3`

**Qué debería ver:**

**Landing page (index.html):**
```html
<h1>Lucas · Asesor Digital para Pequeños Negocios</h1>
  <h2>¿Por qué necesitas un asesor digital?</h2>
  <h2>¿Cómo es el proceso?</h2>
  <h2>Servicios</h2>
  <h2>Lo que dicen mis clientes</h2>
  <h2>Acerca de Lucas</h2>
  <h2>Últimas publicaciones</h2>

❌ NO debe haber múltiples <h1>
✅ Solo 1 <h1> principal
✅ <h2> para secciones principales
```

**Blog listing (blog/index.html):**
```html
<h1>Blog — Estrategia Digital para Pymes</h1>
  (Los títulos de cards dentro de <h3> o simplemente divs con clase .bc-title)
```

**Blog post (dinámico):**
```html
<h1>[Título del artículo]</h1>
  <h2>[Subtítulos del contenido]</h2>
  <h3>[Sub-subtítulos opcionales]</h3>

✅ Jerárquico y bien estructurado
❌ No salta niveles (no h1 → h3 sin h2)
```

### 2.6 Verificación de Internal Links
**Búsqueda manual:**
1. Landing page → Debe linkear a `/blog/` y `/agencia/`
2. Blog page → Debe linkear a `/` (Inicio), `/agencia/`, y otros posts
3. Agencia page → Debe linkear a `/` y `/blog/`

**Qué debería ver:**
```html
<!-- Landing page -->
<a href="/blog/">Ver todos los artículos</a>
<a href="/agencia/">Conocer agencia</a>

<!-- Blog -->
<a href="/">Inicio</a>
<a href="/agencia/">Agencia</a>

<!-- Agencia -->
<a href="/">Inicio</a>
<a href="/blog/">Blog</a>
```

---

## 3. VERIFICAR MOBILE & RESPONSIVE

### 3.1 Mobile Core Web Vitals
En PageSpeed Insights (como en 1.1), los datos de "Mobile" vienen de datos reales de Chrome User Experience Report.

**Qué buscar:**
```
✅ "Good" en todos los metrics (verde)
  - LCP: < 2.5s
  - FID: < 100ms
  - CLS: < 0.1

⚠️ "Needs Improvement" (naranja): Mejorable pero no crítico
❌ "Poor" (rojo): Crítico, debe arreglarse
```

### 3.2 Mobile Menu Functionality
1. Abre el sitio en móvil o emulador (DevTools → Ctrl+Shift+M)
2. Click en botón hamburguesa (esquina superior derecha)
3. Menú debe expandirse completamente
4. Click en enlace → Menú debe cerrarse
5. Presiona ESC → Menú debe cerrarse
6. Body scroll debe estar bloqueado mientras menú está abierto

**Qué debería ver:**
```
✅ Menú abre con animación suave
✅ Todos los links están clickeables
✅ Botón de cierre funciona
✅ ESC key cierra menú
✅ Body no scrollea cuando menú está abierto
✅ Menú tiene fondo oscuro con blur
```

---

## 4. VERIFICAR INDEXACIÓN EN GOOGLE

### 4.1 Google Search Console
URL: https://search.google.com/search-console/

1. Accede con la cuenta de Google (lucasyleodigital@gmail.com)
2. Selecciona la propiedad: lucasyleodigital.com

**Qué buscar:**
```
Coverage:
  ✅ Status: "Success" (todas las URLs indexadas)
  ✅ Valid pages: 3+ (index, blog, agencia)
  ❌ Errors: 0
  ⚠️ Warnings: Mínimas

Enhancements:
  ✅ Rich Results: Debería mostrar BlogPosting, FAQPage, etc.
  ✅ Mobile Usability: "No issues"
  ❌ Core Web Vitals: "No issues" o "Needs improvement"
```

### 4.2 Indexación Manual
1. En Google Search, busca: `site:lucasyleodigital.com`

**Qué debería ver:**
```
Resultados esperados:
1. lucasyleodigital.com/
2. lucasyleodigital.com/blog/
3. lucasyleodigital.com/agencia/
4. Posiblemente URLs individuales de blog posts

✅ Mínimo 3 URLs indexadas
✅ Rich snippets visibles (metadata)
```

---

## 5. VERIFICAR FUENTES (FONTS)

### 5.1 System Font Fallback
1. Desactiva JavaScript en DevTools (para simular font no loading)
   - DevTools → Ctrl+Shift+P → "Disable JavaScript"
2. Recarga la página
3. El texto debe verse legible con fuentes del sistema

**Qué debería ver:**
```
✅ Página aún es completamente legible
✅ Layout no cambia cuando fuentes cargan
✅ No hay "flash" de invisible text (FOIT)
✅ Degradación elegante a Arial/Segoe UI
```

### 5.2 Font Loading Performance
En DevTools → Network:
1. Filtrar por "css" o "google"
2. Ver "Space+Grotesk" y "Inter" requests

**Qué buscar:**
```
❌ ANTES:
   - Status: 200
   - Initiator: (index):1 [render-blocking]
   - Font display: swap

✅ DESPUÉS:
   - Status: 200
   - Initiator: onload event [non-blocking]
   - Font display: fallback
   - Loaded: After DOMContentLoaded (deferred)
```

---

## 6. CHECKLIST DE VERIFICACIÓN COMPLETO

### ✅ Velocidad
- [ ] PageSpeed Insights (Mobile): Score > 85
- [ ] PageSpeed Insights (Desktop): Score > 90
- [ ] LCP < 2.0s (mobile)
- [ ] FCP < 1.4s (mobile)
- [ ] CLS < 0.05
- [ ] Lighthouse Performance > 90
- [ ] Fonts no son render-blocking
- [ ] System font fallback funciona

### ✅ SEO
- [ ] Schema.org validation: 0 errores
- [ ] Meta descriptions correctas (~155 chars)
- [ ] BlogPosting schema inyectado dinámicamente
- [ ] Open Graph tags presentes y dinámicas
- [ ] H1 hierarchy correcta (solo 1 <h1> por página)
- [ ] Alt text en todas las imágenes
- [ ] Internal links presentes
- [ ] Mobile friendly
- [ ] Search Console: 0 crawl errors

### ✅ Mobile
- [ ] Hamburger menu funciona
- [ ] Touch targets > 48px
- [ ] Font sizes legibles en móvil
- [ ] No horizontal scrolling
- [ ] Responsive images con loading="lazy"

### ✅ Google/Search
- [ ] Search Console: Todas las URLs indexadas
- [ ] site: operator muestra 3+ resultados
- [ ] Rich snippets visibles en SERP
- [ ] No warnings de Mobile Usability

---

## 7. MONITOREO A LARGO PLAZO

### 7.1 Herramientas de Monitoreo Gratuitas
- **PageSpeed Insights:** Chequea cada semana
- **Google Search Console:** Revisa weekly crawl errors
- **Google Analytics:** Monitorea bounce rate y time-on-page

### 7.2 Alertas Recomendadas
Configurar en Google Search Console:
- ✅ Coverage issues (si alguna URL falla)
- ✅ Mobile Usability issues
- ✅ Core Web Vitals warnings

### 7.3 Optimizaciones Futuras
- [ ] Considerar WebP para imágenes (reducir 30-40% tamaño)
- [ ] Minificar CSS/JS inline (ganar ~50ms)
- [ ] Implementar image CDN para blog post covers
- [ ] A/B test mobile menu (conversion impact)
- [ ] Agregar internal linking entre blog posts relacionados

---

## 8. PREGUNTAS FRECUENTES

### P: ¿Por qué cambié display=swap a display=fallback?
**R:** `swap` espera hasta 3 segundos por la fuente antes de mostrar el sistema. `fallback` muestra texto inmediatamente con fuente del sistema y carga la fuente personalizada sin bloquear. Mejor UX = mejor SEO.

### P: ¿Las optimizaciones afectan el diseño?
**R:** No. El fallback a system fonts (-apple-system, Segoe UI) es muy similar a Space Grotesk. El usuario apenas nota la diferencia, pero la velocidad mejora dramáticamente.

### P: ¿Debo preocuparme por los warnings de Search Console?
**R:** Solo si son warnings de cobertura o móvil. Warnings de campos opcionales en schema son OK.

### P: ¿Cuándo debo revisar metrics nuevamente?
**R:** 
- Inmediatamente después de este commit (semana 1)
- Luego cada 2 semanas durante primer mes
- Luego mensualmente

### P: ¿Cómo afecta esto al SEO ranking?
**R:** Google da más peso a Core Web Vitals cada vez. Una mejora de 20% en LCP puede resultar en +5-10% más traffic en 1-2 meses, especialmente para palabras clave competitivas.

---

## 9. RECURSOS ÚTILES

- **Google PageSpeed Insights:** https://pagespeed.web.dev/
- **Lighthouse:** Chrome DevTools (F12)
- **WebPageTest:** https://webpagetest.org/
- **Schema.org Validator:** https://schema.org/validate/
- **Search Console:** https://search.google.com/search-console/
- **Facebook Debugger:** https://developers.facebook.com/tools/debug/
- **Lighthouse CI:** https://github.com/GoogleChrome/lighthouse-ci

---

**Estado Final:** ✅ Listo para verificación  
**Próximo Paso:** Ejecutar testing y documentar resultados en esta guía

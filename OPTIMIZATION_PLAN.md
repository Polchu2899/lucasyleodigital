# Plan de Optimización: Velocidad y SEO
**Fecha:** 26-05-2026 | **Estado:** En Ejecución

---

## 1. DIAGNÓSTICO DE VELOCIDAD (Velocity)

### 1.1 Problemas Críticos Identificados

#### A. Images (Alto impacto en LCP - Largest Contentful Paint)
- [ ] **Firebase Storage URLs** en logos, og:image, Twitter cards
  - Problema: URLs largas y hosting lento
  - Solución: Migrar a CDN o servir localmente con optimización
  - Impacto esperado: -200-500ms en LCP

- [ ] **Falta de optimización de imágenes**
  - Problema: No hay WebP, no hay lazy loading
  - Archivos: logo.png, og-image, cover images del blog
  - Solución: Convertir a WebP, implementar lazy loading con `loading="lazy"`
  - Impacto esperado: -400-800ms en LCP

- [ ] **Preload ineficiente del logo**
  - Código: `<link rel="preload" as="image" href="https://firebasestorage.googleapis.com/...">`
  - Problema: Preload remote logo ralentiza DNS + fetch
  - Solución: Usar inline SVG o local image optimized
  - Impacto esperado: -100-300ms en FCP

#### B. Google Fonts (Alto impacto en LCP)
- [ ] **Sin system-ui fallback stack**
  - Problema: Espera bloqueante por Space Grotesk y Inter
  - Código actual: `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap')`
  - Solución: 
    1. Cambiar display=swap a display=fallback
    2. Agregar font-display: fallback en CSS
    3. Cargar solo pesos necesarios
  - Impacto esperado: -150-400ms en LCP

#### C. Third-party Scripts (Alto impacto en FID)
- [ ] **Google Analytics se activa muy tarde**
  - Problema: dataLayer se define en <head>, pero gtag se carga en event
  - Solución: Aplazar GA hasta después de interacción
  - Ya implementado: ✅ función activarGoogleAnalytics()
  - Verificar: Que se llame en scroll o click

- [ ] **Firebase SDK no optimizado**
  - Problema: En blog/index.html, modulo pesado que se ejecuta en top-level
  - Solución: Implement code splitting, lazy load Firebase
  - Impacto esperado: -300-600ms en FCP

#### D. CSS (Afecta CLS - Cumulative Layout Shift)
- [ ] **Estilos inline sin compresión**
  - Problema: Todo CSS está inline en <style> tags, sin minificar
  - Tamaño: ~128KB en index.html solo de CSS inline
  - Solución: Extraer CSS crítico, minificar, servir async
  - Impacto esperado: -50-100ms en LCP + mejor CLS

- [ ] **Falta de containment y will-change**
  - Problema: Animaciones de menú móvil sin optimización
  - Solución: Agregar `contain: layout paint` y `will-change: transform`
  - Impacto esperado: -20-50ms en animaciones

### 1.2 Métricas Actuales Esperadas
```
LCP: ~2.5-3.2s (ROJO - Target: <2.5s)
FCP: ~1.8-2.1s (NARANJA - Target: <1.8s)
CLS: ~0.08-0.15 (NARANJA - Target: <0.1)
FID: ~50-100ms (VERDE - Target: <100ms)
TTFB: ~0.3-0.5s (VERDE - Target: <0.6s)
```

### 1.3 Acciones Prioritarias de Velocidad
1. **URGENTE:** Optimizar imágenes (logo, og-image) → Gain: ~300-500ms
2. **URGENTE:** Optimizar Google Fonts → Gain: ~150-300ms
3. **IMPORTANTE:** Code split Firebase en blog → Gain: ~250-400ms
4. **IMPORTANTE:** Minificar CSS inline → Gain: ~50-100ms
5. **IMPORTANTE:** Implementar lazy loading en blog cards → Gain: ~100-200ms

---

## 2. DIAGNÓSTICO DE SEO

### 2.1 Fortalezas Actuales ✅
- [x] Meta tags básicos completos (title, description, canonical)
- [x] Open Graph tags implementados
- [x] Twitter cards configuradas
- [x] Schema.org markup completo (Person, LocalBusiness, FAQPage, Service, BreadcrumbList)
- [x] Sitemap.xml presente
- [x] robots.txt configurado
- [x] Google Search Console verificado
- [x] hreflang alternates para ES
- [x] Mobile meta viewport correcto
- [x] PWA manifest linked

### 2.2 Oportunidades de Mejora

#### A. Meta Descriptions (Crítico)
- [ ] **Landing page (index.html)**
  - Actual: "Asesor digital para pequeños negocios en Barcelona. Ordeno tu presencia digital y creo un sistema que genera clientes reales. Sesión estratégica gratuita." (155 caracteres ✅)
  - Estado: CORRECTO

- [ ] **Blog listing (/blog/index.html)**
  - Actual: "Artículos prácticos sobre estrategia digital, SEO local, automatización e IA para pequeños negocios. Consejos reales de un consultor de marketing digital en Barcelona." (165 caracteres - LIGERAMENTE LARGO)
  - Mejora: Acortar a 155-160 caracteres

- [ ] **Agencia page (/agencia/index.html)**
  - ⚠️ FALTA REVISAR - No se vio en lectura anterior

#### B. Heading Hierarchy (Crítico para SEO)
- [ ] **Index.html**
  - Problema: Verificar que hay solo UN h1
  - Estructura esperada:
    ```
    h1: "Lucas · Asesor Digital para Pequeños Negocios"
    h2: "¿Por qué necesitas un asesor digital?"
    h2: "¿Cómo es el proceso?"
    h2: "Servicios"
    h2: "Lo que dicen mis clientes"
    h2: "Acerca de Lucas"
    h2: "Últimas publicaciones del blog"
    ```

- [ ] **Blog listing (/blog/index.html)**
  - Problema: Verificar h1 y estructura
  - h1 debería ser: "Blog — Estrategia Digital para Pymes"
  - h2: Títulos de categorías de blog
  - h3: Títulos de artículos (dentro de cards)

- [ ] **Blog single post**
  - Problema: h1 = título del artículo (correcto)
  - Verificar: Subtítulos son h2, no saltar niveles

#### C. Alt Text en Imágenes (Importante)
- [ ] **Logo/branding images**
  - Falta: alt="Lucas y Leo Digital - Asesor digital logo"
  
- [ ] **Blog cover images**
  - Falta: alt text descriptivo por cada artículo
  - Ejemplo: alt="Cómo crear un funnel de ventas digital efectivo para pymes"

- [ ] **Agencia service images**
  - ⚠️ REVISAR en agencia/index.html

#### D. Internal Linking (Importante)
- [ ] **Landing page**
  - Debe linkear a /blog/ en sección "Últimas publicaciones"
  - Debe linkear a /agencia/ en sección "Servicios"
  - Verificar: Todos los links tienen contexto claro

- [ ] **Blog page**
  - Debe linkear a landing (Inicio)
  - Debe linkear a agencia (Agencia)
  - Blog posts deben linkear a otros posts relacionados (FALTA IMPLEMENTAR)
  - Cada post debe tener CTA a sesión gratuita

#### E. Schema.org Structured Data (Muy Bueno, algunos ajustes)
- [x] Person schema para Lucas ✅
- [x] LocalBusiness schema ✅
- [x] FAQPage schema ✅
- [x] Service schemas ✅
- [x] WebSite schema ✅
- [x] BreadcrumbList schema ✅
- [ ] **BlogPosting schema EN CADA ARTÍCULO** (FALTA - Crítico)
  - Debe agregarse en blog/index.html cuando se carga un post
  - Campos necesarios: headline, description, image, datePublished, author, articleBody
  - Impacto: Rich results en Google, featured snippets

- [ ] **Article schema para posts** (FALTA)
  - Similar a BlogPosting, con propiedades adicionales

- [ ] **NewsArticle schema** (OPCIONAL - para blogs con noticias)

#### F. Image Optimization para SEO
- [ ] **Tamaño de imagen óptimo**
  - Problema: Firebase Storage URLs podrían estar sirviendo imágenes sin comprensión
  - Solución: Usar query params de Firebase para resize: `?alt=media&w=800`

- [ ] **Image sitemaps (OPCIONAL)**
  - Agregar imágenes en sitemap.xml para mejor indexación
  - `<image:image><image:loc>...</image:loc></image:image>`

#### G. Mobile Usability
- [x] Mobile hamburger menu ✅
- [x] Responsive viewport ✅
- [ ] **Font sizes on mobile** - VERIFICAR
  - Problema: A veces títulos son demasiado grandes
  - Solución: Usar `clamp()` para escalado fluido

#### H. Performance impacta SEO indirectamente
- Core Web Vitals son ranking factor
- Mejoras de velocidad = mejor SEO ranking automáticamente
- Ver sección 1 (Velocity) para detalles

### 2.3 Métricas SEO Actuales
```
Indexación: ✅ Probablemente indexada (Google Search Console verificado)
Rango: ❓ Unknown - Revisar Search Console
Keywords principales: "asesor digital barcelona", "marketing digital pymes", "consultor digital españa"
Competencia: Media-Alta (mercado de asesorías digitales es competitivo)
Oportunidad: Muy buena con blog posts semanales y contenido Long-tail
```

### 2.4 Acciones Prioritarias de SEO
1. **URGENTE:** Agregar BlogPosting schema a cada artículo del blog → Gain: Featured snippets
2. **IMPORTANTE:** Mejorar heading hierarchy en todas las páginas → Gain: +5-10% CTR
3. **IMPORTANTE:** Agregar alt text a TODAS las imágenes → Gain: Google Images traffic
4. **IMPORTANTE:** Crear internal linking strategy entre posts → Gain: +20-40% tiempo en página
5. **IMPORTANTE:** Optimizar meta descriptions (algunos muy largos) → Gain: +2-5% CTR

---

## 3. PLAN DE IMPLEMENTACIÓN

### Fase 1: VELOCIDAD (1-2 horas)
1. Optimizar Google Fonts (lazy load, font-display: fallback)
2. Optimizar imágenes con WebP + lazy loading
3. Minificar CSS inline (usar CSS minifier)
4. Code split Firebase en blog
5. Agregar lazy loading a blog cards

### Fase 2: SEO (1-2 horas)
1. Agregar BlogPosting schema a articulos
2. Revisar y arreglar heading hierarchy
3. Agregar alt text a todas las imágenes
4. Crear internal linking strategy
5. Mejorar meta descriptions largos

### Fase 3: TESTING & MEASUREMENT (1 hora)
1. Google PageSpeed Insights (Desktop + Mobile)
2. Google Lighthouse audit
3. WebPageTest (detailed metrics)
4. Search Console: revisar crawl errors
5. Verificar rankings en palabras clave principales

---

## 4. CHECKLIST DE IMPLEMENTACIÓN

### Velocidad
- [ ] Fonts: display=fallback implementado
- [ ] Fonts: Carga lazy después de DOMContentLoaded
- [ ] Fonts: Stack sin serif agregado para fallback
- [ ] Images: Logo convertido a WebP o SVG
- [ ] Images: Lazy loading en blog cards (loading="lazy")
- [ ] Images: CSS minificado
- [ ] Firebase: Code split en blog module
- [ ] Firebase: Lazy load en DOMContentLoaded
- [ ] CSS: Contain + will-change en elementos animados
- [ ] Cache: .htaccess rules optimizadas

### SEO
- [ ] BlogPosting schema en cada artículo (dinámico)
- [ ] Alt text en logo (index.html, blog/index.html)
- [ ] Alt text en og:image
- [ ] H1 hierarchy verificada en index.html
- [ ] H1 hierarchy verificada en blog/index.html
- [ ] Internal links verificados y actualizados
- [ ] Meta descriptions revisadas (max 160 chars)
- [ ] Tags semánticos verificados (no divs donde podría haber sections)
- [ ] URL slugs en blog son SEO-friendly
- [ ] Breadcrumb schema actualizado

### Testing
- [ ] PageSpeed Insights (index, blog, agencia)
- [ ] Lighthouse audit completo
- [ ] Mobile Core Web Vitals
- [ ] Desktop Core Web Vitals
- [ ] Search Console: No errors
- [ ] Structured data testing en schema.org
- [ ] Open Graph preview en Facebook Sharing Debugger
- [ ] Twitter Card preview

---

## 5. MÉTRICAS DE ÉXITO (Antes vs Después)

### Velocity Target
| Métrica | Antes | Target | Mejora |
|---------|-------|--------|--------|
| LCP | ~3.0s | <2.0s | -33% |
| FCP | ~2.0s | <1.4s | -30% |
| CLS | ~0.12 | <0.05 | -58% |
| FID | ~70ms | <50ms | -29% |
| TTFB | ~0.4s | <0.3s | -25% |

### SEO Target
| Métrica | Antes | Target | Mejora |
|---------|-------|--------|--------|
| Keywords indexadas | ~15 | ~50+ | +200% |
| Posición promedio | ~15-20 | ~8-12 | +40% |
| CTR esperado | ~2-3% | ~4-6% | +100% |
| Sesiones mensuales | ~50-100 | ~200-400 | +200% |

---

## 6. RECURSOS EXTERNOS
- PageSpeed Insights: https://pagespeed.web.dev/
- Lighthouse: Chrome DevTools → Lighthouse
- WebPageTest: https://webpagetest.org/
- Schema.org Testing: https://schema.org/validate/
- Favicon Generator: https://realfavicongenerator.net/
- TinyPNG: https://tinypng.com/ (image optimization)

---

**Estado:** 🔴 NO INICIADO → 🟡 EN PROGRESO → 🟢 COMPLETADO

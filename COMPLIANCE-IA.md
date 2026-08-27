# Auditoría de Cumplimiento AI Act — Lucas y Leo Digital

**Proyecto:** lucasyleodigital-main  
**Fecha de auditoría:** 2026-08-27  
**Estado:** ✓ SIN RIESGO — No aplica el AI Act  
**Próxima revisión:** Cuando se implemente cualquier sistema de IA (LLM, visión, ML) en el sitio

---

## Resumen ejecutivo

**¿Hay sistemas de IA en el proyecto?** No.  
**¿Aplica el AI Act europeo?** No.  
**¿Hay obligaciones de compliance?** No.  

El proyecto lucasyleodigital-main es una landing page + portfolio + sistema de reservas basado en Firebase. No contiene ningún sistema de inteligencia artificial que requiera auditoría legal.

---

## Alcance de la auditoría

### Qué sí se auditó
- ✓ Todo el código fuente en `lucasyleodigital-main` (excluyendo `node_modules`)
- ✓ Escaneo determinista de patrones conocidos de IA: LLM APIs (OpenAI, Anthropic, Gemini), visión/OCR, modelos de scoring/ML, reconocimiento biométrico, decisiones automáticas, chatbots
- ✓ Verificación manual de archivos candidatos
- ✓ Revisión de dependencias conocidas

### Qué está fuera del alcance
- Proyectos alojados en otro servidor: YouWhole (ERP), Dashboard-LyL (panel Next.js)
- Servicios que Lucas y Leo Digital *ofrece a clientes* (Meta Ads, chatbots para terceros, etc.)
- Infraestructura de Vercel, Firebase, Google Workspace

---

## Hallazgos

### ✓ Chatbot encontrado en 2 páginas — Automatización sin IA

**Ubicaciones:** 
- `/index.html` (landing principal) — 8 referencias
- `/youwhole/index.html` (línea 629-636) — chatbot dedicado
- JavaScript lógica: `/youwhole/js-deferred.js` (línea 119-200)

**Descripción:**
- Botón de chat fijo (abajo-derecha): `chat-bubble-btn` con label "Hablar con nuestro asistente"
- Panel interactivo que recibe preguntas del usuario
- Responde con lógica de palabras clave (`respuestaLocal()` en js-deferred.js)
- **No es IA:** clasificación manual if/else por keywords, no ML ni LLM

**Ejemplo de lógica:**
```javascript
if(msg.includes('verifactu')) {
  return 'VeriFactu es el nuevo sistema de la Agencia Tributaria...'
}
else if(msg.includes('precio')||msg.includes('cuesta')) {
  return 'YouWhole tiene 4 planes: Free (0€), Starter (29€/mes)...'
}
```

**Estado:** Activo — visible y funcional en la página

---

### Otros archivos (verificados)

| Archivo | Contenido | Conclusión |
|---------|-----------|-----------|
| `api/home-markdown.js` | Devuelve markdown con texto: "Automatización con IA, chatbots inteligentes" | Es marketing. Los chatbots que menciona son servicios para clientes, no del sitio. |
| `llms.txt`, `llms-full.txt` | Descripción del sitio para AI search / LLM crawlers | Describe servicios que ofrece la agencia, no funcionalidades del sitio. |
| `reservify/widget.js` | Sistema de reservas: formulario + calendario + Firestore | No es IA. Es automatización simple. |

---

### Resumen técnico

**Identificado:** 1 asistente automatizado (chat)  
**Tipo:** Chatbot basado en reglas (keywords → respuesta)  
**¿Es IA según AI Act?** No (no usa ML/LLM)  
**¿Requiere transparencia?** Sí (se presenta como "asistente" sin avisar que no es IA)

---

## Interpretación legal

### Base normativa

- **AI Act (UE) 2024/1689**: Define "sistema de IA" como software que toma decisiones o produce contenido basado en patrones aprendidos de datos. Requiere que los proveedores declaren el riesgo y se sometan a auditoría.
- **Ley Orgánica 3/2024 (España)**: Traspone el AI Act. Entra en vigencia progresivamente (2025-2027 según el riesgo).
- **AESIA (Autoridad Española de Supervisión de la IA)**: Supervisará el cumplimiento a partir de 2025.

### ¿Aplica el AI Act a lucasyleodigital-main?

**No — No hay sistemas de IA según la ley.**

El chatbot de YouWhole es **automatización sin IA**: responde con reglas if/else, no es ML ni LLM. El AI Act solo regula sistemas que usan aprendizaje automático o toman decisiones basadas en datos procesados por patrones — no regula reglas manuales de if/else.

**Pero sí hay una obligación de transparencia:**  
Aunque el chatbot no sea IA regulable, presentarse como "asistente" sin avisar que es automatización simple puede inducir al usuario a error sobre sus capacidades. Según principios de transparencia (RGPD, buen trato comercial), es recomendable un aviso pequeño.

**Sí aplica el AI Act si llega a implementar:**
- ✓ Un chatbot que responde con Claude/OpenAI API
- ✓ Un modelo de clasificación automática de preguntas (ML)
- ✓ Recomendaciones personalizadas basadas en datos del usuario
- ✓ Detección de intención usando NLP
- ✓ Cualquier integración con LLM, ML, visión, o biometría

---

## Qué hay que vigilar

### Proyectos relacionados (fuera de alcance)

Según el histórico del proyecto:

- **YouWhole** (ERP, proyecto separado): Mencionado como "ERP pymes+autonomos" con características de IA. **Si esta app estuviera en lucasyleodigital-main, habrría que re-auditar.**
- **Dashboard-LyL** (panel Next.js, proyecto separado): Mencionado como panel de "monitorizar webs y campañas". **Si contiene análisis automático / predicción, habría que auditar.**

**Acción:** Si alguno de estos proyectos migra o se integra en lucasyleodigital-main, re-ejecutar auditoría.

### Roadmap de características de IA

Según memory, hay un **asistente de IA pendiente en YouWhole** (Claude API).  
**No está en lucasyleodigital-main todavía.** Cuando se implemente:
- [ ] Re-ejecutar auditoría IA
- [ ] Añadir aviso de transparencia ("Este asistente usa Claude API de Anthropic")
- [ ] Documentar decisiones automáticas (si las hay)
- [ ] Archivar en COMPLIANCE-IA.md

---

## Acciones necesarias

**Prioridad alta — Transparencia chatbot:**

- [ ] Añadir aviso de transparencia en el panel del chat  
  El asistente se presenta sin avisar que es automatización, no IA. Sugerencia de texto: "Asistente automatizado · Responde según palabras clave"

**Ubicación:** `/youwhole/index.html` línea 639 (`.chat-header-info h4`)

Opción 1 — Texto pequeño:
```html
<h4>Asistente YouWhole</h4>
<small style="font-size: 11px; opacity: 0.65;">Automatizado · No es IA</small>
```

Opción 2 — Emoji discreto:
```html
<h4>🤖 Asistente YouWhole <span style="font-size: 11px; opacity: 0.6;">(automatizado)</span></h4>
```

**Prioridad media — Futuro:**

- [ ] Si en el futuro integráis Claude/OpenAI en el chat, re-auditar inmediatamente
- [ ] Revisar si el chatbot en `/index.html` (landing principal) también necesita el mismo aviso

---

## Conclusión

✓ **Sin riesgo legal crítico** bajo el AI Act, pero **necesita mejora de transparencia**.

El chatbot es automatización simple (if/else por keywords), no IA. Por tanto, no aplica el AI Act. Pero como se presenta como "Asistente" sin avisar que no es IA, es recomendable añadir un aviso discreto para ser transparente con los usuarios.

**Próxima revisión:** Manual — cuando hayas implementado la primera característica de IA real (LLM/ML) o después de añadir el aviso de transparencia.

---

## Historial de auditorías

### Auditoría 2026-08-27 (revisión)
- **Resultado:** Sin riesgo legal, pero transparencia pendiente
- **Hallazgo principal:** Chatbot automatizado en `/youwhole/index.html` e `/index.html` (8 referencias)
- **Tipo:** Automatización con reglas if/else (palabras clave → respuesta)
- **¿Es IA?** No — no usa ML/LLM
- **Acción:** Añadir aviso "Asistente automatizado" para transparencia
- **Riesgo residual:** Bajo (no es IA, pero mejorable en comunicación)

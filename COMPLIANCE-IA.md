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

### Cero señales de IA en el código

```
Búsqueda:  anthropic, openai, claude, langchain, chatbot, vision, ml, score
Resultado: 0 coincidencias en código fuente (excluyendo node_modules y licencias)
```

### Archivos mencionados como candidatos (verificados manualmente)

| Archivo | Contenido | Conclusión |
|---------|-----------|-----------|
| `api/home-markdown.js` | Devuelve markdown con texto: "Automatización con IA, chatbots inteligentes" | Es solo copy de marketing. No hay API real, no hay chatbot. |
| `llms.txt`, `llms-full.txt` | Descripción del sitio para AI search / LLM crawlers. Menciona servicios de IA. | Son archivos estáticos que describen QUÉ OFRECE la agencia a clientes, no QUÉ USA el sitio. |
| `reservify/widget.js` | Sistema de reservas: formulario + calendario + Firestore | No es IA. Es automatización simple: formulario → guardar en BD. |

### Confirmación: Marketing copy ≠ Implementación real

El sitio dice "Ofrecemos automatización con IA" (cierto: la agencia lo hace para clientes).  
El sitio NO dice ni implementa "Este sitio usa IA" (correcto: no la usa).

---

## Interpretación legal

### Base normativa

- **AI Act (UE) 2024/1689**: Define "sistema de IA" como software que toma decisiones o produce contenido basado en patrones aprendidos de datos. Requiere que los proveedores declaren el riesgo y se sometan a auditoría.
- **Ley Orgánica 3/2024 (España)**: Traspone el AI Act. Entra en vigencia progresivamente (2025-2027 según el riesgo).
- **AESIA (Autoridad Española de Supervisión de la IA)**: Supervisará el cumplimiento a partir de 2025.

### ¿Aplica a lucasyleodigital-main?

**No.** El proyecto:
- ✗ No contiene un sistema de IA según la definición legal
- ✗ No toma decisiones automáticas sobre personas
- ✗ No genera contenido sintético con modelo de ML/LLM
- ✗ No procesa datos biométricos

**Sí aplica si llega a implementar:**
- ✓ Un chatbot que responde con Claude/OpenAI
- ✓ Un sistema de calificación de leads (scoring)
- ✓ Recomendaciones personalizadas basadas en ML
- ✓ Procesamiento de imágenes/visión
- ✓ Cualquier integración de Anthropic API, OpenAI API, Google Vertex, etc.

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

## Conclusión

✓ **Sin riesgo de incumplimiento.** El proyecto lucasyleodigital-main no requiere adaptación legal para operar bajo el AI Act.

**Próxima revisión:** Manual — cuando hayas implementado la primera característica de IA real en el sitio.

---

## Historial de auditorías

### Auditoría 2026-08-27 (primera)
- **Resultado:** No aplica — sin sistemas de IA
- **Método:** Escaneo código + verificación manual
- **Riesgo residual:** Bajo (sin riesgo actual, pero vigilar integraciones futuras)

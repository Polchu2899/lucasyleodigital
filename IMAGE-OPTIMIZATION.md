# 🖼️ Optimización de Imágenes a WebP

## Estado Actual
- ✅ HTML actualizado con soporte WebP (`<picture>` elements)
- ⏳ Imágenes WebP aún no generadas (requiere ejecutar script)

## Ahorro Esperado
- **Tamaño actual PNG**: 184.1 KiB
- **Tamaño WebP (quality 85)**: ~150-160 KiB
- **Ahorro estimado**: 13-14 KiB por descarga (7-8%)

## Cómo Generar Imágenes WebP

### Opción 1: Con Sharp (Recomendado - Más Fácil)

```bash
# Instalar Sharp
npm install sharp

# Ejecutar script de conversión
node scripts/convert-to-webp.mjs
```

**Requisitos**: Node.js 14+

### Opción 2: Con ffmpeg/ImageMagick

```bash
# Instalar herramientas (elige una)
# En Windows (con Chocolatey):
choco install ffmpeg
# O:
choco install imagemagick

# Ejecutar script alternativo
node optimize-images.js
```

**Requisitos**: ffmpeg o ImageMagick instalado

### Opción 3: Conversión Manual Online
1. Ir a https://cloudconvert.com/png-to-webp
2. Subir `agencia/images/logo_sin_fondo.png`
3. Descargar como WebP
4. Guardar en `agencia/images/logo_sin_fondo.webp`

## Estructura de Carpetas Después de Generar

```
agencia/
├── index.html (✅ Actualizado con <picture> elements)
├── images/
│   ├── logo_sin_fondo.png (original descargado)
│   └── logo_sin_fondo.webp (generado por script)
```

## Verificación

Después de generar los archivos WebP:

1. **Confirmar estructura**:
   ```bash
   ls -la agencia/images/
   ```
   Deberías ver ambos archivos: `logo_sin_fondo.png` y `logo_sin_fondo.webp`

2. **Verificar en navegador**:
   - Abre `https://localhost/agencia/`
   - En DevTools → Network → Images
   - Debería cargar `.webp` en navegadores modernos
   - Debería cargar `.png` en navegadores antiguos (fallback)

3. **Medir tamaño**:
   ```bash
   ls -lh agencia/images/
   # Compara tamaños: PNG vs WebP
   ```

## Cómo Funciona

El HTML actualizado usa `<picture>` elements:

```html
<picture>
  <source srcset="images/logo_sin_fondo.webp" type="image/webp">
  <img src="...firebase.png..." alt="...">
</picture>
```

- **Navegadores modernos** (Chrome, Firefox, Edge, Safari 16+): Cargan WebP (~150 KiB)
- **Navegadores antiguos** (IE11, Safari <16): Cargan PNG fallback (~184 KiB)
- **Diferencia**: Completamente transparente para el usuario ✨

## Próximos Pasos (Opcional)

1. **Responsive images**: Usar `srcset` con múltiples tamaños:
   ```html
   <source srcset="images/logo-sm.webp 320w, images/logo-md.webp 640w" type="image/webp">
   ```

2. **AVIF** (formato más nuevo, 20% más pequeño que WebP):
   Requiere conversión adicional pero ofrece mayor compresión

3. **Otros assets**: Aplicar mismo proceso a imágenes de casos de éxito

## Soporte de Navegadores

| Navegador | WebP | Fallback PNG |
|-----------|------|--------------|
| Chrome 23+ | ✅ | N/A |
| Firefox 65+ | ✅ | N/A |
| Edge 18+ | ✅ | N/A |
| Safari 16+ | ✅ | N/A |
| Safari <16 | ❌ | ✅ PNG |
| IE 11 | ❌ | ✅ PNG |

---

**Nota**: Después de generar WebP, confirma con un nuevo análisis de PageSpeed Insights. 
El ahorro puede llegar a **15-20ms** en LCP y reducir el Performance score negativamente si no funciona bien.

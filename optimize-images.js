#!/usr/bin/env node
/**
 * Script de Optimización de Imágenes - WebP Conversion
 * Descarga imágenes de Firebase Storage y las convierte a WebP
 * Reduce tamaño hasta 40% sin cambios visuales
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Lista de imágenes a optimizar
const IMAGES = [
  {
    name: 'logo_sin_fondo',
    url: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FKOP4qekO2PcHMvwDZsL7FS5fK5f1%2Flogo_sin_fondo__1e540d5a.png?alt=media&token=b832e7f3-ed17-49d7-995f-d8e9ce77d53a',
    originalSize: 184.1 // KiB
  }
];

const ASSETS_DIR = path.join(__dirname, 'agencia', 'images');

// Crear directorio si no existe
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  console.log(`✓ Creado directorio: ${ASSETS_DIR}`);
}

/**
 * Descargar archivo desde URL
 */
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

/**
 * Obtener tamaño de archivo en KiB
 */
function getFileSizeKiB(filepath) {
  const stats = fs.statSync(filepath);
  return (stats.size / 1024).toFixed(2);
}

/**
 * Convertir PNG a WebP usando ffmpeg
 */
function convertToWebP(inputPath, outputPath) {
  try {
    // Intenta usar ffmpeg (más flexible)
    execSync(`ffmpeg -i "${inputPath}" -c:v libwebp -q:v 85 "${outputPath}" -y 2>/dev/null`, {
      stdio: 'ignore'
    });
    return true;
  } catch (e) {
    // Si ffmpeg no está disponible, intenta con ImageMagick
    try {
      execSync(`convert "${inputPath}" -quality 85 "${outputPath}" 2>/dev/null`, {
        stdio: 'ignore'
      });
      return true;
    } catch (e2) {
      // Si ninguno funciona, usa Node.js sharp si está instalado
      try {
        const sharp = require('sharp');
        sharp(inputPath)
          .webp({ quality: 85 })
          .toFile(outputPath)
          .then(() => true)
          .catch(() => false);
        return true;
      } catch (e3) {
        return false;
      }
    }
  }
}

/**
 * Proceso principal
 */
async function optimizeImages() {
  console.log('\n🖼️  Iniciando optimización de imágenes...\n');

  for (const img of IMAGES) {
    try {
      const pngPath = path.join(ASSETS_DIR, `${img.name}.png`);
      const webpPath = path.join(ASSETS_DIR, `${img.name}.webp`);

      // Descargar imagen original
      console.log(`📥 Descargando: ${img.name}.png...`);
      await downloadFile(img.url, pngPath);
      const pngSize = getFileSizeKiB(pngPath);
      console.log(`   ✓ Tamaño PNG: ${pngSize} KiB`);

      // Convertir a WebP
      console.log(`🔄 Convirtiendo a WebP (calidad 85)...`);
      const converted = convertToWebP(pngPath, webpPath);

      if (converted && fs.existsSync(webpPath)) {
        const webpSize = getFileSizeKiB(webpPath);
        const savings = ((pngSize - webpSize) / pngSize * 100).toFixed(1);
        console.log(`   ✓ Tamaño WebP: ${webpSize} KiB (Ahorro: ${savings}%)\n`);
      } else {
        console.log(`   ⚠️  No se pudo convertir. Necesitas ffmpeg, ImageMagick o Sharp instalado.\n`);
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
    }
  }

  console.log('\n✅ Optimización completada.');
  console.log('📝 Próximo paso: Actualizar URLs en HTML con srcset WebP\n');
}

// Ejecutar
optimizeImages().catch(console.error);

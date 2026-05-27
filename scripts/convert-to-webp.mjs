#!/usr/bin/env node
/**
 * Script de conversión PNG → WebP usando Sharp
 * Instalar primero: npm install sharp
 */

import sharp from 'sharp';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(__dirname, '../agencia/images');

// Crear directorio si no existe
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

const IMAGES = [
  {
    name: 'logo_sin_fondo',
    url: 'https://firebasestorage.googleapis.com/v0/b/blink-451505.firebasestorage.app/o/user-uploads%2FKOP4qekO2PcHMvwDZsL7FS5fK5f1%2Flogo_sin_fondo__1e540d5a.png?alt=media&token=b832e7f3-ed17-49d7-995f-d8e9ce77d53a'
  }
];

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

function getFileSizeKiB(filepath) {
  return (fs.statSync(filepath).size / 1024).toFixed(2);
}

async function convertImages() {
  console.log('\n🖼️  Optimizando imágenes a WebP...\n');

  for (const img of IMAGES) {
    try {
      const pngPath = path.join(ASSETS_DIR, `${img.name}.png`);
      const webpPath = path.join(ASSETS_DIR, `${img.name}.webp`);

      // Descargar si no existe
      if (!fs.existsSync(pngPath)) {
        console.log(`📥 Descargando ${img.name}.png...`);
        await downloadFile(img.url, pngPath);
      }

      const pngSize = getFileSizeKiB(pngPath);
      console.log(`   PNG: ${pngSize} KiB`);

      // Convertir a WebP (quality 85 = excelente relación tamaño/calidad)
      console.log(`   🔄 Convirtiendo a WebP...`);
      await sharp(pngPath)
        .webp({ quality: 85, alphaQuality: 100 })
        .toFile(webpPath);

      const webpSize = getFileSizeKiB(webpPath);
      const savings = ((pngSize - webpSize) / pngSize * 100).toFixed(1);
      console.log(`   ✅ WebP: ${webpSize} KiB (Ahorro: ${savings}%)\n`);

    } catch (error) {
      console.error(`❌ Error con ${img.name}: ${error.message}\n`);
    }
  }

  console.log('✨ Conversión completada. Las imágenes WebP están en: agencia/images/');
  console.log('📝 Ahora actualiza el HTML con srcset para servir WebP\n');
}

convertImages().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

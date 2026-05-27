#!/usr/bin/env node
/**
 * Generar múltiples tamaños del logo para responsive images
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.resolve(__dirname, '../images');

const sizes = [
  { width: 64, height: 64, name: 'sm' },   // Header, footer
  { width: 128, height: 128, name: 'md' }, // Badge
  { width: 256, height: 256, name: 'lg' }, // Hero
  { width: 512, height: 512, name: 'xl' }  // Floating bg
];

async function generateVariants() {
  console.log('\n📐 Generando variantes responsivas del logo...\n');

  const sourceWebP = path.join(ASSETS_DIR, 'logo_sin_fondo.webp');

  for (const size of sizes) {
    const outputPath = path.join(ASSETS_DIR, `logo_sin_fondo-${size.name}.webp`);

    try {
      console.log(`  ${size.width}×${size.height} (${size.name})`);
      await sharp(sourceWebP)
        .resize(size.width, size.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Keep transparency
        })
        .webp({ quality: 90 })
        .toFile(outputPath);

      const fs = await import('fs');
      const sizeKb = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`     ✅ ${sizeKb} KiB\n`);
    } catch (err) {
      console.error(`     ❌ Error: ${err.message}\n`);
    }
  }

  console.log('✨ Variantes generadas en images/\n');
  console.log('Usar en HTML:');
  console.log('  <picture>');
  console.log('    <source srcset="images/logo_sin_fondo-sm.webp 1x, images/logo_sin_fondo-md.webp 2x" type="image/webp">');
  console.log('    <img src="images/logo_sin_fondo.png" width="64" height="64">');
  console.log('  </picture>\n');
}

generateVariants().catch(console.error);

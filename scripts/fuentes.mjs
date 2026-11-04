// Fuentes autoalojadas (sin Google Fonts ni terceros):
// - Encode Sans en su ancho expandido (125 %) y peso 700: titulares. Es de la misma familia
//   geométrica y ancha que el nombre AUTIND del logo. Se fija como instancia estática: una sola
//   combinación de ejes es más liviana y más barata de dibujar en un celular que la variable.
// - IBM Plex Sans 400–600: texto, formularios e interfaz.
// - IBM Plex Mono 500: rótulos técnicos (números de sección, vistas, cotas).
// Cada fuente se recorta a los glifos del español que usa el sitio, con nombre con hash (caché
// inmutable), y lleva una fuente de respaldo con métricas ajustadas (capsize) para que el diseño
// no salte cuando llega la real.
// Genera src/styles/fuentes.css y src/data/fuentes.json (rutas para el <link rel="preload">).
// Uso: npm run fuentes
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import subsetFont from 'subset-font';
import { createFontStack } from '@capsizecss/core';
import encodeExpandida from '@capsizecss/metrics/encodeSansExpanded';
import plexSans from '@capsizecss/metrics/iBMPlexSans';
import plexMono from '@capsizecss/metrics/iBMPlexMono';
import arial from '@capsizecss/metrics/arial';

const SALIDA = 'public/fonts';
fs.rmSync(SALIDA, { recursive: true, force: true });
fs.mkdirSync(SALIDA, { recursive: true });

let glifos = '';
for (let c = 0x20; c <= 0x7e; c++) glifos += String.fromCharCode(c); // ASCII imprimible
for (let c = 0xa0; c <= 0xff; c++) glifos += String.fromCharCode(c); // á é í ó ú ñ ü ¿ ¡ « » · ×
glifos += [0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d, 0x2026, 0x2022, 0x2192, 0x2193, 0x2212, 0x2009, 0x202f, 0x2116]
  .map((c) => String.fromCharCode(c))
  .join('');

const huella = (buf) => crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);

async function recortar(origen, base, opciones = {}) {
  const entrada = fs.readFileSync(origen);
  const salida = await subsetFont(entrada, glifos, { targetFormat: 'woff2', ...opciones });
  const nombre = `${base}.${huella(salida)}.woff2`;
  fs.writeFileSync(path.join(SALIDA, nombre), salida);
  console.log(`${nombre}: ${(entrada.length / 1024).toFixed(1)} KB → ${(salida.length / 1024).toFixed(1)} KB`);
  return `/fonts/${nombre}`;
}

const FS = 'node_modules/@fontsource-variable';
const titular = await recortar(`${FS}/encode-sans/files/encode-sans-latin-standard-normal.woff2`, 'encode-sans-expandida', {
  variationAxes: { wght: 700, wdth: 125 },
});
const texto = await recortar(`${FS}/ibm-plex-sans/files/ibm-plex-sans-latin-standard-normal.woff2`, 'ibm-plex-sans', {
  variationAxes: { wght: { min: 400, max: 600 }, wdth: 100 },
});
const mono = await recortar('node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2', 'ibm-plex-mono');

const pilaTitular = createFontStack([encodeExpandida, arial], { fontFaceFormat: 'styleString' });
const pilaTexto = createFontStack([plexSans, arial], { fontFaceFormat: 'styleString' });
const pilaMono = createFontStack([plexMono, arial], { fontFaceFormat: 'styleString' });

const css = `/* Generado por scripts/fuentes.mjs — no editar a mano. */
@font-face {
  font-family: 'Encode Sans Expanded';
  src: url('${titular}') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'IBM Plex Sans';
  src: url('${texto}') format('woff2');
  font-weight: 400 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'IBM Plex Mono';
  src: url('${mono}') format('woff2');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}
${pilaTitular.fontFaces}
${pilaTexto.fontFaces}
${pilaMono.fontFaces}
:root {
  --f-titular: ${pilaTitular.fontFamily}, system-ui, sans-serif;
  --f-texto: ${pilaTexto.fontFamily}, system-ui, sans-serif;
  --f-mono: ${pilaMono.fontFamily}, ui-monospace, monospace;
}
`;

fs.mkdirSync('src/styles', { recursive: true });
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/styles/fuentes.css', css);
fs.writeFileSync('src/data/fuentes.json', JSON.stringify({ titular, texto, mono }, null, 2) + '\n');
console.log('→ src/styles/fuentes.css, src/data/fuentes.json');

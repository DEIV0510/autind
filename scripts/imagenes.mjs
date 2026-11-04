// Fotos reales del cliente → public/img/<id>-<ancho>.{avif,webp} + src/data/fotos.json
//
// Origen: _material-cliente/fotos/autind-NN.jpg (WhatsApp, 2026-11-03; ver ORIGEN.md).
// Las fotos conservan su apariencia real: sin filtros, sin retoque de color, sin ampliar. Lo único
// que se hace es encuadrar (recorte) para sacar del cuadro lo que no es de AUTIND: letreros de
// los locales vecinos, el letrero viejo con el logo anterior, una persona del público, una escoba.
//
// Uso: node scripts/imagenes.mjs
import fs from 'node:fs';
import sharp from 'sharp';
import { FOTOS } from './imagenes.config.mjs';

const SALIDA = 'public/img';
fs.rmSync(SALIDA, { recursive: true, force: true });
fs.mkdirSync(SALIDA, { recursive: true });

const ANCHOS = [480, 800, 1200, 1600];

async function colorMedio(buf) {
  const { dominant } = await sharp(buf).stats();
  return '#' + [dominant.r, dominant.g, dominant.b].map((n) => n.toString(16).padStart(2, '0')).join('');
}

const catalogo = [];
for (const f of FOTOS) {
  let img = sharp(`_material-cliente/fotos/${f.archivo}.jpg`).rotate();
  if (f.recorte) img = img.extract(f.recorte);
  const buf = await img.toBuffer();
  const { width, height } = await sharp(buf).metadata();
  const anchos = ANCHOS.filter((w) => w < width);
  anchos.push(width);
  for (const w of anchos) {
    const r = sharp(buf).resize({ width: w });
    await r.clone().avif({ quality: 54, effort: 6 }).toFile(`${SALIDA}/${f.id}-${w}.avif`);
    await r.clone().webp({ quality: 78, effort: 6 }).toFile(`${SALIDA}/${f.id}-${w}.webp`);
  }
  catalogo.push({
    id: f.id,
    archivo: f.archivo,
    alt: f.alt,
    titulo: f.titulo,
    categoria: f.categoria,
    ancho: width,
    alto: height,
    anchos,
    color: await colorMedio(buf),
    foco: f.foco ?? '50% 50%',
  });
  console.log(`${f.id.padEnd(28)} ${width}×${height}  ${anchos.join('/')}`);
}

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/fotos.json', JSON.stringify(catalogo, null, 2) + '\n');
const total = fs.readdirSync(SALIDA).reduce((s, f) => s + fs.statSync(`${SALIDA}/${f}`).size, 0);
console.log(`→ src/data/fotos.json (${catalogo.length} fotos) · public/img ${(total / 1024 / 1024).toFixed(1)} MB`);

// Fotos propias de los productos → public/img-productos/<id>-<ancho>.{avif,webp}
//                                  + src/data/productos-fotos.json
//
// Origen: _material-cliente/productos/<id>.jpg|jpeg|png|webp, fotos que toma AUTIND en su local.
// El nombre del archivo es el id que se usa en src/data/productos.json (p. ej. «nb1-63-1»).
// Sin retoque: solo se reducen de tamaño y se pasan a AVIF/WebP.
//
// Uso: node scripts/productos.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORIGEN = '_material-cliente/productos';
const SALIDA = 'public/img-productos';
const ANCHOS = [400, 800, 1200];

fs.rmSync(SALIDA, { recursive: true, force: true });
fs.mkdirSync(SALIDA, { recursive: true });
fs.mkdirSync(ORIGEN, { recursive: true });

const archivos = fs.readdirSync(ORIGEN).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
const catalogo = [];
for (const archivo of archivos) {
  const id = path.parse(archivo).name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const buf = await sharp(path.join(ORIGEN, archivo)).rotate().toBuffer();
  const { width, height } = await sharp(buf).metadata();
  const anchos = ANCHOS.filter((w) => w < width);
  anchos.push(width);
  for (const w of anchos) {
    const r = sharp(buf).resize({ width: w });
    await r.clone().avif({ quality: 56, effort: 6 }).toFile(`${SALIDA}/${id}-${w}.avif`);
    await r.clone().webp({ quality: 80, effort: 6 }).toFile(`${SALIDA}/${id}-${w}.webp`);
  }
  const { dominant } = await sharp(buf).stats();
  catalogo.push({
    id,
    base: `/img-productos/${id}`,
    ancho: width,
    alto: height,
    anchos,
    color: '#' + [dominant.r, dominant.g, dominant.b].map((n) => n.toString(16).padStart(2, '0')).join(''),
  });
  console.log(`${id.padEnd(28)} ${width}×${height}  ${anchos.join('/')}`);
}

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/productos-fotos.json', JSON.stringify(catalogo, null, 2) + '\n');
console.log(`→ src/data/productos-fotos.json (${catalogo.length} fotos)`);

// Logo oficial de AUTIND → archivos web, sin redibujar ni recolorear.
//
// El original (_material-cliente/logo-autind-oficial.png) es el óvalo negro-azulado del logo sobre
// un lienzo blanco. Lo único que se hace es volver transparente ese lienzo: se rellena desde los
// bordes todo lo claro que toca el exterior y, en el filo antialias, el alfa sale de la mezcla
// medida entre el blanco y el color del óvalo. Dentro del óvalo no se toca un solo píxel, y las
// proporciones son las del archivo original (1528 × 1029).
//
// Salidas:
//   public/marca/autind-logo-<ancho>.{avif,webp}   logo completo con transparencia
//   public/marca/autind-logo-600.png               para datos estructurados
//   public/favicon.png, apple-touch-icon.png, icono-192/512.png   recorte del emblema (arco + A)
//   public/og.jpg                                   1200 × 630 para compartir
//   src/data/marca.json                             medidas para el HTML
// Uso: node scripts/marca.mjs
import fs from 'node:fs';
import sharp from 'sharp';

const ORIGEN = '_material-cliente/logo-autind-oficial.png';
const SALIDA = 'public/marca';
fs.mkdirSync(SALIDA, { recursive: true });

const { data, info } = await sharp(ORIGEN).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const lum = (i) => (data[i * 3] * 299 + data[i * 3 + 1] * 587 + data[i * 3 + 2] * 114) / 1000;

// Color del óvalo, medido dentro de él (zona sin dibujo, junto al borde izquierdo).
const OVALO = [0, 0, 0];
let n = 0;
for (let y = H / 2 - 40; y < H / 2 + 40; y++) {
  for (let x = 20; x < 60; x++) {
    const i = y * W + x;
    for (let c = 0; c < 3; c++) OVALO[c] += data[i * 3 + c];
    n++;
  }
}
for (let c = 0; c < 3; c++) OVALO[c] = Math.round(OVALO[c] / n);
const lumOvalo = (OVALO[0] * 299 + OVALO[1] * 587 + OVALO[2] * 114) / 1000;

// Relleno desde los bordes, solo por el blanco del lienzo (casi blanco). Con un umbral bajo el
// relleno se colaba por el halo del destello dorado, que roza el filo del óvalo, y vaciaba la A.
const fuera = new Uint8Array(W * H);
const pila = [];
for (let x = 0; x < W; x++) pila.push(x, (H - 1) * W + x);
for (let y = 0; y < H; y++) pila.push(y * W, y * W + W - 1);
const vecinos = (i) => {
  const x = i % W;
  const v = [];
  if (x > 0) v.push(i - 1);
  if (x < W - 1) v.push(i + 1);
  if (i >= W) v.push(i - W);
  if (i < W * (H - 1)) v.push(i + W);
  return v;
};
while (pila.length) {
  const i = pila.pop();
  if (fuera[i] || lum(i) < 150) continue;
  fuera[i] = 1;
  pila.push(...vecinos(i));
}
// Filo antialias: hasta dos píxeles hacia dentro, solo mientras siga siendo más claro que el óvalo.
const UMBRAL = lumOvalo + 18;
for (let anillo = 2; anillo <= 3; anillo++) {
  const nuevos = [];
  for (let i = 0; i < W * H; i++) {
    if (fuera[i] || lum(i) <= UMBRAL) continue;
    if (vecinos(i).some((v) => fuera[v] && fuera[v] < anillo)) nuevos.push(i);
  }
  for (const i of nuevos) fuera[i] = anillo;
}

const rgba = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  if (fuera[i]) {
    // píxel = a·óvalo + (1 − a)·blanco  →  a = (255 − lum) / (255 − lumÓvalo)
    const a = Math.min(1, Math.max(0, (255 - lum(i)) / (255 - lumOvalo)));
    rgba[i * 4] = OVALO[0];
    rgba[i * 4 + 1] = OVALO[1];
    rgba[i * 4 + 2] = OVALO[2];
    rgba[i * 4 + 3] = a < 0.04 ? 0 : Math.round(a * 255);
  } else {
    rgba[i * 4] = data[i * 3];
    rgba[i * 4 + 1] = data[i * 3 + 1];
    rgba[i * 4 + 2] = data[i * 3 + 2];
    rgba[i * 4 + 3] = 255;
  }
}
const logo = sharp(rgba, { raw: { width: W, height: H, channels: 4 } });
const maestro = await logo.clone().png().toBuffer();

const ANCHOS = [200, 320, 480, 640];
for (const w of ANCHOS) {
  const img = sharp(maestro).resize({ width: w });
  await img.clone().avif({ quality: 62, effort: 7 }).toFile(`${SALIDA}/autind-logo-${w}.avif`);
  await img.clone().webp({ quality: 82, alphaQuality: 70, effort: 6 }).toFile(`${SALIDA}/autind-logo-${w}.webp`);
}
await sharp(maestro).resize({ width: 600 }).png({ compressionLevel: 9, palette: false }).toFile(`${SALIDA}/autind-logo-600.png`);

// ------------------------------------------------------------ íconos
// Recorte del emblema (arco plateado + A + destello) sobre el color del óvalo, en un cuadrado.
// Es un recorte del archivo original: a 32 px el nombre y el NIT no se leerían.
const EMBLEMA = { left: 236, top: 96, width: 1132, height: 560 };
const emblema = await sharp(maestro).extract(EMBLEMA).toBuffer();
const LADO = 1240;
const cuadrado = await sharp({
  create: { width: LADO, height: LADO, channels: 4, background: { r: OVALO[0], g: OVALO[1], b: OVALO[2], alpha: 1 } },
})
  .composite([{ input: emblema, left: Math.round((LADO - EMBLEMA.width) / 2), top: Math.round((LADO - EMBLEMA.height) / 2) - 10 }])
  .png()
  .toBuffer();
await sharp(cuadrado).resize(48).png().toFile('public/favicon.png');
await sharp(cuadrado).resize(180).png().toFile('public/apple-touch-icon.png');
await sharp(cuadrado).resize(192).png().toFile('public/icono-192.png');
await sharp(cuadrado).resize(512).png().toFile('public/icono-512.png');

// ------------------------------------------------------------ imagen para compartir
// Negro del sitio, logo completo a la izquierda y un tablero real a la derecha.
const OG = { w: 1200, h: 630 };
const fotoOg = await sharp('_material-cliente/fotos/autind-12.jpg')
  .rotate()
  .resize({ width: 520, height: OG.h, fit: 'cover', position: 'centre' })
  .toBuffer();
const logoOg = await sharp(maestro).resize({ width: 560 }).toBuffer();
const { height: altoLogoOg } = await sharp(logoOg).metadata();
const filo = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.w}" height="${OG.h}">
    <rect x="680" y="0" width="2" height="${OG.h}" fill="#F5E500"/>
    <rect x="60" y="${OG.h - 64}" width="56" height="4" fill="#F5E500"/>
  </svg>`
);
await sharp({ create: { width: OG.w, height: OG.h, channels: 3, background: '#080808' } })
  .composite([
    { input: fotoOg, left: 680, top: 0 },
    { input: logoOg, left: 60, top: Math.round((OG.h - altoLogoOg) / 2) - 16 },
    { input: filo, left: 0, top: 0 },
  ])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og.jpg');

fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync(
  'src/data/marca.json',
  JSON.stringify({ ancho: W, alto: H, anchos: ANCHOS, ovalo: `rgb(${OVALO.join(' ')})` }, null, 2) + '\n'
);
const peso = (f) => `${(fs.statSync(f).size / 1024).toFixed(1)} KB`;
console.log(`óvalo ${OVALO.join(',')} · logo 320 → ${peso(`${SALIDA}/autind-logo-320.avif`)} avif, ${peso(`${SALIDA}/autind-logo-320.webp`)} webp`);
console.log(`favicon ${peso('public/favicon.png')} · og ${peso('public/og.jpg')}`);

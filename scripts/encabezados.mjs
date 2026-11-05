// Encabezados HTTP del sitio, una sola fuente para todos los hostings:
//   · vercel.json       (Vercel)
//   · public/_headers   (Cloudflare Pages y Netlify, si algún día se cambia de proveedor)
//   · scripts/serve-dist.mjs los aplica en local, así las pruebas corren con lo mismo que producción.
// La CSP completa (con las huellas de los scripts en línea) va en un <meta> que escribe
// scripts/csp.mjs al compilar; aquí va la parte que un <meta> no puede llevar (frame-ancestors).
// Uso: node scripts/encabezados.mjs   (reescribe vercel.json y public/_headers)
import fs from 'node:fs';

const UN_ANO = 'public, max-age=31536000, immutable';
const UN_MES = 'public, max-age=2592000, stale-while-revalidate=86400';
const UN_DIA = 'public, max-age=86400, must-revalidate';

export const REGLAS = [
  {
    ruta: '/*',
    encabezados: {
      'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Content-Security-Policy': "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), browsing-topics=()',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-site',
      'X-Permitted-Cross-Domain-Policies': 'none',
    },
  },
  // Con hash en el nombre: no cambian nunca.
  ...['_astro', 'fonts'].map((d) => ({ ruta: `/${d}/*`, encabezados: { 'Cache-Control': UN_ANO } })),
  // Fotos y marca: se regeneran con el mismo nombre si cambia el original → caché de un mes.
  ...['img', 'img-productos', 'marca'].map((d) => ({ ruta: `/${d}/*`, encabezados: { 'Cache-Control': UN_MES } })),
  ...['/og.jpg', '/favicon.png', '/apple-touch-icon.png', '/icono-192.png', '/icono-512.png', '/site.webmanifest', '/robots.txt', '/sitemap.xml'].map((r) => ({
    ruta: r,
    encabezados: { 'Cache-Control': UN_DIA },
  })),
  // La API: nunca en caché, nunca indexada.
  { ruta: '/api/*', encabezados: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } },
];

// «/x/*» → patrón de Vercel «/x/(.*)».
const aVercel = (ruta) => ruta.replace(/\*$/, '(.*)');

if (process.argv[1]?.endsWith('encabezados.mjs')) {
  const vercel = {
    $schema: 'https://openapi.vercel.sh/vercel.json',
    // El build incluye la CSP (scripts/csp.mjs): no basta con «astro build».
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    trailingSlash: true,
    functions: {
      'api/*.js': { maxDuration: 10, memory: 256 },
    },
    headers: REGLAS.map((r) => ({
      source: aVercel(r.ruta),
      headers: Object.entries(r.encabezados).map(([key, value]) => ({ key, value })),
    })),
  };
  fs.writeFileSync('vercel.json', JSON.stringify(vercel, null, 2) + '\n');
  const headers = REGLAS.map((r) => [r.ruta, ...Object.entries(r.encabezados).map(([k, v]) => `  ${k}: ${v}`)].join('\n')).join('\n\n');
  fs.writeFileSync('public/_headers', `# Generado por scripts/encabezados.mjs — no editar a mano.\n${headers}\n`);
  console.log(`→ vercel.json y public/_headers (${REGLAS.length} reglas)`);
}

// Servidor local para revisar dist/ tal como quedará publicado:
// - Los mismos encabezados de seguridad y caché que producción (scripts/encabezados.mjs).
// - /api/* ejecuta las MISMAS funciones que Vercel (api/*.js), con .env cargado: así el
//   formulario se prueba con la CSP real del build.
// - Brotli para texto.
// Uso: node scripts/serve-dist.mjs [puerto]   (por defecto 5621)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { REGLAS } from './encabezados.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(raiz, 'dist');
if (fs.existsSync(path.join(raiz, '.env'))) process.loadEnvFile(path.join(raiz, '.env'));

const coincide = (regla, ruta) => (regla === '/*' ? true : regla.endsWith('/*') ? ruta.startsWith(regla.slice(0, -1)) : regla === ruta);
const comprimidos = new Map();
const port = Number(process.argv[2] || process.env.PORT || 5621);
const tipos = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
};
const funciones = new Set(fs.readdirSync(path.join(raiz, 'api')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)));

http
  .createServer(async (req, res) => {
    const url = new URL(req.url || '/', 'http://localhost');
    const ruta = decodeURIComponent(url.pathname);
    const aplicar = (status, base) => {
      const h = { ...base };
      for (const r of REGLAS) if (coincide(r.ruta, ruta) && (status === 200 || !r.encabezados['Cache-Control'])) Object.assign(h, r.encabezados);
      return h;
    };

    if (ruta.startsWith('/api/')) {
      const nombre = ruta.slice(5).replace(/\/+$/, '');
      if (!funciones.has(nombre)) { res.writeHead(404, aplicar(404, { 'Content-Type': 'application/json' })).end('{"error":"No existe."}'); return; }
      for (const [k, v] of Object.entries(aplicar(200, {}))) res.setHeader(k, v);
      const mod = await import(pathToFileURL(path.join(raiz, 'api', `${nombre}.js`)).href);
      await mod.default(req, res);
      return;
    }

    let archivo = path.join(dist, ruta);
    if (!archivo.startsWith(dist)) { res.writeHead(403).end(); return; }
    const esDir = fs.existsSync(archivo) && fs.statSync(archivo).isDirectory();
    if (esDir && !ruta.endsWith('/')) { res.writeHead(308, { Location: `${url.pathname}/${url.search}` }).end(); return; }
    if (esDir) archivo = path.join(archivo, 'index.html');
    let status = 200;
    if (!fs.existsSync(archivo)) { archivo = path.join(dist, '404.html'); status = 404; }
    const ext = path.extname(archivo);
    const cuerpo = fs.readFileSync(archivo);
    const headers = aplicar(status, { 'Content-Type': tipos[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    if (/\.(html|js|css|json|xml|txt|svg|webmanifest)$/.test(ext) && /\bbr\b/.test(req.headers['accept-encoding'] || '')) {
      const clave = `${archivo}:${fs.statSync(archivo).mtimeMs}`;
      if (!comprimidos.has(clave)) comprimidos.set(clave, zlib.brotliCompressSync(cuerpo));
      res.writeHead(status, { ...headers, 'Content-Encoding': 'br' }).end(comprimidos.get(clave));
    } else {
      res.writeHead(status, headers).end(cuerpo);
    }
  })
  .listen(port, () => console.log(`AUTIND (build) → http://localhost:${port}/`));

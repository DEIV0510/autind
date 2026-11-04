import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'astro/config';

// Las funciones de /api leen process.env. En Vercel lo rellena la plataforma; en local, el
// archivo .env (que nunca se sube al repositorio).
const archivoEnv = resolve(import.meta.dirname, '.env');
if (existsSync(archivoEnv)) process.loadEnvFile(archivoEnv);

// Dominio público. No se inventa: sale de SITE_URL o del dominio de producción que Vercel
// entrega al compilar. Sin dominio no hay canonical absoluto ni sitemap con URL completa.
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const site = process.env.SITE_URL || (vercel ? `https://${vercel}` : undefined);

/**
 * Monta las funciones de /api dentro del servidor de desarrollo, para probar el formulario en
 * local con el MISMO código que ejecuta Vercel en producción.
 */
function apiEnDesarrollo() {
  return {
    name: 'api-en-desarrollo',
    configureServer(server) {
      const dirApi = resolve(import.meta.dirname, 'api');
      const rutas = new Set(
        readdirSync(dirApi)
          .filter((f) => f.endsWith('.js'))
          .map((f) => '/api/' + f.replace(/\.js$/, ''))
      );
      server.middlewares.use(async (req, res, next) => {
        const ruta = req.url.split('?')[0].replace(/\/+$/, '');
        if (!rutas.has(ruta)) return next();
        try {
          const mod = await server.ssrLoadModule(resolve(dirApi, ruta.replace('/api/', '') + '.js'));
          await mod.default(req, res);
        } catch (err) {
          server.config.logger.error(`[api] ${ruta}: ${err.stack || err.message}`);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: 'Error interno del servidor.' }));
          }
        }
      });
    },
  };
}

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // CSS en línea: una petición bloqueante menos en la primera visita.
    inlineStylesheets: 'always',
  },
  scopedStyleStrategy: 'class',
  compressHTML: true,
  devToolbar: { enabled: false },
  server: { port: 5620, host: true },
  vite: {
    plugins: [apiEnDesarrollo()],
    server: { watch: { ignored: ['**/_material-*/**', '**/.cache/**'] } },
  },
});

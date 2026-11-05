import type { APIRoute } from 'astro';
import { PRODUCTOS, hayProductos, urlProducto } from '../lib/productos';

// Sin dominio (SITE_URL o el de Vercel) no se puede escribir un sitemap válido: se publica vacío.
const PAGINAS = [
  { ruta: '/', prioridad: '1.0' },
  { ruta: '/politica-de-tratamiento-de-datos/', prioridad: '0.2' },
  { ruta: '/aviso-de-privacidad/', prioridad: '0.2' },
  ...(hayProductos ? [{ ruta: '/productos/', prioridad: '0.8' }, ...PRODUCTOS.map((p) => ({ ruta: urlProducto(p), prioridad: '0.7' }))] : []),
];

export const GET: APIRoute = ({ site }) => {
  const urls = site
    ? PAGINAS.map((p) => `  <url><loc>${new URL(p.ruta, site)}</loc><lastmod>2026-11-03</lastmod><priority>${p.prioridad}</priority></url>`).join('\n')
    : '';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const lineas = ['User-agent: *', 'Allow: /', 'Disallow: /api/'];
  if (site) lineas.push('', `Sitemap: ${new URL('/sitemap.xml', site)}`);
  return new Response(lineas.join('\n') + '\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};

/**
 * Utilidades comunes de las funciones del servidor.
 *
 * Ningún endpoint filtra detalles internos en un error: al navegador le llega un mensaje
 * entendible y el detalle técnico queda solo en el registro del servidor.
 */

// El formulario pesa unos cientos de bytes: cualquier cuerpo mayor a 16 KB es un abuso.
const LIMITE_CUERPO = 16 * 1024;

export class ErrorHttp extends Error {
  constructor(estado, mensaje) {
    super(mensaje);
    this.estado = estado;
  }
}

export function json(res, estado, cuerpo) {
  res.statusCode = estado;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(JSON.stringify(cuerpo));
}

/** Lee el cuerpo JSON tanto si el entorno ya lo analizó (Vercel) como si no (servidor local). */
export async function leerCuerpo(req) {
  const tipo = String(req.headers['content-type'] || '');
  if (!tipo.startsWith('application/json')) throw new ErrorHttp(415, 'Se esperaba JSON.');
  const largo = Number(req.headers['content-length'] || 0);
  if (largo > LIMITE_CUERPO) throw new ErrorHttp(413, 'La solicitud es demasiado grande.');

  let datos;
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      if (req.body.length > LIMITE_CUERPO) throw new ErrorHttp(413, 'La solicitud es demasiado grande.');
      try { datos = JSON.parse(req.body); } catch { throw new ErrorHttp(400, 'Solicitud mal formada.'); }
    } else {
      datos = req.body;
    }
  } else {
    const trozos = [];
    let total = 0;
    for await (const trozo of req) {
      total += trozo.length;
      if (total > LIMITE_CUERPO) throw new ErrorHttp(413, 'La solicitud es demasiado grande.');
      trozos.push(trozo);
    }
    try {
      datos = trozos.length ? JSON.parse(Buffer.concat(trozos).toString('utf8')) : {};
    } catch {
      throw new ErrorHttp(400, 'Solicitud mal formada.');
    }
  }
  if (!datos || typeof datos !== 'object' || Array.isArray(datos)) throw new ErrorHttp(400, 'Solicitud mal formada.');
  return datos;
}

export function soloMetodos(req, metodos) {
  if (!metodos.includes(req.method)) throw new ErrorHttp(405, 'Método no permitido.');
}

/**
 * Protección CSRF para un endpoint sin sesión ni cookies:
 *  · el navegador siempre manda Origin en un POST, y debe ser este mismo sitio;
 *  · la cabecera X-Solicitud solo la puede poner un fetch de esta página: un formulario o un
 *    fetch desde otro dominio no pueden añadirla sin pasar por CORS, que aquí no se habilita.
 */
export function exigirMismoOrigen(req) {
  if (req.headers['x-solicitud'] !== 'cotizacion') throw new ErrorHttp(403, 'Solicitud no autorizada.');
  const origen = req.headers.origin;
  if (!origen) throw new ErrorHttp(403, 'Solicitud no autorizada.');
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  let o;
  try { o = new URL(origen); } catch { throw new ErrorHttp(403, 'Solicitud no autorizada.'); }
  if (o.host !== host) throw new ErrorHttp(403, 'Solicitud no autorizada.');
}

export function ipDe(req) {
  // En Vercel estas cabeceras las escribe la propia plataforma (no se pueden falsear desde el
  // navegador). Fuera de Vercel no se confía en ninguna cabecera: se usa la conexión real.
  if (process.env.VERCEL) {
    const ip = req.headers['x-real-ip'] || req.headers['x-vercel-forwarded-for'] || req.headers['x-forwarded-for'];
    if (typeof ip === 'string' && ip) return ip.split(',')[0].trim();
  }
  return req.socket?.remoteAddress ?? 'desconocida';
}

/** Registro estructurado de eventos (nunca datos personales). */
export function registrar(evento, datos = {}) {
  console.info(JSON.stringify({ t: new Date().toISOString(), evento, ...datos }));
}

/** Envuelve un handler para que ningún fallo se escape sin controlar. */
export function manejar(fn) {
  return async (req, res) => {
    try {
      await fn(req, res);
    } catch (err) {
      const estado = err instanceof ErrorHttp ? err.estado : 500;
      // Los 5xx se ocultan: el mensaje real puede delatar algo interno.
      const oculto = estado >= 500;
      if (oculto) console.error('[api]', req.url, err);
      if (!res.headersSent) {
        if (estado === 405) res.setHeader('Allow', 'POST');
        json(res, estado, { error: oculto ? 'Error interno del servidor.' : err.message, campo: err?.campo ?? null });
      }
    }
  };
}

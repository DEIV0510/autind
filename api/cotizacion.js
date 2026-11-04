/**
 * POST /api/cotizacion — recibe el formulario de cotización.
 *
 * El formulario abre WhatsApp con el mensaje armado en el navegador (así la solicitud nunca se
 * pierde); esta función es la copia del lado del servidor:
 *   · exige el mismo origen y la cabecera propia del formulario (CSRF),
 *   · limita a 5 solicitudes por IP cada 10 minutos,
 *   · frena robots con un campo trampa y un tiempo mínimo de llenado,
 *   · vuelve a validar y normalizar cada campo (src/lib/validacion.js),
 *   · y, si están configuradas RESEND_API_KEY y COTIZACION_EMAIL, envía la solicitud por correo
 *     como texto plano. Sin esas variables responde `enviado:false` y no finge nada.
 * No guarda datos personales ni los escribe en los registros.
 */
import { ErrorHttp, exigirMismoOrigen, ipDe, json, leerCuerpo, manejar, registrar, soloMetodos } from './_lib/http.js';
import { limitar } from './_lib/limite.js';
import { ErrorValidacion, textoSolicitud, validarSolicitud } from '../src/lib/validacion.js';

const TIEMPO_MINIMO_MS = 3000;

async function enviarCorreo(d) {
  const clave = process.env.RESEND_API_KEY;
  const destino = process.env.COTIZACION_EMAIL;
  if (!clave || !destino) return false;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${clave}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.COTIZACION_REMITENTE || 'AUTIND Web <onboarding@resend.dev>',
      to: [destino],
      subject: `Cotización web · ${d.servicio} · ${d.nombre}`.slice(0, 140),
      text: `${textoSolicitud(d)}\n\n— Enviado desde el formulario del sitio web.`,
    }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => null);
  if (!r?.ok) {
    console.error('[cotizacion] el proveedor de correo no respondió bien', r?.status ?? 'sin respuesta');
    return false;
  }
  return true;
}

export default manejar(async (req, res) => {
  soloMetodos(req, ['POST']);
  exigirMismoOrigen(req);
  // Lo mal formado (tipo, tamaño, JSON) se rechaza antes de contar: no cuesta nada atenderlo.
  const c = await leerCuerpo(req);
  limitar(`cotizacion:${ipDe(req)}`, { max: 5, ventanaMs: 10 * 60 * 1000 });

  // Trampas para robots: un campo oculto que una persona nunca llena y un tiempo mínimo.
  if (c.sitio_web) throw new ErrorHttp(400, 'Solicitud no válida.');
  const ms = Number(c.ms);
  if (!Number.isFinite(ms) || ms < TIEMPO_MINIMO_MS) throw new ErrorHttp(400, 'Solicitud no válida.');

  let datos;
  try {
    datos = validarSolicitud(c);
  } catch (err) {
    if (err instanceof ErrorValidacion) {
      const e = new ErrorHttp(422, err.message);
      e.campo = err.campo;
      throw e;
    }
    throw err;
  }

  const enviado = await enviarCorreo(datos);
  registrar('cotizacion', { servicio: datos.servicio, enviado });
  json(res, 200, { ok: true, enviado });
});

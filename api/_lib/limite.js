/**
 * Límite de peticiones por IP, en memoria.
 *
 * En serverless cada instancia tiene su propio contador y se reinicia al reciclarse: es una
 * traba contra abusos casuales, no una garantía. La protección fuerte va delante, en la
 * plataforma (Vercel Firewall con una regla de rate limit), documentada en docs/SEGURIDAD.md.
 */
import { ErrorHttp } from './http.js';

const cubos = new Map();

/** Cuenta una petición de `clave` y lanza 429 si se pasa de `max` dentro de `ventanaMs`. */
export function limitar(clave, { max, ventanaMs }) {
  const ahora = Date.now();
  // Limpieza perezosa para que el mapa no crezca sin fin.
  if (cubos.size > 5000) for (const [k, v] of cubos) if (ahora - v.desde > v.ventanaMs) cubos.delete(k);

  const actual = cubos.get(clave);
  if (!actual || ahora - actual.desde > ventanaMs) {
    cubos.set(clave, { n: 1, desde: ahora, ventanaMs });
    return;
  }
  actual.n += 1;
  if (actual.n > max) {
    const minutos = Math.max(1, Math.ceil((ventanaMs - (ahora - actual.desde)) / 60000));
    throw new ErrorHttp(429, `Recibimos varias solicitudes seguidas. Intenta de nuevo en ${minutos} minuto(s) o escríbenos por WhatsApp.`);
  }
}

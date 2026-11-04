# Seguridad — AUTIND NC S.A.S.

Ningún sitio es invulnerable. Estas son las medidas reales que tiene este, y lo que depende del hosting.

## Lo que ya hace el código

| Riesgo | Medida | Dónde |
|---|---|---|
| Inyección SQL | No hay base de datos ni consultas: lo que llega del formulario nunca arma una consulta. | — |
| XSS | El JS no escribe HTML como texto (solo `textContent`), la CSP exige **Trusted Types** y solo deja correr los scripts propios (huella SHA-256 de cada script en línea). El servidor rechaza mensajes con etiquetas HTML y el correo se envía como texto plano. | `scripts/csp.mjs`, `src/lib/validacion.js` |
| CSRF | El endpoint no usa cookies ni sesión. Además exige `Origin` del mismo sitio, la cabecera propia `X-Solicitud` (otro dominio no puede ponerla sin CORS, que no se habilita) y `Content-Type: application/json`. | `api/_lib/http.js` |
| Spam y robots | Campo trampa invisible, tiempo mínimo de llenado (3 s), límite de 5 solicitudes por IP cada 10 minutos, máximo 2 enlaces por mensaje. Sin CAPTCHA de terceros: no carga scripts externos ni rastrea al visitante. | `api/cotizacion.js` |
| Datos inválidos | Validación en el navegador y otra vez en el servidor con el **mismo** archivo; solo pasan los campos conocidos, con largo máximo, sin caracteres de control ni invisibles; teléfono colombiano de 10 dígitos; servicio de una lista cerrada. | `src/lib/validacion.js` |
| Abuso por tamaño | Cuerpo máximo de 16 KB (413), solo `POST` (405), tiempo máximo de la función 10 s. | `api/_lib/http.js`, `vercel.json` |
| Fugas de información | Los errores 5xx responden «Error interno del servidor»; el detalle queda solo en el registro. Los registros no guardan nombre, teléfono ni mensaje. | `api/_lib/http.js` |
| IP falseada | En Vercel la IP sale de las cabeceras que escribe la plataforma; fuera de Vercel se usa la conexión real (no se confía en `X-Forwarded-For`). | `ipDe()` |
| Secretos | No hay claves en el código ni en el navegador. La única clave opcional (`RESEND_API_KEY`) vive en las variables de entorno del servidor. `.env` está en `.gitignore`. | `.env.example` |
| Clickjacking | `X-Frame-Options: DENY` y `frame-ancestors 'none'`. | `vercel.json` |
| Terceros | Cero scripts externos. El mapa de Google solo se carga si la persona lo pide (botón), y la CSP solo permite marcos de `www.google.com`. | `Contacto.astro` |
| Dependencias | Una sola dependencia de producción (Astro, que solo corre al compilar). `npm audit`: 0 vulnerabilidades al 2026-11-03. | `package.json` |

### Encabezados HTTP (todas las rutas)

`Strict-Transport-Security` (2 años, subdominios), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (cámara, micrófono, ubicación, pagos… apagados),
`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-site`, `X-Permitted-Cross-Domain-Policies: none`.
La API además lleva `Cache-Control: no-store` y `X-Robots-Tag: noindex`.

Se generan con `npm run headers` (escribe `vercel.json` y `public/_headers`) y el servidor local
(`npm run preview`) aplica exactamente los mismos.

## Lo que depende del hosting (configurar al publicar)

1. **HTTPS obligatorio**: Vercel emite el certificado SSL y redirige HTTP → HTTPS por su cuenta. Con dominio propio, apuntar el DNS a Vercel y esperar el certificado; HSTS ya va en las cabeceras.
2. **Límite fuerte de peticiones**: el límite del código vive en memoria de cada instancia (traba abusos casuales). Para uno global: Vercel → *Firewall* → *Rate Limiting*, regla para `/api/cotizacion` (por ejemplo 10 peticiones por minuto por IP, acción *Deny*). Activar también *Attack Challenge Mode* si hay un ataque.
3. **Variables de entorno**: `RESEND_API_KEY` marcada como *Sensitive* y solo en *Production*. Nunca en variables `PUBLIC_*`.
4. **Permisos mínimos**: en GitHub y Vercel, solo las personas que publican con rol de escritura; activar la verificación en dos pasos en ambas cuentas.
5. **Copias de seguridad**: el sitio entero (código, fotos y textos) está en el repositorio `DEIV0510/autind`; cada commit es una copia restaurable y Vercel guarda cada despliegue para volver atrás con un clic (*Instant Rollback*). Recomendado: una copia local del repositorio una vez al mes (`git clone --mirror`).
6. **Dependencias**: correr `npm audit` y `npm outdated` cada mes; activar *Dependabot alerts* en GitHub.

## Sin CMS

El sitio no tiene panel administrativo ni CMS: no hay pantalla de acceso que proteger ni base de datos que vulnerar. Los textos se cambian en `src/lib/empresa.ts` y las fotos con `npm run imagenes`.

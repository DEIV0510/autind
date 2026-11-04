# AUTIND NC S.A.S. — sitio web

Material eléctrico industrial y ensamble de tableros eléctricos · Calle 18 # 10-33, Local 111, Bogotá · WhatsApp 324 266 7140.

Astro estático + una función de servidor (`api/cotizacion.js`) para el formulario. Pensado para Vercel.

## Comandos
| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Desarrollo en http://localhost:5620 (con la API) |
| `npm run build` | Compila a `dist/` y escribe la CSP con huellas |
| `npm run preview` | Sirve `dist/` en http://localhost:5621 con las cabeceras y la API de producción |
| `npm run assets` | Regenera fuentes, logo e imágenes desde `_material-cliente/` |
| `npm run headers` | Regenera `vercel.json` y `public/_headers` |
| `npm run check` | Revisa tipos y compila |

## Dónde cambiar cosas
- Datos de la empresa, servicios y mensajes de WhatsApp: `src/lib/empresa.ts`.
- Fotos: agregar el JPG a `_material-cliente/fotos/`, describirlo en `scripts/imagenes.config.mjs` y correr `npm run imagenes`.
- Validación del formulario (navegador y servidor): `src/lib/validacion.js`.

## Documentación
- `docs/DISENO.md` — sistema visual.
- `docs/SEGURIDAD.md` — medidas aplicadas y configuración del hosting.
- `docs/PENDIENTES.md` — datos por confirmar y pasos para publicar.

## Variables de entorno (opcionales)
Ver `.env.example`. Sin ninguna, el sitio funciona completo: el formulario envía la solicitud por WhatsApp.

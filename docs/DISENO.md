# Sistema de diseño — AUTIND NC S.A.S.

Concepto: **«Engineering the power of industry»**. La página se lee como una lámina de plano eléctrico:
retícula, vistas rotuladas, cotas, cajetín y diagramas unifilares con símbolos IEC, los mismos que
AUTIND pinta en las puertas de sus tableros.

## Reglas
- **Logo oficial intacto** (`_material-cliente/logo-autind-oficial.png`). Solo se quitó el lienzo blanco alrededor del óvalo (`scripts/marca.mjs`); colores, arco plateado, destello y proporciones son los del archivo. Va en cabecera, pantalla de carga, sección amarilla y pie. El favicon es un recorte del emblema, no un redibujo.
- **Un ángulo: 21°**, la inclinación del destello dorado del logo. Lo usan la línea que cruza la portada y el barrido de los botones.
- **Esquinas rectas** en todo.
- **Amarillo con intención**: botones, indicadores, filos y la única sección amarilla («¿Por qué AUTIND?»). Plata solo en filos finos (pie), como el arco del logo.
- **Fotos reales sin retoque**: solo recortes para sacar letreros de vecinos, el letrero con el logo anterior y personas del público.
- **Sin cifras inventadas**, sin emojis, sin cápsulas sobre cada título.

## Tokens (`src/styles/global.css`)
| Token | Valor | Uso |
|---|---|---|
| `--negro` | `#080808` | Fondo |
| `--grafito` | `#191919` | Tarjetas y formulario |
| `--amarillo` | `#F5E500` | Acción, acentos, sección «¿Por qué?» |
| `--blanco` | `#FFFFFF` | Texto principal |
| `--gris` | `#A5A5A5` | Texto secundario (8:1 sobre negro) |
| `--plata` | degradado de 5 paradas | Filos finos |

Tipografía (autoalojada y recortada, `npm run fuentes`):
- **Encode Sans Expandida 700** — titulares en mayúsculas (misma familia ancha y geométrica del nombre AUTIND).
- **IBM Plex Sans 400–600** — texto e interfaz.
- **IBM Plex Mono 500** — rótulos técnicos (números de sección, vistas, cotas).

## Movimiento
Entradas al hacer scroll, trazos de diagramas que se dibujan, barrido de botones a 21°, parallax mínimo
solo en escritorio. Todo respeta `prefers-reduced-motion`; los equipos modestos o con ahorro de datos
(`html.ligero`) no tienen parallax. La pantalla de carga no tiene tiempo mínimo: sale en cuanto el logo
está pintado y el HTML leído (tope 2,5 s), solo en la primera visita de la sesión.

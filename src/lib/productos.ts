// Catálogo de productos. Hoy está vacío: mientras src/data/productos.json no tenga productos, el
// sitio no publica /productos/, ni la sección «Productos destacados», ni el enlace del menú.
//
// Cómo se agrega un producto: ver docs/PRODUCTOS.md.
// Sin precios: cada producto se cotiza por WhatsApp («Precio a consultar»).
import fs from 'node:fs';
import productosJson from '../data/productos.json';
import fotosJson from '../data/productos-fotos.json';
import { EMPRESA } from './empresa';

export interface FotoProducto {
  id: string;
  /** Ruta sin ancho ni extensión: `${base}-${ancho}.webp` */
  base: string;
  ancho: number;
  alto: number;
  anchos: number[];
  color: string;
}

export interface Producto {
  slug: string;
  nombre: string;
  marca: string;
  referencia: string;
  categoria: string;
  /** Una línea para la tarjeta (p. ej. «Breaker 2P C16 6kA»). */
  resumen: string;
  descripcion: string[];
  ficha: [string, string][];
  fotos: string[];
  destacado?: boolean;
}

// Solo para revisar el diseño en local: PRODUCTOS_PRUEBA=ruta/a/productos.json npm run build
// (el archivo de prueba trae sus propios productos y fotos). Nunca se usa en Vercel.
const prueba = process.env.PRODUCTOS_PRUEBA && !process.env.VERCEL ? JSON.parse(fs.readFileSync(process.env.PRODUCTOS_PRUEBA, 'utf8')) : null;

export const PRODUCTOS: Producto[] = prueba?.productos ?? (productosJson as unknown as Producto[]);
const FOTOS: FotoProducto[] = prueba?.fotos ?? (fotosJson as unknown as FotoProducto[]);
const fotoPorId = new Map(FOTOS.map((f) => [f.id, f]));

// Un dato roto detiene la compilación con un mensaje claro, en vez de publicar una ficha a medias.
const slugs = new Set<string>();
for (const p of PRODUCTOS) {
  for (const campo of ['slug', 'nombre', 'marca', 'referencia', 'categoria', 'resumen'] as const) {
    if (!p[campo]?.trim()) throw new Error(`Producto «${p.slug ?? p.nombre}»: falta «${campo}» en src/data/productos.json`);
  }
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.slug)) throw new Error(`Producto «${p.slug}»: el slug solo admite minúsculas, números y guiones`);
  if (slugs.has(p.slug)) throw new Error(`Producto «${p.slug}» repetido`);
  slugs.add(p.slug);
  if (!p.fotos?.length) throw new Error(`Producto «${p.slug}»: necesita al menos una foto`);
  for (const id of p.fotos) {
    if (!fotoPorId.has(id)) throw new Error(`Producto «${p.slug}»: no existe la foto «${id}» (¿corriste npm run productos?)`);
  }
}

export const hayProductos = PRODUCTOS.length > 0;
export const DESTACADOS = PRODUCTOS.filter((p) => p.destacado).slice(0, 4);
export const CATEGORIAS_PRODUCTO = [...new Set(PRODUCTOS.map((p) => p.categoria))];

export const fotosDe = (p: Producto) => p.fotos.map((id) => fotoPorId.get(id)!);
export const urlProducto = (p: Producto) => `/productos/${p.slug}/`;
export const idCategoria = (c: string) => c.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const juego = (f: FotoProducto, formato: 'avif' | 'webp') => f.anchos.map((w) => `${f.base}-${w}.${formato} ${w}w`).join(', ');
export const srcFoto = (f: FotoProducto, ancho = 800) => `${f.base}-${f.anchos.find((a) => a >= ancho) ?? f.anchos.at(-1)}.webp`;

export const relacionados = (p: Producto, n = 4) => [
  ...PRODUCTOS.filter((o) => o.slug !== p.slug && o.categoria === p.categoria),
  ...PRODUCTOS.filter((o) => o.slug !== p.slug && o.categoria !== p.categoria),
].slice(0, n);

export const MENSAJES_PRODUCTO = {
  cotizar: (p: Producto, cantidad = 1, url?: string) =>
    [`Hola, ${EMPRESA.nombreCorto}. Quiero cotizar: ${p.nombre} (Ref. ${p.referencia}).`, `Cantidad: ${cantidad}.`, url].filter(Boolean).join('\n'),
  disponibilidad: (p: Producto, url?: string) =>
    [`Hola, ${EMPRESA.nombreCorto}. ¿Tienen disponible ${p.nombre} (Ref. ${p.referencia})?`, url].filter(Boolean).join('\n'),
};

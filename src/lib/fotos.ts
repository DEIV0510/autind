import fotos from '../data/fotos.json';

export type Foto = (typeof fotos)[number];

const porId = new Map(fotos.map((f) => [f.id, f]));

export function foto(id: string): Foto {
  const f = porId.get(id);
  if (!f) throw new Error(`No existe la foto «${id}» en src/data/fotos.json (npm run imagenes)`);
  return f;
}

export const FOTOS = fotos;

export const srcset = (f: Foto, formato: 'avif' | 'webp') => f.anchos.map((w) => `/img/${f.id}-${w}.${formato} ${w}w`).join(', ');
export const src = (f: Foto, ancho?: number) => {
  const w = ancho ? (f.anchos.find((a) => a >= ancho) ?? f.anchos.at(-1)) : f.anchos.at(-1);
  return `/img/${f.id}-${w}.webp`;
};

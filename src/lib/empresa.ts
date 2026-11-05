// Datos de AUTIND NC S.A.S. Todo lo que aparece en el sitio sale de aquí.
// Fuentes: el encargo del cliente (dirección, WhatsApp, actividades), el logo oficial (NIT) y el
// letrero del local fotografiado el 2026-11-03 (correo). La ciudad se verificó en directorios de
// empresas con locales en el mismo edificio (Calle 18 # 10-33, Bogotá).
// No hay horarios, años de experiencia, cifras ni certificaciones: no se suministraron.

export const EMPRESA = {
  nombre: 'AUTIND NC S.A.S.',
  nombreCorto: 'AUTIND',
  nit: '901.844.329-8',
  descripcion:
    'Material eléctrico industrial y ensamble de tableros eléctricos de distribución, transferencia y control de motores en Bogotá.',
  direccion: 'Calle 18 # 10-33, Local 111',
  ciudad: 'Bogotá',
  region: 'Bogotá, D.C.',
  pais: 'Colombia',
  whatsapp: '573242667140',
  telefonoVisible: '324 266 7140',
  correo: 'autindnc@gmail.com',
} as const;

export const telHref = `tel:+${EMPRESA.whatsapp}`;
export const direccionCompleta = `${EMPRESA.direccion}, ${EMPRESA.ciudad}, ${EMPRESA.pais}`;
// Con la localidad: sin ella Google lee «Carrera 18 # 10-33» (Los Mártires) y marca otro punto.
// Verificado el 2026-11-03: así cae en la Calle 18 con Carrera 10, junto a TransMilenio Las Nieves.
const consultaMapa = `Calle 18 #10-33, Santa Fe, ${EMPRESA.ciudad}`;
export const mapaHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(consultaMapa)}`;
export const mapaEmbed = `https://www.google.com/maps?q=${encodeURIComponent(consultaMapa)}&z=17&output=embed`;

/** Enlace directo a WhatsApp con el mensaje ya escrito. */
export const whatsapp = (texto: string) => `https://wa.me/${EMPRESA.whatsapp}?text=${encodeURIComponent(texto)}`;

export const MENSAJES = {
  general: 'Hola, AUTIND. Quiero solicitar una cotización.',
  material: 'Hola, AUTIND. Quiero cotizar material eléctrico industrial.',
  ensamble: 'Hola, AUTIND. Necesito cotizar el ensamble de un tablero eléctrico.',
  distribucion: 'Hola, AUTIND. Quiero cotizar un tablero de distribución.',
  motores: 'Hola, AUTIND. Quiero cotizar un tablero de control de motores.',
  proyecto: 'Hola, AUTIND. Tengo un proyecto eléctrico y quiero una cotización.',
  similar: (titulo: string) => `Hola, AUTIND. Vi en su página el tablero «${titulo}» y quiero cotizar uno similar.`,
};

export type IdServicio = 'material' | 'ensamble' | 'distribucion' | 'motores';

export const SERVICIOS: {
  id: IdServicio;
  numero: string;
  titulo: string;
  corto: string;
  descripcion: string;
  foto: string;
}[] = [
  {
    id: 'material',
    numero: '01',
    titulo: 'Material eléctrico industrial',
    corto: 'Material eléctrico',
    descripcion: 'Comercialización de componentes y materiales eléctricos para aplicaciones industriales.',
    foto: 'barrajes-protecciones',
  },
  {
    id: 'ensamble',
    numero: '02',
    titulo: 'Ensamble de tableros eléctricos',
    corto: 'Ensamble de tableros',
    descripcion: 'Diseño, ensamble e integración de tableros eléctricos según los requerimientos del proyecto.',
    foto: 'control-doble-puerta',
  },
  {
    id: 'distribucion',
    numero: '03',
    titulo: 'Tableros de distribución',
    corto: 'Distribución',
    descripcion: 'Soluciones para distribución y protección de circuitos eléctricos.',
    foto: 'distribucion-interior',
  },
  {
    id: 'motores',
    numero: '04',
    titulo: 'Control de motores',
    corto: 'Control de motores',
    descripcion: 'Tableros y sistemas para aplicaciones de control de motores industriales.',
    foto: 'control-de-motores',
  },
];

// Líneas de producto (de la propuesta del cliente para «Productos destacados»).
export const LINEAS = [
  { numero: '01', titulo: 'Material eléctrico industrial', mensaje: 'Hola, AUTIND. Quiero cotizar material eléctrico industrial.' },
  { numero: '02', titulo: 'Variadores de velocidad', mensaje: 'Hola, AUTIND. Quiero cotizar variadores de velocidad.' },
  { numero: '03', titulo: 'Cables encauchetados y control', mensaje: 'Hola, AUTIND. Quiero cotizar cable encauchetado y cable de control.' },
  { numero: '04', titulo: 'Control de motores', mensaje: 'Hola, AUTIND. Quiero cotizar material para control de motores.' },
];

export const NAV = [
  { href: '/#servicios', seccion: 'servicios', texto: 'Servicios' },
  { href: '/#proyectos', seccion: 'proyectos', texto: 'Proyectos' },
  { href: '/#por-que', seccion: 'por-que', texto: 'Por qué AUTIND' },
  { href: '/#contacto', seccion: 'contacto', texto: 'Contacto' },
];

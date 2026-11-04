// Qué foto es cuál. Los títulos salen de los rótulos que tienen los propios tableros en la puerta
// («TRANSFERENCIA AUTOMÁTICA», «ALTERNADOR DE 3 BOMBAS», «CONTROL DE MOTORES»…); cuando la foto
// no muestra rótulo, el título describe solo lo que se ve.
// recorte = { left, top, width, height } en píxeles del original ya rotado.
// foco = object-position para cuando la foto se recorta con CSS (tarjetas, mosaico).

/** @typedef {'transferencia' | 'bombeo' | 'control' | 'distribucion'} Categoria */

export const CATEGORIAS = [
  { id: 'transferencia', nombre: 'Transferencia automática' },
  { id: 'bombeo', nombre: 'Bombas y alternadores' },
  { id: 'control', nombre: 'Control de motores' },
  { id: 'distribucion', nombre: 'Distribución y protección' },
];

export const FOTOS = [
  {
    id: 'transferencia-automatica', archivo: 'autind-12', categoria: 'transferencia',
    titulo: 'Transferencia automática',
    alt: 'Tablero de transferencia automática cerrado, con diagrama unifilar en la puerta, pilotos de red y planta y señal de riesgo eléctrico 220 VAC',
    foco: '50% 30%',
  },
  {
    id: 'control-interior', archivo: 'autind-06', categoria: 'control',
    titulo: 'Tablero de control · interior',
    alt: 'Interior de un tablero de control: interruptor principal sobre fondo naranja, fila de contactores y relés y tres equipos de mando en la parte inferior',
  },
  {
    id: 'barrajes-protecciones', archivo: 'autind-10', categoria: 'distribucion',
    titulo: 'Barrajes y protecciones',
    alt: 'Detalle de barrajes de cobre con fases en amarillo, azul y rojo, interruptores automáticos y canaletas de cableado dentro de un gabinete',
    foco: '50% 35%',
  },
  {
    id: 'control-doble-puerta', archivo: 'autind-08', categoria: 'control',
    titulo: 'Tablero de control · doble puerta',
    alt: 'Tablero de doble puerta abierto con contactores, protecciones y tres equipos de mando montados sobre placa naranja',
  },
  {
    id: 'distribucion-interior', archivo: 'autind-01', categoria: 'distribucion',
    titulo: 'Tablero de distribución · interior',
    alt: 'Tablero de distribución abierto con totalizador, interruptores derivados en riel y barrajes de neutro y tierra',
    foco: '50% 40%',
  },
  {
    id: 'control-de-motores', archivo: 'autind-15', categoria: 'control',
    titulo: 'Control de motores',
    alt: 'Tablero de control de motores con seis pilotos de falla, selectores de arranque y parada de emergencia',
    foco: '50% 32%',
  },
  {
    id: 'alternador-3-bombas', archivo: 'autind-07', categoria: 'bombeo',
    titulo: 'Alternador de 3 bombas',
    alt: 'Tablero de doble puerta «Alternador de 3 bombas» con pilotos, selectores y diagrama unifilar de tres motores',
    recorte: { left: 250, top: 70, width: 1170, height: 1100 },
  },
  {
    id: 'transferencia-autosoportada', archivo: 'autind-14', categoria: 'transferencia',
    titulo: 'Transferencia automática · gabinete autosoportado',
    alt: 'Gabinete autosoportado de doble puerta para transferencia automática, con diagrama unifilar y señales de riesgo eléctrico',
    recorte: { left: 140, top: 0, width: 880, height: 1600 },
    foco: '50% 30%',
  },
  {
    id: 'alternador-bombas', archivo: 'autind-11', categoria: 'bombeo',
    titulo: 'Alternador de bombas',
    alt: 'Tablero «Alternador de bombas» instalado, con pilotos encendidos en verde y azul, selectores y parada de emergencia',
    foco: '50% 35%',
  },
  {
    id: 'distribucion-pareja', archivo: 'autind-02', categoria: 'distribucion',
    titulo: 'Tableros de distribución 220 VAC',
    alt: 'Dos tableros de distribución abiertos con contratapa, ventana para el totalizador y rotulado 220 VAC',
  },
  {
    id: 'transferencia-puerta', archivo: 'autind-16', categoria: 'transferencia',
    titulo: 'Transferencia automática',
    alt: 'Puerta de un tablero de transferencia automática con pilotos de red y planta y selectores de modo',
    recorte: { left: 175, top: 0, width: 1025, height: 1600 },
    foco: '50% 40%',
  },
  {
    id: 'control-interior-2', archivo: 'autind-17', categoria: 'control',
    titulo: 'Tablero de control · interior',
    alt: 'Interior de un tablero de control con interruptores, contactores, temporizadores y borneras sobre placa naranja',
    foco: '50% 45%',
  },
  {
    id: 'distribucion-gabinetes', archivo: 'autind-09', categoria: 'distribucion',
    titulo: 'Tableros de distribución · interior',
    alt: 'Dos gabinetes de distribución abiertos con interruptores en riel y barrajes de colores',
  },
  {
    id: 'alternadores-apilados', archivo: 'autind-21', categoria: 'bombeo',
    titulo: 'Alternadores de bomba 2 HP y 5 HP',
    alt: 'Dos tableros apilados rotulados «Alternador bomba 2HP» y «Alternador bomba 5HP», con pilotos, selectores y parada de emergencia',
    recorte: { left: 140, top: 110, width: 730, height: 1490 },
    foco: '50% 30%',
  },
  {
    id: 'transferencia-interior', archivo: 'autind-20', categoria: 'transferencia',
    titulo: 'Transferencia automática · interior',
    alt: 'Gabinete de transferencia automática con una puerta abierta: barrajes de cobre, contactores y bandeja portacables',
    foco: '50% 35%',
  },
  {
    id: 'tablero-220-interior', archivo: 'autind-13', categoria: 'distribucion',
    titulo: 'Tablero eléctrico 220 VAC · interior',
    alt: 'Tablero abierto con dos interruptores de caja moldeada sobre placa naranja, señal de riesgo eléctrico 220 VAC y equipo de control en la puerta',
  },
  {
    id: 'alternadores-interior', archivo: 'autind-19', categoria: 'bombeo',
    titulo: 'Alternadores de bomba · interior',
    alt: 'Dos tableros apilados con las puertas abiertas: contactores, guardamotores y borneras sobre placa naranja',
    recorte: { left: 20, top: 0, width: 965, height: 1600 },
    foco: '50% 40%',
  },
  {
    id: 'distribucion-contratapa', archivo: 'autind-03', categoria: 'distribucion',
    titulo: 'Tablero de distribución · contratapa',
    alt: 'Tablero de distribución con la puerta abierta y la contratapa puesta, ventanas para totalizador e interruptores y rótulo 220 VAC',
    foco: '50% 30%',
  },
  {
    id: 'tablero-220', archivo: 'autind-04', categoria: 'distribucion',
    titulo: 'Tablero eléctrico 220 VAC · interior',
    alt: 'Tablero abierto con equipo de maniobra negro, barrajes de colores y señal de riesgo eléctrico 220 VAC',
    foco: '50% 45%',
  },
  {
    id: 'local-tableros', archivo: 'autind-18', categoria: 'bombeo',
    titulo: 'Alternadores de bomba y tablero contra incendio',
    alt: 'Tableros alternadores de bomba de 2 HP y 5 HP y un tablero contra incendio rojo en el local de AUTIND, frente a estanterías con material eléctrico',
    recorte: { left: 0, top: 410, width: 1200, height: 1190 },
  },
];

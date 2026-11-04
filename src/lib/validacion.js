/**
 * Única definición de una solicitud de cotización válida.
 *
 * La usan el formulario (para avisar antes de enviar) y la función del servidor, que NO se fía
 * del navegador y vuelve a validar todo. JavaScript plano y sin dependencias para que corra en
 * los dos lados. Devuelve una copia normalizada con solo los campos conocidos: lo que llegue de
 * más se descarta.
 *
 * No hay base de datos: nada de lo que llega se usa para armar consultas, así que no existe una
 * vía de inyección SQL. El texto se trata siempre como texto (nunca como HTML) en el correo y en
 * el mensaje de WhatsApp.
 */

export class ErrorValidacion extends Error {
  constructor(mensaje, campo) {
    super(mensaje);
    this.campo = campo ?? null;
  }
}

export const SERVICIOS = [
  'Material eléctrico industrial',
  'Ensamble de tableros eléctricos',
  'Tableros de distribución',
  'Control de motores',
  'Otro',
];

// Caracteres de control (salvo salto de línea y tabulación) y los invisibles que sirven para
// disfrazar texto: marcas de dirección y espacios de ancho cero.
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩﻿]/;
const ENLACE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|ru|xyz|top|info|biz|io)\b)/gi;
const ETIQUETA = /<\s*\/?\s*[a-z!]/i;

export function texto(valor, { campo, etiqueta, max = 200, min = 0, multilinea = false } = {}) {
  if (valor === undefined || valor === null) valor = '';
  if (typeof valor !== 'string') throw new ErrorValidacion(`«${etiqueta}» debe ser texto.`, campo);
  let v = valor.normalize('NFC').trim();
  if (multilinea) v = v.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n');
  else v = v.replace(/\s+/g, ' ');
  if (CONTROL.test(v)) throw new ErrorValidacion(`«${etiqueta}» tiene caracteres no permitidos.`, campo);
  if (ETIQUETA.test(v)) throw new ErrorValidacion(`«${etiqueta}» no puede llevar etiquetas HTML.`, campo);
  if (v.length < min) {
    throw new ErrorValidacion(min === 1 ? `Completa «${etiqueta}».` : `«${etiqueta}» necesita al menos ${min} caracteres.`, campo);
  }
  if (v.length > max) throw new ErrorValidacion(`«${etiqueta}» admite hasta ${max} caracteres.`, campo);
  return v;
}

/** Teléfono colombiano: celular (3xx) o fijo (60x), con o sin +57. Devuelve solo dígitos. */
export function telefono(valor) {
  const crudo = texto(valor, { campo: 'telefono', etiqueta: 'Teléfono', max: 24, min: 1 });
  if (!/^[+\d\s().-]+$/.test(crudo)) throw new ErrorValidacion('Escribe el teléfono solo con números.', 'telefono');
  let d = crudo.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  if (!/^(3\d{9}|60\d{8})$/.test(d)) throw new ErrorValidacion('Escribe un número de 10 dígitos (celular o fijo con indicativo).', 'telefono');
  return d;
}

export function validarSolicitud(c) {
  const nombre = texto(c.nombre, { campo: 'nombre', etiqueta: 'Nombre', max: 80, min: 2 });
  if (!/\p{L}/u.test(nombre)) throw new ErrorValidacion('Escribe tu nombre.', 'nombre');
  const empresa = texto(c.empresa, { campo: 'empresa', etiqueta: 'Empresa', max: 100 });
  const tel = telefono(c.telefono);
  const servicio = texto(c.servicio, { campo: 'servicio', etiqueta: 'Servicio', max: 60, min: 1 });
  if (!SERVICIOS.includes(servicio)) throw new ErrorValidacion('Elige un servicio de la lista.', 'servicio');
  const mensaje = texto(c.mensaje, { campo: 'mensaje', etiqueta: 'Mensaje', max: 800, min: 10, multilinea: true });
  // Más de dos enlaces en una solicitud de cotización es casi siempre publicidad automática.
  if ((mensaje.match(ENLACE) || []).length > 2) throw new ErrorValidacion('El mensaje tiene demasiados enlaces.', 'mensaje');
  if (c.acepto !== true) throw new ErrorValidacion('Necesitamos tu autorización para responderte.', 'acepto');
  return { nombre, empresa, telefono: tel, servicio, mensaje };
}

/** Texto del mensaje de WhatsApp (el mismo en el navegador y en el correo). */
export function textoSolicitud(d) {
  return [
    `Hola, AUTIND. Soy ${d.nombre}${d.empresa ? ` de ${d.empresa}` : ''}.`,
    `Quiero cotizar: ${d.servicio}.`,
    d.mensaje,
    `Teléfono de contacto: ${d.telefono}`,
  ].join('\n');
}

// JS del sitio. Sin dependencias y sin innerHTML (la CSP exige Trusted Types).
import { ErrorValidacion, textoSolicitud, validarSolicitud } from '../lib/validacion.js';

declare global {
  interface Window { __autindRed?: number }
}

// El JS llegó: se cancela la red de seguridad que mostraba todo sin animaciones.
clearTimeout(window.__autindRed);

const html = document.documentElement;
const reducido = window.matchMedia('(prefers-reduced-motion: reduce)');
const escritorio = window.matchMedia('(min-width: 1024px)');
const $ = <T extends Element = HTMLElement>(s: string, raiz: ParentNode = document) => raiz.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, raiz: ParentNode = document) => [...raiz.querySelectorAll<T>(s)];

/** Abre un enlace externo en otra pestaña; si el navegador lo bloquea, en la misma. */
function abrirFuera(url: string) {
  // Sin «noopener» en las características: con él window.open devuelve null aunque abra.
  const ventana = window.open(url, '_blank');
  if (ventana) ventana.opener = null;
  else location.href = url;
}

// ----------------------------------------------------------------- bloqueo de scroll
// Lo pone y lo quita cada capa (menú, visor); un contador evita que una libere a la otra.
let capasAbiertas = 0;
const bloquearScroll = () => { if (capasAbiertas++ === 0) html.style.overflow = 'hidden'; };
const liberarScroll = () => { if (capasAbiertas > 0 && --capasAbiertas === 0) html.style.overflow = ''; };

// ----------------------------------------------------------------- encabezado
const cabecera = $('[data-cabecera]');
const hero = $('.hero');
let ultimoY = window.scrollY;
let pendiente = false;

function alDesplazar() {
  pendiente = false;
  const y = window.scrollY;
  const limite = hero ? hero.offsetHeight - 120 : 400;
  if (cabecera) {
    cabecera.classList.toggle('solida', y > 40);
    const ocultar = y > limite && y > ultimoY + 4 && capasAbiertas === 0;
    if (ocultar) cabecera.classList.add('oculta');
    else if (y < ultimoY - 4 || y <= limite) cabecera.classList.remove('oculta');
  }
  ultimoY = y;
  moverParallax();
}
window.addEventListener('scroll', () => {
  if (!pendiente) { pendiente = true; requestAnimationFrame(alDesplazar); }
}, { passive: true });

// ----------------------------------------------------------------- menú móvil
const menu = $('[data-menu]');
const abrirMenu = $<HTMLButtonElement>('[data-menu-abrir]');
let menuEnHistorial = false;

function mostrarMenu() {
  if (!menu || !abrirMenu || !menu.hidden) return;
  menu.hidden = false;
  requestAnimationFrame(() => menu.classList.add('abierto'));
  abrirMenu.setAttribute('aria-expanded', 'true');
  bloquearScroll();
  // El botón «atrás» del celular cierra el menú en vez de salir del sitio.
  history.pushState({ autindCapa: 'menu' }, '');
  menuEnHistorial = true;
  $<HTMLElement>('[data-menu-cerrar]', menu)?.focus();
}
function ocultarMenu({ devolverFoco = true } = {}) {
  if (!menu || menu.hidden) return;
  menu.classList.remove('abierto');
  menu.hidden = true;
  abrirMenu?.setAttribute('aria-expanded', 'false');
  liberarScroll();
  if (devolverFoco) abrirMenu?.focus();
}
const cerrarMenu = () => { if (menuEnHistorial) history.back(); else ocultarMenu(); };
abrirMenu?.addEventListener('click', mostrarMenu);
$('[data-menu-cerrar]')?.addEventListener('click', cerrarMenu);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) cerrarMenu(); });
escritorio.addEventListener('change', (e) => { if (e.matches) cerrarMenu(); });
$$<HTMLAnchorElement>('[data-menu-enlace]').forEach((a) => a.addEventListener('click', (e) => {
  const destino = new URL(a.href);
  if (destino.pathname !== location.pathname) return; // otra página: navegación normal
  e.preventDefault();
  ocultarMenu({ devolverFoco: false });
  // La entrada del menú en el historial se reemplaza por la sección elegida.
  if (menuEnHistorial) { menuEnHistorial = false; history.replaceState(null, '', destino.hash || '/'); }
  const objetivo = destino.hash ? document.querySelector(destino.hash) : document.body;
  objetivo?.scrollIntoView({ behavior: reducido.matches ? 'auto' : 'smooth' });
}));

// ----------------------------------------------------------------- sección activa
const enlacesNav = $$<HTMLAnchorElement>('.cabecera__nav a[data-seccion]');
if (enlacesNav.length && 'IntersectionObserver' in window) {
  const porSeccion = new Map(enlacesNav.map((a) => [a.dataset.seccion, a]));
  const espia = new IntersectionObserver((entradas) => {
    for (const en of entradas) {
      const enlace = porSeccion.get(en.target.id);
      if (en.isIntersecting) {
        enlacesNav.forEach((a) => a.removeAttribute('aria-current'));
        enlace?.setAttribute('aria-current', 'true');
      } else {
        enlace?.removeAttribute('aria-current');
      }
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  porSeccion.forEach((_, id) => { const s = id && document.getElementById(id); if (s) espia.observe(s); });
}

// ----------------------------------------------------------------- entradas al scroll
const revelables = $$('.revelar, .revelar-foto, .trazar');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entradas) => {
    for (const en of entradas) {
      if (!en.isIntersecting) continue;
      (objetivo.get(en.target) ?? en.target).classList.add('visible');
      io.unobserve(en.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
  // Una foto que arranca recortada al 100 % (clip-path) no tiene área visible y Chrome nunca
  // la daría por «en pantalla»: se observa su contenedor y se anima la foto.
  const objetivo = new Map<Element, Element>();
  revelables.forEach((el) => {
    const vigilado = el.classList.contains('revelar-foto') && el.parentElement ? el.parentElement : el;
    objetivo.set(vigilado, el);
    io.observe(vigilado);
  });
} else {
  revelables.forEach((el) => el.classList.add('visible'));
}

// ----------------------------------------------------------------- parallax sutil
const capasParallax = $$('[data-parallax]').map((el) => ({ el, factor: Number(el.dataset.parallax) || 0 }));
function moverParallax() {
  if (reducido.matches || !escritorio.matches || html.classList.contains('ligero')) return;
  const alto = window.innerHeight;
  for (const { el, factor } of capasParallax) {
    const caja = (el.parentElement ?? el).getBoundingClientRect();
    if (caja.bottom < -100 || caja.top > alto + 100) continue;
    const d = (caja.top + caja.height / 2 - alto / 2) * factor;
    el.style.transform = `translate3d(0, ${d.toFixed(1)}px, 0)`;
  }
}

// ----------------------------------------------------------------- galería
interface FotoVisor { id: string; titulo: string; categoria: string; alt: string; anchos: number[]; ancho: number; alto: number; color: string }
const mosaico = $('[data-mosaico]');
const obras = mosaico ? $$<HTMLLIElement>('.obra', mosaico) : [];
const filtros = $('[data-filtros]');
if (filtros && mosaico) {
  const estado = $('[data-filtros-estado]');
  filtros.addEventListener('click', (e) => {
    const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-filtro]');
    if (!boton) return;
    const f = boton.dataset.filtro!;
    $$('[data-filtro]', filtros).forEach((b) => b.setAttribute('aria-pressed', String(b === boton)));
    let visibles = 0;
    obras.forEach((o) => {
      const ok = f === 'todos' || o.dataset.categoria === f;
      o.hidden = !ok;
      if (ok) { visibles++; $('.revelar-foto', o)?.classList.add('visible'); }
    });
    if (estado) estado.textContent = `${visibles} ${visibles === 1 ? 'foto' : 'fotos'}`;
  });
}

const visor = $<HTMLDialogElement>('[data-visor]');
const datosVisor = $('#datos-visor');
if (visor && datosVisor && mosaico) {
  const dialogo = visor;
  const { fotos, whatsapp, plantilla } = JSON.parse(datosVisor.textContent || '{}') as { fotos: FotoVisor[]; whatsapp: string; plantilla: string };
  const img = $<HTMLImageElement>('[data-visor-img]', visor)!;
  const avif = $<HTMLSourceElement>('[data-visor-avif]', visor)!;
  const lienzo = $('[data-visor-lienzo]', visor)!;
  const titulo = $('[data-visor-titulo]', visor)!;
  const categoria = $('[data-visor-categoria]', visor)!;
  const contador = $('[data-visor-contador]', visor)!;
  const cotizar = $<HTMLAnchorElement>('[data-visor-cotizar]', visor)!;
  let actual = 0;
  let enHistorial = false;

  // Solo se recorre lo que el filtro deja a la vista.
  const visibles = () => obras.map((o, i) => (o.hidden ? -1 : i)).filter((i) => i >= 0);
  const juego = (f: FotoVisor, formato: string) => f.anchos.map((w) => `/img/${f.id}-${w}.${formato} ${w}w`).join(', ');

  function mostrar(i: number) {
    const f = fotos[i];
    if (!f) return;
    actual = i;
    lienzo.classList.add('cargando');
    avif.srcset = juego(f, 'avif');
    img.srcset = juego(f, 'webp');
    img.src = `/img/${f.id}-${f.anchos.at(-1)}.webp`;
    img.width = f.ancho;
    img.height = f.alto;
    img.alt = f.alt;
    img.style.backgroundColor = f.color;
    titulo.textContent = f.titulo;
    categoria.textContent = f.categoria;
    const lista = visibles();
    contador.textContent = `${String(lista.indexOf(i) + 1).padStart(2, '0')} / ${String(lista.length).padStart(2, '0')}`;
    cotizar.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(plantilla.replace('{t}', f.titulo))}`;
  }
  img.addEventListener('load', () => lienzo.classList.remove('cargando'));
  img.addEventListener('error', () => lienzo.classList.remove('cargando'));

  function mover(paso: number) {
    const lista = visibles();
    const pos = lista.indexOf(actual);
    mostrar(lista[(pos + paso + lista.length) % lista.length]);
  }

  function abrir(i: number) {
    mostrar(i);
    dialogo.showModal();
    bloquearScroll();
    history.pushState({ autindCapa: 'visor' }, '');
    enHistorial = true;
  }
  function cerrarVisor() {
    if (!dialogo.open) return;
    dialogo.close();
  }
  const pedirCierre = () => { if (enHistorial) history.back(); else cerrarVisor(); };
  visor.addEventListener('close', () => {
    liberarScroll();
    if (enHistorial) { enHistorial = false; history.back(); }
  });

  mosaico.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-abrir]');
    if (b) abrir(Number(b.dataset.abrir));
  });
  $('[data-visor-cerrar]', visor)?.addEventListener('click', pedirCierre);
  $('[data-visor-anterior]', visor)?.addEventListener('click', () => mover(-1));
  $('[data-visor-siguiente]', visor)?.addEventListener('click', () => mover(1));
  visor.addEventListener('cancel', (e) => { e.preventDefault(); pedirCierre(); });
  visor.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mover(-1);
    if (e.key === 'ArrowRight') mover(1);
  });
  // Clic en el fondo (fuera de la foto y de los controles) = cerrar.
  visor.addEventListener('click', (e) => { if (e.target === visor || e.target === lienzo) pedirCierre(); });
  cotizar.addEventListener('click', (e) => { e.preventDefault(); abrirFuera(cotizar.href); });

  // Deslizar con el dedo. Sin capturar el puntero: así un toque sigue siendo un clic normal.
  let x0: number | null = null;
  lienzo.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') x0 = e.clientX; });
  lienzo.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 50) mover(dx < 0 ? 1 : -1);
  });
  lienzo.addEventListener('pointercancel', () => { x0 = null; });

  window.addEventListener('popstate', () => {
    if (enHistorial) { enHistorial = false; cerrarVisor(); }
  });
}

// El «atrás» que cierra el menú (el del visor se atiende arriba).
window.addEventListener('popstate', () => {
  if (menuEnHistorial) { menuEnHistorial = false; ocultarMenu(); }
});

// ----------------------------------------------------------------- botón flotante
const flotante = $('[data-flotante]');
if (flotante && 'IntersectionObserver' in window) {
  let pasoHero = !hero;
  const tapan = new Set<Element>();
  const actualizar = () => flotante.classList.toggle('visible', pasoHero && tapan.size === 0);
  if (hero) new IntersectionObserver(([en]) => { pasoHero = !en.isIntersecting; actualizar(); }).observe(hero);
  const vigilarFin = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => (en.isIntersecting ? tapan.add(en.target) : tapan.delete(en.target)));
    actualizar();
  }, { rootMargin: '0px 0px -15% 0px' });
  ['[data-formulario]', '.pie'].forEach((s) => { const el = $(s); if (el) vigilarFin.observe(el); });
  actualizar();
  // Sobre la sección amarilla el botón se invierte (negro) para no perderse.
  const amarilla = $('#por-que');
  if (amarilla) {
    new IntersectionObserver(([en]) => flotante.classList.toggle('sobre-amarillo', en.isIntersecting), {
      // Solo cuenta la franja inferior de la pantalla, que es donde vive el botón.
      rootMargin: '-94% 0px -4% 0px', threshold: 0,
    }).observe(amarilla);
  }
}

// ----------------------------------------------------------------- mapa a pedido
const mapa = $('[data-mapa]');
$('[data-mapa-cargar]', mapa ?? document)?.addEventListener('click', () => {
  if (!mapa || mapa.classList.contains('cargado')) return;
  const marco = document.createElement('iframe');
  marco.src = mapa.dataset.src!;
  marco.title = 'Ubicación de AUTIND NC S.A.S. en Google Maps';
  marco.loading = 'lazy';
  marco.referrerPolicy = 'strict-origin-when-cross-origin';
  marco.allowFullscreen = true;
  mapa.append(marco);
  mapa.classList.add('cargado');
  marco.focus();
});

// ----------------------------------------------------------------- formulario
const form = $<HTMLFormElement>('[data-formulario]');
if (form) {
  const inicio = performance.now();
  const error = $('[data-formulario-error]', form)!;
  const ok = $('[data-formulario-ok]', form)!;
  const okTexto = $('[data-formulario-ok-texto]', form)!;
  const okEnlace = $<HTMLAnchorElement>('[data-formulario-enlace]', form)!;
  const numero = form.dataset.whatsapp!;

  const mostrarError = (msg: string, campo?: string | null) => {
    error.textContent = msg;
    error.hidden = false;
    const el = campo ? $<HTMLElement>(`#f-${campo}`, form) : null;
    if (el) { el.setAttribute('aria-invalid', 'true'); el.focus(); }
  };
  // El error se limpia al escribir, no al salir del campo: así el clic en «Enviar» no se mueve.
  form.addEventListener('input', (e) => {
    (e.target as HTMLElement).removeAttribute('aria-invalid');
    error.hidden = true;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    error.hidden = true;
    const f = new FormData(form);
    const campos = {
      nombre: String(f.get('nombre') ?? ''),
      empresa: String(f.get('empresa') ?? ''),
      telefono: String(f.get('telefono') ?? ''),
      servicio: String(f.get('servicio') ?? ''),
      mensaje: String(f.get('mensaje') ?? ''),
      acepto: f.get('acepto') === 'on',
    };
    let datos;
    try {
      datos = validarSolicitud(campos);
    } catch (err) {
      if (err instanceof ErrorValidacion) return mostrarError(err.message, err.campo);
      throw err;
    }

    // Copia del lado del servidor (valida de nuevo, frena spam y avisa por correo si está
    // configurado). No bloquea: la solicitud sale por WhatsApp aunque el servidor no responda.
    fetch('/api/cotizacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Solicitud': 'cotizacion' },
      body: JSON.stringify({ ...campos, sitio_web: String(f.get('sitio_web') ?? ''), ms: Math.round(performance.now() - inicio) }),
      keepalive: true,
      credentials: 'same-origin',
    }).catch(() => null);

    const url = `https://wa.me/${numero}?text=${encodeURIComponent(textoSolicitud(datos))}`;
    abrirFuera(url);
    okTexto.textContent = 'Se abrió WhatsApp con tu solicitud. Solo falta enviarla.';
    okEnlace.href = url;
    ok.hidden = false;
  });
}

// Estado inicial (por si la página se abre ya desplazada, p. ej. al volver atrás).
alDesplazar();

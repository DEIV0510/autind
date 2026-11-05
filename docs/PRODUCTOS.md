# Cómo agregar productos

El catálogo está listo pero vacío. Mientras `src/data/productos.json` sea `[]`, el sitio **no** muestra
`/productos/`, ni «Productos destacados» en la portada, ni el enlace «Productos» del menú.

## 1. Fotos (propias del local)
Guardar las fotos en `_material-cliente/productos/`, sin espacios ni tildes en el nombre:
`nb1-63-1.jpg`, `nb1-63-2.jpg`, `lc1d32-1.jpg`… Luego:

    npm run productos

## 2. Datos
Agregar cada producto a `src/data/productos.json`:

```json
[
  {
    "slug": "chint-nb1-63-2p-c16",
    "nombre": "Breaker CHINT NB1-63 2P C16",
    "marca": "CHINT",
    "referencia": "NB1-63 2P C16",
    "categoria": "Protección",
    "resumen": "Breaker 2P C16 6kA",
    "descripcion": ["Párrafo de descripción (opcional)."],
    "ficha": [["Polos", "2"], ["Curva", "C"], ["Corriente", "16 A"], ["Capacidad de ruptura", "6 kA"]],
    "fotos": ["nb1-63-1", "nb1-63-2"],
    "destacado": true
  }
]
```

- `slug`: la dirección de la página (`/productos/chint-nb1-63-2p-c16/`). Minúsculas, números y guiones.
- `categoria`: crea solo los filtros del catálogo.
- `destacado: true`: sale en «Productos destacados» de la portada (máximo 4).
- Sin precio: todas las fichas dicen «Precio a consultar» y cotizan por WhatsApp con el nombre, la
  referencia y la cantidad ya escritos.

Si falta un campo o una foto, `npm run build` se detiene y dice qué falta.

## Revisar el diseño sin publicar nada
    PRODUCTOS_PRUEBA=.cache/qa/productos-prueba.json npm run build
(productos de ejemplo con fotos de tableros; no funciona en Vercel). Después, `npm run build` normal.

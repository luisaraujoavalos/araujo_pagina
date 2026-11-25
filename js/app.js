/* =====================================================
   NOVAK - app.js
   Núcleo compartido por todas las páginas:
   1. Guardado en el navegador y estado de la tienda
   2. Precios, ofertas y stock por talla
   3. Sesión, favoritos, vistos y eventos (para estadísticas)
   4. Carrito (por talla y color) y cupones
   5. Cabecera, buscador, pie de página
   6. Avisos (toasts) y ventanas flotantes (modales)
   7. Tarjetas de producto, selector de talla y guía de tallas
   8. Carruseles horizontales y cuenta regresiva
===================================================== */

// =====================================================
// 1. GUARDADO Y ESTADO
// =====================================================
function leerLocal(clave, pordefecto) {
    try {
        let texto = localStorage.getItem(clave);
        return texto === null ? pordefecto : JSON.parse(texto);
    } catch (error) {
        return pordefecto;
    }
}

function guardarLocal(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.warn("No se pudo guardar", clave, error);
        if (typeof mostrarToast === "function") {
            mostrarToast("El navegador no tiene más espacio para guardar. Usa imágenes más livianas.", "error");
        }
        return false;
    }
}

const CLAVES = {
    productos: "novak_productos_v3",
    pedidos: "novak_pedidos_v1",
    eventos: "novak_eventos_v1",
    usuarios: "novak_usuarios",
    carrito: "novak_carrito_v3",
    favoritos: "novak_favoritos",
    sesion: "novak_sesion",
    campana: "novak_campana_v1",
    cupones: "novak_cupones_v1",
    cuponAplicado: "novak_cupon_aplicado",
    resenas: "novak_resenas_v1",
    recientes: "novak_recientes"
};

// Campaña de ofertas (nombre y fecha de término de la cuenta regresiva)
let campana = leerLocal(CLAVES.campana, null);
if (campana === null) {
    campana = { nombre: "Cyber NOVAK", subtitulo: "Hasta 50% de descuento en prendas seleccionadas", fin: fechaISO(7) };
    guardarLocal(CLAVES.campana, campana);
}

let productos = leerLocal(CLAVES.productos, null);
if (!Array.isArray(productos) || productos.length === 0) {
    productos = productosIniciales(campana.fin);
    // Si el administrador había creado prendas en la versión anterior, se conservan
    let anteriores = leerLocal("novak_productos_v2", []);
    if (Array.isArray(anteriores)) {
        anteriores.forEach(function (p) {
            if (p && p.id && p.id.indexOf("prod-") === 0) {
                productos.push(migrarProductoAntiguo(p));
            }
        });
    }
    guardarLocal(CLAVES.productos, productos);
}

let usuarios = leerLocal(CLAVES.usuarios, null);
if (!Array.isArray(usuarios)) {
    usuarios = [];
}
// Agrega los clientes de ejemplo una sola vez
if (!leerLocal("novak_semilla_clientes", false)) {
    clientesIniciales().forEach(function (c) {
        if (!usuarios.some(function (u) { return u.correo === c.correo; })) {
            usuarios.push(c);
        }
    });
    guardarLocal(CLAVES.usuarios, usuarios);
    guardarLocal("novak_semilla_clientes", true);
}

let pedidos = leerLocal(CLAVES.pedidos, null);
if (!Array.isArray(pedidos)) {
    pedidos = pedidosIniciales(productos);
    guardarLocal(CLAVES.pedidos, pedidos);
}

let eventos = leerLocal(CLAVES.eventos, null);
if (eventos === null) {
    eventos = eventosIniciales(productos, pedidos);
    guardarLocal(CLAVES.eventos, eventos);
}

let cupones = leerLocal(CLAVES.cupones, null);
if (!Array.isArray(cupones)) {
    cupones = CUPONES_INICIALES.slice();
    guardarLocal(CLAVES.cupones, cupones);
}

let carrito = leerLocal(CLAVES.carrito, []);
let favoritos = leerLocal(CLAVES.favoritos, []);
let sesion = leerLocal(CLAVES.sesion, null);
let pagina = document.body.dataset.pagina || "index";

function guardarProductos() { guardarLocal(CLAVES.productos, productos); }
function guardarPedidos() { guardarLocal(CLAVES.pedidos, pedidos); }
function guardarEventos() { guardarLocal(CLAVES.eventos, eventos); }
function guardarCupones() { guardarLocal(CLAVES.cupones, cupones); }
function guardarCampana() { guardarLocal(CLAVES.campana, campana); }

// =====================================================
// 2. AYUDAS, PRECIOS, OFERTAS Y STOCK
// =====================================================
function formatoPrecio(numero) {
    return "S/ " + Number(numero).toFixed(2);
}

function escapar(texto) {
    return String(texto === undefined || texto === null ? "" : texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function fechaCorta(iso) {
    return new Date(iso).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function infoCategoria(id) {
    return CATEGORIAS.find(function (c) { return c.id === id; }) || { id: id, nombre: id, segmento: "ropa" };
}

function nombreCategoria(id) {
    return infoCategoria(id).nombre;
}

function buscarProducto(id) {
    for (let producto of productos) {
        if (producto.id === id) {
            return producto;
        }
    }
    return null;
}

function stockTotal(p) {
    let total = 0;
    for (let talla in p.stockTallas) {
        total += Number(p.stockTallas[talla]) || 0;
    }
    return total;
}

// Una oferta vale si tiene descuento y la fecha de término no pasó
function ofertaVigente(p) {
    if (!p.descuento || p.descuento <= 0) {
        return false;
    }
    if (!p.ofertaHasta) {
        return true;
    }
    return new Date(p.ofertaHasta).getTime() > Date.now();
}

function precioFinal(p) {
    return ofertaVigente(p) ? redondear(p.precio * (1 - p.descuento / 100)) : p.precio;
}

function htmlPrecio(p, grande) {
    let html = '<div class="precios' + (grande ? " precios-grande" : "") + '">';
    if (ofertaVigente(p)) {
        html += '<span class="precio-final oferta">' + formatoPrecio(precioFinal(p)) + "</span>" +
            '<span class="precio-antes">' + formatoPrecio(p.precio) + "</span>" +
            '<span class="pastilla-dcto">-' + p.descuento + "%</span>";
    } else {
        html += '<span class="precio-final">' + formatoPrecio(p.precio) + "</span>";
    }
    return html + "</div>";
}

// Ruta de cada una de las 4 vistas; si no hay foto real se marca como referencial
function vistaProducto(p, vista) {
    if (vista === "frente") {
        return { src: p.imagen || IMG_RESPALDO, real: true };
    }
    let ruta = p.vistas && p.vistas[vista];
    if (ruta) {
        return { src: ruta, real: true };
    }
    return { src: p.imagen || IMG_RESPALDO, real: false };
}

// =====================================================
// 3. SESIÓN, FAVORITOS, VISTOS Y EVENTOS
// =====================================================
function esAdmin() {
    return sesion !== null && sesion.rol === "admin";
}

// Las cuentas guardadas tienen prioridad (así se pueden editar los datos de la cuenta demo)
function todasLasCuentas() {
    let correos = usuarios.map(function (u) { return u.correo; });
    return usuarios.concat(CUENTAS_DEMO.filter(function (c) { return !correos.includes(c.correo); }));
}

function cuentaPorCorreo(correo) {
    return todasLasCuentas().find(function (c) { return c.correo === correo || c.usuario === correo; }) || null;
}

function iniciarSesion(cuenta) {
    sesion = { usuario: cuenta.usuario, correo: cuenta.correo || cuenta.usuario, nombre: cuenta.nombre, rol: cuenta.rol };
    guardarLocal(CLAVES.sesion, sesion);
}

function cerrarSesion() {
    if (!confirm("¿Quieres cerrar sesión?")) {
        return;
    }
    localStorage.removeItem(CLAVES.sesion);
    sesion = null;
    window.location.href = "index.html";
}

function registrarVista(id) {
    eventos.vistas[id] = (eventos.vistas[id] || 0) + 1;
    if (sesion !== null && !esAdmin()) {
        let mapa = eventos.vistasCliente[sesion.correo] = eventos.vistasCliente[sesion.correo] || {};
        mapa[id] = (mapa[id] || 0) + 1;
    }
    guardarEventos();

    let recientes = leerLocal(CLAVES.recientes, []).filter(function (r) { return r !== id; });
    recientes.unshift(id);
    guardarLocal(CLAVES.recientes, recientes.slice(0, 12));
}

function esFavorito(id) {
    return favoritos.includes(id);
}

function alternarFavorito(id) {
    let p = buscarProducto(id);
    if (p === null) {
        return;
    }
    if (esFavorito(id)) {
        favoritos = favoritos.filter(function (f) { return f !== id; });
        mostrarToast("Quitaste " + p.nombre + " de favoritos.");
    } else {
        favoritos.push(id);
        mostrarToast("♥ " + p.nombre + " está en tus favoritos.", "ok");
    }
    guardarLocal(CLAVES.favoritos, favoritos);
    document.querySelectorAll('[data-accion="favorito"][data-id="' + id + '"]').forEach(function (b) {
        b.classList.toggle("activo", esFavorito(id));
        b.setAttribute("aria-pressed", esFavorito(id));
    });
    mostrarContadores();
    if (typeof alCambiarFavoritos === "function") {
        alCambiarFavoritos();
    }
}

// =====================================================
// 4. CARRITO Y CUPONES
// =====================================================
function claveItem(item) {
    return item.id + "|" + item.talla + "|" + item.color;
}

// Quita del carrito lo que ya no existe y respeta el stock de cada talla
function limpiarCarrito() {
    let limpio = [];
    for (let item of carrito) {
        let p = buscarProducto(item.id);
        if (p === null || !item.talla) {
            continue;
        }
        let disponible = Number(p.stockTallas[item.talla]) || 0;
        if (disponible > 0) {
            limpio.push({ id: item.id, talla: item.talla, color: item.color, cantidad: Math.min(item.cantidad, disponible) });
        }
    }
    carrito = limpio;
}

function guardarCarrito() {
    guardarLocal(CLAVES.carrito, carrito);
    mostrarContadores();
    if (typeof alCambiarCarrito === "function") {
        alCambiarCarrito();
    }
}

function cantidadEnCarrito(id, talla) {
    let total = 0;
    for (let item of carrito) {
        if (item.id === id && item.talla === talla) {
            total += item.cantidad;
        }
    }
    return total;
}

function agregarAlCarrito(id, talla, color, cantidad) {
    let p = buscarProducto(id);
    if (p === null) {
        return false;
    }
    cantidad = cantidad || 1;
    let disponible = Number(p.stockTallas[talla]) || 0;
    if (!talla || !(talla in p.stockTallas)) {
        mostrarToast("Elige una talla primero.", "error");
        return false;
    }
    if (disponible <= 0) {
        mostrarToast("La talla " + talla + " está agotada.", "error");
        return false;
    }
    if (cantidadEnCarrito(id, talla) + cantidad > disponible) {
        mostrarToast("Solo quedan " + disponible + " unidades en talla " + talla + ".", "error");
        return false;
    }
    color = color || p.colores[0].nombre;
    let item = carrito.find(function (i) { return i.id === id && i.talla === talla && i.color === color; });
    if (item) {
        item.cantidad += cantidad;
    } else {
        carrito.push({ id: id, talla: talla, color: color, cantidad: cantidad });
    }
    eventos.carrito[id] = (eventos.carrito[id] || 0) + cantidad;
    guardarEventos();
    guardarCarrito();
    mostrarMiniCarrito(p, talla, color);
    return true;
}

function cambiarCantidad(clave, cambio) {
    let item = carrito.find(function (i) { return claveItem(i) === clave; });
    if (!item) {
        return;
    }
    let p = buscarProducto(item.id);
    let nueva = item.cantidad + cambio;
    if (p !== null && cambio > 0 && cantidadEnCarrito(item.id, item.talla) + cambio > (Number(p.stockTallas[item.talla]) || 0)) {
        mostrarToast("No hay más unidades en talla " + item.talla + ".", "error");
        return;
    }
    if (nueva <= 0) {
        carrito = carrito.filter(function (i) { return claveItem(i) !== clave; });
    } else {
        item.cantidad = nueva;
    }
    guardarCarrito();
}

function cuponAplicado() {
    let codigo = leerLocal(CLAVES.cuponAplicado, "");
    return cupones.find(function (c) { return c.codigo === codigo && c.activo; }) || null;
}

const ENVIO_GRATIS_DESDE = 199;
const COSTO_ENVIO = { lima: 10, provincia: 18, recojo: 0 };

// Calcula todos los montos del carrito: subtotal, ahorro por ofertas, cupón, envío y total
function calcularTotales(zona) {
    zona = zona || "lima";
    let lista = 0, subtotal = 0, unidades = 0;
    for (let item of carrito) {
        let p = buscarProducto(item.id);
        if (p === null) {
            continue;
        }
        lista += p.precio * item.cantidad;
        subtotal += precioFinal(p) * item.cantidad;
        unidades += item.cantidad;
    }
    let cupon = cuponAplicado();
    let descuentoCupon = 0, mensajeCupon = "";
    let envioGratisCupon = false;
    if (cupon !== null) {
        if (subtotal < cupon.minimo) {
            mensajeCupon = "El cupón " + cupon.codigo + " requiere una compra mínima de " + formatoPrecio(cupon.minimo) + ".";
        } else if (cupon.tipo === "porcentaje") {
            descuentoCupon = redondear(subtotal * cupon.valor / 100);
        } else if (cupon.tipo === "monto") {
            descuentoCupon = Math.min(cupon.valor, subtotal);
        } else if (cupon.tipo === "envio") {
            envioGratisCupon = true;
        }
    }
    let base = subtotal - descuentoCupon;
    let envio = (unidades === 0 || base >= ENVIO_GRATIS_DESDE || envioGratisCupon) ? 0 : COSTO_ENVIO[zona];
    return {
        lista: redondear(lista), subtotal: redondear(subtotal), ahorro: redondear(lista - subtotal),
        cupon: cupon, descuentoCupon: descuentoCupon, mensajeCupon: mensajeCupon,
        envio: envio, total: redondear(base + envio), unidades: unidades,
        faltaEnvioGratis: Math.max(0, redondear(ENVIO_GRATIS_DESDE - base))
    };
}

function aplicarCupon(codigo) {
    codigo = codigo.trim().toUpperCase();
    let cupon = cupones.find(function (c) { return c.codigo === codigo; });
    if (!cupon || !cupon.activo) {
        mostrarToast("El cupón " + codigo + " no existe o ya no está activo.", "error");
        return false;
    }
    guardarLocal(CLAVES.cuponAplicado, codigo);
    let t = calcularTotales();
    if (t.mensajeCupon) {
        mostrarToast(t.mensajeCupon, "error");
    } else {
        mostrarToast("Cupón " + codigo + " aplicado: " + cupon.descripcion, "ok");
    }
    return true;
}

function quitarCupon() {
    localStorage.removeItem(CLAVES.cuponAplicado);
}

// =====================================================
// 5. CABECERA, BUSCADOR Y PIE
// =====================================================
const ICONOS = {
    buscar: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    usuario: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    corazon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-9-9.2C1.7 7.3 4 4 7.4 4c2 0 3.5 1.1 4.6 2.6C13.1 5.1 14.6 4 16.6 4 20 4 22.3 7.3 21 10.8 19 15.6 12 20 12 20z"/></svg>',
    bolsa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    camion: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 6h12v10H2zM14 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    tienda: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h16l-1-5H5L4 9zM5 9v11h14V9M9 20v-6h6v6"/></svg>',
    escudo: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3z"/><path d="m9 12 2 2 4-4"/></svg>',
    cambio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h13l-3-3M20 17H7l3 3"/></svg>',
    chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4V5z"/></svg>',
    grafico: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    regla: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17 17 3l4 4L7 21z"/><path d="m7 13 2 2M10 10l2 2M13 7l2 2"/></svg>'
};

function dibujarCabecera() {
    let cabecera = document.getElementById("cabecera");
    if (cabecera === null) {
        return;
    }
    let enlaces = [
        { id: "nuevo", texto: "Novedades", href: "catalogo.html?nuevo=1" },
        { id: "hombre", texto: "Hombre", href: "catalogo.html?genero=hombre" },
        { id: "mujer", texto: "Mujer", href: "catalogo.html?genero=mujer" },
        { id: "calzado", texto: "Zapatillas", href: "catalogo.html?cat=calzado" },
        { id: "accesorios", texto: "Accesorios", href: "catalogo.html?seg=accesorios" },
        { id: "oferta", texto: "Ofertas", href: "catalogo.html?oferta=1", clase: "enlace-oferta" },
        { id: "contacto", texto: "Contacto", href: "contacto.html" }
    ];
    if (esAdmin()) {
        enlaces.push({ id: "admin", texto: "Panel admin", href: "admin.html", clase: "enlace-admin" });
    }
    let actual = seccionActual();
    let lista = enlaces.map(function (e) {
        return '<li><a href="' + e.href + '" class="' + (e.clase || "") + '"' + (e.id === actual ? ' aria-current="page"' : "") + ">" + e.texto + "</a></li>";
    }).join("");

    let cuentaHref = sesion === null ? "login.html" : (esAdmin() ? "admin.html" : "cuenta.html");
    let cuentaTexto = sesion === null ? "Ingresar" : "Hola, " + escapar(sesion.nombre.split(" ")[0]);
    let salir = sesion !== null ? '<button type="button" class="icono-boton salir" data-accion="salir" title="Cerrar sesión">Salir</button>' : "";

    let mensajes = [
        "🚚 Delivery GRATIS en Lima y provincias por compras desde S/ " + ENVIO_GRATIS_DESDE,
        "🔥 " + campana.nombre + ": " + campana.subtitulo,
        "💳 Paga con tarjeta, Yape, Plin o PagoEfectivo",
        "🎁 Usa el cupón GENZ20 y ahorra S/ 20 desde S/ 120",
        "↩️ Cambios gratis hasta 30 días después de tu compra"
    ];
    let cinta = mensajes.concat(mensajes).map(function (m) { return "<span>" + m + "</span>"; }).join("");

    cabecera.innerHTML =
        '<div class="cinta" aria-label="Promociones"><div class="cinta-pista">' + cinta + "</div></div>" +
        '<div class="cabecera-interior">' +
        '<button type="button" class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="panel-menu"><span></span><span></span><span></span></button>' +
        '<a class="logo" href="index.html" aria-label="NOVAK, ir al inicio">NOVAK<span>.</span></a>' +
        '<div class="cabecera-panel" id="panel-menu"><nav class="menu" aria-label="Menú principal"><ul>' + lista + "</ul></nav></div>" +
        '<form class="buscador-global" action="catalogo.html" role="search">' +
        '<input type="search" name="q" id="busqueda-global" placeholder="Busca hoodies, jeans, zapatillas..." aria-label="Buscar en la tienda" autocomplete="off">' +
        '<button type="submit" aria-label="Buscar">' + ICONOS.buscar + "</button>" +
        '<div class="sugerencias" id="sugerencias" hidden></div></form>' +
        '<div class="iconos-cabecera">' +
        '<a class="icono-boton" href="' + cuentaHref + '" title="Mi cuenta">' + ICONOS.usuario + '<span class="icono-texto">' + cuentaTexto + (esAdmin() ? ' <b class="etiqueta-rol">Admin</b>' : "") + "</span></a>" +
        '<a class="icono-boton" href="cuenta.html#favoritos" title="Favoritos">' + ICONOS.corazon + '<span class="burbuja contador-favoritos">0</span></a>' +
        '<a class="icono-boton" href="carrito.html" title="Carrito">' + ICONOS.bolsa + '<span class="burbuja contador-carrito">0</span></a>' +
        salir + "</div></div>";

    let campo = document.getElementById("busqueda-global");
    let q = new URLSearchParams(location.search).get("q");
    if (q && pagina === "catalogo") {
        campo.value = q;
    }
}

function seccionActual() {
    let params = new URLSearchParams(location.search);
    if (pagina === "contacto") { return "contacto"; }
    if (pagina === "admin") { return "admin"; }
    if (pagina !== "catalogo") { return ""; }
    if (params.get("oferta")) { return "oferta"; }
    if (params.get("nuevo")) { return "nuevo"; }
    if (params.get("seg") === "accesorios") { return "accesorios"; }
    if (params.get("cat") === "calzado") { return "calzado"; }
    return params.get("genero") || "";
}

function alternarMenu(forzarCierre) {
    let cabecera = document.getElementById("cabecera");
    let boton = document.querySelector(".nav-toggle");
    if (cabecera === null || boton === null) {
        return;
    }
    let abierto = forzarCierre ? false : !cabecera.classList.contains("abierto");
    cabecera.classList.toggle("abierto", abierto);
    boton.setAttribute("aria-expanded", abierto);
    boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
}

// Sugerencias mientras se escribe en el buscador de la cabecera
function mostrarSugerencias(texto) {
    let caja = document.getElementById("sugerencias");
    if (caja === null) {
        return;
    }
    texto = texto.trim().toLowerCase();
    if (texto.length < 2) {
        caja.hidden = true;
        return;
    }
    let encontrados = productos.filter(function (p) {
        return (p.nombre + " " + nombreCategoria(p.categoria) + " " + p.descripcion).toLowerCase().includes(texto);
    }).slice(0, 6);
    if (encontrados.length === 0) {
        caja.innerHTML = '<p class="sugerencia-vacia">Sin resultados para "' + escapar(texto) + '"</p>';
    } else {
        caja.innerHTML = encontrados.map(function (p) {
            return '<a class="sugerencia" href="producto.html?id=' + encodeURIComponent(p.id) + '">' +
                '<img src="' + escapar(p.imagen) + '" alt="" width="40" height="50">' +
                "<span><strong>" + escapar(p.nombre) + "</strong><small>" + nombreCategoria(p.categoria) + "</small></span>" +
                "<b>" + formatoPrecio(precioFinal(p)) + "</b></a>";
        }).join("") + '<a class="sugerencia-todos" href="catalogo.html?q=' + encodeURIComponent(texto) + '">Ver todos los resultados →</a>';
    }
    activarImagenesDeRespaldo(caja);
    caja.hidden = false;
}

function dibujarPie() {
    let pie = document.getElementById("pie");
    if (pie === null) {
        return;
    }
    pie.innerHTML =
        '<div class="pie-newsletter"><div class="contenedor pie-newsletter-interior">' +
        "<div><h2>Únete al club NOVAK</h2><p>Recibe drops, ofertas antes que nadie y un cupón de 15% para tu primera compra.</p></div>" +
        '<form class="form-newsletter" id="form-newsletter" novalidate>' +
        '<label class="sr-only" for="correo-newsletter">Tu correo</label>' +
        '<input type="email" id="correo-newsletter" name="correo" placeholder="tu@correo.com" required>' +
        '<button type="submit" class="boton boton-lima">Quiero mi 15%</button>' +
        '<p class="mensaje" role="status" hidden></p></form></div></div>' +
        '<div class="pie-interior">' +
        '<div class="pie-marca"><strong class="logo">NOVAK<span>.</span></strong><p class="lema-pie">STAY DIFFERENT</p>' +
        "<p>Moda urbana para la generación que se viste a su manera. Diseñado en Lima.</p>" +
        '<div class="pie-redes">' +
        '<a class="red" href="#" aria-label="NOVAK en Instagram">IG</a>' +
        '<a class="red" href="#" aria-label="NOVAK en TikTok">TT</a>' +
        '<a class="red" href="#" aria-label="NOVAK en Facebook">FB</a></div></div>' +
        '<div><h3>Compra</h3><ul class="pie-enlaces">' +
        '<li><a href="catalogo.html?nuevo=1">Novedades</a></li>' +
        '<li><a href="catalogo.html?genero=mujer">Mujer</a></li>' +
        '<li><a href="catalogo.html?genero=hombre">Hombre</a></li>' +
        '<li><a href="catalogo.html?oferta=1">Ofertas</a></li></ul></div>' +
        '<div><h3>Ayuda</h3><ul class="pie-enlaces">' +
        '<li><a href="cuenta.html">Mis pedidos</a></li>' +
        '<li><a href="#" data-accion="guia-tallas">Guía de tallas</a></li>' +
        '<li><a href="contacto.html">Cambios y devoluciones</a></li>' +
        '<li><a href="contacto.html?motivo=reclamo">Libro de reclamaciones</a></li></ul></div>' +
        '<address><h3>Escríbenos</h3><p>contacto@novak.pe</p><p>999 999 999</p>' +
        "<p>Lunes a sábado, 09:00 - 19:00</p></address>" +
        "</div>" +
        '<div class="pie-pagos"><span>Pagos seguros:</span>' +
        '<span class="medio">VISA</span><span class="medio">Mastercard</span><span class="medio">Amex</span>' +
        '<span class="medio">Diners</span><span class="medio yape">Yape</span><span class="medio plin">Plin</span>' +
        '<span class="medio">PagoEfectivo</span></div>' +
        '<p class="pie-derechos">&copy; ' + new Date().getFullYear() + " NOVAK. Todos los derechos reservados. Proyecto de tienda virtual.</p>" +
        '<a class="flotante-chat" href="contacto.html" aria-label="Escríbenos por chat">' + ICONOS.chat + "<span>¿Ayuda?</span></a>";
}

function mostrarContadores() {
    let cantidad = carrito.reduce(function (s, i) { return s + i.cantidad; }, 0);
    for (let c of document.getElementsByClassName("contador-carrito")) {
        c.textContent = cantidad;
        c.hidden = cantidad === 0;
    }
    for (let c of document.getElementsByClassName("contador-favoritos")) {
        c.textContent = favoritos.length;
        c.hidden = favoritos.length === 0;
    }
}

// =====================================================
// 6. AVISOS Y VENTANAS FLOTANTES
// =====================================================
function mostrarToast(texto, tipo) {
    let contenedor = document.getElementById("toasts");
    if (contenedor === null) {
        contenedor = document.createElement("div");
        contenedor.id = "toasts";
        contenedor.className = "toasts";
        contenedor.setAttribute("aria-live", "polite");
        document.body.appendChild(contenedor);
    }
    let toast = document.createElement("div");
    toast.className = "toast " + (tipo || "");
    toast.textContent = texto;
    contenedor.appendChild(toast);
    setTimeout(function () {
        toast.classList.add("saliendo");
        setTimeout(function () { toast.remove(); }, 300);
    }, 3200);
}

let modal = null;
let modalCuerpo = null;
let focoAnterior = null;

function crearModal() {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.innerHTML =
        '<div class="modal-caja" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">' +
        '<button type="button" class="modal-cerrar" data-accion="cerrar-modal" aria-label="Cerrar ventana">&times;</button>' +
        '<div class="modal-cuerpo"></div></div>';
    document.body.appendChild(modal);
    modalCuerpo = modal.querySelector(".modal-cuerpo");
    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) {
            cerrarModal();
        }
    });
}

function abrirModal(html, clase) {
    if (modal === null) {
        crearModal();
    }
    focoAnterior = document.activeElement;
    modal.querySelector(".modal-caja").className = "modal-caja " + (clase || "");
    modalCuerpo.innerHTML = html;
    activarImagenesDeRespaldo(modalCuerpo);
    modal.classList.add("abierto");
    document.body.classList.add("sin-scroll");
    let primero = modalCuerpo.querySelector("input:not([type=hidden]), select, textarea, .boton");
    (primero || modal.querySelector(".modal-cerrar")).focus({ preventScroll: true });
}

function cerrarModal() {
    if (modal === null || !modal.classList.contains("abierto")) {
        return;
    }
    modal.classList.remove("abierto");
    document.body.classList.remove("sin-scroll");
    modalCuerpo.innerHTML = "";
    if (focoAnterior !== null && document.body.contains(focoAnterior)) {
        focoAnterior.focus({ preventScroll: true });
    }
}

function modalAbierto() {
    return modal !== null && modal.classList.contains("abierto");
}

function activarImagenesDeRespaldo(contenedor) {
    for (let imagen of contenedor.getElementsByTagName("img")) {
        if (imagen.dataset.respaldo === "si") {
            continue;
        }
        imagen.dataset.respaldo = "si";
        imagen.addEventListener("error", function () {
            imagen.src = imagen.dataset.alterna || IMG_RESPALDO;
            imagen.dataset.alterna = IMG_RESPALDO;
        });
        if (imagen.complete && imagen.naturalWidth === 0 && imagen.getAttribute("src")) {
            imagen.src = imagen.dataset.alterna || IMG_RESPALDO;
        }
    }
}

function mostrarMensaje(formulario, texto, esError) {
    let mensaje = formulario.querySelector(".mensaje");
    if (mensaje === null) {
        return;
    }
    mensaje.textContent = texto;
    mensaje.className = esError ? "mensaje error" : "mensaje";
    mensaje.hidden = false;
}

// Panel lateral que confirma lo que se agregó al carrito
function mostrarMiniCarrito(p, talla, color) {
    let t = calcularTotales();
    let panel = document.getElementById("mini-carrito");
    if (panel === null) {
        panel = document.createElement("aside");
        panel.id = "mini-carrito";
        panel.className = "mini-carrito";
        panel.setAttribute("aria-live", "polite");
        document.body.appendChild(panel);
    }
    let barra = Math.min(100, Math.round((1 - t.faltaEnvioGratis / ENVIO_GRATIS_DESDE) * 100));
    panel.innerHTML =
        '<div class="mini-cabecera"><strong>✓ Agregado a tu carrito</strong><button type="button" data-accion="cerrar-mini" aria-label="Cerrar">&times;</button></div>' +
        '<div class="mini-producto"><img src="' + escapar(p.imagen) + '" alt="" width="64" height="80">' +
        "<div><p>" + escapar(p.nombre) + "</p><small>Talla " + escapar(talla) + " · " + escapar(color) + "</small>" +
        "<b>" + formatoPrecio(precioFinal(p)) + "</b></div></div>" +
        '<p class="mini-envio">' + (t.faltaEnvioGratis > 0 ? "Te faltan <b>" + formatoPrecio(t.faltaEnvioGratis) + "</b> para el envío gratis" : "🎉 ¡Tienes envío gratis!") + "</p>" +
        '<div class="barra-progreso"><span style="width:' + barra + '%"></span></div>' +
        '<div class="mini-acciones"><a class="boton" href="carrito.html">Ver carrito (' + t.unidades + ")</a>" +
        '<a class="boton boton-claro" href="checkout.html">Pagar ahora</a></div>';
    activarImagenesDeRespaldo(panel);
    panel.classList.add("visible");
    clearTimeout(panel.temporizador);
    panel.temporizador = setTimeout(function () { panel.classList.remove("visible"); }, 5000);
}

// =====================================================
// 7. TARJETAS, SELECTOR DE TALLA Y GUÍA DE TALLAS
// =====================================================
function crearTarjeta(p, opciones) {
    opciones = opciones || {};
    let total = stockTotal(p);
    let agotado = total <= 0;
    let sellos = "";
    if (ofertaVigente(p)) {
        sellos += '<span class="sello sello-dcto">-' + p.descuento + "%</span>";
    }
    if (p.nuevo) {
        sellos += '<span class="sello sello-nuevo">Nuevo</span>';
    }
    if (agotado) {
        sellos += '<span class="sello sello-agotado">Agotado</span>';
    } else if (total <= 5) {
        sellos += '<span class="sello sello-poco">Últimas ' + total + "</span>";
    }
    let colores = p.colores.map(function (c) {
        return '<span class="punto-color" style="background:' + escapar(c.hex) + '" title="' + escapar(c.nombre) + '"></span>';
    }).join("");
    let admin = "";
    if (opciones.admin && esAdmin()) {
        admin = '<div class="producto-admin">' +
            '<button type="button" class="boton boton-claro boton-chico" data-accion="estadisticas" data-id="' + escapar(p.id) + '">' + ICONOS.grafico + "Stats</button>" +
            '<button type="button" class="boton boton-claro boton-chico" data-accion="editar" data-id="' + escapar(p.id) + '">Editar</button>' +
            '<button type="button" class="boton boton-peligro boton-chico" data-accion="eliminar" data-id="' + escapar(p.id) + '">Eliminar</button></div>';
    }
    let url = "producto.html?id=" + encodeURIComponent(p.id);
    return '<article class="producto' + (agotado ? " agotado" : "") + '" data-id="' + escapar(p.id) + '">' +
        '<div class="producto-imagen">' +
        '<a href="' + url + '" tabindex="-1" aria-hidden="true"><img src="' + escapar(p.imagen || IMG_RESPALDO) + '" alt="" loading="lazy" width="400" height="500"></a>' +
        '<div class="sellos">' + sellos + "</div>" +
        '<button type="button" class="boton-favorito' + (esFavorito(p.id) ? " activo" : "") + '" data-accion="favorito" data-id="' + escapar(p.id) + '" aria-pressed="' + esFavorito(p.id) + '" aria-label="Guardar ' + escapar(p.nombre) + ' en favoritos">' + ICONOS.corazon + "</button>" +
        (agotado ? "" : '<button type="button" class="agregar-rapido" data-accion="elegir" data-id="' + escapar(p.id) + '">+ Agregar rápido</button>') +
        "</div>" +
        '<div class="producto-info">' +
        '<p class="producto-marca">NOVAK · ' + escapar(nombreCategoria(p.categoria)) + "</p>" +
        '<h3><a href="' + url + '">' + escapar(p.nombre) + "</a></h3>" +
        htmlPrecio(p) +
        '<div class="producto-colores" aria-label="Colores disponibles">' + colores + "<small>" + p.colores.length + (p.colores.length === 1 ? " color" : " colores") + "</small></div>" +
        admin + "</div></article>";
}

function htmlTallas(p, seleccionada) {
    return '<div class="tallas" role="radiogroup" aria-label="Tallas">' + Object.keys(p.stockTallas).map(function (t) {
        let sinStock = (Number(p.stockTallas[t]) || 0) <= 0;
        return '<button type="button" class="talla' + (t === seleccionada ? " activa" : "") + '" data-talla="' + escapar(t) + '"' +
            (sinStock ? ' disabled aria-label="Talla ' + escapar(t) + ' agotada"' : ' aria-label="Talla ' + escapar(t) + '"') +
            ' aria-pressed="' + (t === seleccionada) + '">' + escapar(t) + "</button>";
    }).join("") + "</div>";
}

function htmlColores(p, seleccionado) {
    return '<div class="colores" role="radiogroup" aria-label="Colores">' + p.colores.map(function (c) {
        return '<button type="button" class="color' + (c.nombre === seleccionado ? " activo" : "") + '" data-color="' + escapar(c.nombre) + '" aria-pressed="' + (c.nombre === seleccionado) + '" title="' + escapar(c.nombre) + '">' +
            '<span style="background:' + escapar(c.hex) + '"></span></button>';
    }).join("") + "</div>";
}

// Ventana rápida para elegir talla y color antes de agregar al carrito
function abrirSelectorTalla(id) {
    let p = buscarProducto(id);
    if (p === null) {
        return;
    }
    let tallasDisponibles = Object.keys(p.stockTallas).filter(function (t) { return p.stockTallas[t] > 0; });
    if (tallasDisponibles.length === 1 && Object.keys(p.stockTallas).length === 1) {
        agregarAlCarrito(id, tallasDisponibles[0], p.colores[0].nombre, 1);
        return;
    }
    abrirModal(
        '<div class="selector-rapido" data-id="' + escapar(p.id) + '">' +
        '<img src="' + escapar(p.imagen) + '" alt="' + escapar(p.nombre) + '" width="160" height="200">' +
        "<div>" +
        '<h2 id="modal-titulo">' + escapar(p.nombre) + "</h2>" + htmlPrecio(p) +
        '<p class="etiqueta-campo">Color: <b class="color-elegido">' + escapar(p.colores[0].nombre) + "</b></p>" + htmlColores(p, p.colores[0].nombre) +
        '<p class="etiqueta-campo">Talla <button type="button" class="enlace" data-accion="guia-tallas" data-categoria="' + p.categoria + '">Guía de tallas</button></p>' + htmlTallas(p, "") +
        '<button type="button" class="boton boton-bloque" data-accion="confirmar-agregar">Agregar al carrito</button>' +
        '<a class="enlace" href="producto.html?id=' + encodeURIComponent(p.id) + '">Ver ficha completa →</a>' +
        "</div></div>", "modal-mediano");
}

function tipoGuia(categoria) {
    if (categoria === "calzado") { return "calzado"; }
    if (categoria === "pantalones") { return "pantalones"; }
    if (["gafas", "relojes", "collares", "gorras"].includes(categoria)) { return "accesorios"; }
    return "ropa";
}

function abrirGuiaTallas(categoria) {
    let tipo = tipoGuia(categoria || "polos");
    let tablas = {
        ropa: ["<tr><th>Talla</th><th>Pecho (cm)</th><th>Largo (cm)</th><th>Equivale a</th></tr>",
            "<tr><td>XS</td><td>84 - 88</td><td>66</td><td>Peruana 32</td></tr>",
            "<tr><td>S</td><td>89 - 94</td><td>69</td><td>Peruana 34</td></tr>",
            "<tr><td>M</td><td>95 - 100</td><td>72</td><td>Peruana 36</td></tr>",
            "<tr><td>L</td><td>101 - 106</td><td>74</td><td>Peruana 38</td></tr>",
            "<tr><td>XL</td><td>107 - 112</td><td>76</td><td>Peruana 40</td></tr>"],
        pantalones: ["<tr><th>Talla</th><th>Cintura (cm)</th><th>Cadera (cm)</th><th>Largo (cm)</th></tr>",
            "<tr><td>28</td><td>71 - 74</td><td>90</td><td>100</td></tr>",
            "<tr><td>30</td><td>76 - 79</td><td>95</td><td>102</td></tr>",
            "<tr><td>32</td><td>81 - 84</td><td>100</td><td>104</td></tr>",
            "<tr><td>34</td><td>86 - 89</td><td>105</td><td>106</td></tr>",
            "<tr><td>36</td><td>91 - 94</td><td>110</td><td>107</td></tr>"],
        calzado: ["<tr><th>Talla PE</th><th>US H</th><th>US M</th><th>Largo del pie (cm)</th></tr>",
            "<tr><td>37</td><td>5</td><td>6.5</td><td>23.5</td></tr>",
            "<tr><td>38</td><td>6</td><td>7.5</td><td>24.0</td></tr>",
            "<tr><td>39</td><td>6.5</td><td>8</td><td>24.5</td></tr>",
            "<tr><td>40</td><td>7.5</td><td>9</td><td>25.5</td></tr>",
            "<tr><td>41</td><td>8</td><td>9.5</td><td>26.0</td></tr>",
            "<tr><td>42</td><td>9</td><td>10.5</td><td>26.5</td></tr>",
            "<tr><td>43</td><td>10</td><td>11.5</td><td>27.5</td></tr>"],
        accesorios: ["<tr><th>Producto</th><th>Medida</th></tr>",
            "<tr><td>Gorras</td><td>Ajustables de 54 a 60 cm de contorno</td></tr>",
            "<tr><td>Collares</td><td>50 cm + 5 cm de extensión</td></tr>",
            "<tr><td>Relojes</td><td>Correa para muñecas de 15 a 21 cm</td></tr>",
            "<tr><td>Gafas</td><td>Ancho de montura 138 - 145 mm</td></tr>"]
    };
    let nombres = { ropa: "Polos, camisas, hoodies, casacas y vestidos", pantalones: "Pantalones y jeans", calzado: "Zapatillas", accesorios: "Accesorios" };
    abrirModal('<h2 id="modal-titulo">' + ICONOS.regla + " Guía de tallas</h2>" +
        '<p class="subtitulo">' + nombres[tipo] + ". Si estás entre dos tallas, elige la mayor para un look más relajado.</p>" +
        '<div class="tabla-scroll"><table class="tabla-guia">' + tablas[tipo].join("") + "</table></div>" +
        '<p class="nota">¿Dudas? Escríbenos y te ayudamos a elegir. Los cambios de talla son gratis.</p>', "modal-mediano");
}

// =====================================================
// 8. CARRUSELES HORIZONTALES Y CUENTA REGRESIVA
// =====================================================
function activarRieles(contenedor) {
    (contenedor || document).querySelectorAll(".riel-envoltura").forEach(function (envoltura) {
        if (envoltura.dataset.listo === "si") {
            return;
        }
        envoltura.dataset.listo = "si";
        let riel = envoltura.querySelector(".riel");
        let anterior = envoltura.querySelector(".riel-anterior");
        let siguiente = envoltura.querySelector(".riel-siguiente");
        function actualizar() {
            if (anterior) { anterior.disabled = riel.scrollLeft <= 4; }
            if (siguiente) { siguiente.disabled = riel.scrollLeft + riel.clientWidth >= riel.scrollWidth - 4; }
        }
        function mover(direccion) {
            riel.scrollBy({ left: direccion * riel.clientWidth * 0.85, behavior: "smooth" });
        }
        if (anterior) { anterior.addEventListener("click", function () { mover(-1); }); }
        if (siguiente) { siguiente.addEventListener("click", function () { mover(1); }); }
        riel.addEventListener("scroll", actualizar, { passive: true });
        window.addEventListener("resize", actualizar);
        actualizar();
    });
}

function htmlRiel(contenidoHtml, clase) {
    return '<div class="riel-envoltura ' + (clase || "") + '">' +
        '<button type="button" class="riel-flecha riel-anterior" aria-label="Anterior">‹</button>' +
        '<div class="riel">' + contenidoHtml + "</div>" +
        '<button type="button" class="riel-flecha riel-siguiente" aria-label="Siguiente">›</button></div>';
}

function tiempoRestante(fin) {
    let ms = Math.max(0, new Date(fin).getTime() - Date.now());
    let s = Math.floor(ms / 1000);
    return { dias: Math.floor(s / 86400), horas: Math.floor(s % 86400 / 3600), minutos: Math.floor(s % 3600 / 60), segundos: s % 60, terminado: ms <= 0 };
}

function iniciarCuentasRegresivas() {
    function dos(n) { return String(n).padStart(2, "0"); }
    function tic() {
        document.querySelectorAll("[data-cuenta-regresiva]").forEach(function (el) {
            let r = tiempoRestante(el.dataset.cuentaRegresiva || campana.fin);
            if (r.terminado) {
                el.innerHTML = '<span class="cr-fin">Campaña finalizada</span>';
                return;
            }
            el.innerHTML = [["dias", "días"], ["horas", "hrs"], ["minutos", "min"], ["segundos", "seg"]].map(function (par) {
                return '<span class="cr-bloque"><b>' + dos(r[par[0]]) + "</b><small>" + par[1] + "</small></span>";
            }).join("");
        });
    }
    tic();
    setInterval(tic, 1000);
}

// =====================================================
// EVENTOS COMUNES A TODAS LAS PÁGINAS
// =====================================================
document.addEventListener("click", function (evento) {
    let objetivo = evento.target;

    if (objetivo.closest(".nav-toggle") !== null) {
        alternarMenu(false);
        return;
    }
    if (objetivo.closest(".menu a") !== null) {
        alternarMenu(true);
    }
    // Tarjetas "Sobre NOVAK": en el celular se giran al tocar
    let flip = objetivo.closest(".flip");
    if (flip !== null) {
        flip.classList.toggle("girada");
    }
    if (objetivo.closest(".buscador-global") === null) {
        let caja = document.getElementById("sugerencias");
        if (caja) { caja.hidden = true; }
    }

    // Selección de talla y color (en el selector rápido y en la ficha)
    let talla = objetivo.closest(".talla");
    if (talla !== null && !talla.disabled) {
        let grupo = talla.closest(".tallas");
        grupo.querySelectorAll(".talla").forEach(function (b) {
            b.classList.toggle("activa", b === talla);
            b.setAttribute("aria-pressed", b === talla);
        });
        if (typeof alElegirTalla === "function") { alElegirTalla(talla.dataset.talla); }
        return;
    }
    let color = objetivo.closest(".color");
    if (color !== null) {
        let grupo = color.closest(".colores");
        grupo.querySelectorAll(".color").forEach(function (b) {
            b.classList.toggle("activo", b === color);
            b.setAttribute("aria-pressed", b === color);
        });
        let etiqueta = grupo.parentElement.querySelector(".color-elegido");
        if (etiqueta) { etiqueta.textContent = color.dataset.color; }
        if (typeof alElegirColor === "function") { alElegirColor(color.dataset.color); }
        return;
    }

    let boton = objetivo.closest("[data-accion]");
    if (boton === null) {
        return;
    }
    let id = boton.dataset.id;
    switch (boton.dataset.accion) {
        case "favorito": alternarFavorito(id); break;
        case "elegir": abrirSelectorTalla(id); break;
        case "confirmar-agregar": {
            let caja = boton.closest(".selector-rapido");
            let tallaActiva = caja.querySelector(".talla.activa");
            let colorActivo = caja.querySelector(".color.activo");
            if (tallaActiva === null) {
                mostrarToast("Elige una talla primero.", "error");
                caja.querySelector(".tallas").classList.add("sacudir");
                setTimeout(function () { caja.querySelector(".tallas").classList.remove("sacudir"); }, 500);
                break;
            }
            if (agregarAlCarrito(caja.dataset.id, tallaActiva.dataset.talla, colorActivo ? colorActivo.dataset.color : "", 1)) {
                cerrarModal();
            }
            break;
        }
        case "guia-tallas": evento.preventDefault(); abrirGuiaTallas(boton.dataset.categoria); break;
        case "cerrar-mini": document.getElementById("mini-carrito").classList.remove("visible"); break;
        case "salir": cerrarSesion(); break;
        case "cerrar-modal": cerrarModal(); break;
    }
});

document.addEventListener("input", function (evento) {
    if (evento.target.id === "busqueda-global") {
        mostrarSugerencias(evento.target.value);
    }
});

document.addEventListener("keydown", function (evento) {
    if (evento.key === "Escape") {
        cerrarModal();
        alternarMenu(true);
        let caja = document.getElementById("sugerencias");
        if (caja) { caja.hidden = true; }
    }
    if (evento.key === "Tab" && modalAbierto()) {
        let elementos = modal.querySelectorAll("button:not([disabled]), input, select, textarea, a[href]");
        if (elementos.length === 0) {
            return;
        }
        let primero = elementos[0];
        let ultimo = elementos[elementos.length - 1];
        if (evento.shiftKey && document.activeElement === primero) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primero.focus();
        }
    }
});

// Newsletter del pie: entrega el cupón de bienvenida
document.addEventListener("submit", function (evento) {
    if (evento.target.id !== "form-newsletter") {
        return;
    }
    evento.preventDefault();
    let formulario = evento.target;
    let correo = formulario.correo.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        mostrarMensaje(formulario, "Escribe un correo válido.", true);
        return;
    }
    let suscritos = leerLocal("novak_newsletter", []);
    if (!suscritos.includes(correo)) {
        suscritos.push(correo);
        guardarLocal("novak_newsletter", suscritos);
    }
    mostrarMensaje(formulario, "¡Listo! Tu cupón es BIENVENIDA15 (15% desde S/ 150). Ya puedes usarlo en el carrito.", false);
    formulario.reset();
});

// Si otra pestaña cambia datos, esta se actualiza
window.addEventListener("storage", function (evento) {
    if (evento.key === CLAVES.productos) { productos = leerLocal(CLAVES.productos, productos); }
    if (evento.key === CLAVES.carrito) { carrito = leerLocal(CLAVES.carrito, []); }
    if (evento.key === CLAVES.favoritos) { favoritos = leerLocal(CLAVES.favoritos, []); }
    if (evento.key === CLAVES.pedidos) { pedidos = leerLocal(CLAVES.pedidos, pedidos); }
    if ([CLAVES.productos, CLAVES.carrito, CLAVES.favoritos, CLAVES.pedidos].includes(evento.key)) {
        limpiarCarrito();
        mostrarContadores();
        if (typeof redibujarPagina === "function") { redibujarPagina(); }
    }
});

// Arranque común: se ejecuta cuando todos los scripts ya cargaron
document.addEventListener("DOMContentLoaded", function () {
    limpiarCarrito();
    guardarLocal(CLAVES.carrito, carrito);
    dibujarCabecera();
    dibujarPie();
    mostrarContadores();
    if (typeof iniciarPagina === "function") {
        iniciarPagina();
    }
    activarImagenesDeRespaldo(document);
    activarRieles();
    iniciarCuentasRegresivas();
});

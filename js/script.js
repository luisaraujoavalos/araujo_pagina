/* =====================================================
   NOVAK - script.js
   Un solo archivo para todas las páginas.

   Contenido:
   0.  Datos: productos iniciales, categorías y cuentas demo
   1.  Funciones de ayuda (guardar, leer, escapar texto)
   2.  Sesión: login, registro y cierre de sesión
   3.  Cabecera, menú hamburguesa y pie de página
   4.  Avisos (toasts) y ventanas flotantes (modales)
   5.  Productos: tarjetas, catálogo, filtros y orden
   6.  Administrador: agregar, editar, eliminar y stock
   7.  Carrito y compra
   8.  Formularios (submit)
   9.  Eventos generales (click, keyup, teclado)
   10. Al cargar la página
===================================================== */

// =====================================================
// 0. DATOS
// =====================================================
const CATEGORIAS = [
    { id: "polos", nombre: "Polos" },
    { id: "camisas", nombre: "Camisas" },
    { id: "hoodies", nombre: "Hoodies" },
    { id: "casacas", nombre: "Casacas" },
    { id: "pantalones", nombre: "Pantalones" },
    { id: "shorts", nombre: "Shorts" },
    { id: "vestidos", nombre: "Vestidos" },
    { id: "calzado", nombre: "Calzado" },
    { id: "gafas", nombre: "Gafas" },
    { id: "relojes", nombre: "Relojes" },
    { id: "collares", nombre: "Collares" },
    { id: "gorras", nombre: "Gorras" }
];

// Imagen que se muestra si un producto no tiene foto o el enlace falla
const IMG_RESPALDO = "data:image/svg+xml;utf8," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'>" +
    "<rect width='400' height='500' fill='#ececf0'/>" +
    "<text x='200' y='260' font-family='Arial' font-size='44' font-weight='700' letter-spacing='6' " +
    "fill='#1f2038' text-anchor='middle'>NOVAK</text></svg>"
);

// Cuentas de ejemplo para probar el login (además de las que se registren)
const CUENTAS_DEMO = [
    { usuario: "cliente@novak.pe", correo: "cliente@novak.pe", clave: "cliente123", nombre: "Cliente Demo", rol: "usuario" },
    { usuario: "admin@novak.pe", correo: "admin@novak.pe", clave: "admin123", nombre: "Administrador", rol: "admin" }
];

// Clave donde se guardan los productos (cambia cuando se renueva el catálogo)
const CLAVE_PRODUCTOS = "novak_productos_v2";

// Prendas que se muestran como destacadas en el inicio
const DESTACADOS = ["polo-blanco", "casaca-jean", "jean-slim"];

const PAGINAS_PERMITIDAS = ["index.html", "catalogo.html", "carrito.html", "admin.html"];

// Arreglo de objetos: cada prenda es un objeto con sus propiedades
function productosIniciales() {
    let hoy = fechaHoy();
    return [
        { id: "polo-blanco", nombre: "Polo básico blanco", categoria: "polos", descripcion: "Algodón 100%", precio: 39.90, stock: 24, fecha: hoy,
          imagen: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&h=750&q=80" },
        { id: "polo-negro", nombre: "Polo oversize negro", categoria: "polos", descripcion: "Corte holgado urbano", precio: 49.90, stock: 18, fecha: hoy,
          imagen: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&h=750&q=80" },
        { id: "polos-03", nombre: "Polo rayas marino", categoria: "polos", descripcion: "Algodón con rayas horizontales", precio: 54.90, stock: 12, fecha: hoy, imagen: "img/polos-03.jpg" },
        { id: "polos-04", nombre: "Polo oversize gris", categoria: "polos", descripcion: "Corte holgado, tela suave", precio: 49.90, stock: 30, fecha: hoy, imagen: "img/polos-04.jpg" },
        { id: "polos-05", nombre: "Polo boxy beige", categoria: "polos", descripcion: "Corte recto y fresco", precio: 52.90, stock: 9, fecha: hoy, imagen: "img/polos-05.jpg" },
        { id: "polos-06", nombre: "Polo estampado NOVAK", categoria: "polos", descripcion: "Logo en el pecho", precio: 59.90, stock: 15, fecha: hoy, imagen: "img/polos-06.jpg" },
        { id: "polos-07", nombre: "Polo verde oliva", categoria: "polos", descripcion: "Algodón peinado", precio: 44.90, stock: 22, fecha: hoy, imagen: "img/polos-07.jpg" },
        { id: "polos-08", nombre: "Polo celeste lavado", categoria: "polos", descripcion: "Efecto lavado suave", precio: 44.90, stock: 5, fecha: hoy, imagen: "img/polos-08.jpg" },
        { id: "polos-09", nombre: "Polo burdeos", categoria: "polos", descripcion: "Color intenso, uso diario", precio: 46.90, stock: 27, fecha: hoy, imagen: "img/polos-09.jpg" },
        { id: "camisas-01", nombre: "Camisa oxford celeste", categoria: "camisas", descripcion: "Algodón oxford, manga larga", precio: 79.90, stock: 14, fecha: hoy, imagen: "img/camisas-01.jpg" },
        { id: "camisas-02", nombre: "Camisa de lino arena", categoria: "camisas", descripcion: "Fresca para el verano", precio: 89.90, stock: 8, fecha: hoy, imagen: "img/camisas-02.jpg" },
        { id: "camisas-03", nombre: "Camisa blanca clásica", categoria: "camisas", descripcion: "Para toda ocasión", precio: 74.90, stock: 20, fecha: hoy, imagen: "img/camisas-03.jpg" },
        { id: "camisas-04", nombre: "Camisa a cuadros rojo", categoria: "camisas", descripcion: "Estilo casual", precio: 84.90, stock: 3, fecha: hoy, imagen: "img/camisas-04.jpg" },
        { id: "camisas-05", nombre: "Camisa negra", categoria: "camisas", descripcion: "Tela lisa, acabado elegante", precio: 94.90, stock: 17, fecha: hoy, imagen: "img/camisas-05.jpg" },
        { id: "camisas-06", nombre: "Camisa overshirt oliva", categoria: "camisas", descripcion: "Gruesa, se usa abierta", precio: 99.90, stock: 11, fecha: hoy, imagen: "img/camisas-06.jpg" },
        { id: "camisas-07", nombre: "Camisa de rayas azul", categoria: "camisas", descripcion: "Rayas verticales finas", precio: 79.90, stock: 26, fecha: hoy, imagen: "img/camisas-07.jpg" },
        { id: "hoodies-01", nombre: "Hoodie negro básico", categoria: "hoodies", descripcion: "Interior afelpado", precio: 119.90, stock: 6, fecha: hoy, imagen: "img/hoodies-01.jpg" },
        { id: "hoodies-02", nombre: "Hoodie gris melange", categoria: "hoodies", descripcion: "Capucha con cordones", precio: 114.90, stock: 13, fecha: hoy, imagen: "img/hoodies-02.jpg" },
        { id: "hoodies-03", nombre: "Hoodie crema", categoria: "hoodies", descripcion: "Tono neutro, combina con todo", precio: 124.90, stock: 19, fecha: hoy, imagen: "img/hoodies-03.jpg" },
        { id: "hoodies-04", nombre: "Hoodie burdeos", categoria: "hoodies", descripcion: "Algodón grueso", precio: 119.90, stock: 4, fecha: hoy, imagen: "img/hoodies-04.jpg" },
        { id: "hoodies-05", nombre: "Hoodie azul marino", categoria: "hoodies", descripcion: "Bolsillo canguro", precio: 119.90, stock: 21, fecha: hoy, imagen: "img/hoodies-05.jpg" },
        { id: "hoodies-06", nombre: "Hoodie verde bosque", categoria: "hoodies", descripcion: "Corte relajado", precio: 124.90, stock: 10, fecha: hoy, imagen: "img/hoodies-06.jpg" },
        { id: "hoodies-07", nombre: "Hoodie rosa palo", categoria: "hoodies", descripcion: "Suave y abrigador", precio: 119.90, stock: 16, fecha: hoy, imagen: "img/hoodies-07.jpg" },
        { id: "hoodies-08", nombre: "Hoodie oversize terracota", categoria: "hoodies", descripcion: "Corte holgado urbano", precio: 129.90, stock: 28, fecha: hoy, imagen: "img/hoodies-08.jpg" },
        { id: "casaca-jean", nombre: "Casaca de jean", categoria: "casacas", descripcion: "Estilo urbano", precio: 89.90, stock: 7, fecha: hoy,
          imagen: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&h=750&q=80" },
        { id: "casaca-bomber", nombre: "Casaca bomber", categoria: "casacas", descripcion: "Liviana y abrigadora", precio: 119.90, stock: 23, fecha: hoy,
          imagen: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&h=750&q=80" },
        { id: "casacas-03", nombre: "Bomber verde militar", categoria: "casacas", descripcion: "Liviana, cierre frontal", precio: 129.90, stock: 12, fecha: hoy, imagen: "img/casacas-03.jpg" },
        { id: "casacas-04", nombre: "Casaca denim negra", categoria: "casacas", descripcion: "Botones y bolsillos", precio: 99.90, stock: 25, fecha: hoy, imagen: "img/casacas-04.jpg" },
        { id: "casacas-05", nombre: "Rompevientos celeste", categoria: "casacas", descripcion: "Ligera e impermeable", precio: 109.90, stock: 24, fecha: hoy, imagen: "img/casacas-05.jpg" },
        { id: "casacas-06", nombre: "Casaca corduroy café", categoria: "casacas", descripcion: "Pana, estilo retro", precio: 134.90, stock: 18, fecha: hoy, imagen: "img/casacas-06.jpg" },
        { id: "casacas-07", nombre: "Casaca varsity", categoria: "casacas", descripcion: "Mangas en contraste", precio: 149.90, stock: 12, fecha: hoy, imagen: "img/casacas-07.jpg" },
        { id: "casacas-08", nombre: "Casaca acolchada negra", categoria: "casacas", descripcion: "Abrigadora y ligera", precio: 159.90, stock: 30, fecha: hoy, imagen: "img/casacas-08.jpg" },
        { id: "jean-slim", nombre: "Jean slim azul", categoria: "pantalones", descripcion: "Denim elástico", precio: 94.90, stock: 9, fecha: hoy,
          imagen: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&h=750&q=80" },
        { id: "pantalon-cargo", nombre: "Pantalón cargo", categoria: "pantalones", descripcion: "Bolsillos laterales", precio: 109.90, stock: 15, fecha: hoy,
          imagen: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&h=750&q=80" },
        { id: "pantalones-03", nombre: "Jean recto negro", categoria: "pantalones", descripcion: "Denim rígido", precio: 99.90, stock: 22, fecha: hoy, imagen: "img/pantalones-03.jpg" },
        { id: "pantalones-04", nombre: "Jogger gris", categoria: "pantalones", descripcion: "Puños elásticos", precio: 79.90, stock: 5, fecha: hoy, imagen: "img/pantalones-04.jpg" },
        { id: "pantalones-05", nombre: "Pantalón chino beige", categoria: "pantalones", descripcion: "Corte recto", precio: 89.90, stock: 27, fecha: hoy, imagen: "img/pantalones-05.jpg" },
        { id: "pantalones-06", nombre: "Jean wide leg celeste", categoria: "pantalones", descripcion: "Pierna ancha", precio: 104.90, stock: 14, fecha: hoy, imagen: "img/pantalones-06.jpg" },
        { id: "pantalones-07", nombre: "Pantalón de vestir marino", categoria: "pantalones", descripcion: "Con pinzas y caída", precio: 119.90, stock: 8, fecha: hoy, imagen: "img/pantalones-07.jpg" },
        { id: "pantalones-08", nombre: "Cargo verde oliva", categoria: "pantalones", descripcion: "Bolsillos amplios", precio: 114.90, stock: 20, fecha: hoy, imagen: "img/pantalones-08.jpg" },
        { id: "shorts-01", nombre: "Short denim", categoria: "shorts", descripcion: "Largo a la rodilla", precio: 59.90, stock: 3, fecha: hoy, imagen: "img/shorts-01.jpg" },
        { id: "shorts-02", nombre: "Short cargo beige", categoria: "shorts", descripcion: "Bolsillos laterales", precio: 64.90, stock: 17, fecha: hoy, imagen: "img/shorts-02.jpg" },
        { id: "shorts-03", nombre: "Short deportivo negro", categoria: "shorts", descripcion: "Tela ligera con cordón", precio: 44.90, stock: 11, fecha: hoy, imagen: "img/shorts-03.jpg" },
        { id: "shorts-04", nombre: "Short de lino blanco", categoria: "shorts", descripcion: "Fresco para la playa", precio: 54.90, stock: 26, fecha: hoy, imagen: "img/shorts-04.jpg" },
        { id: "shorts-05", nombre: "Bermuda verde", categoria: "shorts", descripcion: "Algodón grueso", precio: 59.90, stock: 6, fecha: hoy, imagen: "img/shorts-05.jpg" },
        { id: "shorts-06", nombre: "Short de baño azul", categoria: "shorts", descripcion: "Secado rápido", precio: 49.90, stock: 13, fecha: hoy, imagen: "img/shorts-06.jpg" },
        { id: "vestidos-01", nombre: "Vestido negro midi", categoria: "vestidos", descripcion: "Elegante para toda ocasión", precio: 129.90, stock: 19, fecha: hoy, imagen: "img/vestidos-01.jpg" },
        { id: "vestidos-02", nombre: "Vestido floral crema", categoria: "vestidos", descripcion: "Estampado de flores", precio: 139.90, stock: 4, fecha: hoy, imagen: "img/vestidos-02.jpg" },
        { id: "vestidos-03", nombre: "Vestido rojo", categoria: "vestidos", descripcion: "Para eventos especiales", precio: 149.90, stock: 21, fecha: hoy, imagen: "img/vestidos-03.jpg" },
        { id: "vestidos-04", nombre: "Vestido de lino arena", categoria: "vestidos", descripcion: "Liviano y fresco", precio: 119.90, stock: 10, fecha: hoy, imagen: "img/vestidos-04.jpg" },
        { id: "vestidos-05", nombre: "Vestido celeste", categoria: "vestidos", descripcion: "Ideal para el verano", precio: 109.90, stock: 16, fecha: hoy, imagen: "img/vestidos-05.jpg" },
        { id: "vestidos-06", nombre: "Vestido rayas marino", categoria: "vestidos", descripcion: "Rayas horizontales", precio: 114.90, stock: 28, fecha: hoy, imagen: "img/vestidos-06.jpg" },
        { id: "vestidos-07", nombre: "Vestido verde esmeralda", categoria: "vestidos", descripcion: "Tela con caída", precio: 144.90, stock: 7, fecha: hoy, imagen: "img/vestidos-07.jpg" },
        { id: "calzado-01", nombre: "Zapatillas urbanas blancas", categoria: "calzado", descripcion: "Suela de goma, diseño limpio", precio: 159.90, stock: 23, fecha: hoy, imagen: "img/calzado-01.jpg" },
        { id: "calzado-02", nombre: "Zapatillas negras low", categoria: "calzado", descripcion: "Uso diario", precio: 149.90, stock: 12, fecha: hoy, imagen: "img/calzado-02.jpg" },
        { id: "calzado-03", nombre: "Zapatillas retro crema", categoria: "calzado", descripcion: "Estilo años 90", precio: 169.90, stock: 25, fecha: hoy, imagen: "img/calzado-03.jpg" },
        { id: "calzado-04", nombre: "Zapatillas rojas", categoria: "calzado", descripcion: "Color que resalta", precio: 159.90, stock: 24, fecha: hoy, imagen: "img/calzado-04.jpg" },
        { id: "calzado-05", nombre: "Zapatillas azules", categoria: "calzado", descripcion: "Detalles blancos", precio: 164.90, stock: 18, fecha: hoy, imagen: "img/calzado-05.jpg" },
        { id: "calzado-06", nombre: "Zapatillas high top negras", categoria: "calzado", descripcion: "Caña alta", precio: 179.90, stock: 12, fecha: hoy, imagen: "img/calzado-06.jpg" },
        { id: "calzado-07", nombre: "Zapatillas verde oliva", categoria: "calzado", descripcion: "Tono tierra", precio: 154.90, stock: 30, fecha: hoy, imagen: "img/calzado-07.jpg" },
        { id: "calzado-08", nombre: "Zapatillas grises running", categoria: "calzado", descripcion: "Ligeras y flexibles", precio: 169.90, stock: 9, fecha: hoy, imagen: "img/calzado-08.jpg" },
        { id: "calzado-09", nombre: "Zapatillas rosa pastel", categoria: "calzado", descripcion: "Suela blanca", precio: 154.90, stock: 15, fecha: hoy, imagen: "img/calzado-09.jpg" },
        { id: "gafas-01", nombre: "Gafas redondas negras", categoria: "gafas", descripcion: "Protección UV400", precio: 69.90, stock: 22, fecha: hoy, imagen: "img/gafas-01.jpg" },
        { id: "gafas-02", nombre: "Gafas aviador dorado", categoria: "gafas", descripcion: "Montura metálica", precio: 79.90, stock: 5, fecha: hoy, imagen: "img/gafas-02.jpg" },
        { id: "gafas-03", nombre: "Gafas wayfarer carey", categoria: "gafas", descripcion: "Montura gruesa", precio: 74.90, stock: 27, fecha: hoy, imagen: "img/gafas-03.jpg" },
        { id: "gafas-04", nombre: "Gafas cuadradas azul", categoria: "gafas", descripcion: "Lentes degradados", precio: 64.90, stock: 14, fecha: hoy, imagen: "img/gafas-04.jpg" },
        { id: "gafas-05", nombre: "Gafas ojo de gato rosa", categoria: "gafas", descripcion: "Estilo retro", precio: 69.90, stock: 8, fecha: hoy, imagen: "img/gafas-05.jpg" },
        { id: "gafas-06", nombre: "Gafas deportivas", categoria: "gafas", descripcion: "Lente envolvente", precio: 59.90, stock: 20, fecha: hoy, imagen: "img/gafas-06.jpg" },
        { id: "relojes-01", nombre: "Reloj clásico negro", categoria: "relojes", descripcion: "Correa de silicona", precio: 189.90, stock: 3, fecha: hoy, imagen: "img/relojes-01.jpg" },
        { id: "relojes-02", nombre: "Reloj plateado minimal", categoria: "relojes", descripcion: "Esfera blanca", precio: 209.90, stock: 17, fecha: hoy, imagen: "img/relojes-02.jpg" },
        { id: "relojes-03", nombre: "Reloj dorado", categoria: "relojes", descripcion: "Acabado dorado", precio: 229.90, stock: 11, fecha: hoy, imagen: "img/relojes-03.jpg" },
        { id: "relojes-04", nombre: "Reloj deportivo azul", categoria: "relojes", descripcion: "Resistente al agua", precio: 179.90, stock: 26, fecha: hoy, imagen: "img/relojes-04.jpg" },
        { id: "relojes-05", nombre: "Reloj de cuero café", categoria: "relojes", descripcion: "Correa de cuero", precio: 199.90, stock: 6, fecha: hoy, imagen: "img/relojes-05.jpg" },
        { id: "relojes-06", nombre: "Reloj digital negro", categoria: "relojes", descripcion: "Pantalla digital", precio: 119.90, stock: 13, fecha: hoy, imagen: "img/relojes-06.jpg" },
        { id: "collares-01", nombre: "Collar cadena plateada", categoria: "collares", descripcion: "Cadena fina", precio: 49.90, stock: 19, fecha: hoy, imagen: "img/collares-01.jpg" },
        { id: "collares-02", nombre: "Collar dorado con dije", categoria: "collares", descripcion: "Dije circular", precio: 59.90, stock: 4, fecha: hoy, imagen: "img/collares-02.jpg" },
        { id: "collares-03", nombre: "Collar de perlas", categoria: "collares", descripcion: "Perlas cultivadas", precio: 69.90, stock: 21, fecha: hoy, imagen: "img/collares-03.jpg" },
        { id: "collares-04", nombre: "Collar cruz negro", categoria: "collares", descripcion: "Cordón con cruz", precio: 44.90, stock: 10, fecha: hoy, imagen: "img/collares-04.jpg" },
        { id: "collares-05", nombre: "Collar eslabones gruesos", categoria: "collares", descripcion: "Estilo urbano", precio: 64.90, stock: 16, fecha: hoy, imagen: "img/collares-05.jpg" },
        { id: "gorras-01", nombre: "Gorra negra clásica", categoria: "gorras", descripcion: "Ajustable", precio: 39.90, stock: 28, fecha: hoy, imagen: "img/gorras-01.jpg" },
        { id: "gorras-02", nombre: "Gorra beige", categoria: "gorras", descripcion: "Algodón, visera curva", precio: 39.90, stock: 7, fecha: hoy, imagen: "img/gorras-02.jpg" },
        { id: "gorras-03", nombre: "Gorra azul marino", categoria: "gorras", descripcion: "Ajustable", precio: 42.90, stock: 23, fecha: hoy, imagen: "img/gorras-03.jpg" },
        { id: "gorras-04", nombre: "Gorra blanca", categoria: "gorras", descripcion: "Visera curva", precio: 39.90, stock: 12, fecha: hoy, imagen: "img/gorras-04.jpg" },
        { id: "gorras-05", nombre: "Gorra verde oliva", categoria: "gorras", descripcion: "Tono tierra", precio: 42.90, stock: 25, fecha: hoy, imagen: "img/gorras-05.jpg" }
    ];
}

// =====================================================
// 1. FUNCIONES DE AYUDA
// =====================================================

// Lee un dato guardado en el navegador (localStorage)
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
    } catch (error) {
        console.warn("No se pudo guardar", clave);
    }
}

function fechaHoy() {
    return new Date().toLocaleDateString("es-PE");
}

function formatoPrecio(numero) {
    return "S/ " + Number(numero).toFixed(2);
}

// Evita que un texto escrito por el administrador rompa el HTML
function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function nombreCategoria(id) {
    for (let categoria of CATEGORIAS) {
        if (categoria.id === id) {
            return categoria.nombre;
        }
    }
    return id;
}

// Busca un producto por su id. Usa for + break para parar al encontrarlo.
function buscarProducto(id) {
    let encontrado = null;
    for (let producto of productos) {
        if (producto.id === id) {
            encontrado = producto;
            break;
        }
    }
    return encontrado;
}

// Genera un id nuevo que no exista (while repite hasta encontrar uno libre)
function generarId() {
    let numero = productos.length + 1;
    while (buscarProducto("prod-" + numero) !== null) {
        numero = numero + 1;
    }
    return "prod-" + numero;
}

// Estado de la aplicación (variables globales)
localStorage.removeItem("novak_productos"); // catálogo de la versión anterior
let productos = leerLocal(CLAVE_PRODUCTOS, null);
if (!Array.isArray(productos) || productos.length === 0) {
    productos = productosIniciales();
    guardarLocal(CLAVE_PRODUCTOS, productos);
}

let carrito = leerLocal("carrito", []);
let sesion = leerLocal("novak_sesion", null);
let pagina = document.body.dataset.pagina || "index";

// Limpia el carrito: quita productos que ya no existen y respeta el stock
function limpiarCarrito() {
    let limpio = [];
    for (let item of carrito) {
        let producto = buscarProducto(item.id);
        if (producto !== null && producto.stock > 0) {
            limpio.push({ id: item.id, cantidad: Math.min(item.cantidad, producto.stock) });
        }
    }
    carrito = limpio;
}

function guardarProductos() {
    guardarLocal(CLAVE_PRODUCTOS, productos);
}

function guardarCarrito() {
    guardarLocal("carrito", carrito);
    mostrarContador();
    dibujarCarrito();
}

// =====================================================
// 2. SESIÓN: LOGIN, REGISTRO Y CIERRE
// =====================================================
function esAdmin() {
    return sesion !== null && sesion.rol === "admin";
}

function iniciarSesion(cuenta) {
    sesion = { usuario: cuenta.usuario, nombre: cuenta.nombre, rol: cuenta.rol };
    guardarLocal("novak_sesion", sesion);
}

function cerrarSesion() {
    if (!confirm("¿Quieres cerrar sesión?")) {
        return;
    }
    localStorage.removeItem("novak_sesion");
    sesion = null;
    window.location.href = "index.html";
}

// Une las cuentas demo con las que se crearon en el registro
function todasLasCuentas() {
    return CUENTAS_DEMO.concat(leerLocal("novak_usuarios", []));
}

function destinoDespuesDeLogin() {
    let destino = new URLSearchParams(window.location.search).get("volver");
    if (destino !== null && PAGINAS_PERMITIDAS.includes(destino)) {
        return destino;
    }
    return "catalogo.html";
}

// =====================================================
// 3. CABECERA, MENÚ HAMBURGUESA Y PIE DE PÁGINA
// =====================================================
function dibujarCabecera() {
    let cabecera = document.getElementById("cabecera");
    if (cabecera === null) {
        return;
    }

    // Cada enlace del menú es un objeto; se arma la lista con un ciclo
    let enlaces = [
        { archivo: "index", texto: "Inicio", href: "index.html" },
        { archivo: "catalogo", texto: "Catálogo", href: "catalogo.html" }
    ];
    if (sesion === null) {
        enlaces.push({ archivo: "registro", texto: "Registro", href: "registro.html" });
    }
    if (esAdmin()) {
        enlaces.push({ archivo: "admin", texto: "Inventario", href: "admin.html" });
    }
    enlaces.push({ archivo: "contacto", texto: "Contacto", href: "contacto.html" });
    enlaces.push({ archivo: "carrito", texto: "Carrito", href: "carrito.html", contador: true });

    let lista = "";
    for (let enlace of enlaces) {
        let actual = enlace.archivo === pagina ? ' aria-current="page"' : "";
        let contador = enlace.contador ? ' <span class="contador-carrito">0</span>' : "";
        lista += '<li><a href="' + enlace.href + '"' + actual + ">" + enlace.texto + contador + "</a></li>";
    }

    let zonaSesion;
    if (sesion !== null) {
        let etiqueta = esAdmin() ? '<span class="etiqueta-rol">Admin</span>' : "";
        zonaSesion = '<span class="sesion-nombre">Hola, ' + escapar(sesion.nombre.split(" ")[0]) + etiqueta + "</span>" +
            '<button type="button" class="boton boton-claro boton-chico" data-accion="salir">Salir</button>';
    } else {
        zonaSesion = '<a class="boton boton-chico" href="login.html">Ingresar</a>';
    }

    cabecera.innerHTML =
        '<div class="cabecera-interior">' +
        '<a class="logo" href="index.html">NOVAK</a>' +
        '<button type="button" class="nav-toggle" aria-label="Abrir menú" aria-expanded="false" aria-controls="panel-menu">' +
        "<span></span><span></span><span></span></button>" +
        '<div class="cabecera-panel" id="panel-menu">' +
        '<nav class="menu" aria-label="Menú principal"><ul>' + lista + "</ul></nav>" +
        '<div class="sesion">' + zonaSesion + "</div>" +
        "</div></div>";
}

// Abre o cierra el menú en celulares usando classList.toggle
function alternarMenu(forzarCierre) {
    let cabecera = document.getElementById("cabecera");
    let boton = document.querySelector(".nav-toggle");
    if (cabecera === null || boton === null) {
        return;
    }
    let abierto;
    if (forzarCierre) {
        cabecera.classList.remove("abierto");
        abierto = false;
    } else {
        abierto = cabecera.classList.toggle("abierto");
    }
    boton.setAttribute("aria-expanded", abierto);
    boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
}

function dibujarPie() {
    let pie = document.getElementById("pie");
    if (pie === null) {
        return;
    }
    pie.innerHTML =
        '<div class="pie-interior">' +
        '<div class="pie-marca"><strong>NOVAK</strong><p>STAY DIFFERENT</p>' +
        '<p>Moda urbana para vestir a tu estilo.</p>' +
        '<div class="pie-redes">' +
        '<a class="red" href="#" aria-label="NOVAK en Instagram">IG</a>' +
        '<a class="red" href="#" aria-label="NOVAK en Facebook">FB</a>' +
        '<a class="red" href="#" aria-label="NOVAK en TikTok">TT</a></div></div>' +
        '<div><h3>Explora</h3><ul class="pie-enlaces">' +
        '<li><a href="catalogo.html">Catálogo</a></li>' +
        '<li><a href="carrito.html">Carrito</a></li>' +
        '<li><a href="contacto.html">Contacto</a></li>' +
        '<li><a href="login.html">Ingresar</a></li></ul></div>' +
        '<address><h3>Escríbenos</h3><p>contacto@novak.pe</p><p>999 999 999</p>' +
        "<p>Lunes a viernes, 09:00 - 19:00</p></address>" +
        "</div>" +
        '<p class="pie-derechos">&copy; ' + new Date().getFullYear() + " NOVAK. Todos los derechos reservados.</p>";
}

// Muestra la cantidad de prendas junto a "Carrito"
function mostrarContador() {
    let cantidad = 0;
    for (let item of carrito) {
        cantidad = cantidad + item.cantidad;
    }
    let contadores = document.getElementsByClassName("contador-carrito");
    for (let contador of contadores) {
        contador.textContent = cantidad;
    }
}

// =====================================================
// 4. AVISOS (TOASTS) Y VENTANAS FLOTANTES (MODALES)
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

    // A los 3 segundos el aviso se elimina del DOM
    setTimeout(function () {
        if (toast.parentNode === contenedor) {
            contenedor.removeChild(toast);
        }
    }, 3000);
}

// Una sola ventana flotante que se reutiliza con distinto contenido
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

    // Clic en el fondo oscuro cierra la ventana
    modal.addEventListener("click", function (evento) {
        if (evento.target === modal) {
            cerrarModal();
        }
    });
}

function abrirModal(html) {
    if (modal === null) {
        crearModal();
    }
    focoAnterior = document.activeElement;
    modalCuerpo.innerHTML = html;
    activarImagenesDeRespaldo(modalCuerpo);
    modal.classList.add("abierto");
    document.body.classList.add("sin-scroll");

    let primero = modalCuerpo.querySelector("input, select, textarea, .boton");
    (primero || modal.querySelector(".modal-cerrar")).focus();
}

function cerrarModal() {
    if (modal === null || !modal.classList.contains("abierto")) {
        return;
    }
    modal.classList.remove("abierto");
    document.body.classList.remove("sin-scroll");
    modalCuerpo.innerHTML = "";
    if (focoAnterior !== null && document.body.contains(focoAnterior)) {
        focoAnterior.focus();
    }
}

function modalAbierto() {
    return modal !== null && modal.classList.contains("abierto");
}

// Si una imagen no carga, se reemplaza por la imagen de respaldo
function activarImagenesDeRespaldo(contenedor) {
    for (let imagen of contenedor.getElementsByTagName("img")) {
        if (imagen.dataset.respaldo === "si") {
            continue;
        }
        imagen.dataset.respaldo = "si";
        imagen.addEventListener("error", function () {
            imagen.src = IMG_RESPALDO;
        });
        if (imagen.complete && imagen.naturalWidth === 0) {
            imagen.src = IMG_RESPALDO;
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

// =====================================================
// 5. PRODUCTOS: TARJETAS, CATÁLOGO, FILTROS Y ORDEN
// =====================================================
let categoriaActiva = "todos";

function crearTarjeta(p, conAdmin) {
    let agotado = p.stock <= 0;
    let sello = "";
    if (agotado) {
        sello = '<span class="sello sello-agotado">Agotado</span>';
    } else if (p.stock <= 5) {
        sello = '<span class="sello sello-poco">Últimas ' + p.stock + "</span>";
    }

    let admin = "";
    if (conAdmin && esAdmin()) {
        admin = '<div class="producto-admin">' +
            '<button type="button" class="boton boton-claro boton-chico" data-accion="editar" data-id="' + escapar(p.id) + '">Editar</button>' +
            '<button type="button" class="boton boton-peligro boton-chico" data-accion="eliminar" data-id="' + escapar(p.id) + '">Eliminar</button>' +
            "</div>";
    }

    return '<article class="producto' + (agotado ? " agotado" : "") + '" data-id="' + escapar(p.id) + '">' +
        '<button type="button" class="producto-imagen" data-accion="detalle" data-id="' + escapar(p.id) + '" aria-label="Ver detalle de ' + escapar(p.nombre) + '">' +
        '<img src="' + escapar(p.imagen || IMG_RESPALDO) + '" alt="' + escapar(p.nombre) + '" loading="lazy" width="400" height="500">' +
        '<span class="etiqueta">' + escapar(nombreCategoria(p.categoria)) + "</span>" + sello +
        "</button>" +
        '<div class="producto-info">' +
        "<h3>" + escapar(p.nombre) + "</h3>" +
        '<p class="producto-desc">' + escapar(p.descripcion || "") + "</p>" +
        '<div class="producto-precio"><span class="precio">' + formatoPrecio(p.precio) + "</span>" +
        '<span class="stock-texto">' + (agotado ? "Sin stock" : p.stock + " disponibles") + "</span></div>" +
        '<button type="button" class="boton btn-agregar" data-accion="agregar" data-id="' + escapar(p.id) + '"' + (agotado ? " disabled" : "") + ">" +
        (agotado ? "Agotado" : "Agregar") + "</button>" +
        admin + "</div></article>";
}

// Devuelve los productos que cumplen la búsqueda y la categoría, ya ordenados
function productosFiltrados() {
    let buscador = document.getElementById("buscador");
    let texto = buscador !== null ? buscador.value.trim().toLowerCase() : "";
    let lista = [];

    for (let producto of productos) {
        let coincideTexto = (producto.nombre + " " + producto.descripcion).toLowerCase().includes(texto);
        let coincideCategoria = categoriaActiva === "todos" || producto.categoria === categoriaActiva;
        if (coincideTexto && coincideCategoria) {
            lista.push(producto);
        }
    }

    let selectorOrden = document.getElementById("orden");
    let orden = selectorOrden !== null ? selectorOrden.value : "recientes";
    if (orden === "precio-asc") {
        lista.sort(function (a, b) { return a.precio - b.precio; });
    } else if (orden === "precio-desc") {
        lista.sort(function (a, b) { return b.precio - a.precio; });
    } else if (orden === "nombre") {
        lista.sort(function (a, b) { return a.nombre.localeCompare(b.nombre, "es"); });
    }
    return lista;
}

// Botones de categoría (se crean con createElement y appendChild)
function dibujarChips() {
    let contenedor = document.getElementById("chips");
    if (contenedor === null) {
        return;
    }
    contenedor.innerHTML = "";

    let conteo = {};
    for (let producto of productos) {
        conteo[producto.categoria] = (conteo[producto.categoria] || 0) + 1;
    }

    let opciones = [{ id: "todos", nombre: "Todos", total: productos.length }];
    for (let categoria of CATEGORIAS) {
        opciones.push({ id: categoria.id, nombre: categoria.nombre, total: conteo[categoria.id] || 0 });
    }

    for (let opcion of opciones) {
        let boton = document.createElement("button");
        boton.type = "button";
        boton.className = "chip" + (opcion.id === categoriaActiva ? " activo" : "");
        boton.dataset.categoria = opcion.id;
        boton.textContent = opcion.nombre + " (" + opcion.total + ")";
        boton.setAttribute("aria-pressed", opcion.id === categoriaActiva);
        contenedor.appendChild(boton);
    }
}

function dibujarCatalogo() {
    let contenedor = document.getElementById("catalogo");
    if (contenedor === null) {
        return;
    }

    // La barra de administrador solo aparece si la sesión es de admin
    document.getElementById("aviso-admin").hidden = !esAdmin();

    dibujarChips();
    let lista = productosFiltrados();
    let html = "";
    for (let producto of lista) {
        html += crearTarjeta(producto, true);
    }
    contenedor.innerHTML = html;
    activarImagenesDeRespaldo(contenedor);

    document.getElementById("sin-resultados").hidden = lista.length > 0;
    document.getElementById("contador-resultados").textContent =
        "Mostrando " + lista.length + " de " + productos.length + " prendas";
}

// Las prendas de la lista DESTACADOS aparecen en el inicio
function dibujarDestacados() {
    let contenedor = document.getElementById("destacados");
    if (contenedor === null) {
        return;
    }
    let html = "";
    for (let id of DESTACADOS) {
        let producto = buscarProducto(id);
        if (producto !== null) {
            html += crearTarjeta(producto, false);
        }
    }
    contenedor.innerHTML = html;
    activarImagenesDeRespaldo(contenedor);
}

function mostrarDetalle(id) {
    let p = buscarProducto(id);
    if (p === null) {
        return;
    }
    let agotado = p.stock <= 0;
    abrirModal(
        '<div class="detalle">' +
        '<div class="detalle-imagen"><img src="' + escapar(p.imagen || IMG_RESPALDO) + '" alt="' + escapar(p.nombre) + '"></div>' +
        '<div class="detalle-info">' +
        '<span class="etiqueta-simple">' + escapar(nombreCategoria(p.categoria)) + "</span>" +
        '<h2 id="modal-titulo">' + escapar(p.nombre) + "</h2>" +
        "<p>" + escapar(p.descripcion || "Sin descripción.") + "</p>" +
        '<p class="precio">' + formatoPrecio(p.precio) + "</p>" +
        '<p class="stock-texto">' + (agotado ? "Sin stock por ahora" : p.stock + " unidades disponibles") + "</p>" +
        '<button type="button" class="boton" data-accion="agregar" data-id="' + escapar(p.id) + '"' + (agotado ? " disabled" : "") + ">" +
        (agotado ? "Agotado" : "Agregar al carrito") + "</button>" +
        "</div></div>"
    );
}

// =====================================================
// 6. ADMINISTRADOR: AGREGAR, EDITAR, ELIMINAR Y STOCK
// Cada acción guarda los datos y vuelve a dibujar la página,
// así el cambio se ve al instante.
// =====================================================
function exigirAdmin() {
    if (!esAdmin()) {
        mostrarToast("Solo el administrador puede hacer esto.", "error");
        return false;
    }
    return true;
}

function abrirFormularioProducto(id) {
    if (!exigirAdmin()) {
        return;
    }
    let p = id ? buscarProducto(id) : null;
    let datos = p || { nombre: "", categoria: "polos", descripcion: "", precio: "", stock: "", imagen: "" };

    let opciones = "";
    for (let categoria of CATEGORIAS) {
        opciones += '<option value="' + categoria.id + '"' + (datos.categoria === categoria.id ? " selected" : "") + ">" + categoria.nombre + "</option>";
    }

    abrirModal(
        '<h2 id="modal-titulo">' + (p ? "Editar producto" : "Agregar producto") + "</h2>" +
        '<form id="form-producto" novalidate data-id="' + (p ? escapar(p.id) : "") + '">' +
        '<div class="grupo-formulario"><label for="pNombre">Nombre:</label>' +
        '<input type="text" id="pNombre" name="nombre" value="' + escapar(datos.nombre) + '" placeholder="Ej. Polo estampado" maxlength="50"></div>' +
        '<div class="fila-doble">' +
        '<div class="grupo-formulario"><label for="pCategoria">Categoría:</label><select id="pCategoria" name="categoria">' + opciones + "</select></div>" +
        '<div class="grupo-formulario"><label for="pPrecio">Precio (S/):</label>' +
        '<input type="number" id="pPrecio" name="precio" value="' + escapar(datos.precio) + '" min="0.1" step="0.10" placeholder="0.00"></div></div>' +
        '<div class="fila-doble">' +
        '<div class="grupo-formulario"><label for="pStock">Stock:</label>' +
        '<input type="number" id="pStock" name="stock" value="' + escapar(datos.stock) + '" min="0" step="1" placeholder="0"></div>' +
        '<div class="grupo-formulario"><label for="pDesc">Descripción corta:</label>' +
        '<input type="text" id="pDesc" name="descripcion" value="' + escapar(datos.descripcion) + '" maxlength="60" placeholder="Ej. Algodón 100%"></div></div>' +
        '<div class="grupo-formulario"><label for="pImagen">Enlace de la imagen (opcional):</label>' +
        '<input type="url" id="pImagen" name="imagen" value="' + escapar(datos.imagen) + '" placeholder="https://..."></div>' +
        '<div class="botones-accion"><button type="submit" class="boton">' + (p ? "Guardar cambios" : "Agregar producto") + "</button>" +
        '<button type="button" class="boton boton-claro" data-accion="cerrar-modal">Cancelar</button></div>' +
        '<p class="mensaje" role="alert" hidden></p></form>'
    );
}

function guardarFormularioProducto(formulario) {
    let nombre = formulario.nombre.value.trim();
    let precio = parseFloat(formulario.precio.value);
    let stock = parseInt(formulario.stock.value, 10);
    let imagen = formulario.imagen.value.trim();

    if (nombre.length < 3) {
        mostrarMensaje(formulario, "El nombre debe tener al menos 3 letras.", true);
        return;
    }
    if (isNaN(precio) || precio <= 0) {
        mostrarMensaje(formulario, "Ingresa un precio mayor que 0.", true);
        return;
    }
    if (isNaN(stock) || stock < 0) {
        mostrarMensaje(formulario, "El stock debe ser 0 o más.", true);
        return;
    }
    if (imagen !== "" && !/^(https?:\/\/|data:image\/)/i.test(imagen)) {
        mostrarMensaje(formulario, "El enlace de la imagen debe empezar con http:// o https://", true);
        return;
    }

    let datos = {
        nombre: nombre,
        categoria: formulario.categoria.value,
        descripcion: formulario.descripcion.value.trim(),
        precio: Math.round(precio * 100) / 100,
        stock: stock,
        imagen: imagen
    };

    let id = formulario.dataset.id;
    let mensaje;
    if (id !== "") {
        Object.assign(buscarProducto(id), datos);
        mensaje = "Producto actualizado: " + nombre;
    } else {
        datos.id = generarId();
        datos.fecha = fechaHoy();
        productos.push(datos);
        mensaje = "Producto agregado: " + nombre;
    }

    guardarProductos();
    limpiarCarrito();
    guardarLocal("carrito", carrito);
    cerrarModal();
    dibujarTodo();
    mostrarToast(mensaje, "ok");
}

function eliminarProducto(id) {
    if (!exigirAdmin()) {
        return;
    }
    let p = buscarProducto(id);
    if (p === null) {
        return;
    }
    if (!confirm('¿Eliminar "' + p.nombre + '" de la tienda? Esta acción no se puede deshacer.')) {
        return;
    }
    productos = productos.filter(function (producto) { return producto.id !== id; });
    guardarProductos();
    limpiarCarrito();
    guardarLocal("carrito", carrito);
    dibujarTodo();
    mostrarToast("Producto eliminado: " + p.nombre, "ok");
}

// Pide la nueva cantidad con prompt() y repite (do...while) hasta que sea válida
function actualizarStock(id) {
    if (!exigirAdmin()) {
        return;
    }
    let p = buscarProducto(id);
    if (p === null) {
        return;
    }

    let nuevo;
    let valido;
    do {
        let texto = prompt('Nueva cantidad en stock para "' + p.nombre + '" (actual: ' + p.stock + "):", p.stock);
        if (texto === null) {
            return; // el administrador canceló
        }
        nuevo = parseInt(texto, 10);
        valido = !isNaN(nuevo) && nuevo >= 0;
        if (!valido) {
            alert("Ingresa un número entero igual o mayor que 0.");
        }
    } while (!valido);

    p.stock = nuevo;
    guardarProductos();
    limpiarCarrito();
    guardarLocal("carrito", carrito);
    dibujarTodo();
    mostrarToast("Stock de " + p.nombre + ": " + nuevo + " unidades", "ok");
}

// Tabla de inventario y estadísticas (admin.html)
function dibujarInventario() {
    let cuerpo = document.getElementById("cuerpo-inventario");
    if (cuerpo === null) {
        return;
    }

    let buscador = document.getElementById("buscador");
    let texto = buscador !== null ? buscador.value.trim().toLowerCase() : "";

    cuerpo.innerHTML = "";
    let filas = 0;
    for (let p of productos) {
        if (!p.nombre.toLowerCase().includes(texto)) {
            continue;
        }
        filas++;
        let claseStock = p.stock <= 0 ? " agotado" : (p.stock <= 5 ? " poco" : "");
        let fila = cuerpo.insertRow();
        fila.innerHTML =
            '<td><div class="celda-producto"><img class="miniatura" src="' + escapar(p.imagen || IMG_RESPALDO) + '" alt="" width="52" height="64"><span>' + escapar(p.nombre) + "</span></div></td>" +
            "<td>" + escapar(nombreCategoria(p.categoria)) + "</td>" +
            "<td>" + formatoPrecio(p.precio) + "</td>" +
            '<td><span class="stock-pastilla' + claseStock + '">' + p.stock + "</span></td>" +
            "<td>" + escapar(p.fecha || "-") + "</td>" +
            '<td><div class="acciones-fila">' +
            '<button type="button" class="boton boton-claro boton-chico" data-accion="editar" data-id="' + escapar(p.id) + '">Editar</button>' +
            '<button type="button" class="boton boton-claro boton-chico" data-accion="stock" data-id="' + escapar(p.id) + '">Actualizar stock</button>' +
            '<button type="button" class="boton boton-peligro boton-chico" data-accion="eliminar" data-id="' + escapar(p.id) + '">Eliminar</button>' +
            "</div></td>";
    }
    activarImagenesDeRespaldo(cuerpo);

    document.getElementById("sin-inventario").hidden = filas > 0;

    // Estadísticas: se recorren los productos y se cuenta por categoría con for...in
    let unidades = 0;
    let valor = 0;
    let agotados = 0;
    let porCategoria = {};
    for (let p of productos) {
        unidades += p.stock;
        valor += p.precio * p.stock;
        if (p.stock <= 0) {
            agotados++;
        }
        porCategoria[p.categoria] = (porCategoria[p.categoria] || 0) + 1;
    }
    let detalle = "";
    for (let categoria in porCategoria) {
        detalle += nombreCategoria(categoria) + ": " + porCategoria[categoria] + " · ";
    }

    document.getElementById("estadisticas").innerHTML =
        '<div class="estadistica"><strong>' + productos.length + "</strong><span>Productos</span></div>" +
        '<div class="estadistica"><strong>' + unidades + "</strong><span>Unidades en stock</span></div>" +
        '<div class="estadistica"><strong>' + formatoPrecio(valor) + "</strong><span>Valor del inventario</span></div>" +
        '<div class="estadistica"><strong>' + agotados + "</strong><span>Agotados</span></div>";
    document.getElementById("detalle-categorias").textContent = detalle.slice(0, -3);
}

// =====================================================
// 7. CARRITO Y COMPRA
// =====================================================
function agregarAlCarrito(id) {
    let producto = buscarProducto(id);
    if (producto === null) {
        return false;
    }

    let item = carrito.find(function (i) { return i.id === id; });
    let enCarrito = item ? item.cantidad : 0;

    if (producto.stock <= 0) {
        mostrarToast("Este producto está agotado.", "error");
        return false;
    }
    if (enCarrito + 1 > producto.stock) {
        mostrarToast("Solo quedan " + producto.stock + " unidades de " + producto.nombre + ".", "error");
        return false;
    }

    if (item) {
        item.cantidad = item.cantidad + 1;
    } else {
        carrito.push({ id: id, cantidad: 1 });
    }
    guardarCarrito();
    mostrarToast(producto.nombre + " se agregó al carrito.", "ok");
    return true;
}

function cambiarCantidad(id, cambio) {
    let item = carrito.find(function (i) { return i.id === id; });
    let producto = buscarProducto(id);
    if (!item || producto === null) {
        return;
    }
    let nueva = item.cantidad + cambio;
    if (nueva > producto.stock) {
        mostrarToast("No hay más unidades disponibles.", "error");
        return;
    }
    if (nueva <= 0) {
        carrito = carrito.filter(function (i) { return i.id !== id; });
    } else {
        item.cantidad = nueva;
    }
    guardarCarrito();
}

function totalCarrito() {
    let total = 0;
    for (let item of carrito) {
        let producto = buscarProducto(item.id);
        if (producto !== null) {
            total = total + producto.precio * item.cantidad;
        }
    }
    return total;
}

function dibujarCarrito() {
    let cuerpo = document.getElementById("cuerpo-carrito");
    if (cuerpo === null) {
        return;
    }

    cuerpo.innerHTML = "";
    let vacio = carrito.length === 0;
    document.getElementById("carrito-vacio").hidden = !vacio;
    document.getElementById("tabla-carrito").hidden = vacio;

    for (let item of carrito) {
        let p = buscarProducto(item.id);
        if (p === null) {
            continue;
        }
        let fila = cuerpo.insertRow();
        fila.innerHTML =
            '<td><div class="celda-producto"><img class="miniatura" src="' + escapar(p.imagen || IMG_RESPALDO) + '" alt="" width="52" height="64"><span>' + escapar(p.nombre) + "</span></div></td>" +
            '<td><div class="cantidad">' +
            '<button type="button" data-accion="restar" data-id="' + escapar(p.id) + '" aria-label="Quitar una unidad de ' + escapar(p.nombre) + '">&minus;</button>' +
            "<span>" + item.cantidad + "</span>" +
            '<button type="button" data-accion="sumar" data-id="' + escapar(p.id) + '" aria-label="Agregar una unidad de ' + escapar(p.nombre) + '">+</button></div></td>' +
            "<td>" + formatoPrecio(p.precio) + "</td>" +
            "<td>" + formatoPrecio(p.precio * item.cantidad) + "</td>" +
            '<td><button type="button" class="btn-quitar" data-accion="quitar" data-id="' + escapar(p.id) + '">Quitar</button></td>';
    }
    activarImagenesDeRespaldo(cuerpo);

    let total = formatoPrecio(totalCarrito());
    document.getElementById("total-carrito").textContent = total;
    document.getElementById("total-pagar").textContent = total;
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        return;
    }
    if (confirm("¿Quieres vaciar tu carrito?")) {
        carrito = [];
        guardarCarrito();
    }
}

// Prepara el formulario de compra según haya o no una sesión iniciada
function prepararCompra() {
    let formulario = document.getElementById("form-compra");
    let aviso = document.getElementById("aviso-login");
    if (formulario === null) {
        return;
    }
    if (sesion === null) {
        formulario.hidden = true;
        aviso.hidden = false;
        return;
    }
    formulario.hidden = false;
    aviso.hidden = true;
    formulario.nombre.value = sesion.nombre;
    let cuenta = todasLasCuentas().find(function (c) { return c.usuario === sesion.usuario; });
    if (cuenta && cuenta.correo) {
        formulario.correo.value = cuenta.correo;
    }
}

function confirmarCompra(formulario) {
    if (sesion === null) {
        mostrarMensaje(formulario, "Inicia sesión para finalizar tu compra.", true);
        return;
    }
    if (carrito.length === 0) {
        mostrarMensaje(formulario, "Tu carrito está vacío. Agrega productos desde el catálogo.", true);
        return;
    }

    // Revisa que todavía haya stock suficiente (se detiene con break al primer problema)
    let problema = "";
    for (let item of carrito) {
        let p = buscarProducto(item.id);
        if (p === null || item.cantidad > p.stock) {
            problema = p === null ? "Un producto de tu carrito ya no está disponible." : "No hay stock suficiente de " + p.nombre + ".";
            break;
        }
    }
    if (problema !== "") {
        limpiarCarrito();
        guardarCarrito();
        mostrarMensaje(formulario, problema + " Revisamos tu carrito.", true);
        return;
    }

    // Arma el resumen y descuenta el stock
    let lineas = "";
    let total = totalCarrito();
    for (let item of carrito) {
        let p = buscarProducto(item.id);
        lineas += "<li><span>" + item.cantidad + " × " + escapar(p.nombre) + "</span><span>" + formatoPrecio(p.precio * item.cantidad) + "</span></li>";
        p.stock = p.stock - item.cantidad;
    }
    lineas += "<li><span>Total</span><span>" + formatoPrecio(total) + "</span></li>";

    let pedido = "NV-" + String(Date.now()).slice(-6);
    guardarProductos();
    carrito = [];
    guardarCarrito();
    formulario.reset();
    formulario.hidden = true;
    document.getElementById("compra-lista").hidden = false;

    abrirModal(
        '<h2 id="modal-titulo">¡Gracias por tu compra!</h2>' +
        "<p>Tu pedido <strong>" + pedido + "</strong> se registró el " + fechaHoy() + ". Te enviaremos la confirmación a tu correo.</p>" +
        '<ul class="resumen-pedido">' + lineas + "</ul>" +
        '<a class="boton" href="catalogo.html">Seguir comprando</a>'
    );
}

// =====================================================
// 8. FORMULARIOS (SUBMIT)
// =====================================================
function procesarLogin(formulario) {
    let usuario = formulario.usuario.value.trim().toLowerCase();
    let clave = formulario.clave.value;

    // getElementsByName devuelve todos los radios "rol"; se busca el marcado
    let rol = "usuario";
    for (let opcion of document.getElementsByName("rol")) {
        if (opcion.checked) {
            rol = opcion.value;
            break;
        }
    }

    let cuenta = null;
    for (let c of todasLasCuentas()) {
        if ((c.usuario === usuario || c.correo === usuario) && c.clave === clave) {
            cuenta = c;
            break;
        }
    }

    if (cuenta === null) {
        mostrarMensaje(formulario, "Usuario o contraseña incorrectos.", true);
        return;
    }
    if (cuenta.rol !== rol) {
        mostrarMensaje(formulario, cuenta.rol === "admin"
            ? "Esta cuenta es de administrador. Elige la opción Administrador."
            : "Esta cuenta es de cliente. Elige la opción Cliente.", true);
        return;
    }

    iniciarSesion(cuenta);
    mostrarMensaje(formulario, "Bienvenido, " + cuenta.nombre + ". Entrando...", false);
    window.location.href = destinoDespuesDeLogin();
}

function procesarRegistro(formulario) {
    let correo = formulario.correo.value.trim().toLowerCase();
    for (let c of todasLasCuentas()) {
        if (c.usuario === correo || c.correo === correo) {
            mostrarMensaje(formulario, "Ya existe una cuenta con ese correo. Ingresa desde Login.", true);
            return;
        }
    }

    let prendas = [];
    for (let casilla of document.getElementsByName("prendas")) {
        if (casilla.checked) {
            prendas.push(casilla.value);
        }
    }
    let talla = formulario.querySelector('input[name="talla"]:checked');

    let cuenta = {
        usuario: correo,
        correo: correo,
        clave: formulario.clave.value,
        nombre: formulario.nombre.value.trim(),
        rol: "usuario",
        talla: talla ? talla.value : "",
        prendas: prendas,
        estilo: formulario.estilo.value
    };

    let usuarios = leerLocal("novak_usuarios", []);
    usuarios.push(cuenta);
    guardarLocal("novak_usuarios", usuarios);

    iniciarSesion(cuenta);
    mostrarMensaje(formulario, "¡Registro exitoso! Bienvenido a NOVAK.", false);
    setTimeout(function () {
        window.location.href = "catalogo.html";
    }, 1200);
}

// Un solo "submit" para todos los formularios de la tienda
document.addEventListener("submit", function (evento) {
    let formulario = evento.target;
    evento.preventDefault();

    if (formulario.id === "form-producto") {
        guardarFormularioProducto(formulario);
    } else if (formulario.id === "form-login") {
        procesarLogin(formulario);
    } else if (formulario.id === "form-registro") {
        procesarRegistro(formulario);
    } else if (formulario.id === "form-compra") {
        confirmarCompra(formulario);
    } else if (formulario.dataset.exito) {
        mostrarMensaje(formulario, formulario.dataset.exito, false);
        mostrarToast("Mensaje enviado.", "ok");
        formulario.reset();
    }
});

// =====================================================
// 9. EVENTOS GENERALES
// =====================================================

// Un solo "click" para todos los botones que tienen data-accion
document.addEventListener("click", function (evento) {
    let objetivo = evento.target;

    // Tarjetas "Sobre NOVAK": en el celular se giran al tocar
    let tarjeta = objetivo.closest(".flip");
    if (tarjeta !== null) {
        tarjeta.classList.toggle("girada");
    }

    // Botones de categoría del catálogo
    let chip = objetivo.closest(".chip");
    if (chip !== null) {
        categoriaActiva = chip.dataset.categoria;
        dibujarCatalogo();
        return;
    }

    // Botón hamburguesa
    if (objetivo.closest(".nav-toggle") !== null) {
        alternarMenu(false);
        return;
    }

    // Al tocar un enlace del menú, se cierra el menú móvil
    if (objetivo.closest(".menu a") !== null) {
        alternarMenu(true);
    }

    let boton = objetivo.closest("[data-accion]");
    if (boton === null) {
        return;
    }
    let id = boton.dataset.id;

    switch (boton.dataset.accion) {
        case "agregar":
            if (agregarAlCarrito(id)) {
                let textoOriginal = boton.textContent;
                boton.textContent = "¡Agregado!";
                boton.classList.add("agregado");
                setTimeout(function () {
                    boton.textContent = textoOriginal;
                    boton.classList.remove("agregado");
                }, 1000);
            }
            break;
        case "detalle": mostrarDetalle(id); break;
        case "nuevo": abrirFormularioProducto(null); break;
        case "editar": abrirFormularioProducto(id); break;
        case "eliminar": eliminarProducto(id); break;
        case "stock": actualizarStock(id); break;
        case "sumar": cambiarCantidad(id, 1); break;
        case "restar": cambiarCantidad(id, -1); break;
        case "quitar": cambiarCantidad(id, -carrito.find(function (i) { return i.id === id; }).cantidad); break;
        case "vaciar": vaciarCarrito(); break;
        case "salir": cerrarSesion(); break;
        case "cerrar-modal": cerrarModal(); break;
    }
});

// Buscador en tiempo real: se actualiza cada vez que se suelta una tecla
document.addEventListener("keyup", function (evento) {
    if (evento.target.id === "buscador") {
        dibujarCatalogo();
        dibujarInventario();
    }
});

document.addEventListener("change", function (evento) {
    if (evento.target.id === "orden") {
        dibujarCatalogo();
    }
});

document.addEventListener("keydown", function (evento) {
    // Escape cierra la ventana flotante y el menú
    if (evento.key === "Escape") {
        cerrarModal();
        alternarMenu(true);
    }

    // Dentro de la ventana flotante, Tab no se sale de ella
    if (evento.key === "Tab" && modalAbierto()) {
        let elementos = modal.querySelectorAll("button, input, select, textarea, a[href]");
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

// Si otra pestaña cambia los productos o el carrito, esta se actualiza sola
window.addEventListener("storage", function (evento) {
    if (evento.key === CLAVE_PRODUCTOS) {
        productos = leerLocal(CLAVE_PRODUCTOS, productos);
    }
    if (evento.key === "carrito") {
        carrito = leerLocal("carrito", []);
    }
    if (evento.key === CLAVE_PRODUCTOS || evento.key === "carrito") {
        limpiarCarrito();
        dibujarTodo();
    }
});

// =====================================================
// 10. AL CARGAR LA PÁGINA
// =====================================================

// Vuelve a dibujar todo lo que exista en la página actual
function dibujarTodo() {
    dibujarCatalogo();
    dibujarDestacados();
    dibujarInventario();
    dibujarCarrito();
    mostrarContador();
}

// Página de login: si ya hay sesión, se muestra un resumen en vez del formulario
function prepararLogin() {
    let contenido = document.getElementById("login-contenido");
    if (contenido === null || sesion === null) {
        return;
    }
    contenido.innerHTML =
        "<h2>Ya iniciaste sesión</h2>" +
        "<p>Ingresaste como <strong>" + escapar(sesion.nombre) + "</strong> (" + (esAdmin() ? "administrador" : "cliente") + ").</p>" +
        '<div class="botones-accion"><a class="boton" href="catalogo.html">Ir al catálogo</a>' +
        '<button type="button" class="boton boton-claro" data-accion="salir">Cerrar sesión</button></div>';
}

// El panel de administración solo se abre si la sesión es de administrador
if (pagina === "admin" && !esAdmin()) {
    window.location.replace("login.html?volver=admin.html");
}

limpiarCarrito();
guardarLocal("carrito", carrito);
dibujarCabecera();
dibujarPie();
dibujarTodo();
prepararCompra();
prepararLogin();

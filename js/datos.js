/* =====================================================
   NOVAK - datos.js
   Todo lo que la tienda "sabe" al iniciar:
   1. Categorías, segmentos y plantillas de especificaciones
   2. Catálogo base (80 prendas) y su enriquecimiento
      (tallas, colores, 4 vistas, especificaciones, ofertas)
   3. Cuentas, clientes y pedidos de ejemplo para las estadísticas
   4. Cupones y campaña de ofertas
   Los datos se guardan en localStorage la primera vez; después
   el administrador los cambia desde el panel.
===================================================== */

const CATEGORIAS = [
    { id: "polos", nombre: "Polos", segmento: "ropa", portada: "img/polos-04.jpg" },
    { id: "camisas", nombre: "Camisas", segmento: "ropa", portada: "img/camisas-04.jpg" },
    { id: "hoodies", nombre: "Hoodies", segmento: "ropa", portada: "img/hoodies-08.jpg" },
    { id: "casacas", nombre: "Casacas", segmento: "ropa", portada: "img/casacas-07.jpg" },
    { id: "pantalones", nombre: "Pantalones", segmento: "ropa", portada: "img/pantalones-06.jpg" },
    { id: "shorts", nombre: "Shorts", segmento: "ropa", portada: "img/shorts-03.jpg" },
    { id: "vestidos", nombre: "Vestidos", segmento: "ropa", portada: "img/vestidos-03.jpg" },
    { id: "calzado", nombre: "Zapatillas", segmento: "calzado", portada: "img/calzado-04.jpg" },
    { id: "gafas", nombre: "Gafas", segmento: "accesorios", portada: "img/gafas-02.jpg" },
    { id: "relojes", nombre: "Relojes", segmento: "accesorios", portada: "img/relojes-03.jpg" },
    { id: "collares", nombre: "Collares", segmento: "accesorios", portada: "img/collares-05.jpg" },
    { id: "gorras", nombre: "Gorras", segmento: "accesorios", portada: "img/gorras-02.jpg" }
];

const SEGMENTOS = { ropa: "Ropa", calzado: "Calzado", accesorios: "Accesorios" };
const GENEROS = { hombre: "Hombre", mujer: "Mujer", unisex: "Unisex" };
const VISTAS = [
    { id: "frente", nombre: "Frente" },
    { id: "espalda", nombre: "Espalda" },
    { id: "izquierda", nombre: "Lado izquierdo" },
    { id: "derecha", nombre: "Lado derecho" }
];

// Paleta de colores que reconoce la tienda (nombre -> hex)
const COLORES = {
    "Blanco": "#f4f4f2", "Negro": "#1b1b1f", "Gris": "#9a9ca3", "Beige": "#d9c7a7", "Marino": "#1f2a4d",
    "Oliva": "#6b6f3a", "Celeste": "#9cc5e8", "Burdeos": "#7a1f33", "Arena": "#cdb891", "Rojo": "#c62b35",
    "Crema": "#efe4cf", "Rosa": "#f3b8c4", "Terracota": "#d2642f", "Café": "#7a4b2a", "Dorado": "#c9a248",
    "Plateado": "#c2c5cc", "Azul": "#2d5bd3", "Verde": "#2f6b45", "Carey": "#6b3e1f", "Denim": "#4a6d9c"
};

// Plantillas por categoría: tallas, material, cuidado y otros datos de ficha
const PLANTILLAS = {
    polos: { tallas: ["XS", "S", "M", "L", "XL"], material: "Algodón 100% peinado, 180 g/m²", fit: "Regular", cuidado: "Lavar en frío al revés. No usar secadora.", extras: ["Cuello redondo reforzado", "Costuras dobles"], alternos: ["Negro", "Blanco"] },
    camisas: { tallas: ["S", "M", "L", "XL"], material: "Algodón 97%, elastano 3%", fit: "Regular", cuidado: "Lavar a 30 °C. Planchar a temperatura media.", extras: ["Botones de nácar sintético", "Manga con puño ajustable"], alternos: ["Blanco", "Celeste"] },
    hoodies: { tallas: ["XS", "S", "M", "L", "XL"], material: "Algodón 80%, poliéster 20%, interior afelpado 320 g/m²", fit: "Oversize", cuidado: "Lavar en frío. Secar a la sombra.", extras: ["Bolsillo canguro", "Capucha con doble forro"], alternos: ["Negro", "Gris"] },
    casacas: { tallas: ["S", "M", "L", "XL"], material: "Exterior poliéster/algodón, forro 100% poliéster", fit: "Regular", cuidado: "Lavado delicado en frío. No usar lejía.", extras: ["Bolsillos laterales", "Cierre frontal resistente"], alternos: ["Negro"] },
    pantalones: { tallas: ["28", "30", "32", "34", "36"], material: "Denim/drill de algodón 98%, elastano 2%", fit: "Regular", cuidado: "Lavar al revés en frío para conservar el color.", extras: ["5 bolsillos", "Tiro medio"], alternos: ["Negro"] },
    shorts: { tallas: ["S", "M", "L", "XL"], material: "Algodón 100% / poliéster de secado rápido", fit: "Regular", cuidado: "Lavar en frío.", extras: ["Pretina con cordón", "Largo sobre la rodilla"], alternos: ["Negro"] },
    vestidos: { tallas: ["XS", "S", "M", "L"], material: "Viscosa 95%, elastano 5%", fit: "Entallado", cuidado: "Lavado a mano o ciclo delicado.", extras: ["Forro interior", "Cierre invisible"], alternos: ["Negro"] },
    calzado: { tallas: ["37", "38", "39", "40", "41", "42", "43"], material: "Capellada de cuero sintético y textil, suela de caucho", fit: "Horma normal", cuidado: "Limpiar con paño húmedo. No lavar a máquina.", extras: ["Plantilla acolchada", "Suela antideslizante"], alternos: ["Blanco", "Negro"] },
    gafas: { tallas: ["Única"], material: "Montura de acetato/metal, lentes de policarbonato", fit: "Ajuste estándar", cuidado: "Limpiar con paño de microfibra.", extras: ["Protección UV400", "Incluye estuche"], alternos: ["Negro"] },
    relojes: { tallas: ["Única"], material: "Caja de acero inoxidable, cristal mineral", fit: "Correa ajustable", cuidado: "Evitar golpes y perfumes sobre la correa.", extras: ["Resistente a salpicaduras", "Garantía de 1 año"], alternos: ["Negro", "Plateado"] },
    collares: { tallas: ["Única"], material: "Acero quirúrgico 316L hipoalergénico", fit: "Largo 50 cm + 5 cm de extensión", cuidado: "Guardar en lugar seco, evitar el agua de mar.", extras: ["No se oscurece", "Cierre de mosquetón"], alternos: ["Dorado", "Plateado"] },
    gorras: { tallas: ["Única"], material: "Algodón 100% con visera rígida", fit: "Ajustable (54–60 cm)", cuidado: "Limpiar a mano con agua fría.", extras: ["Bordado frontal", "Cierre trasero regulable"], alternos: ["Negro", "Beige"] }
};

// Género de cada prenda (si no está aquí, se usa el de la categoría)
const GENERO_CATEGORIA = { vestidos: "mujer", camisas: "hombre", shorts: "hombre", relojes: "hombre" };
const GENERO_PRODUCTO = {
    "pantalones-06": "mujer", "pantalones-07": "mujer", "pantalones-03": "mujer", "pantalones-04": "unisex",
    "relojes-02": "mujer", "relojes-03": "mujer", "relojes-06": "unisex",
    "collares-02": "mujer", "collares-03": "mujer", "collares-01": "hombre", "collares-05": "unisex",
    "hoodies-07": "mujer", "gafas-05": "mujer", "calzado-09": "mujer", "polos-05": "mujer",
    "casacas-03": "mujer", "casacas-05": "mujer"
};

// Apertura de bota (cm) para la sección "Encuentra tu fit"
const FITS_PANTALON = {
    "pantalones-06": { fit: "Wide leg", bota: 26 }, "pantalones-08": { fit: "Cargo", bota: 24 },
    "pantalones-03": { fit: "Baggy", bota: 25 }, "pantalones-05": { fit: "Straight", bota: 21 },
    "jean-slim": { fit: "Slim fit", bota: 17 }, "pantalones-04": { fit: "Jogger", bota: 14 },
    "pantalones-07": { fit: "Palazzo", bota: 28 }, "pantalon-cargo": { fit: "Cargo", bota: 22 }
};

const IMG_RESPALDO = "data:image/svg+xml;utf8," + encodeURIComponent(
    "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'>" +
    "<rect width='400' height='500' fill='#ececf0'/>" +
    "<text x='200' y='260' font-family='Arial' font-size='44' font-weight='700' letter-spacing='6' " +
    "fill='#1f2038' text-anchor='middle'>NOVAK</text></svg>"
);

const UNSPLASH = "https://images.unsplash.com/photo-";

// [id, nombre, categoría, descripción corta, precio, stock, imagen]
const CATALOGO_BASE = [
    ["polo-blanco", "Polo básico blanco", "polos", "Algodón 100%", 39.90, 24, UNSPLASH + "1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&h=750&q=80"],
    ["polo-negro", "Polo oversize negro", "polos", "Corte holgado urbano", 49.90, 18, UNSPLASH + "1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&h=750&q=80"],
    ["polos-03", "Polo rayas marino", "polos", "Algodón con rayas horizontales", 54.90, 12, "img/polos-03.jpg"],
    ["polos-04", "Polo oversize gris", "polos", "Corte holgado, tela suave", 49.90, 30, "img/polos-04.jpg"],
    ["polos-05", "Polo boxy beige", "polos", "Corte recto y fresco", 52.90, 9, "img/polos-05.jpg"],
    ["polos-06", "Polo estampado NOVAK", "polos", "Logo en el pecho", 59.90, 15, "img/polos-06.jpg"],
    ["polos-07", "Polo verde oliva", "polos", "Algodón peinado", 44.90, 22, "img/polos-07.jpg"],
    ["polos-08", "Polo celeste lavado", "polos", "Efecto lavado suave", 44.90, 5, "img/polos-08.jpg"],
    ["polos-09", "Polo burdeos", "polos", "Color intenso, uso diario", 46.90, 27, "img/polos-09.jpg"],
    ["camisas-01", "Camisa oxford celeste", "camisas", "Algodón oxford, manga larga", 79.90, 14, "img/camisas-01.jpg"],
    ["camisas-02", "Camisa de lino arena", "camisas", "Fresca para el verano", 89.90, 8, "img/camisas-02.jpg"],
    ["camisas-03", "Camisa blanca clásica", "camisas", "Para toda ocasión", 74.90, 20, "img/camisas-03.jpg"],
    ["camisas-04", "Camisa a cuadros rojo", "camisas", "Estilo casual", 84.90, 3, "img/camisas-04.jpg"],
    ["camisas-05", "Camisa negra", "camisas", "Tela lisa, acabado elegante", 94.90, 17, "img/camisas-05.jpg"],
    ["camisas-06", "Camisa overshirt oliva", "camisas", "Gruesa, se usa abierta", 99.90, 11, "img/camisas-06.jpg"],
    ["camisas-07", "Camisa de rayas azul", "camisas", "Rayas verticales finas", 79.90, 26, "img/camisas-07.jpg"],
    ["hoodies-01", "Hoodie negro básico", "hoodies", "Interior afelpado", 119.90, 6, "img/hoodies-01.jpg"],
    ["hoodies-02", "Hoodie gris melange", "hoodies", "Capucha con cordones", 114.90, 13, "img/hoodies-02.jpg"],
    ["hoodies-03", "Hoodie crema", "hoodies", "Tono neutro, combina con todo", 124.90, 19, "img/hoodies-03.jpg"],
    ["hoodies-04", "Hoodie burdeos", "hoodies", "Algodón grueso", 119.90, 4, "img/hoodies-04.jpg"],
    ["hoodies-05", "Hoodie azul marino", "hoodies", "Bolsillo canguro", 119.90, 21, "img/hoodies-05.jpg"],
    ["hoodies-06", "Hoodie verde bosque", "hoodies", "Corte relajado", 124.90, 10, "img/hoodies-06.jpg"],
    ["hoodies-07", "Hoodie rosa palo", "hoodies", "Suave y abrigador", 119.90, 16, "img/hoodies-07.jpg"],
    ["hoodies-08", "Hoodie oversize terracota", "hoodies", "Corte holgado urbano", 129.90, 28, "img/hoodies-08.jpg"],
    ["casaca-jean", "Casaca de jean", "casacas", "Estilo urbano", 89.90, 7, UNSPLASH + "1551028719-00167b16eac5?auto=format&fit=crop&w=600&h=750&q=80"],
    ["casaca-bomber", "Casaca bomber", "casacas", "Liviana y abrigadora", 119.90, 23, UNSPLASH + "1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&h=750&q=80"],
    ["casacas-03", "Bomber verde militar", "casacas", "Liviana, cierre frontal", 129.90, 12, "img/casacas-03.jpg"],
    ["casacas-04", "Casaca denim negra", "casacas", "Botones y bolsillos", 99.90, 25, "img/casacas-04.jpg"],
    ["casacas-05", "Rompevientos celeste", "casacas", "Ligera e impermeable", 109.90, 24, "img/casacas-05.jpg"],
    ["casacas-06", "Casaca corduroy café", "casacas", "Pana, estilo retro", 134.90, 18, "img/casacas-06.jpg"],
    ["casacas-07", "Casaca varsity", "casacas", "Mangas en contraste", 149.90, 12, "img/casacas-07.jpg"],
    ["casacas-08", "Casaca acolchada negra", "casacas", "Abrigadora y ligera", 159.90, 30, "img/casacas-08.jpg"],
    ["jean-slim", "Jean slim azul", "pantalones", "Denim elástico", 94.90, 9, UNSPLASH + "1542272604-787c3835535d?auto=format&fit=crop&w=600&h=750&q=80"],
    ["pantalon-cargo", "Pantalón cargo", "pantalones", "Bolsillos laterales", 109.90, 15, UNSPLASH + "1473966968600-fa801b869a1a?auto=format&fit=crop&w=600&h=750&q=80"],
    ["pantalones-03", "Pantalón baggy negro", "pantalones", "Denim rígido, pierna amplia", 99.90, 22, "img/pantalones-03.jpg"],
    ["pantalones-04", "Jogger gris", "pantalones", "Puños elásticos", 79.90, 5, "img/pantalones-04.jpg"],
    ["pantalones-05", "Pantalón chino beige", "pantalones", "Corte recto", 89.90, 27, "img/pantalones-05.jpg"],
    ["pantalones-06", "Jean wide leg celeste", "pantalones", "Pierna ancha", 104.90, 14, "img/pantalones-06.jpg"],
    ["pantalones-07", "Pantalón palazzo marino", "pantalones", "Tiro alto y caída fluida", 119.90, 8, "img/pantalones-07.jpg"],
    ["pantalones-08", "Cargo verde oliva", "pantalones", "Bolsillos amplios", 114.90, 20, "img/pantalones-08.jpg"],
    ["shorts-01", "Short denim", "shorts", "Largo a la rodilla", 59.90, 3, "img/shorts-01.jpg"],
    ["shorts-02", "Short cargo beige", "shorts", "Bolsillos laterales", 64.90, 17, "img/shorts-02.jpg"],
    ["shorts-03", "Short deportivo negro", "shorts", "Tela ligera con cordón", 44.90, 11, "img/shorts-03.jpg"],
    ["shorts-04", "Short de lino blanco", "shorts", "Fresco para la playa", 54.90, 26, "img/shorts-04.jpg"],
    ["shorts-05", "Bermuda verde", "shorts", "Algodón grueso", 59.90, 6, "img/shorts-05.jpg"],
    ["shorts-06", "Short de baño celeste", "shorts", "Secado rápido", 49.90, 13, "img/shorts-06.jpg"],
    ["vestidos-01", "Vestido negro midi", "vestidos", "Elegante para toda ocasión", 129.90, 19, "img/vestidos-01.jpg"],
    ["vestidos-02", "Vestido floral crema", "vestidos", "Estampado de flores", 139.90, 4, "img/vestidos-02.jpg"],
    ["vestidos-03", "Vestido rojo", "vestidos", "Para eventos especiales", 149.90, 21, "img/vestidos-03.jpg"],
    ["vestidos-04", "Vestido de lino arena", "vestidos", "Liviano y fresco", 119.90, 10, "img/vestidos-04.jpg"],
    ["vestidos-05", "Vestido celeste", "vestidos", "Ideal para el verano", 109.90, 16, "img/vestidos-05.jpg"],
    ["vestidos-06", "Vestido rayas marino", "vestidos", "Rayas horizontales", 114.90, 28, "img/vestidos-06.jpg"],
    ["vestidos-07", "Vestido verde esmeralda", "vestidos", "Tela con caída", 144.90, 7, "img/vestidos-07.jpg"],
    ["calzado-01", "Zapatillas urbanas blancas", "calzado", "Suela de goma, diseño limpio", 159.90, 23, "img/calzado-01.jpg"],
    ["calzado-02", "Zapatillas negras low", "calzado", "Uso diario", 149.90, 12, "img/calzado-02.jpg"],
    ["calzado-03", "Zapatillas retro crema", "calzado", "Estilo años 90", 169.90, 25, "img/calzado-03.jpg"],
    ["calzado-04", "Zapatillas rojas", "calzado", "Color que resalta", 159.90, 24, "img/calzado-04.jpg"],
    ["calzado-05", "Zapatillas azules", "calzado", "Detalles negros", 164.90, 18, "img/calzado-05.jpg"],
    ["calzado-06", "Zapatillas high top negras", "calzado", "Caña alta", 179.90, 12, "img/calzado-06.jpg"],
    ["calzado-07", "Zapatillas verde oliva", "calzado", "Tono tierra", 154.90, 30, "img/calzado-07.jpg"],
    ["calzado-08", "Zapatillas grises running", "calzado", "Ligeras y flexibles", 169.90, 9, "img/calzado-08.jpg"],
    ["calzado-09", "Zapatillas rosa pastel", "calzado", "Suela blanca", 154.90, 15, "img/calzado-09.jpg"],
    ["gafas-01", "Gafas redondas negras", "gafas", "Protección UV400", 69.90, 22, "img/gafas-01.jpg"],
    ["gafas-02", "Gafas aviador dorado", "gafas", "Montura metálica", 79.90, 5, "img/gafas-02.jpg"],
    ["gafas-03", "Gafas wayfarer carey", "gafas", "Montura gruesa", 74.90, 27, "img/gafas-03.jpg"],
    ["gafas-04", "Gafas cuadradas azul", "gafas", "Lentes degradados", 64.90, 14, "img/gafas-04.jpg"],
    ["gafas-05", "Gafas ojo de gato rosa", "gafas", "Estilo retro", 69.90, 8, "img/gafas-05.jpg"],
    ["gafas-06", "Gafas deportivas", "gafas", "Lente envolvente", 59.90, 20, "img/gafas-06.jpg"],
    ["relojes-01", "Reloj clásico negro", "relojes", "Correa de cuero", 189.90, 3, "img/relojes-01.jpg"],
    ["relojes-02", "Reloj plateado minimal", "relojes", "Esfera blanca", 209.90, 17, "img/relojes-02.jpg"],
    ["relojes-03", "Reloj dorado", "relojes", "Acabado dorado", 229.90, 11, "img/relojes-03.jpg"],
    ["relojes-04", "Reloj deportivo azul", "relojes", "Resistente al agua", 179.90, 26, "img/relojes-04.jpg"],
    ["relojes-05", "Reloj de cuero café", "relojes", "Correa de cuero", 199.90, 6, "img/relojes-05.jpg"],
    ["relojes-06", "Reloj digital negro", "relojes", "Pantalla digital", 119.90, 13, "img/relojes-06.jpg"],
    ["collares-01", "Collar cadena plateada", "collares", "Cadena cubana", 49.90, 19, "img/collares-01.jpg"],
    ["collares-02", "Collar dorado con dije", "collares", "Dije de corazón", 59.90, 4, "img/collares-02.jpg"],
    ["collares-03", "Collar de perlas", "collares", "Perlas cultivadas", 69.90, 21, "img/collares-03.jpg"],
    ["collares-04", "Collar cruz negro", "collares", "Cadena con cruz", 44.90, 10, "img/collares-04.jpg"],
    ["collares-05", "Collar eslabones dorado", "collares", "Eslabones gruesos", 64.90, 16, "img/collares-05.jpg"],
    ["gorras-01", "Gorra negra clásica", "gorras", "Ajustable", 39.90, 28, "img/gorras-01.jpg"],
    ["gorras-02", "Gorra trucker beige", "gorras", "Malla trasera, visera curva", 39.90, 7, "img/gorras-02.jpg"],
    ["gorras-03", "Gorra azul marino", "gorras", "Ajustable", 42.90, 23, "img/gorras-03.jpg"],
    ["gorras-04", "Gorra blanca", "gorras", "Visera curva", 39.90, 12, "img/gorras-04.jpg"],
    ["gorras-05", "Gorra verde oliva", "gorras", "Tono tierra", 42.90, 25, "img/gorras-05.jpg"]
];

// Ofertas iniciales de la campaña (id -> % de descuento)
const OFERTAS_INICIALES = {
    "polo-negro": 20, "polos-06": 30, "polos-09": 25, "camisas-04": 35, "camisas-06": 20,
    "hoodies-02": 30, "hoodies-08": 40, "hoodies-06": 25, "casaca-bomber": 30, "casacas-07": 20,
    "casacas-08": 35, "pantalones-06": 25, "pantalones-08": 30, "shorts-02": 40, "vestidos-03": 30,
    "vestidos-02": 20, "calzado-04": 25, "calzado-03": 20, "calzado-08": 35, "gafas-02": 50,
    "gafas-04": 30, "relojes-04": 30, "relojes-02": 15, "collares-05": 40, "gorras-02": 30
};
const NUEVOS_INICIALES = ["hoodies-07", "hoodies-03", "casacas-05", "pantalones-07", "vestidos-05",
    "vestidos-07", "calzado-09", "calzado-07", "gafas-05", "collares-02", "polos-05", "shorts-04"];

// ---------- Generador de números pseudoaleatorios con semilla ----------
// Siempre da la misma secuencia, así los datos de ejemplo no cambian.
function crearAzar(semilla) {
    let a = semilla >>> 0;
    return function () {
        a = (a + 0x6D2B79F5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

// Detecta el color principal a partir del nombre de la prenda
function colorDesdeNombre(nombre) {
    let n = nombre.toLowerCase();
    let reglas = [
        ["blanc", "Blanco"], ["negr", "Negro"], ["gris", "Gris"], ["beige", "Beige"], ["marino", "Marino"],
        ["oliva", "Oliva"], ["militar", "Oliva"], ["celeste", "Celeste"], ["burdeos", "Burdeos"], ["arena", "Arena"],
        ["rojo", "Rojo"], ["roja", "Rojo"], ["crema", "Crema"], ["rosa", "Rosa"], ["terracota", "Terracota"],
        ["café", "Café"], ["dorad", "Dorado"], ["platead", "Plateado"], ["carey", "Carey"], ["verde", "Verde"],
        ["azul", "Azul"], ["jean", "Denim"], ["denim", "Denim"], ["perlas", "Blanco"], ["varsity", "Café"]
    ];
    for (let regla of reglas) {
        if (n.includes(regla[0])) {
            return regla[1];
        }
    }
    return "Negro";
}

function fechaISO(dias) {
    let d = new Date();
    d.setDate(d.getDate() + dias);
    return d.toISOString();
}

// Convierte una fila del catálogo base en una prenda completa
function enriquecerProducto(fila, azar, finCampana) {
    let id = fila[0], nombre = fila[1], categoria = fila[2];
    let plantilla = PLANTILLAS[categoria];
    let principal = colorDesdeNombre(nombre);
    let colores = [principal];
    for (let alterno of plantilla.alternos) {
        if (!colores.includes(alterno) && colores.length < 3) {
            colores.push(alterno);
        }
    }

    // Reparte el stock total entre las tallas (las del medio tienen más)
    let stockTallas = {};
    let total = fila[5];
    let pesos = plantilla.tallas.map(function (t, i) {
        let medio = (plantilla.tallas.length - 1) / 2;
        return 1.6 - Math.abs(i - medio) / Math.max(1, medio) + azar() * 0.4;
    });
    let sumaPesos = pesos.reduce(function (a, b) { return a + b; }, 0);
    let asignado = 0;
    plantilla.tallas.forEach(function (talla, i) {
        let cantidad = i === plantilla.tallas.length - 1 ? total - asignado : Math.floor(total * pesos[i] / sumaPesos);
        cantidad = Math.max(0, cantidad);
        stockTallas[talla] = cantidad;
        asignado += cantidad;
    });
    // Para que se vea realista, alguna talla extrema queda agotada
    if (plantilla.tallas.length > 3 && azar() < 0.3) {
        let extremo = plantilla.tallas[0];
        stockTallas[plantilla.tallas[1]] += stockTallas[extremo];
        stockTallas[extremo] = 0;
    }

    let genero = GENERO_PRODUCTO[id] || GENERO_CATEGORIA[categoria] || "unisex";
    let descuento = OFERTAS_INICIALES[id] || 0;
    let especificaciones = [
        ["Material", plantilla.material],
        ["Fit / ajuste", (FITS_PANTALON[id] ? FITS_PANTALON[id].fit : plantilla.fit)],
        ["Cuidado", plantilla.cuidado],
        ["Origen", categoria === "relojes" || categoria === "gafas" ? "Importado" : "Hecho en Perú"]
    ];
    if (FITS_PANTALON[id]) {
        especificaciones.push(["Apertura de bota", FITS_PANTALON[id].bota + " cm"]);
    }
    plantilla.extras.forEach(function (extra, i) {
        especificaciones.push(["Detalle " + (i + 1), extra]);
    });

    return {
        id: id,
        nombre: nombre,
        categoria: categoria,
        genero: genero,
        descripcion: fila[3],
        detalle: nombre + " de la línea NOVAK " + (genero === "unisex" ? "unisex" : "para " + GENEROS[genero].toLowerCase()) +
            ". " + fila[3] + ". Pensado para el día a día en la ciudad: combina fácil, se siente bien y resiste el uso. " +
            "El color de la foto es " + principal.toLowerCase() + ".",
        precio: fila[4],
        descuento: descuento,
        ofertaHasta: descuento > 0 ? finCampana : "",
        stockTallas: stockTallas,
        colores: colores.map(function (c) { return { nombre: c, hex: COLORES[c] }; }),
        especificaciones: especificaciones,
        imagen: fila[6],
        vistas: { espalda: "", izquierda: "", derecha: "" },
        nuevo: NUEVOS_INICIALES.includes(id),
        sku: "NVK-" + id.toUpperCase().replace(/[^A-Z0-9]/g, ""),
        fecha: new Date().toLocaleDateString("es-PE")
    };
}

function productosIniciales(finCampana) {
    let azar = crearAzar(2027);
    return CATALOGO_BASE.map(function (fila) {
        return enriquecerProducto(fila, azar, finCampana);
    });
}

// Convierte un producto de la versión anterior (sin tallas) al formato nuevo
function migrarProductoAntiguo(p) {
    let categoria = PLANTILLAS[p.categoria] ? p.categoria : "polos";
    let fila = [p.id, p.nombre, categoria, p.descripcion || "", Number(p.precio) || 0, Number(p.stock) || 0, p.imagen || ""];
    return enriquecerProducto(fila, crearAzar(p.id.length * 97), "");
}

// ---------- Cuentas ----------
const CUENTAS_DEMO = [
    { usuario: "cliente@novak.pe", correo: "cliente@novak.pe", clave: "cliente123", nombre: "Cliente Demo", rol: "usuario",
      genero: "femenino", nacimiento: "2001-05-14", telefono: "987 654 321", distrito: "Miraflores", talla: "M" },
    { usuario: "admin@novak.pe", correo: "admin@novak.pe", clave: "admin123", nombre: "Administrador", rol: "admin" }
];

// Clientes de ejemplo (contraseña novak123) con gustos distintos,
// para que el panel de estadísticas tenga información desde el inicio.
const CLIENTES_SEMILLA = [
    ["Camila Rojas", "camila.rojas@gmail.com", "femenino", "2003-02-11", "San Miguel", ["vestidos", "collares", "gafas"], "Rosa", "S"],
    ["Diego Mendoza", "diego.mendoza@gmail.com", "masculino", "1998-09-03", "Surco", ["hoodies", "calzado", "gorras"], "Negro", "L"],
    ["Valeria Torres", "vale.torres@hotmail.com", "femenino", "1995-12-22", "Miraflores", ["pantalones", "camisas", "relojes"], "Beige", "M"],
    ["Sebastián Quispe", "sebas.quispe@gmail.com", "masculino", "2004-06-30", "Los Olivos", ["polos", "shorts", "calzado"], "Blanco", "M"],
    ["Luciana Paredes", "lu.paredes@outlook.com", "femenino", "2000-03-17", "Jesús María", ["hoodies", "pantalones", "calzado"], "Gris", "S"],
    ["Mateo Castillo", "mateo.castillo@gmail.com", "masculino", "1993-11-05", "San Isidro", ["camisas", "relojes", "pantalones"], "Marino", "L"],
    ["Ariana Salazar", "ariana.sz@gmail.com", "femenino", "2005-08-19", "La Molina", ["vestidos", "calzado", "gafas"], "Celeste", "XS"],
    ["Joaquín Herrera", "joaco.herrera@gmail.com", "masculino", "1999-01-27", "Barranco", ["casacas", "gorras", "collares"], "Oliva", "M"],
    ["Fernanda Ríos", "fer.rios@yahoo.com", "femenino", "1991-04-09", "Pueblo Libre", ["camisas", "vestidos", "relojes"], "Blanco", "M"],
    ["Bruno Vargas", "bruno.vargas@gmail.com", "masculino", "2002-10-12", "Callao", ["hoodies", "pantalones", "gorras"], "Negro", "XL"],
    ["Daniela Flores", "dani.flores@gmail.com", "femenino", "1997-07-01", "Lince", ["polos", "shorts", "collares"], "Verde", "S"],
    ["Rodrigo Chávez", "rodrigo.chavez@gmail.com", "masculino", "1988-05-25", "Arequipa", ["calzado", "relojes", "casacas"], "Café", "L"],
    ["Cliente Demo", "cliente@novak.pe", "femenino", "2001-05-14", "Miraflores", ["hoodies", "vestidos", "calzado"], "Negro", "M"]
];

const METODOS_PAGO = {
    tarjeta: "Tarjeta de crédito / débito",
    yape: "Yape / Plin",
    pagoefectivo: "PagoEfectivo",
    transferencia: "Transferencia bancaria",
    contraentrega: "Pago contra entrega"
};
const ESTADOS_PEDIDO = ["Pendiente de pago", "Pagado", "Preparando", "En camino", "Entregado", "Cancelado"];

function clientesIniciales() {
    return CLIENTES_SEMILLA.filter(function (c) { return c[1] !== "cliente@novak.pe"; }).map(function (c) {
        return {
            usuario: c[1], correo: c[1], clave: "novak123", nombre: c[0], rol: "usuario",
            genero: c[2], nacimiento: c[3], distrito: c[4], talla: c[7], prendas: c[5],
            telefono: "9" + String(10000000 + c[0].length * 1234567).slice(0, 8), registro: fechaISO(-200)
        };
    });
}

// Historial de pedidos de los últimos 6 meses (no descuenta stock: es historia)
function pedidosIniciales(productos) {
    let azar = crearAzar(1995);
    let pedidos = [];
    let porCategoria = {};
    productos.forEach(function (p) {
        (porCategoria[p.categoria] = porCategoria[p.categoria] || []).push(p);
    });
    let metodos = ["tarjeta", "tarjeta", "tarjeta", "yape", "yape", "pagoefectivo", "transferencia", "contraentrega"];
    let numero = 10240;

    CLIENTES_SEMILLA.forEach(function (c, indice) {
        let cantidadPedidos = 3 + Math.floor(azar() * 8);
        let metodoFavorito = metodos[Math.floor(azar() * metodos.length)];
        for (let k = 0; k < cantidadPedidos; k++) {
            let dias = -Math.floor(2 + azar() * 178);
            let items = [];
            let lineas = 1 + Math.floor(azar() * 3);
            for (let l = 0; l < lineas; l++) {
                // 70% de las veces compra de sus categorías favoritas
                let categoria = azar() < 0.7 ? c[5][Math.floor(azar() * c[5].length)] : CATEGORIAS[Math.floor(azar() * CATEGORIAS.length)].id;
                let lista = porCategoria[categoria];
                // Prefiere prendas de su color favorito
                let delColor = lista.filter(function (p) { return p.colores[0].nombre === c[6]; });
                let p = (delColor.length > 0 && azar() < 0.55) ? delColor[Math.floor(azar() * delColor.length)] : lista[Math.floor(azar() * lista.length)];
                let tallas = Object.keys(p.stockTallas);
                let talla = tallas.includes(c[7]) ? c[7] : tallas[Math.floor(azar() * tallas.length)];
                if (tallas.length > 3 && !tallas.includes(c[7])) {
                    talla = tallas[Math.min(tallas.length - 1, Math.floor(tallas.length / 2) + (c[2] === "masculino" ? 1 : -1))];
                }
                let color = azar() < 0.8 ? p.colores[0].nombre : p.colores[Math.floor(azar() * p.colores.length)].nombre;
                let enOferta = p.descuento > 0 && azar() < 0.6;
                let unitario = enOferta ? redondear(p.precio * (1 - p.descuento / 100)) : p.precio;
                items.push({ id: p.id, nombre: p.nombre, categoria: p.categoria, talla: talla, color: color,
                    cantidad: azar() < 0.85 ? 1 : 2, precio: unitario, precioLista: p.precio, oferta: enOferta, imagen: p.imagen });
            }
            let subtotal = items.reduce(function (s, i) { return s + i.precio * i.cantidad; }, 0);
            let envio = subtotal >= 199 ? 0 : (c[4] === "Arequipa" ? 18 : 10);
            let estado = dias > -3 ? "Preparando" : (dias > -6 ? "En camino" : "Entregado");
            let metodo = azar() < 0.7 ? metodoFavorito : metodos[Math.floor(azar() * metodos.length)];
            pedidos.push({
                id: "NV-" + (numero++),
                cliente: c[1], nombre: c[0], fecha: fechaISO(dias), items: items,
                subtotal: redondear(subtotal), descuentoCupon: 0, cupon: "", envio: envio,
                total: redondear(subtotal + envio), metodo: metodo, estado: estado,
                entrega: { tipo: "domicilio", distrito: c[4], direccion: "Av. Principal " + (100 + indice * 37) },
                semilla: true
            });
        }
    });
    pedidos.sort(function (a, b) { return a.fecha < b.fecha ? -1 : 1; });
    return pedidos;
}

// Vistas y "agregados al carrito" de ejemplo, proporcionales a lo vendido
function eventosIniciales(productos, pedidos) {
    let azar = crearAzar(77);
    let vendidos = {};
    pedidos.forEach(function (ped) {
        ped.items.forEach(function (i) { vendidos[i.id] = (vendidos[i.id] || 0) + i.cantidad; });
    });
    let eventos = { vistas: {}, carrito: {}, vistasCliente: {} };
    productos.forEach(function (p) {
        let v = vendidos[p.id] || 0;
        eventos.vistas[p.id] = Math.round(v * (7 + azar() * 9) + 25 + azar() * 90);
        eventos.carrito[p.id] = Math.round(v * (1.6 + azar() * 1.6) + azar() * 8);
    });
    return eventos;
}

const CUPONES_INICIALES = [
    { codigo: "NOVAK10", tipo: "porcentaje", valor: 10, minimo: 0, activo: true, descripcion: "10% en toda la tienda" },
    { codigo: "BIENVENIDA15", tipo: "porcentaje", valor: 15, minimo: 150, activo: true, descripcion: "15% en tu primera compra desde S/ 150" },
    { codigo: "GENZ20", tipo: "monto", valor: 20, minimo: 120, activo: true, descripcion: "S/ 20 menos en compras desde S/ 120" },
    { codigo: "ENVIOGRATIS", tipo: "envio", valor: 0, minimo: 0, activo: true, descripcion: "Envío gratis sin mínimo" }
];

function redondear(n) {
    return Math.round(n * 100) / 100;
}

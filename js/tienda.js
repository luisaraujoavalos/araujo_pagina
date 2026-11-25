/* =====================================================
   NOVAK - tienda.js
   Lo que ve el cliente, página por página:
   1. Inicio (carrusel principal, categorías, ofertas, fits, para ti)
   2. Catálogo (filtros, orden y búsqueda)
   3. Ficha de producto (4 vistas, tallas, colores, especificaciones, reseñas)
   4. Carrito (cupones y envío gratis)
   5. Checkout (datos, entrega y pasarela de pago)
   6. Mi cuenta (pedidos, favoritos, datos y estilo)
   7. Login, registro y contacto
   8. Arranque de cada página
===================================================== */

// =====================================================
// 1. INICIO
// =====================================================
function diapositivasHero() {
    let fotos = "?auto=format&fit=crop&w=1900&q=80";
    return [
        { img: UNSPLASH + "1483985988355-763728e1935b" + fotos, alterna: "img/vestidos-02.jpg", tono: "rosa",
          etiqueta: "🔥 " + campana.nombre, titulo: "Hasta<br>50% off", texto: campana.subtitulo + ". Solo por tiempo limitado.",
          cta: ["Ver ofertas", "catalogo.html?oferta=1"], cta2: ["Usa el cupón GENZ20", "carrito.html"], cuenta: true },
        { img: UNSPLASH + "1490481651871-ab68de25d43d" + fotos, alterna: "img/hoodies-07.jpg", tono: "lila",
          etiqueta: "Nueva colección", titulo: "Drop de<br>verano 2027", texto: "Linos, tonos arena y cortes relajados para el calor de la ciudad.",
          cta: ["Descubrir lo nuevo", "catalogo.html?nuevo=1"], cta2: ["Shop mujer", "catalogo.html?genero=mujer"] },
        { img: UNSPLASH + "1503342217505-b0a15ec3261c" + fotos, alterna: "img/hoodies-08.jpg", tono: "tinta",
          etiqueta: "Ready for the street", titulo: "Hoodies &amp;<br>casacas", texto: "Oversize, afelpados y con la actitud que buscas. Desde S/ 89.90.",
          cta: ["Ver hoodies", "catalogo.html?cat=hoodies"], cta2: ["Ver casacas", "catalogo.html?cat=casacas"] },
        { img: UNSPLASH + "1441986300917-64674bd600d8" + fotos, alterna: "img/calzado-03.jpg", tono: "arena",
          etiqueta: "Compra online, recoge gratis", titulo: "Visítanos<br>en tienda", texto: "Pide desde la web y retira gratis en NOVAK Miraflores o Jockey Plaza en 24 horas.",
          cta: ["Ver zapatillas", "catalogo.html?cat=calzado"], cta2: ["Guía de tallas", "#guia"] },
        { img: UNSPLASH + "1529139574466-a303027c1d8b" + fotos, alterna: "img/gafas-05.jpg", tono: "lima", posicion: "center 22%",
          etiqueta: "El detalle hace el look", titulo: "Accesorios<br>desde S/ 39.90", texto: "Gafas, relojes, collares y gorras para cerrar tu outfit.",
          cta: ["Ver accesorios", "catalogo.html?seg=accesorios"] }
    ];
}

let heroIndice = 0;
let heroTemporizador = null;

function dibujarHero() {
    let hero = document.getElementById("hero-carrusel");
    if (hero === null) {
        return;
    }
    let slides = diapositivasHero();
    hero.innerHTML =
        '<div class="hero-pista">' + slides.map(function (s, i) {
            return '<div class="hero-slide tono-' + s.tono + (i === 0 ? " activa" : "") + '" role="group" aria-roledescription="diapositiva" aria-label="' + (i + 1) + " de " + slides.length + '"' + (i === 0 ? "" : ' aria-hidden="true"') + ">" +
                '<img src="' + s.img + '" data-alterna="' + s.alterna + '" alt="" ' + (s.posicion ? 'style="object-position:' + s.posicion + '" ' : '') + (i === 0 ? 'fetchpriority="high"' : 'loading="lazy"') + ">" +
                '<div class="hero-texto">' +
                '<span class="hero-etiqueta">' + s.etiqueta + "</span>" +
                "<h" + (i === 0 ? "1" : "2") + ' class="hero-titulo">' + s.titulo + "</h" + (i === 0 ? "1" : "2") + ">" +
                "<p>" + escapar(s.texto) + "</p>" +
                (s.cuenta ? '<div class="cuenta-regresiva" data-cuenta-regresiva="' + campana.fin + '"></div>' : "") +
                '<div class="hero-acciones"><a class="boton" href="' + s.cta[1] + '">' + s.cta[0] + "</a>" +
                (s.cta2 ? (s.cta2[1] === "#guia" ? '<button type="button" class="boton boton-vidrio" data-accion="guia-tallas" data-categoria="calzado">' + s.cta2[0] + "</button>" : '<a class="boton boton-vidrio" href="' + s.cta2[1] + '">' + s.cta2[0] + "</a>") : "") +
                "</div></div></div>";
        }).join("") + "</div>" +
        '<button type="button" class="hero-flecha anterior" aria-label="Diapositiva anterior">‹</button>' +
        '<button type="button" class="hero-flecha siguiente" aria-label="Diapositiva siguiente">›</button>' +
        '<div class="hero-puntos">' + slides.map(function (s, i) {
            return '<button type="button" data-slide="' + i + '" aria-label="Ir a la diapositiva ' + (i + 1) + '"' + (i === 0 ? ' class="activo"' : "") + '><span></span></button>';
        }).join("") + "</div>";

    hero.querySelector(".anterior").addEventListener("click", function () { irHero(heroIndice - 1, true); });
    hero.querySelector(".siguiente").addEventListener("click", function () { irHero(heroIndice + 1, true); });
    hero.querySelectorAll("[data-slide]").forEach(function (b) {
        b.addEventListener("click", function () { irHero(Number(b.dataset.slide), true); });
    });
    hero.addEventListener("mouseenter", function () { clearInterval(heroTemporizador); });
    hero.addEventListener("mouseleave", iniciarAutoplayHero);
    hero.addEventListener("focusin", function () { clearInterval(heroTemporizador); });

    // Deslizar con el dedo en celulares
    let inicioX = null;
    hero.addEventListener("pointerdown", function (e) { inicioX = e.clientX; });
    hero.addEventListener("pointerup", function (e) {
        if (inicioX !== null && Math.abs(e.clientX - inicioX) > 50) {
            irHero(heroIndice + (e.clientX < inicioX ? 1 : -1), true);
        }
        inicioX = null;
    });
    iniciarAutoplayHero();
}

function irHero(n, manual) {
    let slides = document.querySelectorAll(".hero-slide");
    let puntos = document.querySelectorAll(".hero-puntos button");
    heroIndice = (n + slides.length) % slides.length;
    slides.forEach(function (s, i) {
        s.classList.toggle("activa", i === heroIndice);
        s.setAttribute("aria-hidden", i !== heroIndice);
    });
    puntos.forEach(function (p, i) { p.classList.toggle("activo", i === heroIndice); });
    if (manual) {
        iniciarAutoplayHero();
    }
}

function iniciarAutoplayHero() {
    clearInterval(heroTemporizador);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }
    heroTemporizador = setInterval(function () { irHero(heroIndice + 1); }, 6500);
}

function dibujarCategoriasInicio() {
    let caja = document.getElementById("riel-categorias");
    if (caja === null) {
        return;
    }
    caja.innerHTML = htmlRiel(CATEGORIAS.map(function (c) {
        let cantidad = productos.filter(function (p) { return p.categoria === c.id; }).length;
        return '<a class="tarjeta-categoria" href="catalogo.html?cat=' + c.id + '">' +
            '<img src="' + c.portada + '" alt="" loading="lazy">' +
            "<span><b>" + c.nombre.toUpperCase() + '<i>.</i></b><small>' + cantidad + " productos</small></span></a>";
    }).join(""), "riel-categorias");
}

function rielProductos(lista) {
    return htmlRiel(lista.map(function (p) { return '<div class="riel-item">' + crearTarjeta(p) + "</div>"; }).join(""));
}

function masVendidos(cantidad) {
    let ids = rankingProductos(90).map(function (r) { return r.id; });
    return ids.map(buscarProducto).filter(function (p) { return p && stockTotal(p) > 0; }).slice(0, cantidad);
}

function dibujarSeccionesInicio() {
    let ofertas = document.getElementById("riel-ofertas");
    if (ofertas !== null) {
        let lista = productos.filter(function (p) { return ofertaVigente(p) && stockTotal(p) > 0; })
            .sort(function (a, b) { return b.descuento - a.descuento; }).slice(0, 14);
        let seccion = document.getElementById("seccion-ofertas");
        seccion.hidden = lista.length === 0;
        document.getElementById("titulo-campana").textContent = campana.nombre;
        document.getElementById("subtitulo-campana").textContent = campana.subtitulo;
        ofertas.innerHTML = rielProductos(lista);
    }
    let nuevos = document.getElementById("riel-nuevos");
    if (nuevos !== null) {
        nuevos.innerHTML = rielProductos(productos.filter(function (p) { return p.nuevo && stockTotal(p) > 0; }).slice(0, 14));
    }
    let paraTi = document.getElementById("riel-para-ti");
    if (paraTi !== null) {
        let lista;
        let titulo = document.getElementById("titulo-para-ti");
        if (sesion !== null && !esAdmin() && estadisticasCliente(sesion.correo).pedidos > 0) {
            lista = recomendacionesPara(sesion.correo, 12);
            titulo.textContent = "Seleccionados para ti, " + sesion.nombre.split(" ")[0];
        } else {
            lista = masVendidos(12);
            titulo.textContent = "Lo más vendido de la semana";
        }
        paraTi.innerHTML = rielProductos(lista);
    }
    let recientes = document.getElementById("riel-recientes");
    if (recientes !== null) {
        let lista = leerLocal(CLAVES.recientes, []).map(buscarProducto).filter(Boolean);
        document.getElementById("seccion-recientes").hidden = lista.length === 0;
        recientes.innerHTML = rielProductos(lista);
    }
    let fits = document.getElementById("grilla-fits");
    if (fits !== null) {
        fits.innerHTML = Object.keys(FITS_PANTALON).map(function (id) {
            let p = buscarProducto(id);
            // Solo prendas con foto propia en la carpeta img/
            if (!p || p.imagen.indexOf("img/") !== 0) { return ""; }
            return '<a class="tarjeta-fit" href="producto.html?id=' + encodeURIComponent(id) + '">' +
                '<span class="fit-foto"><img src="' + escapar(p.imagen) + '" alt="' + escapar(p.nombre) + '" loading="lazy"></span>' +
                '<b class="fit-nombre">' + FITS_PANTALON[id].fit + "</b>" +
                '<small>Apertura de bota <strong>' + FITS_PANTALON[id].bota + " cm</strong></small></a>";
        }).join("");
    }
    activarRieles();
}

// =====================================================
// 2. CATÁLOGO
// =====================================================
let filtros = null;
let limiteCatalogo = 24;

function leerFiltrosURL() {
    let q = new URLSearchParams(location.search);
    let f = {
        q: q.get("q") || "",
        cats: [], generos: [], tallas: [], colores: [],
        precioMax: Number(q.get("max")) || 0,
        oferta: q.get("oferta") === "1",
        nuevo: q.get("nuevo") === "1",
        orden: q.get("orden") || "relevancia"
    };
    if (q.get("cat")) { f.cats = q.get("cat").split(","); }
    if (q.get("seg")) {
        f.cats = CATEGORIAS.filter(function (c) { return c.segmento === q.get("seg"); }).map(function (c) { return c.id; });
    }
    if (q.get("genero")) { f.generos = q.get("genero").split(","); }
    if (q.get("talla")) { f.tallas = q.get("talla").split(","); }
    if (q.get("color")) { f.colores = q.get("color").split(","); }
    return f;
}

function escribirFiltrosURL() {
    let q = new URLSearchParams();
    if (filtros.q) { q.set("q", filtros.q); }
    if (filtros.cats.length) { q.set("cat", filtros.cats.join(",")); }
    if (filtros.generos.length) { q.set("genero", filtros.generos.join(",")); }
    if (filtros.tallas.length) { q.set("talla", filtros.tallas.join(",")); }
    if (filtros.colores.length) { q.set("color", filtros.colores.join(",")); }
    if (filtros.precioMax) { q.set("max", filtros.precioMax); }
    if (filtros.oferta) { q.set("oferta", "1"); }
    if (filtros.nuevo) { q.set("nuevo", "1"); }
    if (filtros.orden !== "relevancia") { q.set("orden", filtros.orden); }
    let texto = q.toString();
    history.replaceState(null, "", "catalogo.html" + (texto ? "?" + texto : ""));
}

function cumpleFiltros(p, ignorar) {
    let f = filtros;
    if (f.q && !(p.nombre + " " + p.descripcion + " " + nombreCategoria(p.categoria) + " " + p.colores.map(function (c) { return c.nombre; }).join(" ")).toLowerCase().includes(f.q.toLowerCase())) { return false; }
    if (ignorar !== "cats" && f.cats.length && !f.cats.includes(p.categoria)) { return false; }
    if (f.generos.length && !f.generos.some(function (g) { return p.genero === g || (g !== "unisex" && p.genero === "unisex"); })) { return false; }
    if (f.tallas.length && !f.tallas.some(function (t) { return (Number(p.stockTallas[t]) || 0) > 0; })) { return false; }
    if (f.colores.length && !p.colores.some(function (c) { return f.colores.includes(c.nombre); })) { return false; }
    if (f.precioMax && precioFinal(p) > f.precioMax) { return false; }
    if (f.oferta && !ofertaVigente(p)) { return false; }
    if (f.nuevo && !p.nuevo) { return false; }
    return true;
}

function listaCatalogo() {
    let lista = productos.filter(function (p) { return cumpleFiltros(p); });
    let ventas = {};
    rankingProductos(90).forEach(function (r) { ventas[r.id] = r.unidades; });
    let o = filtros.orden;
    lista.sort(function (a, b) {
        if (o === "precio-asc") { return precioFinal(a) - precioFinal(b); }
        if (o === "precio-desc") { return precioFinal(b) - precioFinal(a); }
        if (o === "descuento") { return (ofertaVigente(b) ? b.descuento : 0) - (ofertaVigente(a) ? a.descuento : 0); }
        if (o === "vendidos") { return (ventas[b.id] || 0) - (ventas[a.id] || 0); }
        if (o === "nombre") { return a.nombre.localeCompare(b.nombre, "es"); }
        // Relevancia: primero lo que tiene stock, luego novedades y ofertas
        let puntos = function (p) { return (stockTotal(p) > 0 ? 4 : 0) + (p.nuevo ? 1 : 0) + (ofertaVigente(p) ? 1 : 0); };
        return puntos(b) - puntos(a);
    });
    return lista;
}

function dibujarFiltros() {
    let caja = document.getElementById("filtros");
    if (caja === null) {
        return;
    }
    let conteo = {};
    productos.forEach(function (p) { if (cumpleFiltros(p, "cats")) { conteo[p.categoria] = (conteo[p.categoria] || 0) + 1; } });
    let tallas = ["XS", "S", "M", "L", "XL", "28", "30", "32", "34", "36", "37", "38", "39", "40", "41", "42", "43", "Única"];
    let coloresUsados = {};
    productos.forEach(function (p) { p.colores.forEach(function (c) { coloresUsados[c.nombre] = c.hex; }); });
    let maximo = Math.ceil(Math.max.apply(null, productos.map(precioFinal)) / 10) * 10;

    let grupo = function (titulo, contenido, abierto) {
        return '<details class="filtro-grupo"' + (abierto ? " open" : "") + "><summary>" + titulo + "</summary><div>" + contenido + "</div></details>";
    };
    caja.innerHTML =
        '<div class="filtros-cabecera"><h2>Filtrar</h2><button type="button" class="enlace" data-filtro-limpiar>Limpiar todo</button>' +
        '<button type="button" class="cerrar-filtros" data-cerrar-filtros aria-label="Cerrar filtros">&times;</button></div>' +
        '<label class="interruptor"><input type="checkbox" data-filtro="oferta"' + (filtros.oferta ? " checked" : "") + '><span></span>🔥 Solo ofertas</label>' +
        '<label class="interruptor"><input type="checkbox" data-filtro="nuevo"' + (filtros.nuevo ? " checked" : "") + '><span></span>✨ Solo novedades</label>' +
        grupo("Categoría", CATEGORIAS.map(function (c) {
            return '<label class="casilla-filtro"><input type="checkbox" data-filtro="cats" value="' + c.id + '"' + (filtros.cats.includes(c.id) ? " checked" : "") + ">" +
                c.nombre + "<small>" + (conteo[c.id] || 0) + "</small></label>";
        }).join(""), true) +
        grupo("Línea", Object.keys(GENEROS).map(function (g) {
            return '<label class="casilla-filtro"><input type="checkbox" data-filtro="generos" value="' + g + '"' + (filtros.generos.includes(g) ? " checked" : "") + ">" + GENEROS[g] + "</label>";
        }).join(""), true) +
        grupo("Talla", '<div class="tallas-filtro">' + tallas.map(function (t) {
            return '<label class="chip-talla"><input type="checkbox" data-filtro="tallas" value="' + t + '"' + (filtros.tallas.includes(t) ? " checked" : "") + "><span>" + t + "</span></label>";
        }).join("") + "</div>", filtros.tallas.length > 0) +
        grupo("Color", '<div class="colores-filtro">' + Object.keys(coloresUsados).map(function (c) {
            return '<label class="chip-color" title="' + c + '"><input type="checkbox" data-filtro="colores" value="' + c + '"' + (filtros.colores.includes(c) ? " checked" : "") + '><span style="background:' + coloresUsados[c] + '"></span><small>' + c + "</small></label>";
        }).join("") + "</div>", filtros.colores.length > 0) +
        grupo("Precio", '<label class="rango-precio">Hasta <b id="precio-max-texto">' + formatoPrecio(filtros.precioMax || maximo) + "</b>" +
            '<input type="range" min="30" max="' + maximo + '" step="10" value="' + (filtros.precioMax || maximo) + '" data-filtro="precio" aria-label="Precio máximo"></label>', true) +
        '<button type="button" class="boton boton-bloque ver-resultados" data-cerrar-filtros>Ver resultados</button>';
}

function tituloCatalogo() {
    let f = filtros;
    if (f.oferta) { return [campana.nombre, campana.subtitulo]; }
    if (f.q) { return ['Resultados para "' + f.q + '"', "Encontramos lo que buscas en NOVAK"]; }
    if (f.nuevo) { return ["Novedades", "Lo último que llegó a la tienda"]; }
    if (f.cats.length === 1) { return [nombreCategoria(f.cats[0]), "Explora toda la línea de " + nombreCategoria(f.cats[0]).toLowerCase()]; }
    if (f.cats.length > 1 && f.cats.every(function (c) { return infoCategoria(c).segmento === "accesorios"; })) { return ["Accesorios", "Gafas, relojes, collares y gorras"]; }
    if (f.generos.length === 1 && f.generos[0] !== "unisex") { return [GENEROS[f.generos[0]], "Moda urbana " + (f.generos[0] === "mujer" ? "para ella" : "para él") + " + prendas unisex"]; }
    return ["Catálogo", "Toda la moda NOVAK en un solo lugar"];
}

function dibujarCatalogo() {
    let contenedor = document.getElementById("catalogo");
    if (contenedor === null) {
        return;
    }
    document.getElementById("aviso-admin").hidden = !esAdmin();
    let titulo = tituloCatalogo();
    document.getElementById("titulo-catalogo").textContent = titulo[0];
    document.getElementById("subtitulo-catalogo").textContent = titulo[1];
    let banner = document.getElementById("banner-catalogo");
    banner.classList.toggle("banner-oferta", filtros.oferta);
    document.getElementById("cuenta-catalogo").hidden = !filtros.oferta;

    let lista = listaCatalogo();
    contenedor.innerHTML = lista.slice(0, limiteCatalogo).map(function (p) { return crearTarjeta(p, { admin: true }); }).join("");
    activarImagenesDeRespaldo(contenedor);
    document.getElementById("sin-resultados").hidden = lista.length > 0;
    document.getElementById("ver-mas").hidden = lista.length <= limiteCatalogo;
    document.getElementById("contador-resultados").textContent = lista.length + (lista.length === 1 ? " producto" : " productos");
    document.getElementById("orden").value = filtros.orden;

    // Chips con los filtros activos
    let chips = [];
    if (filtros.q) { chips.push(["q", "", '"' + filtros.q + '"']); }
    filtros.cats.forEach(function (c) { chips.push(["cats", c, nombreCategoria(c)]); });
    filtros.generos.forEach(function (g) { chips.push(["generos", g, GENEROS[g]]); });
    filtros.tallas.forEach(function (t) { chips.push(["tallas", t, "Talla " + t]); });
    filtros.colores.forEach(function (c) { chips.push(["colores", c, c]); });
    if (filtros.precioMax) { chips.push(["precio", "", "Hasta " + formatoPrecio(filtros.precioMax)]); }
    if (filtros.oferta) { chips.push(["oferta", "", "En oferta"]); }
    if (filtros.nuevo) { chips.push(["nuevo", "", "Novedades"]); }
    document.getElementById("filtros-activos").innerHTML = chips.map(function (c) {
        return '<button type="button" class="chip-activo" data-quitar-filtro="' + c[0] + '" data-valor="' + escapar(c[1]) + '">' + escapar(c[2]) + " ✕</button>";
    }).join("");
    let cantidadFiltros = chips.length;
    document.getElementById("boton-filtros").textContent = "Filtros" + (cantidadFiltros ? " (" + cantidadFiltros + ")" : "");
}

function actualizarCatalogo() {
    limiteCatalogo = 24;
    escribirFiltrosURL();
    dibujarFiltros();
    dibujarCatalogo();
}

function iniciarCatalogo() {
    filtros = leerFiltrosURL();
    dibujarFiltros();
    dibujarCatalogo();
    document.addEventListener("change", function (evento) {
        let t = evento.target;
        if (t.id === "orden") {
            filtros.orden = t.value;
            escribirFiltrosURL();
            dibujarCatalogo();
            return;
        }
        let tipo = t.dataset.filtro;
        if (!tipo) {
            return;
        }
        if (tipo === "oferta" || tipo === "nuevo") {
            filtros[tipo] = t.checked;
        } else if (tipo === "precio") {
            filtros.precioMax = Number(t.value);
            if (filtros.precioMax >= Number(t.max)) { filtros.precioMax = 0; }
        } else {
            filtros[tipo] = filtros[tipo].filter(function (v) { return v !== t.value; });
            if (t.checked) { filtros[tipo].push(t.value); }
        }
        actualizarCatalogo();
    });
    document.addEventListener("input", function (evento) {
        if (evento.target.dataset.filtro === "precio") {
            document.getElementById("precio-max-texto").textContent = formatoPrecio(evento.target.value);
        }
    });
    document.addEventListener("click", function (evento) {
        let t = evento.target;
        let quitar = t.closest("[data-quitar-filtro]");
        if (quitar) {
            let tipo = quitar.dataset.quitarFiltro;
            if (tipo === "q") { filtros.q = ""; document.getElementById("busqueda-global").value = ""; }
            else if (tipo === "precio") { filtros.precioMax = 0; }
            else if (tipo === "oferta" || tipo === "nuevo") { filtros[tipo] = false; }
            else { filtros[tipo] = filtros[tipo].filter(function (v) { return v !== quitar.dataset.valor; }); }
            actualizarCatalogo();
        }
        if (t.closest("[data-filtro-limpiar]")) {
            filtros = { q: "", cats: [], generos: [], tallas: [], colores: [], precioMax: 0, oferta: false, nuevo: false, orden: filtros.orden };
            document.getElementById("busqueda-global").value = "";
            actualizarCatalogo();
        }
        if (t.closest("#boton-filtros")) {
            document.body.classList.add("filtros-abiertos");
        }
        if (t.closest("[data-cerrar-filtros]") || t.classList.contains("fondo-filtros")) {
            document.body.classList.remove("filtros-abiertos");
        }
        if (t.closest("#ver-mas")) {
            limiteCatalogo += 24;
            dibujarCatalogo();
        }
    });
}

// =====================================================
// 3. FICHA DE PRODUCTO
// =====================================================
let productoActual = null;
let tallaElegida = "";
let colorElegido = "";
let vistaActiva = 0;

// Reseñas de ejemplo (siempre las mismas para cada prenda) + las que escriben los clientes
function resenasDe(p) {
    let azar = crearAzar(p.id.split("").reduce(function (s, c) { return s + c.charCodeAt(0); }, 0));
    let nombres = ["Camila R.", "Diego M.", "Valeria T.", "Sebastián Q.", "Luciana P.", "Mateo C.", "Ariana S.", "Joaquín H.", "Daniela F.", "Bruno V."];
    let textos = {
        ropa: ["La tela se siente buena y no se deformó al lavarla.", "Me quedó perfecta, pedí mi talla de siempre.", "El color es igual a la foto, súper recomendado.", "Llegó rápido y bien empacado. Ya quiero otro color.", "Un poco grande, pero me gusta el estilo oversize."],
        calzado: ["Comodísimas, las uso todo el día.", "La horma es normal, pedí mi talla y quedaron bien.", "Combinan con todo, me encantaron.", "La suela es firme, se nota la calidad."],
        accesorios: ["Se ve mejor en persona.", "Buen acabado, llegó con su estuche.", "El regalo perfecto, a mi pareja le encantó.", "Calidad-precio excelente."]
    };
    let segmento = infoCategoria(p.categoria).segmento;
    let pool = textos[segmento] || textos.ropa;
    let lista = [];
    let cantidad = 2 + Math.floor(azar() * 5);
    for (let i = 0; i < cantidad; i++) {
        lista.push({ nombre: nombres[Math.floor(azar() * nombres.length)], estrellas: azar() < 0.7 ? 5 : 4, texto: pool[Math.floor(azar() * pool.length)], fecha: fechaISO(-Math.floor(5 + azar() * 120)) });
    }
    let propias = leerLocal(CLAVES.resenas, {})[p.id] || [];
    return propias.concat(lista);
}

function estrellas(valor) {
    let llenas = Math.round(valor);
    return '<span class="estrellas" aria-label="' + valor.toFixed(1) + ' de 5 estrellas">' + "★★★★★".slice(0, llenas) + '<span class="vacias">' + "★★★★★".slice(llenas) + "</span></span>";
}

function dibujarFicha() {
    let caja = document.getElementById("ficha");
    let id = new URLSearchParams(location.search).get("id");
    let p = buscarProducto(id);
    if (p === null) {
        caja.innerHTML = '<div class="contenedor vacio-grande"><h1>No encontramos esta prenda</h1><p>Puede que ya no esté disponible.</p><a class="boton" href="catalogo.html">Ir al catálogo</a></div>';
        return;
    }
    productoActual = p;
    document.title = p.nombre + " - NOVAK";
    if (!colorElegido) { colorElegido = p.colores[0].nombre; }

    let resenas = resenasDe(p);
    let promedio = resenas.reduce(function (s, r) { return s + r.estrellas; }, 0) / resenas.length;
    let galeria = VISTAS.map(function (v, i) {
        let vista = vistaProducto(p, v.id);
        return '<figure class="vista' + (vista.real ? "" : " vista-ref vista-ref-" + v.id) + (i === vistaActiva ? " activa" : "") + '" data-vista="' + i + '">' +
            '<button type="button" class="vista-boton" data-ampliar="' + i + '" aria-label="Ampliar vista ' + v.nombre + '">' +
            '<img src="' + escapar(vista.src) + '" alt="' + escapar(p.nombre) + " - " + v.nombre + '" data-id-vista="' + v.id + '"' + (i > 1 ? ' loading="lazy"' : "") + "></button>" +
            '<figcaption>' + v.nombre + (vista.real ? "" : " · referencial") + "</figcaption></figure>";
    }).join("");

    let st = stockTotal(p);
    let oferta = ofertaVigente(p);
    let specs = p.especificaciones.map(function (e) { return "<tr><th>" + escapar(e[0]) + "</th><td>" + escapar(e[1]) + "</td></tr>"; }).join("") +
        "<tr><th>Línea</th><td>" + GENEROS[p.genero] + "</td></tr>" +
        "<tr><th>Tallas</th><td>" + Object.keys(p.stockTallas).join(" · ") + "</td></tr>" +
        "<tr><th>Colores</th><td>" + p.colores.map(function (c) { return escapar(c.nombre); }).join(", ") + "</td></tr>" +
        "<tr><th>SKU</th><td>" + escapar(p.sku) + "</td></tr>";

    caja.innerHTML =
        '<div class="contenedor">' +
        '<nav class="migas" aria-label="Ruta"><a href="index.html">Inicio</a> / <a href="catalogo.html?cat=' + p.categoria + '">' + nombreCategoria(p.categoria) + "</a> / <span>" + escapar(p.nombre) + "</span></nav>" +
        '<div class="ficha-grilla">' +
        '<div class="galeria-columna"><div class="galeria" id="galeria">' + galeria + "</div>" +
        '<div class="galeria-puntos">' + VISTAS.map(function (v, i) { return '<button type="button" data-ir-vista="' + i + '" aria-label="' + v.nombre + '"' + (i === 0 ? ' class="activo"' : "") + "></button>"; }).join("") + "</div>" +
        '<p class="nota-color" id="nota-color" hidden></p></div>' +

        '<div class="ficha-info">' +
        '<p class="producto-marca">NOVAK · ' + nombreCategoria(p.categoria) + " · " + GENEROS[p.genero] + (p.nuevo ? ' <span class="sello sello-nuevo">Nuevo</span>' : "") + "</p>" +
        '<h1 class="ficha-titulo">' + escapar(p.nombre) + "</h1>" +
        '<a class="ficha-rating" href="#resenas">' + estrellas(promedio) + " " + promedio.toFixed(1) + " (" + resenas.length + " reseñas)</a>" +
        '<p class="ficha-corta">' + escapar(p.descripcion) + "</p>" +
        htmlPrecio(p, true) +
        (oferta ? '<div class="oferta-ficha"><span>🔥 Oferta termina en</span><div class="cuenta-regresiva chica" data-cuenta-regresiva="' + (p.ofertaHasta || campana.fin) + '"></div><small>Ahorras ' + formatoPrecio(p.precio - precioFinal(p)) + "</small></div>" : "") +
        '<p class="cuotas">o hasta 3 cuotas sin intereses de <b>' + formatoPrecio(precioFinal(p) / 3) + "</b> con tarjeta de crédito</p>" +

        '<div class="ficha-bloque"><p class="etiqueta-campo">Color: <b class="color-elegido">' + escapar(colorElegido) + "</b></p>" + htmlColores(p, colorElegido) + "</div>" +
        '<div class="ficha-bloque"><p class="etiqueta-campo">Talla <button type="button" class="enlace" data-accion="guia-tallas" data-categoria="' + p.categoria + '">' + ICONOS.regla + " Guía de tallas</button></p>" +
        htmlTallas(p, tallaElegida) + '<p class="nota-stock" id="nota-stock">' + (st <= 0 ? "Agotado en todas las tallas." : "Elige tu talla para ver el stock.") + "</p></div>" +

        '<div class="ficha-compra">' +
        '<div class="cantidad"><button type="button" data-cantidad="-1" aria-label="Quitar uno">−</button><span id="cantidad-ficha">1</span><button type="button" data-cantidad="1" aria-label="Agregar uno">+</button></div>' +
        '<button type="button" class="boton boton-grande" id="agregar-ficha"' + (st <= 0 ? " disabled" : "") + ">" + ICONOS.bolsa + (st <= 0 ? "Agotado" : "Añadir al carrito") + "</button>" +
        '<button type="button" class="boton-favorito grande' + (esFavorito(p.id) ? " activo" : "") + '" data-accion="favorito" data-id="' + escapar(p.id) + '" aria-pressed="' + esFavorito(p.id) + '" aria-label="Guardar en favoritos">' + ICONOS.corazon + "</button></div>" +
        (st > 0 ? '<button type="button" class="boton boton-claro boton-bloque" id="comprar-ahora">Comprar ahora</button>' : "") +

        '<ul class="beneficios-ficha">' +
        "<li>" + ICONOS.camion + "<span><b>Despacho a domicilio</b> Lima en 24 - 48 h · Provincias 3 - 5 días. Gratis desde S/ " + ENVIO_GRATIS_DESDE + "</span></li>" +
        "<li>" + ICONOS.tienda + "<span><b>Retira gratis en tienda</b> NOVAK Miraflores y Jockey Plaza</span></li>" +
        "<li>" + ICONOS.cambio + "<span><b>Cambios y devoluciones gratis</b> hasta 30 días después de tu compra</span></li>" +
        "<li>" + ICONOS.escudo + "<span><b>Pago 100% seguro</b> Tarjeta, Yape, Plin, PagoEfectivo o transferencia</span></li></ul>" +

        '<div class="acordeon">' +
        "<details open><summary>Descripción</summary><p>" + escapar(p.detalle || p.descripcion) + "</p></details>" +
        '<details><summary>Especificaciones</summary><table class="tabla-especificaciones">' + specs + "</table></details>" +
        "<details><summary>Envíos y devoluciones</summary><p>Envío a todo el Perú. Lima Metropolitana y Callao: " + formatoPrecio(COSTO_ENVIO.lima) + ", provincias: " + formatoPrecio(COSTO_ENVIO.provincia) + ". Gratis por compras desde " + formatoPrecio(ENVIO_GRATIS_DESDE) + ". Puedes cambiar talla o color sin costo dentro de los 30 días, con la etiqueta puesta.</p></details>" +
        "</div></div></div>" +

        (esAdmin() ? '<section class="panel-admin-ficha" aria-labelledby="titulo-admin-ficha"><div class="panel-admin-cabecera"><h2 id="titulo-admin-ficha">' + ICONOS.grafico + " Estadísticas de esta prenda <small>Solo lo ve el administrador</small></h2>" +
            '<div class="acciones-fila"><button type="button" class="boton boton-chico" data-accion="editar" data-id="' + escapar(p.id) + '">Editar prenda y fotos</button>' +
            '<button type="button" class="boton boton-claro boton-chico" data-accion="stock" data-id="' + escapar(p.id) + '">Actualizar stock</button></div></div>' +
            panelEstadisticasProducto(p.id) + "</section>" : "") +

        '<section class="resenas" id="resenas" aria-labelledby="titulo-resenas"><div class="resenas-cabecera"><div><h2 id="titulo-resenas">Valoraciones</h2>' +
        '<p class="promedio-grande">' + promedio.toFixed(1) + " " + estrellas(promedio) + "<small>" + resenas.length + " opiniones</small></p></div>" +
        (sesion !== null && !esAdmin() ? '<form class="form-resena" id="form-resena" novalidate><h3>Deja tu opinión</h3>' +
            '<div class="elegir-estrellas" role="radiogroup" aria-label="Calificación">' + [5, 4, 3, 2, 1].map(function (n) {
                return '<input type="radio" name="estrellas" id="est-' + n + '" value="' + n + '"' + (n === 5 ? " checked" : "") + '><label for="est-' + n + '" title="' + n + ' estrellas">★</label>';
            }).join("") + "</div>" +
            '<label class="sr-only" for="texto-resena">Tu comentario</label><textarea id="texto-resena" name="texto" rows="2" placeholder="¿Qué tal la talla, la tela, el color?" maxlength="300"></textarea>' +
            '<button type="submit" class="boton boton-chico">Publicar</button><p class="mensaje" role="status" hidden></p></form>'
            : (esAdmin() ? "" : '<p><a href="login.html?volver=producto.html">Ingresa</a> para dejar tu opinión.</p>')) +
        "</div>" +
        '<div class="lista-resenas">' + resenas.slice(0, 8).map(function (r) {
            return '<article class="resena">' + estrellas(r.estrellas) + "<p>" + escapar(r.texto) + "</p><small>" + escapar(r.nombre) + " · " + fechaCorta(r.fecha) + " · Compra verificada</small></article>";
        }).join("") + "</div></section>" +

        '<section class="seccion-riel"><h2>También te puede gustar</h2><div id="riel-relacionados"></div></section>' +
        '<section class="seccion-riel" id="seccion-recientes-ficha"><h2>Vistos recientemente</h2><div id="riel-recientes-ficha"></div></section>' +
        "</div>";

    let relacionados = productos.filter(function (x) { return x.categoria === p.categoria && x.id !== p.id; })
        .concat(productos.filter(function (x) { return x.genero === p.genero && x.categoria !== p.categoria; }).slice(0, 4)).slice(0, 12);
    document.getElementById("riel-relacionados").innerHTML = rielProductos(relacionados);
    let recientes = leerLocal(CLAVES.recientes, []).filter(function (r) { return r !== p.id; }).map(buscarProducto).filter(Boolean);
    document.getElementById("seccion-recientes-ficha").hidden = recientes.length === 0;
    document.getElementById("riel-recientes-ficha").innerHTML = rielProductos(recientes);
    activarImagenesDeRespaldo(caja);
    activarRieles(caja);
    buscarFotosDeVistas(p);
    alElegirColor(colorElegido);
    if (tallaElegida) { alElegirTalla(tallaElegida); }
}

// Si existe img/<id>-espalda.jpg (o -izquierda / -derecha) se usa automáticamente
function buscarFotosDeVistas(p) {
    ["espalda", "izquierda", "derecha"].forEach(function (v) {
        if (p.vistas && p.vistas[v]) {
            return;
        }
        let prueba = new Image();
        prueba.onload = function () {
            let img = document.querySelector('[data-id-vista="' + v + '"]');
            if (img) {
                img.src = prueba.src;
                let figura = img.closest(".vista");
                figura.classList.remove("vista-ref", "vista-ref-" + v);
                figura.querySelector("figcaption").textContent = VISTAS.find(function (x) { return x.id === v; }).nombre;
            }
        };
        prueba.src = "img/" + p.id + "-" + v + ".jpg";
    });
}

function alElegirTalla(talla) {
    if (pagina !== "producto" || !productoActual) {
        return;
    }
    tallaElegida = talla;
    let disponible = Number(productoActual.stockTallas[talla]) || 0;
    let nota = document.getElementById("nota-stock");
    nota.innerHTML = disponible <= 5 ? "⚡ ¡Quedan solo <b>" + disponible + "</b> en talla " + escapar(talla) + "!" : "✓ Talla " + escapar(talla) + " disponible (" + disponible + " unidades)";
    nota.classList.toggle("urgente", disponible <= 5);
    let cantidad = document.getElementById("cantidad-ficha");
    if (Number(cantidad.textContent) > disponible) { cantidad.textContent = Math.max(1, disponible); }
}

function alElegirColor(color) {
    if (pagina !== "producto" || !productoActual) {
        return;
    }
    colorElegido = color;
    let nota = document.getElementById("nota-color");
    let esFoto = productoActual.colores[0].nombre === color;
    nota.hidden = esFoto;
    nota.textContent = "Las fotos muestran el color " + productoActual.colores[0].nombre.toLowerCase() + ". Recibirás la prenda en " + color.toLowerCase() + ".";
    document.getElementById("galeria").style.setProperty("--tinte", esFoto ? "transparent" : hexDeColor(color));
    document.getElementById("galeria").classList.toggle("con-tinte", !esFoto);
}

function abrirVisor(indice) {
    let p = productoActual;
    vistaActiva = (indice + 4) % 4;
    let v = VISTAS[vistaActiva];
    let figura = document.querySelectorAll("#galeria .vista")[vistaActiva];
    let img = figura.querySelector("img");
    abrirModal('<div class="visor">' +
        '<h2 id="modal-titulo" class="sr-only">' + escapar(p.nombre) + " - " + v.nombre + "</h2>" +
        '<div class="visor-imagen ' + (figura.classList.contains("vista-ref") ? "vista-ref vista-ref-" + v.id : "") + '"><img src="' + escapar(img.src) + '" alt="' + escapar(p.nombre + " - " + v.nombre) + '"></div>' +
        '<div class="visor-barra"><button type="button" class="boton boton-claro boton-chico" data-visor="-1">‹ Anterior</button>' +
        "<span>" + v.nombre + (figura.classList.contains("vista-ref") ? " (vista referencial)" : "") + " · " + (vistaActiva + 1) + "/4</span>" +
        '<button type="button" class="boton boton-claro boton-chico" data-visor="1">Siguiente ›</button></div>' +
        '<div class="visor-miniaturas">' + Array.prototype.map.call(document.querySelectorAll("#galeria .vista"), function (f, i) {
            return '<button type="button" data-visor-ir="' + i + '" class="' + (i === vistaActiva ? "activo " : "") + f.className.replace(/vista|activa/g, "") + '"><img src="' + escapar(f.querySelector("img").src) + '" alt="' + VISTAS[i].nombre + '"></button>';
        }).join("") + "</div></div>", "modal-visor");
}

function iniciarFicha() {
    dibujarFicha();
    if (productoActual && !esAdmin()) {
        registrarVista(productoActual.id);
    }
    document.addEventListener("click", function (evento) {
        let t = evento.target;
        let ampliar = t.closest("[data-ampliar]");
        if (ampliar) { abrirVisor(Number(ampliar.dataset.ampliar)); return; }
        let visor = t.closest("[data-visor]");
        if (visor) { abrirVisor(vistaActiva + Number(visor.dataset.visor)); return; }
        let visorIr = t.closest("[data-visor-ir]");
        if (visorIr) { abrirVisor(Number(visorIr.dataset.visorIr)); return; }
        let ir = t.closest("[data-ir-vista]");
        if (ir) {
            let galeria = document.getElementById("galeria");
            galeria.scrollTo({ left: galeria.clientWidth * Number(ir.dataset.irVista), behavior: "smooth" });
        }
        let cambio = t.closest("[data-cantidad]");
        if (cambio) {
            let span = document.getElementById("cantidad-ficha");
            let maximo = tallaElegida ? Number(productoActual.stockTallas[tallaElegida]) || 1 : 10;
            span.textContent = Math.min(maximo, Math.max(1, Number(span.textContent) + Number(cambio.dataset.cantidad)));
        }
        if (t.closest("#agregar-ficha") || t.closest("#comprar-ahora")) {
            if (!tallaElegida) {
                mostrarToast("Elige una talla primero.", "error");
                let grupo = document.querySelector(".ficha-info .tallas");
                grupo.classList.add("sacudir");
                grupo.scrollIntoView({ behavior: "smooth", block: "center" });
                setTimeout(function () { grupo.classList.remove("sacudir"); }, 500);
                return;
            }
            let ok = agregarAlCarrito(productoActual.id, tallaElegida, colorElegido, Number(document.getElementById("cantidad-ficha").textContent));
            if (ok && t.closest("#comprar-ahora")) {
                window.location.href = "checkout.html";
            }
        }
    });
    // En celulares la galería se desliza: se actualizan los puntos
    let galeria = document.getElementById("galeria");
    if (galeria) {
        galeria.addEventListener("scroll", function () {
            let i = Math.round(galeria.scrollLeft / galeria.clientWidth);
            document.querySelectorAll("[data-ir-vista]").forEach(function (b, k) { b.classList.toggle("activo", k === i); });
        }, { passive: true });
    }
    // Si solo hay una talla (accesorios) se elige sola
    if (productoActual) {
        let tallas = Object.keys(productoActual.stockTallas);
        if (tallas.length === 1 && productoActual.stockTallas[tallas[0]] > 0) {
            let b = document.querySelector('.ficha-info .talla[data-talla="' + tallas[0] + '"]');
            if (b) { b.click(); }
        }
    }
}

// =====================================================
// 4. CARRITO
// =====================================================
function dibujarCarritoPagina() {
    let lista = document.getElementById("lista-carrito");
    if (lista === null) {
        return;
    }
    let vacio = carrito.length === 0;
    document.getElementById("carrito-vacio").hidden = !vacio;
    document.getElementById("carrito-lleno").hidden = vacio;
    if (vacio) {
        document.getElementById("riel-sugeridos").innerHTML = rielProductos(masVendidos(10));
        activarRieles();
        return;
    }
    lista.innerHTML = carrito.map(function (item) {
        let p = buscarProducto(item.id);
        if (!p) { return ""; }
        let clave = claveItem(item);
        let hex = (p.colores.find(function (c) { return c.nombre === item.color; }) || {}).hex || hexDeColor(item.color);
        return '<article class="item-carrito">' +
            '<a href="producto.html?id=' + encodeURIComponent(p.id) + '"><img src="' + escapar(p.imagen) + '" alt="" width="96" height="120"></a>' +
            '<div class="item-info"><h3><a href="producto.html?id=' + encodeURIComponent(p.id) + '">' + escapar(p.nombre) + "</a></h3>" +
            '<p class="item-variante">Talla <b>' + escapar(item.talla) + '</b> · <span class="muestra" style="background:' + escapar(hex) + '"></span>' + escapar(item.color) + "</p>" +
            htmlPrecio(p) +
            '<div class="item-acciones"><div class="cantidad"><button type="button" data-cambiar="' + escapar(clave) + '" data-delta="-1" aria-label="Quitar una unidad">−</button><span>' + item.cantidad + "</span>" +
            '<button type="button" data-cambiar="' + escapar(clave) + '" data-delta="1" aria-label="Agregar una unidad">+</button></div>' +
            '<button type="button" class="enlace" data-mover-favorito="' + escapar(clave) + '">Mover a favoritos</button>' +
            '<button type="button" class="enlace peligro" data-quitar-item="' + escapar(clave) + '">Eliminar</button></div></div>' +
            '<p class="item-total">' + formatoPrecio(precioFinal(p) * item.cantidad) + "</p></article>";
    }).join("");
    activarImagenesDeRespaldo(lista);

    let t = calcularTotales();
    let barra = Math.min(100, Math.round((1 - t.faltaEnvioGratis / ENVIO_GRATIS_DESDE) * 100));
    document.getElementById("progreso-envio").innerHTML = (t.faltaEnvioGratis > 0
        ? ICONOS.camion + "<span>Agrega <b>" + formatoPrecio(t.faltaEnvioGratis) + "</b> más y tu envío es <b>GRATIS</b></span>"
        : ICONOS.camion + "<span>🎉 ¡Genial! Tu pedido tiene <b>envío gratis</b></span>") +
        '<div class="barra-progreso"><span style="width:' + barra + '%"></span></div>';
    document.getElementById("resumen-carrito").innerHTML = htmlResumenTotales(t, "lima", true);
    let cupon = document.getElementById("cupon-actual");
    cupon.innerHTML = t.cupon ? '<span class="chip-cupon">🎟 ' + escapar(t.cupon.codigo) + " · " + escapar(t.cupon.descripcion) + ' <button type="button" data-quitar-cupon aria-label="Quitar cupón">✕</button></span>' +
        (t.mensajeCupon ? '<p class="mensaje error">' + escapar(t.mensajeCupon) + "</p>" : "") : "";
}

function htmlResumenTotales(t, zona, estimado) {
    return '<dl class="totales">' +
        "<div><dt>Subtotal (" + t.unidades + (t.unidades === 1 ? " producto" : " productos") + ")</dt><dd>" + formatoPrecio(t.lista) + "</dd></div>" +
        (t.ahorro > 0 ? '<div class="ahorro"><dt>Descuentos por ofertas</dt><dd>-' + formatoPrecio(t.ahorro) + "</dd></div>" : "") +
        (t.descuentoCupon > 0 ? '<div class="ahorro"><dt>Cupón ' + escapar(t.cupon.codigo) + "</dt><dd>-" + formatoPrecio(t.descuentoCupon) + "</dd></div>" : "") +
        "<div><dt>Envío" + (estimado ? " (estimado Lima)" : "") + "</dt><dd>" + (t.envio === 0 ? '<b class="gratis">Gratis</b>' : formatoPrecio(t.envio)) + "</dd></div>" +
        '<div class="total"><dt>Total</dt><dd>' + formatoPrecio(t.total) + "</dd></div>" +
        (t.ahorro + t.descuentoCupon > 0 ? '<p class="ahorro-total">🎉 Estás ahorrando ' + formatoPrecio(t.ahorro + t.descuentoCupon) + "</p>" : "") + "</dl>";
}

function iniciarCarrito() {
    dibujarCarritoPagina();
    document.addEventListener("click", function (evento) {
        let t = evento.target;
        let cambiar = t.closest("[data-cambiar]");
        if (cambiar) { cambiarCantidad(cambiar.dataset.cambiar, Number(cambiar.dataset.delta)); }
        let quitar = t.closest("[data-quitar-item]");
        if (quitar) {
            let item = carrito.find(function (i) { return claveItem(i) === quitar.dataset.quitarItem; });
            cambiarCantidad(quitar.dataset.quitarItem, -item.cantidad);
            mostrarToast("Producto eliminado del carrito.");
        }
        let mover = t.closest("[data-mover-favorito]");
        if (mover) {
            let item = carrito.find(function (i) { return claveItem(i) === mover.dataset.moverFavorito; });
            if (!esFavorito(item.id)) { alternarFavorito(item.id); }
            cambiarCantidad(mover.dataset.moverFavorito, -item.cantidad);
        }
        if (t.closest("[data-quitar-cupon]")) {
            quitarCupon();
            dibujarCarritoPagina();
        }
        if (t.closest("[data-vaciar]") && confirm("¿Quieres vaciar tu carrito?")) {
            carrito = [];
            guardarCarrito();
        }
        let sugerido = t.closest("[data-usar-cupon]");
        if (sugerido) {
            aplicarCupon(sugerido.dataset.usarCupon);
            dibujarCarritoPagina();
        }
    });
    document.addEventListener("submit", function (evento) {
        if (evento.target.id === "form-cupon-carrito") {
            evento.preventDefault();
            let campo = evento.target.codigo;
            if (campo.value.trim() === "") {
                mostrarToast("Escribe un código de cupón.", "error");
                return;
            }
            if (aplicarCupon(campo.value)) { campo.value = ""; }
            dibujarCarritoPagina();
        }
    });
    let sugeridos = document.getElementById("cupones-sugeridos");
    if (sugeridos) {
        sugeridos.innerHTML = cupones.filter(function (c) { return c.activo; }).slice(0, 4).map(function (c) {
            return '<button type="button" class="cupon-sugerido" data-usar-cupon="' + escapar(c.codigo) + '"><b>' + escapar(c.codigo) + "</b><small>" + escapar(c.descripcion) + "</small></button>";
        }).join("");
    }
}

// =====================================================
// 5. CHECKOUT Y PASARELA DE PAGO
// =====================================================
let pasoCheckout = 1;
let datosCheckout = {};

const TIENDAS = ["NOVAK Miraflores · Av. Larco 345", "NOVAK Jockey Plaza · Tienda 214", "NOVAK Mall Plaza Arequipa · Local 118"];
const DEPARTAMENTOS = ["Amazonas", "Áncash", "Apurímac", "Arequipa", "Ayacucho", "Cajamarca", "Cusco", "Huancavelica", "Huánuco", "Ica", "Junín", "La Libertad", "Lambayeque", "Loreto", "Madre de Dios", "Moquegua", "Pasco", "Piura", "Puno", "San Martín", "Tacna", "Tumbes", "Ucayali"];

function zonaCheckout() {
    if (datosCheckout.entrega === "recojo") { return "recojo"; }
    return datosCheckout.zona === "provincia" ? "provincia" : "lima";
}

function dibujarResumenCheckout() {
    let caja = document.getElementById("resumen-checkout");
    if (!caja) {
        return;
    }
    let t = calcularTotales(zonaCheckout());
    caja.innerHTML = "<h2>Tu pedido</h2>" +
        '<ul class="items-checkout">' + carrito.map(function (item) {
            let p = buscarProducto(item.id);
            return '<li><span class="foto-cantidad"><img src="' + escapar(p.imagen) + '" alt="" width="52" height="64"><b>' + item.cantidad + "</b></span>" +
                "<span>" + escapar(p.nombre) + "<small>Talla " + escapar(item.talla) + " · " + escapar(item.color) + "</small></span>" +
                "<span>" + formatoPrecio(precioFinal(p) * item.cantidad) + "</span></li>";
        }).join("") + "</ul>" +
        '<form class="form-cupon-mini" id="form-cupon-checkout" novalidate><label class="sr-only" for="cupon-checkout">Cupón</label><input id="cupon-checkout" name="codigo" placeholder="Código de cupón"' + (t.cupon ? ' value="' + escapar(t.cupon.codigo) + '"' : "") + '><button class="boton boton-claro boton-chico" type="submit">Aplicar</button></form>' +
        (t.mensajeCupon ? '<p class="mensaje error">' + escapar(t.mensajeCupon) + "</p>" : "") +
        htmlResumenTotales(t, zonaCheckout(), false) +
        '<p class="sello-seguro">' + ICONOS.escudo + " Pago protegido con cifrado SSL de 256 bits</p>";
    activarImagenesDeRespaldo(caja);
    let boton = document.getElementById("boton-pagar");
    if (boton) { boton.textContent = "Pagar " + formatoPrecio(t.total); }
}

function irPaso(n) {
    pasoCheckout = n;
    document.querySelectorAll(".paso-checkout").forEach(function (s) {
        let num = Number(s.dataset.paso);
        s.classList.toggle("activo", num === n);
        s.classList.toggle("hecho", num < n);
    });
    document.querySelectorAll(".indicador-pasos li").forEach(function (li, i) {
        li.classList.toggle("activo", i + 1 === n);
        li.classList.toggle("hecho", i + 1 < n);
    });
    let activo = document.querySelector('.paso-checkout[data-paso="' + n + '"]');
    if (activo) { activo.scrollIntoView({ behavior: "smooth", block: "start" }); }
    actualizarMetodosDisponibles();
    dibujarResumenCheckout();
}

function resumenPaso(n) {
    let r = document.querySelector('.paso-checkout[data-paso="' + n + '"] .paso-resumen');
    if (!r) { return; }
    if (n === 1) { r.textContent = datosCheckout.nombre + " · " + datosCheckout.correo + " · " + datosCheckout.telefono; }
    if (n === 2) { r.textContent = datosCheckout.entrega === "recojo" ? "Recojo en " + datosCheckout.tienda : datosCheckout.direccion + ", " + datosCheckout.distrito + (datosCheckout.zona === "provincia" ? " (" + datosCheckout.departamento + ")" : ""); }
}

function marcaTarjeta(numero) {
    if (/^4/.test(numero)) { return "Visa"; }
    if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(numero)) { return "Mastercard"; }
    if (/^3[47]/.test(numero)) { return "Amex"; }
    if (/^3(0[0-5]|[68])/.test(numero)) { return "Diners"; }
    return "";
}

// Algoritmo de Luhn: valida que el número de tarjeta sea coherente
function pasaLuhn(numero) {
    let suma = 0;
    let doble = false;
    for (let i = numero.length - 1; i >= 0; i--) {
        let d = Number(numero[i]);
        if (doble) {
            d *= 2;
            if (d > 9) { d -= 9; }
        }
        suma += d;
        doble = !doble;
    }
    return numero.length >= 13 && suma % 10 === 0;
}

function actualizarTarjetaVisual() {
    let f = document.getElementById("form-pago");
    let numero = f.tarjeta.value.replace(/\D/g, "");
    let marca = marcaTarjeta(numero);
    let tarjeta = document.getElementById("tarjeta-visual");
    tarjeta.dataset.marca = marca.toLowerCase();
    let mostrado = (numero + "•".repeat(Math.max(0, 16 - numero.length))).replace(/(.{4})/g, "$1 ").trim();
    tarjeta.querySelector(".tv-numero").textContent = mostrado;
    tarjeta.querySelector(".tv-nombre").textContent = f.titular.value.toUpperCase() || "NOMBRE DEL TITULAR";
    tarjeta.querySelector(".tv-vence").textContent = f.vence.value || "MM/AA";
    tarjeta.querySelector(".tv-marca").textContent = marca || "TARJETA";
    f.cvv.maxLength = marca === "Amex" ? 4 : 3;
    document.querySelectorAll(".logo-marca").forEach(function (l) { l.classList.toggle("activo", l.dataset.marca === marca); });
}

function actualizarMetodosDisponibles() {
    let contra = document.querySelector('input[name="metodo"][value="contraentrega"]');
    if (!contra) { return; }
    let permitido = datosCheckout.entrega === "domicilio" && datosCheckout.zona !== "provincia";
    contra.disabled = !permitido;
    contra.closest(".metodo").classList.toggle("deshabilitado", !permitido);
    contra.closest(".metodo").querySelector("small").textContent = permitido ? "Paga en efectivo o POS al recibir (solo Lima)" : "Solo para envíos a domicilio en Lima";
    if (!permitido && contra.checked) {
        document.querySelector('input[name="metodo"][value="tarjeta"]').checked = true;
        mostrarPanelPago();
    }
}

function mostrarPanelPago() {
    let metodo = document.querySelector('input[name="metodo"]:checked').value;
    document.querySelectorAll(".panel-pago").forEach(function (p) { p.hidden = p.dataset.panel !== metodo; });
    document.querySelectorAll(".metodo").forEach(function (m) { m.classList.toggle("activo", m.querySelector("input").checked); });
    let t = calcularTotales(zonaCheckout());
    document.querySelectorAll("[data-monto]").forEach(function (el) { el.textContent = formatoPrecio(t.total); });
}

// Dibuja un código QR de demostración (patrón fijo, no se puede escanear)
function qrDemostracion() {
    let azar = crearAzar(4242);
    let celdas = "";
    let n = 25;
    let esOjo = function (x, y) {
        return (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    };
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            let lleno;
            if (esOjo(x, y)) {
                let cx = x < 7 ? x : x - (n - 7);
                let cy = y < 7 ? y : y - (n - 7);
                lleno = cx === 0 || cx === 6 || cy === 0 || cy === 6 || (cx >= 2 && cx <= 4 && cy >= 2 && cy <= 4);
            } else {
                lleno = azar() < 0.48;
            }
            if (lleno) { celdas += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; }
        }
    }
    return '<svg class="qr" viewBox="-2 -2 29 29" role="img" aria-label="Código QR de demostración"><rect x="-2" y="-2" width="29" height="29" fill="#fff"/>' + celdas + "</svg>";
}

function validarPaso1(f) {
    let nombre = f.nombre.value.trim();
    let correo = f.correo.value.trim();
    let telefono = f.telefono.value.replace(/\D/g, "");
    let dni = f.dni.value.replace(/\D/g, "");
    if (nombre.length < 3) { return "Escribe tu nombre completo."; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { return "Escribe un correo válido."; }
    if (!/^9\d{8}$/.test(telefono)) { return "El celular debe tener 9 dígitos y empezar con 9."; }
    if (!/^\d{8}$/.test(dni)) { return "El DNI debe tener 8 dígitos."; }
    datosCheckout.nombre = nombre; datosCheckout.correo = correo; datosCheckout.telefono = telefono; datosCheckout.dni = dni;
    return "";
}

function validarPaso2(f) {
    datosCheckout.entrega = f.entrega.value;
    if (datosCheckout.entrega === "recojo") {
        datosCheckout.tienda = f.tienda.value;
        return "";
    }
    datosCheckout.zona = f.zona.value;
    datosCheckout.departamento = f.departamento.value;
    datosCheckout.distrito = f.distrito.value.trim();
    datosCheckout.direccion = f.direccion.value.trim();
    datosCheckout.referencia = f.referencia.value.trim();
    if (datosCheckout.zona === "provincia" && !datosCheckout.departamento) { return "Elige el departamento."; }
    if (datosCheckout.distrito.length < 3) { return "Escribe el distrito o la ciudad."; }
    if (datosCheckout.direccion.length < 6) { return "Escribe la dirección completa (calle y número)."; }
    return "";
}

function validarPago(f) {
    let metodo = f.metodo.value;
    if (metodo === "tarjeta") {
        let numero = f.tarjeta.value.replace(/\D/g, "");
        let marca = marcaTarjeta(numero);
        if (!marca) { return "Aceptamos Visa, Mastercard, American Express y Diners."; }
        if (!pasaLuhn(numero) || numero.length < (marca === "Amex" ? 15 : marca === "Diners" ? 14 : 16)) { return "El número de tarjeta no es válido. Revísalo."; }
        if (f.titular.value.trim().length < 3) { return "Escribe el nombre como aparece en la tarjeta."; }
        let m = f.vence.value.match(/^(\d{2})\/(\d{2})$/);
        if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) { return "La fecha de vencimiento debe ser MM/AA."; }
        let fin = new Date(2000 + Number(m[2]), Number(m[1]), 1);
        if (fin <= new Date()) { return "La tarjeta está vencida."; }
        if (!new RegExp("^\\d{" + (marca === "Amex" ? 4 : 3) + "}$").test(f.cvv.value)) { return "El código de seguridad (CVV) no es válido."; }
        datosCheckout.pagoDetalle = marca + " •••• " + numero.slice(-4) + (f.cuotas.value !== "1" ? " · " + f.cuotas.value + " cuotas" : "");
        datosCheckout.rechazo = numero === "4000000000000002";
    } else if (metodo === "yape") {
        if (!/^\d{6,8}$/.test(f.operacionYape.value.trim())) { return "Escribe el número de operación de Yape/Plin (6 a 8 dígitos)."; }
        datosCheckout.pagoDetalle = "Yape/Plin · operación " + f.operacionYape.value.trim();
    } else if (metodo === "transferencia") {
        if (!/^\d{6,12}$/.test(f.operacionBanco.value.trim())) { return "Escribe el número de operación de la transferencia (6 a 12 dígitos)."; }
        datosCheckout.pagoDetalle = f.banco.value + " · operación " + f.operacionBanco.value.trim();
    } else if (metodo === "pagoefectivo") {
        datosCheckout.pagoDetalle = "CIP " + String(Date.now()).slice(-8);
    } else if (metodo === "contraentrega") {
        datosCheckout.pagoDetalle = f.contraModo.value;
    }
    if (!f.terminos.checked) { return "Acepta los términos y condiciones para continuar."; }
    datosCheckout.metodo = metodo;
    return "";
}

function procesarPago(f) {
    let error = validarPago(f);
    if (error) {
        mostrarMensaje(f, error, true);
        return;
    }
    f.querySelector(".mensaje").hidden = true;
    let capa = document.getElementById("procesando");
    capa.hidden = false;
    let pasos = ["Conectando con la pasarela segura...", "Validando los datos de pago...", "Confirmando tu pedido..."];
    let i = 0;
    capa.querySelector("p").textContent = pasos[0];
    let intervalo = setInterval(function () {
        i++;
        if (i < pasos.length) { capa.querySelector("p").textContent = pasos[i]; }
    }, 700);
    setTimeout(function () {
        clearInterval(intervalo);
        capa.hidden = true;
        if (datosCheckout.rechazo) {
            mostrarMensaje(f, "Tu banco rechazó la operación (tarjeta de prueba de rechazo). Prueba con otra tarjeta o método de pago.", true);
            return;
        }
        crearPedido();
    }, 2200);
}

function crearPedido() {
    // Se revisa el stock otra vez por si cambió mientras se pagaba
    for (let item of carrito) {
        let p = buscarProducto(item.id);
        if (!p || cantidadEnCarrito(item.id, item.talla) > (Number(p.stockTallas[item.talla]) || 0)) {
            limpiarCarrito();
            guardarCarrito();
            mostrarToast("Una prenda se quedó sin stock. Revisamos tu carrito.", "error");
            setTimeout(function () { window.location.href = "carrito.html"; }, 1500);
            return;
        }
    }
    let t = calcularTotales(zonaCheckout());
    let items = carrito.map(function (item) {
        let p = buscarProducto(item.id);
        p.stockTallas[item.talla] -= item.cantidad;
        return { id: p.id, nombre: p.nombre, categoria: p.categoria, talla: item.talla, color: item.color, cantidad: item.cantidad,
            precio: precioFinal(p), precioLista: p.precio, oferta: ofertaVigente(p), imagen: p.imagen };
    });
    let pendiente = ["pagoefectivo", "transferencia"].includes(datosCheckout.metodo);
    let pedido = {
        id: "NV-" + String(Date.now()).slice(-6),
        cliente: sesion.correo, nombre: datosCheckout.nombre, fecha: new Date().toISOString(), items: items,
        subtotal: t.subtotal, descuentoCupon: t.descuentoCupon, cupon: t.cupon && !t.mensajeCupon ? t.cupon.codigo : "",
        envio: t.envio, total: t.total, metodo: datosCheckout.metodo, pagoDetalle: datosCheckout.pagoDetalle,
        estado: pendiente ? "Pendiente de pago" : (datosCheckout.metodo === "contraentrega" ? "Preparando" : "Pagado"),
        entrega: datosCheckout.entrega === "recojo" ? { tipo: "recojo", direccion: datosCheckout.tienda, distrito: "" }
            : { tipo: "domicilio", direccion: datosCheckout.direccion, distrito: datosCheckout.distrito, referencia: datosCheckout.referencia, zona: datosCheckout.zona, departamento: datosCheckout.departamento },
        telefono: datosCheckout.telefono, dni: datosCheckout.dni
    };
    pedidos.push(pedido);
    guardarPedidos();
    guardarProductos();
    carrito = [];
    guardarCarrito();
    quitarCupon();

    let llegada = new Date();
    llegada.setDate(llegada.getDate() + (pedido.entrega.tipo === "recojo" ? 1 : (datosCheckout.zona === "provincia" ? 5 : 2)));
    let extra = "";
    if (pedido.metodo === "pagoefectivo") {
        extra = '<div class="caja-cip"><p>Tu código de pago <b>CIP</b>:</p><strong>' + escapar(pedido.pagoDetalle.replace("CIP ", "")) + "</strong>" +
            "<p>Págalo en las próximas 24 horas desde tu banca móvil (BCP, BBVA, Interbank, Scotiabank) o en agentes y bodegas. Monto: <b>" + formatoPrecio(pedido.total) + "</b></p></div>";
    } else if (pedido.metodo === "transferencia") {
        extra = '<div class="caja-cip"><p>Validaremos tu transferencia en un máximo de 2 horas hábiles y te avisaremos por correo.</p></div>';
    }
    document.getElementById("checkout-contenido").hidden = true;
    let conf = document.getElementById("confirmacion");
    conf.hidden = false;
    conf.innerHTML = '<div class="confirmacion-caja"><div class="check-grande" aria-hidden="true">✓</div>' +
        "<h1>¡Gracias por tu compra, " + escapar(pedido.nombre.split(" ")[0]) + "!</h1>" +
        '<p>Tu pedido <b>' + escapar(pedido.id) + "</b> fue registrado. Te enviamos el detalle a <b>" + escapar(sesion.correo) + "</b>.</p>" +
        '<div class="estado-confirmacion"><span class="estado-chip ' + (pendiente ? "ambar" : "verde") + '">' + escapar(pedido.estado) + "</span>" +
        "<span>" + escapar(METODOS_PAGO[pedido.metodo]) + " · " + escapar(pedido.pagoDetalle) + "</span></div>" + extra +
        "<p>" + (pedido.entrega.tipo === "recojo" ? "Podrás recogerlo desde el " : "Llegada estimada: ") + "<b>" + llegada.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" }) + "</b></p>" +
        htmlDetallePedido(pedido) +
        '<div class="botones-accion centrado"><a class="boton" href="cuenta.html#pedidos">Ver mis pedidos</a><a class="boton boton-claro" href="catalogo.html">Seguir comprando</a></div></div>';
    activarImagenesDeRespaldo(conf);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function iniciarCheckout() {
    let contenido = document.getElementById("checkout-contenido");
    if (carrito.length === 0) {
        contenido.innerHTML = '<div class="vacio-grande"><h1>Tu carrito está vacío</h1><p>Agrega prendas para poder pagar.</p><a class="boton" href="catalogo.html">Ir al catálogo</a></div>';
        return;
    }
    if (sesion === null) {
        contenido.innerHTML = '<div class="vacio-grande"><h1>Ingresa para finalizar tu compra</h1><p>Así guardamos tu pedido y puedes seguirlo desde "Mi cuenta".</p>' +
            '<div class="botones-accion centrado"><a class="boton" href="login.html?volver=checkout.html">Ingresar</a><a class="boton boton-claro" href="registro.html?volver=checkout.html">Crear cuenta</a></div></div>';
        return;
    }
    if (esAdmin()) {
        contenido.innerHTML = '<div class="vacio-grande"><h1>Estás como administrador</h1><p>Para probar una compra, ingresa con una cuenta de cliente (cliente@novak.pe / cliente123).</p><button type="button" class="boton" data-accion="salir">Cerrar sesión</button></div>';
        return;
    }
    let cuenta = cuentaPorCorreo(sesion.correo) || {};
    let f1 = document.getElementById("form-datos");
    f1.nombre.value = cuenta.nombre || sesion.nombre;
    f1.correo.value = cuenta.correo || sesion.correo;
    f1.telefono.value = (cuenta.telefono || "").replace(/\D/g, "");
    let f2 = document.getElementById("form-entrega");
    f2.distrito.value = cuenta.distrito || "";
    f2.departamento.innerHTML = '<option value="">Elige el departamento</option>' + DEPARTAMENTOS.map(function (d) { return "<option>" + d + "</option>"; }).join("");
    f2.tienda.innerHTML = TIENDAS.map(function (t) { return "<option>" + t + "</option>"; }).join("");
    datosCheckout = { entrega: "domicilio", zona: "lima" };
    document.getElementById("qr-yape").innerHTML = qrDemostracion();
    irPaso(1);
    mostrarPanelPago();

    document.addEventListener("submit", function (evento) {
        let f = evento.target;
        if (f.id === "form-datos" || f.id === "form-entrega") {
            evento.preventDefault();
            let error = f.id === "form-datos" ? validarPaso1(f) : validarPaso2(f);
            if (error) {
                mostrarMensaje(f, error, true);
                return;
            }
            f.querySelector(".mensaje").hidden = true;
            resumenPaso(f.id === "form-datos" ? 1 : 2);
            irPaso(f.id === "form-datos" ? 2 : 3);
        } else if (f.id === "form-pago") {
            evento.preventDefault();
            procesarPago(f);
        } else if (f.id === "form-cupon-checkout") {
            evento.preventDefault();
            if (f.codigo.value.trim()) { aplicarCupon(f.codigo.value); } else { quitarCupon(); }
            dibujarResumenCheckout();
        }
    });
    document.addEventListener("click", function (evento) {
        let editar = evento.target.closest("[data-editar-paso]");
        if (editar) { irPaso(Number(editar.dataset.editarPaso)); }
    });
    document.addEventListener("change", function (evento) {
        let t = evento.target;
        if (t.name === "entrega" || t.name === "zona") {
            let f = document.getElementById("form-entrega");
            datosCheckout.entrega = f.entrega.value;
            datosCheckout.zona = f.zona.value;
            document.getElementById("campos-domicilio").hidden = f.entrega.value !== "domicilio";
            document.getElementById("campos-recojo").hidden = f.entrega.value !== "recojo";
            document.getElementById("campo-departamento").hidden = f.zona.value !== "provincia";
            document.querySelectorAll(".opcion-entrega").forEach(function (o) { o.classList.toggle("activo", o.querySelector("input").checked); });
            actualizarMetodosDisponibles();
            dibujarResumenCheckout();
        }
        if (t.name === "metodo") { mostrarPanelPago(); }
    });
    document.addEventListener("input", function (evento) {
        let t = evento.target;
        if (t.name === "tarjeta") {
            let d = t.value.replace(/\D/g, "").slice(0, 16);
            t.value = marcaTarjeta(d) === "Amex" ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, function (m, a, b, c) { return [a, b, c].filter(Boolean).join(" "); }) : d.replace(/(\d{4})(?=\d)/g, "$1 ");
        }
        if (t.name === "vence") {
            let d = t.value.replace(/\D/g, "").slice(0, 4);
            t.value = d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
        }
        if (t.name === "cvv" || t.name === "dni" || t.name === "telefono") {
            t.value = t.value.replace(/\D/g, "");
        }
        if (["tarjeta", "titular", "vence"].includes(t.name)) { actualizarTarjetaVisual(); }
    });
    document.addEventListener("focusin", function (evento) {
        let tv = document.getElementById("tarjeta-visual");
        if (tv) { tv.classList.toggle("volteada", evento.target.name === "cvv"); }
    });
}

// =====================================================
// 6. MI CUENTA
// =====================================================
function dibujarCuenta() {
    let caja = document.getElementById("cuenta-contenido");
    if (caja === null) {
        return;
    }
    let favs = favoritos.map(buscarProducto).filter(Boolean);
    let htmlFavoritos = '<section id="favoritos" class="bloque-cuenta"><h2>♥ Mis favoritos <small>' + favs.length + "</small></h2>" +
        (favs.length ? '<div class="catalogo">' + favs.map(function (p) { return crearTarjeta(p); }).join("") + "</div>"
            : '<p class="sin-datos">Aún no guardas favoritos. Toca el corazón de cualquier prenda para guardarla aquí.</p><a class="boton" href="catalogo.html">Explorar catálogo</a>') + "</section>";

    if (sesion === null) {
        caja.innerHTML = '<div class="aviso-cuenta"><h2>Ingresa a tu cuenta</h2><p>Para ver tus pedidos y tu estilo NOVAK necesitas iniciar sesión.</p>' +
            '<div class="botones-accion"><a class="boton" href="login.html?volver=cuenta.html">Ingresar</a><a class="boton boton-claro" href="registro.html">Crear cuenta</a></div></div>' + htmlFavoritos;
        activarImagenesDeRespaldo(caja);
        return;
    }
    if (esAdmin()) {
        caja.innerHTML = '<div class="aviso-cuenta"><h2>Hola, administrador</h2><p>Tu panel con estadísticas de prendas y clientes está aquí:</p><a class="boton" href="admin.html">Ir al panel admin</a></div>' + htmlFavoritos;
        activarImagenesDeRespaldo(caja);
        return;
    }
    let cuenta = cuentaPorCorreo(sesion.correo) || { correo: sesion.correo, nombre: sesion.nombre };
    let misPedidos = pedidos.filter(function (p) { return p.cliente === sesion.correo; }).slice().reverse();
    let e = estadisticasCliente(sesion.correo);
    let ahorro = 0;
    misPedidos.forEach(function (p) {
        if (p.estado === "Cancelado") { return; }
        ahorro += p.descuentoCupon || 0;
        p.items.forEach(function (i) { ahorro += (i.precioLista - i.precio) * i.cantidad; });
    });
    let etapas = ["Pagado", "Preparando", "En camino", "Entregado"];

    caja.innerHTML =
        '<div class="cuenta-cabecera"><div class="avatar">' + escapar(cuenta.nombre.charAt(0)) + "</div><div><h1>Hola, " + escapar(cuenta.nombre.split(" ")[0]) + " 👋</h1><p>" + escapar(cuenta.correo) + "</p></div>" +
        '<button type="button" class="boton boton-claro boton-chico" data-accion="salir">Cerrar sesión</button></div>' +
        '<nav class="pestanas" aria-label="Secciones de mi cuenta"><a href="#pedidos">Pedidos</a><a href="#estilo">Mi estilo</a><a href="#favoritos">Favoritos</a><a href="#datos">Mis datos</a></nav>' +

        '<section id="pedidos" class="bloque-cuenta"><h2>Mis pedidos <small>' + misPedidos.length + "</small></h2>" +
        (misPedidos.length === 0 ? '<p class="sin-datos">Todavía no tienes pedidos.</p><a class="boton" href="catalogo.html">Empezar a comprar</a>' :
            misPedidos.map(function (p) {
                let paso = etapas.indexOf(p.estado);
                return '<article class="pedido-tarjeta"><div class="pedido-cabecera"><div><b>' + escapar(p.id) + "</b><small>" + fechaCorta(p.fecha) + " · " + escapar(METODOS_PAGO[p.metodo] || p.metodo) + "</small></div>" +
                    '<span class="estado-chip ' + (p.estado === "Entregado" ? "verde" : p.estado === "Cancelado" ? "rojo" : "ambar") + '">' + escapar(p.estado) + "</span><b>" + formatoPrecio(p.total) + "</b></div>" +
                    (p.estado !== "Cancelado" && p.estado !== "Pendiente de pago" ? '<ol class="linea-tiempo">' + etapas.map(function (et, i) { return '<li class="' + (i <= paso ? "hecho" : "") + '">' + et + "</li>"; }).join("") + "</ol>" : "") +
                    '<div class="pedido-fotos">' + p.items.map(function (i) {
                        return '<img src="' + escapar(i.imagen || (buscarProducto(i.id) || {}).imagen || IMG_RESPALDO) + '" alt="' + escapar(i.nombre) + '" title="' + escapar(i.nombre + " · " + i.talla + " · " + i.color) + '" width="48" height="60">';
                    }).join("") + "</div>" +
                    '<details><summary>Ver detalle</summary>' + htmlDetallePedido(p) + "</details>" +
                    '<button type="button" class="boton boton-claro boton-chico" data-recomprar="' + escapar(p.id) + '">Volver a comprar</button></article>';
            }).join("")) + "</section>" +

        '<section id="estilo" class="bloque-cuenta"><h2>Mi estilo NOVAK</h2>' +
        (e.pedidos ? htmlIndicadores([
            [e.categoriaFavorita ? nombreCategoria(e.categoriaFavorita) : "—", "Lo que más te gusta", e.segmentoFavorito || ""],
            [e.colorFavorito ? '<span class="muestra grande" style="background:' + hexDeColor(e.colorFavorito) + '"></span>' + escapar(e.colorFavorito) : "—", "Tu color", ""],
            [e.tallaFavorita || "—", "Tu talla más pedida", ""],
            [formatoPrecio(ahorro), "Has ahorrado", "con ofertas y cupones"]
        ]) : '<p class="sin-datos">Cuando hagas tu primera compra te mostraremos tu estilo.</p>') +
        "<h3>Elegidos para ti</h3>" + rielProductos(recomendacionesPara(sesion.correo, 10)) + "</section>" +
        htmlFavoritos +

        '<section id="datos" class="bloque-cuenta"><h2>Mis datos</h2><form id="form-mis-datos" class="caja-formulario ancho" novalidate>' +
        '<div class="fila-doble"><div class="grupo-formulario"><label for="dNombre">Nombre completo</label><input id="dNombre" name="nombre" value="' + escapar(cuenta.nombre) + '" required minlength="3"></div>' +
        '<div class="grupo-formulario"><label for="dTelefono">Celular</label><input id="dTelefono" name="telefono" value="' + escapar(cuenta.telefono || "") + '" inputmode="numeric"></div></div>' +
        '<div class="fila-triple"><div class="grupo-formulario"><label for="dNacimiento">Fecha de nacimiento</label><input type="date" id="dNacimiento" name="nacimiento" value="' + escapar(cuenta.nacimiento || "") + '"></div>' +
        '<div class="grupo-formulario"><label for="dGenero">Género</label><select id="dGenero" name="genero">' +
        [["", "Prefiero no decir"], ["femenino", "Femenino"], ["masculino", "Masculino"], ["otro", "Otro"]].map(function (g) {
            return '<option value="' + g[0] + '"' + ((cuenta.genero || "") === g[0] ? " selected" : "") + ">" + g[1] + "</option>";
        }).join("") + "</select></div>" +
        '<div class="grupo-formulario"><label for="dTalla">Talla habitual</label><select id="dTalla" name="talla">' + ["XS", "S", "M", "L", "XL"].map(function (t) {
            return "<option" + (cuenta.talla === t ? " selected" : "") + ">" + t + "</option>";
        }).join("") + "</select></div></div>" +
        '<div class="grupo-formulario"><label for="dDistrito">Distrito</label><input id="dDistrito" name="distrito" value="' + escapar(cuenta.distrito || "") + '"></div>' +
        '<button type="submit" class="boton">Guardar cambios</button><p class="mensaje" role="status" hidden></p></form></section>';
    activarImagenesDeRespaldo(caja);
    activarRieles(caja);
}

function alCambiarFavoritos() {
    if (pagina === "cuenta") {
        dibujarCuenta();
    }
}

function iniciarCuenta() {
    dibujarCuenta();
    if (location.hash) {
        let destino = document.querySelector(location.hash);
        if (destino) { setTimeout(function () { destino.scrollIntoView(); }, 50); }
    }
    document.addEventListener("click", function (evento) {
        let b = evento.target.closest("[data-recomprar]");
        if (!b) { return; }
        let pedido = pedidos.find(function (p) { return p.id === b.dataset.recomprar; });
        let agregados = 0;
        pedido.items.forEach(function (i) {
            let p = buscarProducto(i.id);
            if (p && (Number(p.stockTallas[i.talla]) || 0) > cantidadEnCarrito(i.id, i.talla)) {
                let item = carrito.find(function (x) { return x.id === i.id && x.talla === i.talla && x.color === i.color; });
                if (item) { item.cantidad++; } else { carrito.push({ id: i.id, talla: i.talla, color: i.color, cantidad: 1 }); }
                agregados++;
            }
        });
        guardarCarrito();
        mostrarToast(agregados ? agregados + " prendas agregadas al carrito." : "Esas prendas ya no tienen stock en tu talla.", agregados ? "ok" : "error");
        if (agregados) { setTimeout(function () { window.location.href = "carrito.html"; }, 800); }
    });
    document.addEventListener("submit", function (evento) {
        let f = evento.target;
        if (f.id !== "form-mis-datos") { return; }
        evento.preventDefault();
        if (f.nombre.value.trim().length < 3) {
            mostrarMensaje(f, "El nombre debe tener al menos 3 letras.", true);
            return;
        }
        let cuenta = cuentaPorCorreo(sesion.correo);
        let copia = Object.assign({}, cuenta, {
            nombre: f.nombre.value.trim(), telefono: f.telefono.value.trim(), nacimiento: f.nacimiento.value,
            genero: f.genero.value, talla: f.talla.value, distrito: f.distrito.value.trim()
        });
        usuarios = usuarios.filter(function (u) { return u.correo !== copia.correo; });
        usuarios.push(copia);
        guardarLocal(CLAVES.usuarios, usuarios);
        iniciarSesion(copia);
        dibujarCabecera();
        mostrarContadores();
        mostrarMensaje(f, "Datos guardados.", false);
    });
}

// =====================================================
// 7. LOGIN, REGISTRO Y CONTACTO
// =====================================================
const PAGINAS_PERMITIDAS = ["index.html", "catalogo.html", "carrito.html", "checkout.html", "admin.html", "cuenta.html", "producto.html"];

function destinoDespuesDeLogin(cuenta) {
    let destino = new URLSearchParams(window.location.search).get("volver");
    if (destino !== null && PAGINAS_PERMITIDAS.includes(destino)) {
        if (destino === "producto.html" && document.referrer.includes("producto.html")) {
            return document.referrer;
        }
        return destino;
    }
    return cuenta.rol === "admin" ? "admin.html" : "index.html";
}

function procesarLogin(f) {
    let usuario = f.usuario.value.trim().toLowerCase();
    let clave = f.clave.value;
    let rol = (f.querySelector('input[name="rol"]:checked') || {}).value || "usuario";
    let cuenta = todasLasCuentas().find(function (c) { return (c.usuario === usuario || c.correo === usuario) && c.clave === clave; });
    if (!cuenta) {
        mostrarMensaje(f, "Correo o contraseña incorrectos.", true);
        return;
    }
    if (cuenta.rol !== rol) {
        mostrarMensaje(f, cuenta.rol === "admin" ? "Esta cuenta es de administrador. Elige la opción Administrador." : "Esta cuenta es de cliente. Elige la opción Cliente.", true);
        return;
    }
    iniciarSesion(cuenta);
    mostrarMensaje(f, "Bienvenido, " + cuenta.nombre + ". Entrando...", false);
    window.location.href = destinoDespuesDeLogin(cuenta);
}

function procesarRegistro(f) {
    let correo = f.correo.value.trim().toLowerCase();
    let nombre = f.nombre.value.trim();
    if (nombre.length < 3) { mostrarMensaje(f, "Escribe tu nombre completo.", true); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) { mostrarMensaje(f, "Escribe un correo válido.", true); return; }
    if (f.clave.value.length < 8) { mostrarMensaje(f, "La contraseña debe tener al menos 8 caracteres.", true); return; }
    if (f.clave.value !== f.clave2.value) { mostrarMensaje(f, "Las contraseñas no coinciden.", true); return; }
    let edad = calcularEdad(f.nacimiento.value);
    if (edad === null || isNaN(edad)) { mostrarMensaje(f, "Indica tu fecha de nacimiento.", true); return; }
    if (edad < 14) { mostrarMensaje(f, "Debes tener al menos 14 años para registrarte.", true); return; }
    if (!f.terminos.checked) { mostrarMensaje(f, "Acepta los términos y condiciones.", true); return; }
    if (cuentaPorCorreo(correo)) { mostrarMensaje(f, "Ya existe una cuenta con ese correo. Ingresa desde Login.", true); return; }
    let prendas = Array.prototype.map.call(f.querySelectorAll('input[name="prendas"]:checked'), function (c) { return c.value; });
    let talla = f.querySelector('input[name="talla"]:checked');
    let cuenta = {
        usuario: correo, correo: correo, clave: f.clave.value, nombre: nombre, rol: "usuario",
        nacimiento: f.nacimiento.value, genero: f.genero.value, telefono: f.telefono.value.trim(), distrito: f.distrito.value.trim(),
        talla: talla ? talla.value : "", prendas: prendas, estilo: f.estilo.value, registro: new Date().toISOString()
    };
    usuarios.push(cuenta);
    guardarLocal(CLAVES.usuarios, usuarios);
    iniciarSesion(cuenta);
    if (f.novedades.checked) {
        let suscritos = leerLocal("novak_newsletter", []);
        suscritos.push(correo);
        guardarLocal("novak_newsletter", suscritos);
    }
    mostrarMensaje(f, "¡Registro exitoso! Tu cupón de bienvenida es BIENVENIDA15. Entrando...", false);
    let volver = new URLSearchParams(location.search).get("volver");
    setTimeout(function () {
        window.location.href = PAGINAS_PERMITIDAS.includes(volver) ? volver : "catalogo.html";
    }, 1400);
}

function prepararLogin() {
    let contenido = document.getElementById("login-contenido");
    if (contenido === null || sesion === null) {
        return;
    }
    contenido.innerHTML = "<h2>Ya iniciaste sesión</h2>" +
        "<p>Ingresaste como <strong>" + escapar(sesion.nombre) + "</strong> (" + (esAdmin() ? "administrador" : "cliente") + ").</p>" +
        '<div class="botones-accion"><a class="boton" href="' + (esAdmin() ? "admin.html" : "cuenta.html") + '">' + (esAdmin() ? "Ir al panel" : "Mi cuenta") + "</a>" +
        '<button type="button" class="boton boton-claro" data-accion="salir">Cerrar sesión</button></div>';
}

document.addEventListener("submit", function (evento) {
    let f = evento.target;
    if (f.id === "form-login") {
        evento.preventDefault();
        procesarLogin(f);
    } else if (f.id === "form-registro") {
        evento.preventDefault();
        procesarRegistro(f);
    } else if (f.id === "form-resena") {
        evento.preventDefault();
        let texto = f.texto.value.trim();
        if (texto.length < 5) {
            mostrarMensaje(f, "Escribe un comentario un poco más largo.", true);
            return;
        }
        let todas = leerLocal(CLAVES.resenas, {});
        (todas[productoActual.id] = todas[productoActual.id] || []).unshift({
            nombre: sesion.nombre.split(" ")[0] + " " + (sesion.nombre.split(" ")[1] || "").charAt(0) + ".",
            estrellas: Number(f.querySelector('input[name="estrellas"]:checked').value), texto: texto, fecha: new Date().toISOString()
        });
        guardarLocal(CLAVES.resenas, todas);
        mostrarToast("¡Gracias por tu opinión!", "ok");
        dibujarFicha();
        document.getElementById("resenas").scrollIntoView();
    } else if (f.id === "form-contacto") {
        evento.preventDefault();
        if (f.nombre.value.trim().length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.correo.value.trim()) || f.mensaje.value.trim().length < 10) {
            mostrarMensaje(f, "Completa tu nombre, un correo válido y un mensaje de al menos 10 caracteres.", true);
            return;
        }
        let mensajes = leerLocal("novak_mensajes", []);
        let numero = (f.motivo.value === "reclamo" ? "REC-" : "MSG-") + String(Date.now()).slice(-6);
        mensajes.push({ numero: numero, nombre: f.nombre.value.trim(), correo: f.correo.value.trim(), motivo: f.motivo.value, mensaje: f.mensaje.value.trim(), fecha: new Date().toISOString() });
        guardarLocal("novak_mensajes", mensajes);
        mostrarMensaje(f, (f.motivo.value === "reclamo" ? "Reclamo registrado con el número " : "¡Mensaje enviado! Tu número de atención es ") + numero + ". Te responderemos en un máximo de 24 horas.", false);
        mostrarToast("Mensaje enviado.", "ok");
        f.reset();
    }
});

// =====================================================
// 8. ARRANQUE DE CADA PÁGINA
// =====================================================
function iniciarPagina() {
    switch (pagina) {
        case "index": dibujarHero(); dibujarCategoriasInicio(); dibujarSeccionesInicio(); break;
        case "catalogo": iniciarCatalogo(); break;
        case "producto": iniciarFicha(); break;
        case "carrito": iniciarCarrito(); break;
        case "checkout": iniciarCheckout(); break;
        case "cuenta": iniciarCuenta(); break;
        case "admin": iniciarAdmin(); break;
        case "login": prepararLogin(); break;
        case "contacto": {
            let motivo = new URLSearchParams(location.search).get("motivo");
            let select = document.getElementById("cMotivo");
            if (motivo && select) { select.value = motivo; }
            break;
        }
    }
}

// Se llama cuando cambian los datos (otra pestaña, el admin editó, etc.)
function redibujarPagina() {
    switch (pagina) {
        case "index": dibujarSeccionesInicio(); break;
        case "catalogo": dibujarFiltros(); dibujarCatalogo(); break;
        case "producto": dibujarFicha(); break;
        case "carrito": dibujarCarritoPagina(); break;
        case "checkout": dibujarResumenCheckout(); break;
        case "cuenta": dibujarCuenta(); break;
        case "admin": redibujarAdmin(); break;
    }
}

function alCambiarCarrito() {
    if (pagina === "carrito") { dibujarCarritoPagina(); }
    if (pagina === "checkout") { dibujarResumenCheckout(); }
}

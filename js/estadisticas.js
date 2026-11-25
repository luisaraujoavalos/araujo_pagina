/* =====================================================
   NOVAK - estadisticas.js
   Cálculo de estadísticas a partir de los pedidos guardados
   y gráficos hechos con HTML/SVG (sin librerías):
   1. Utilidades (edad, meses, conteos)
   2. Estadísticas de una prenda
   3. Estadísticas de un cliente
   4. Estadísticas globales de la tienda
   5. Gráficos: indicadores, barras y línea mensual
   6. Paneles listos para mostrar (prenda y cliente)
===================================================== */

// =====================================================
// 1. UTILIDADES
// =====================================================
function calcularEdad(nacimiento) {
    if (!nacimiento) {
        return null;
    }
    let n = new Date(nacimiento);
    let hoy = new Date();
    let edad = hoy.getFullYear() - n.getFullYear();
    if (hoy.getMonth() < n.getMonth() || (hoy.getMonth() === n.getMonth() && hoy.getDate() < n.getDate())) {
        edad--;
    }
    return edad;
}

function grupoEdad(edad) {
    if (edad === null || isNaN(edad)) { return "Sin dato"; }
    if (edad < 18) { return "Menos de 18"; }
    if (edad <= 24) { return "18 - 24 (Gen Z)"; }
    if (edad <= 34) { return "25 - 34 (Millennials)"; }
    return "35 a más";
}

function nombreGeneroCliente(g) {
    return { femenino: "Mujeres", masculino: "Hombres", otro: "Otro / prefiere no decir" }[g] || "Sin dato";
}

// Últimos n meses como [{clave:"2026-07", etiqueta:"jul"}]
function ultimosMeses(n) {
    let lista = [];
    let d = new Date();
    d.setDate(1);
    for (let i = n - 1; i >= 0; i--) {
        let m = new Date(d.getFullYear(), d.getMonth() - i, 1);
        lista.push({
            clave: m.getFullYear() + "-" + String(m.getMonth() + 1).padStart(2, "0"),
            etiqueta: m.toLocaleDateString("es-PE", { month: "short" }).replace(".", "") + (m.getMonth() === 0 ? " " + String(m.getFullYear()).slice(2) : "")
        });
    }
    return lista;
}

function claveMes(iso) {
    let d = new Date(iso);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
}

function sumar(mapa, clave, valor) {
    mapa[clave] = (mapa[clave] || 0) + valor;
}

// Convierte {clave: valor} en lista ordenada de mayor a menor
function ordenarMapa(mapa) {
    return Object.keys(mapa).map(function (k) { return { clave: k, valor: mapa[k] }; })
        .sort(function (a, b) { return b.valor - a.valor; });
}

function pedidosActivos(dias) {
    let desde = dias ? Date.now() - dias * 86400000 : 0;
    return pedidos.filter(function (p) {
        return p.estado !== "Cancelado" && new Date(p.fecha).getTime() >= desde;
    });
}

function hexDeColor(nombre) {
    return COLORES[nombre] || "#cccccc";
}

// =====================================================
// 2. ESTADÍSTICAS DE UNA PRENDA
// =====================================================
function estadisticasProducto(id, dias) {
    let e = {
        unidades: 0, ingresos: 0, pedidos: 0, compradores: {}, enOferta: 0,
        porTalla: {}, porColor: {}, porMes: {}, porGenero: {}, porEdad: {}, ultimaVenta: null
    };
    for (let pedido of pedidosActivos(dias)) {
        let tuvo = false;
        for (let item of pedido.items) {
            if (item.id !== id) {
                continue;
            }
            tuvo = true;
            let monto = item.precio * item.cantidad;
            e.unidades += item.cantidad;
            e.ingresos += monto;
            if (item.oferta) { e.enOferta += item.cantidad; }
            sumar(e.porTalla, item.talla, item.cantidad);
            sumar(e.porColor, item.color, item.cantidad);
            sumar(e.porMes, claveMes(pedido.fecha), monto);
            sumar(e.compradores, pedido.cliente, item.cantidad);
            let cuenta = cuentaPorCorreo(pedido.cliente);
            sumar(e.porGenero, nombreGeneroCliente(cuenta ? cuenta.genero : ""), item.cantidad);
            sumar(e.porEdad, grupoEdad(cuenta ? calcularEdad(cuenta.nacimiento) : null), item.cantidad);
        }
        if (tuvo) {
            e.pedidos++;
            if (e.ultimaVenta === null || pedido.fecha > e.ultimaVenta) { e.ultimaVenta = pedido.fecha; }
        }
    }
    e.vistas = eventos.vistas[id] || 0;
    e.carrito = eventos.carrito[id] || 0;
    e.conversion = e.vistas > 0 ? e.unidades / e.vistas * 100 : 0;
    e.ingresos = redondear(e.ingresos);
    return e;
}

// Ranking de todas las prendas por unidades vendidas
function rankingProductos(dias) {
    let mapa = {};
    let ingresos = {};
    for (let pedido of pedidosActivos(dias)) {
        for (let item of pedido.items) {
            sumar(mapa, item.id, item.cantidad);
            sumar(ingresos, item.id, item.precio * item.cantidad);
        }
    }
    return ordenarMapa(mapa).map(function (r) {
        return { id: r.clave, unidades: r.valor, ingresos: redondear(ingresos[r.clave]) };
    });
}

// =====================================================
// 3. ESTADÍSTICAS DE UN CLIENTE
// =====================================================
function estadisticasCliente(correo) {
    let e = {
        pedidos: 0, gastado: 0, unidades: 0, enOferta: 0,
        porCategoria: {}, porSegmento: {}, porGeneroPrenda: {}, porColor: {}, porTalla: {},
        porMetodo: {}, porMes: {}, productos: {}, fechas: []
    };
    for (let pedido of pedidos) {
        if (pedido.cliente !== correo || pedido.estado === "Cancelado") {
            continue;
        }
        e.pedidos++;
        e.gastado += pedido.total;
        e.fechas.push(pedido.fecha);
        sumar(e.porMetodo, METODOS_PAGO[pedido.metodo] || pedido.metodo, 1);
        sumar(e.porMes, claveMes(pedido.fecha), pedido.total);
        for (let item of pedido.items) {
            let p = buscarProducto(item.id);
            let categoria = item.categoria || (p ? p.categoria : "otros");
            e.unidades += item.cantidad;
            if (item.oferta) { e.enOferta += item.cantidad; }
            sumar(e.porCategoria, categoria, item.cantidad);
            sumar(e.porSegmento, SEGMENTOS[infoCategoria(categoria).segmento] || "Otros", item.cantidad);
            sumar(e.porGeneroPrenda, p ? GENEROS[p.genero] : "Sin dato", item.cantidad);
            sumar(e.porColor, item.color, item.cantidad);
            if (item.talla !== "Única") { sumar(e.porTalla, item.talla, item.cantidad); }
            sumar(e.productos, item.id, item.cantidad);
        }
    }
    e.fechas.sort();
    e.gastado = redondear(e.gastado);
    e.ticket = e.pedidos > 0 ? redondear(e.gastado / e.pedidos) : 0;
    e.primera = e.fechas[0] || null;
    e.ultima = e.fechas[e.fechas.length - 1] || null;
    e.frecuencia = e.fechas.length > 1
        ? Math.round((new Date(e.ultima) - new Date(e.primera)) / 86400000 / (e.fechas.length - 1)) : null;
    e.pctOferta = e.unidades > 0 ? Math.round(e.enOferta / e.unidades * 100) : 0;

    let top = function (mapa) { let l = ordenarMapa(mapa); return l.length ? l[0].clave : null; };
    e.categoriaFavorita = top(e.porCategoria);
    e.segmentoFavorito = top(e.porSegmento);
    e.colorFavorito = top(e.porColor);
    e.tallaFavorita = top(e.porTalla);
    e.metodoFavorito = top(e.porMetodo);
    e.vistas = eventos.vistasCliente[correo] || {};

    // Etiquetas de perfil (segmentación simple para marketing)
    e.perfil = [];
    if (e.pedidos === 0) { e.perfil.push("Sin compras"); }
    if (e.pedidos >= 8) { e.perfil.push("Cliente fiel"); }
    if (e.gastado >= 1200) { e.perfil.push("Alto valor"); }
    if (e.pctOferta >= 50) { e.perfil.push("Cazador de ofertas"); }
    if (e.ultima && Date.now() - new Date(e.ultima) > 60 * 86400000) { e.perfil.push("Inactivo +60 días"); }
    if (e.pedidos > 0 && e.pedidos <= 2) { e.perfil.push("Nuevo cliente"); }
    return e;
}

// Recomienda prendas de sus categorías y colores favoritos que aún no compró
function recomendacionesPara(correo, cantidad) {
    let e = estadisticasCliente(correo);
    let categorias = ordenarMapa(e.porCategoria).slice(0, 3).map(function (r) { return r.clave; });
    let vistas = ordenarMapa(e.vistas).map(function (r) { return r.clave; });
    let puntaje = function (p) {
        let s = 0;
        let i = categorias.indexOf(p.categoria);
        if (i >= 0) { s += 6 - i * 2; }
        if (p.colores.some(function (c) { return c.nombre === e.colorFavorito; })) { s += 2; }
        if (vistas.includes(p.id)) { s += 2; }
        if (ofertaVigente(p) && e.pctOferta >= 40) { s += 2; }
        if (e.productos[p.id]) { s -= 5; }
        return s;
    };
    return productos.filter(function (p) { return stockTotal(p) > 0; })
        .map(function (p) { return { p: p, s: puntaje(p) }; })
        .sort(function (a, b) { return b.s - a.s || b.p.precio - a.p.precio; })
        .slice(0, cantidad).map(function (r) { return r.p; });
}

function listaClientes() {
    let correos = {};
    todasLasCuentas().forEach(function (u) { if (u.rol !== "admin") { correos[u.correo] = u; } });
    pedidos.forEach(function (p) { if (!correos[p.cliente]) { correos[p.cliente] = { correo: p.cliente, nombre: p.nombre }; } });
    return Object.keys(correos).map(function (c) { return correos[c]; });
}

// =====================================================
// 4. ESTADÍSTICAS GLOBALES
// =====================================================
function estadisticasGlobales(dias) {
    let lista = pedidosActivos(dias);
    let e = { ventas: 0, pedidos: lista.length, unidades: 0, clientes: {}, porMes: {}, porCategoria: {}, porSegmento: {},
        porGenero: {}, porEdad: {}, porMetodo: {}, porColor: {}, porEstado: {} };
    for (let pedido of lista) {
        e.ventas += pedido.total;
        sumar(e.porMes, claveMes(pedido.fecha), pedido.total);
        sumar(e.porMetodo, METODOS_PAGO[pedido.metodo] || pedido.metodo, 1);
        sumar(e.porEstado, pedido.estado, 1);
        let cuenta = cuentaPorCorreo(pedido.cliente);
        let primeraVez = !e.clientes[pedido.cliente];
        sumar(e.clientes, pedido.cliente, pedido.total);
        if (primeraVez) {
            sumar(e.porGenero, nombreGeneroCliente(cuenta ? cuenta.genero : ""), 1);
            sumar(e.porEdad, grupoEdad(cuenta ? calcularEdad(cuenta.nacimiento) : null), 1);
        }
        for (let item of pedido.items) {
            let categoria = item.categoria || (buscarProducto(item.id) || {}).categoria || "otros";
            e.unidades += item.cantidad;
            sumar(e.porCategoria, categoria, item.precio * item.cantidad);
            sumar(e.porSegmento, SEGMENTOS[infoCategoria(categoria).segmento] || "Otros", item.cantidad);
            sumar(e.porColor, item.color, item.cantidad);
        }
    }
    e.ventas = redondear(e.ventas);
    e.ticket = e.pedidos > 0 ? redondear(e.ventas / e.pedidos) : 0;
    e.totalClientes = Object.keys(e.clientes).length;
    let vistas = 0;
    for (let k in eventos.vistas) { vistas += eventos.vistas[k]; }
    e.conversion = vistas > 0 ? e.unidades / vistas * 100 : 0;
    return e;
}

// =====================================================
// 5. GRÁFICOS (HTML + SVG)
// =====================================================
function htmlIndicadores(lista) {
    return '<div class="kpis">' + lista.map(function (k) {
        return '<div class="kpi"><span class="kpi-etiqueta">' + k[1] + "</span><strong>" + k[0] + "</strong>" +
            (k[2] ? "<small>" + k[2] + "</small>" : "") + "</div>";
    }).join("") + "</div>";
}

// Barras horizontales de una sola serie. items: [{etiqueta, valor, color?}]
function htmlBarras(titulo, items, formato, limite) {
    formato = formato || function (v) { return v; };
    items = items.slice(0, limite || 8);
    if (items.length === 0) {
        return '<div class="grafico"><h4>' + titulo + '</h4><p class="sin-datos">Aún no hay datos.</p></div>';
    }
    let maximo = Math.max.apply(null, items.map(function (i) { return i.valor; })) || 1;
    let total = items.reduce(function (s, i) { return s + i.valor; }, 0) || 1;
    return '<div class="grafico"><h4>' + titulo + '</h4><div class="barras">' + items.map(function (i) {
        let pct = Math.round(i.valor / total * 100);
        let muestra = i.color ? '<span class="muestra" style="background:' + escapar(i.color) + '"></span>' : "";
        return '<div class="barra-fila" data-tip="' + escapar(i.etiqueta) + ": " + escapar(formato(i.valor)) + " (" + pct + '%)">' +
            '<span class="barra-etiqueta">' + muestra + escapar(i.etiqueta) + "</span>" +
            '<span class="barra-pista"><span class="barra-relleno" style="width:' + Math.max(2, i.valor / maximo * 100) + '%"></span></span>' +
            '<span class="barra-valor">' + escapar(formato(i.valor)) + "</span></div>";
    }).join("") + "</div></div>";
}

function mapaABarras(mapa, conColor, traductor) {
    return ordenarMapa(mapa).map(function (r) {
        return { etiqueta: traductor ? traductor(r.clave) : r.clave, valor: r.valor, color: conColor ? hexDeColor(r.clave) : null };
    });
}

// Línea mensual con área suave y puntos con tooltip
function htmlLineaMensual(titulo, porMes, meses, formato) {
    let puntos = meses.map(function (m) { return { etiqueta: m.etiqueta, valor: redondear(porMes[m.clave] || 0) }; });
    let ancho = 560, alto = 200, margenIzq = 8, margenDer = 8, arriba = 18, abajo = 26;
    let maximo = Math.max.apply(null, puntos.map(function (p) { return p.valor; })) || 1;
    maximo = maximo * 1.12;
    let paso = (ancho - margenIzq - margenDer) / Math.max(1, puntos.length - 1);
    let xy = puntos.map(function (p, i) {
        return [margenIzq + i * paso, arriba + (alto - arriba - abajo) * (1 - p.valor / maximo)];
    });
    let linea = xy.map(function (c, i) { return (i ? "L" : "M") + c[0].toFixed(1) + " " + c[1].toFixed(1); }).join(" ");
    let area = linea + " L" + xy[xy.length - 1][0].toFixed(1) + " " + (alto - abajo) + " L" + xy[0][0].toFixed(1) + " " + (alto - abajo) + " Z";
    let rejilla = [0.25, 0.5, 0.75].map(function (f) {
        let y = arriba + (alto - arriba - abajo) * f;
        return '<line x1="0" x2="' + ancho + '" y1="' + y + '" y2="' + y + '" class="rejilla"/>';
    }).join("");
    let marcas = xy.map(function (c, i) {
        let tip = puntos[i].etiqueta + ": " + formato(puntos[i].valor);
        return '<g class="punto-linea" data-tip="' + escapar(tip) + '">' +
            '<rect x="' + (c[0] - paso / 2) + '" y="0" width="' + paso + '" height="' + alto + '" fill="transparent"/>' +
            '<line class="guia" x1="' + c[0] + '" x2="' + c[0] + '" y1="' + arriba + '" y2="' + (alto - abajo) + '"/>' +
            '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="4.5"/>' +
            '<text x="' + c[0] + '" y="' + (alto - 6) + '" text-anchor="' + (i === 0 ? "start" : (i === xy.length - 1 ? "end" : "middle")) + '">' + escapar(puntos[i].etiqueta) + "</text></g>";
    }).join("");
    let ultimo = puntos[puntos.length - 1];
    return '<div class="grafico grafico-linea"><h4>' + titulo + ' <small>Último mes: ' + formato(ultimo.valor) + "</small></h4>" +
        '<svg viewBox="0 0 ' + ancho + " " + alto + '" role="img" aria-label="' + escapar(titulo) + '">' +
        rejilla + '<path class="area" d="' + area + '"/><path class="trazo" d="' + linea + '"/>' + marcas + "</svg>" +
        '<details class="tabla-datos"><summary>Ver tabla</summary><table>' +
        puntos.map(function (p) { return "<tr><td>" + escapar(p.etiqueta) + "</td><td>" + formato(p.valor) + "</td></tr>"; }).join("") +
        "</table></details></div>";
}

// Tooltip compartido para todos los elementos con data-tip
(function () {
    let tip = null;
    document.addEventListener("mouseover", function (evento) {
        let el = evento.target.closest("[data-tip]");
        if (el === null) {
            if (tip) { tip.hidden = true; }
            return;
        }
        if (tip === null) {
            tip = document.createElement("div");
            tip.className = "tooltip";
            document.body.appendChild(tip);
        }
        tip.textContent = el.dataset.tip;
        tip.hidden = false;
    });
    document.addEventListener("mousemove", function (evento) {
        if (tip && !tip.hidden) {
            let x = Math.min(evento.clientX + 14, window.innerWidth - tip.offsetWidth - 8);
            tip.style.left = x + "px";
            tip.style.top = (evento.clientY + 16) + "px";
        }
    });
})();

// =====================================================
// 6. PANELES LISTOS PARA MOSTRAR
// =====================================================
function soles(v) { return formatoPrecio(v); }
function unidadesTexto(v) { return v + (v === 1 ? " und." : " und."); }

function panelEstadisticasProducto(id) {
    let p = buscarProducto(id);
    if (p === null) {
        return "<p>Producto no encontrado.</p>";
    }
    let e = estadisticasProducto(id);
    let ranking = rankingProductos();
    let puesto = ranking.findIndex(function (r) { return r.id === id; });
    let stock = stockTotal(p);
    let html = htmlIndicadores([
        [e.unidades, "Unidades vendidas", puesto >= 0 ? "Puesto #" + (puesto + 1) + " de " + productos.length : "Sin ventas aún"],
        [soles(e.ingresos), "Ingresos generados", e.pedidos + " pedidos"],
        [e.vistas, "Vistas de la ficha", e.carrito + " veces al carrito"],
        [e.conversion.toFixed(1) + "%", "Conversión", "unidades / vistas"],
        [stock, "Stock actual", stock <= 5 ? "⚠ Reponer pronto" : "En buen nivel"],
        [(e.unidades ? Math.round(e.enOferta / e.unidades * 100) : 0) + "%", "Vendido en oferta", ofertaVigente(p) ? "Oferta activa -" + p.descuento + "%" : "Sin oferta activa"]
    ]);
    html += '<div class="graficos-grilla">' +
        htmlLineaMensual("Ventas por mes (S/)", e.porMes, ultimosMeses(6), soles) +
        htmlBarras("Ventas por talla", mapaABarras(e.porTalla), unidadesTexto) +
        htmlBarras("Ventas por color", mapaABarras(e.porColor, true), unidadesTexto) +
        htmlBarras("Compradores por edad", mapaABarras(e.porEdad), unidadesTexto) +
        htmlBarras("Compradores por género", mapaABarras(e.porGenero), unidadesTexto) +
        htmlBarras("Stock disponible por talla", Object.keys(p.stockTallas).map(function (t) {
            return { etiqueta: t, valor: Number(p.stockTallas[t]) || 0 };
        }), unidadesTexto) +
        "</div>";
    let compradores = ordenarMapa(e.compradores).slice(0, 5);
    html += '<div class="grafico"><h4>Clientes que más compran esta prenda</h4>' + (compradores.length ? '<ul class="lista-ranking">' + compradores.map(function (c) {
        let cuenta = cuentaPorCorreo(c.clave);
        return '<li><button type="button" class="enlace" data-accion="perfil-cliente" data-correo="' + escapar(c.clave) + '">' +
            escapar(cuenta ? cuenta.nombre : c.clave) + "</button><span>" + unidadesTexto(c.valor) + "</span></li>";
    }).join("") + "</ul>" : '<p class="sin-datos">Aún no hay compradores.</p>') +
        (e.ultimaVenta ? '<p class="nota">Última venta: ' + fechaCorta(e.ultimaVenta) + "</p>" : "") + "</div>";
    return html;
}

function panelPerfilCliente(correo) {
    let cuenta = cuentaPorCorreo(correo) || { correo: correo, nombre: correo };
    let e = estadisticasCliente(correo);
    let edad = calcularEdad(cuenta.nacimiento);
    let cabecera = '<div class="perfil-cabecera"><div class="avatar">' + escapar((cuenta.nombre || "?").charAt(0)) + "</div><div>" +
        '<h2 id="modal-titulo">' + escapar(cuenta.nombre) + "</h2>" +
        "<p>" + escapar(correo) + (edad !== null ? " · " + edad + " años (" + grupoEdad(edad) + ")" : "") +
        (cuenta.genero ? " · " + ({ femenino: "Mujer", masculino: "Hombre", otro: "Otro" }[cuenta.genero] || "") : "") +
        (cuenta.distrito ? " · " + escapar(cuenta.distrito) : "") + "</p>" +
        '<div class="etiquetas-perfil">' + e.perfil.map(function (t) { return '<span class="chip-perfil">' + t + "</span>"; }).join("") + "</div></div></div>";

    let html = cabecera + htmlIndicadores([
        [soles(e.gastado), "Total gastado", e.pedidos + " pedidos"],
        [soles(e.ticket), "Ticket promedio", e.unidades + " prendas"],
        [e.categoriaFavorita ? nombreCategoria(e.categoriaFavorita) : "—", "Lo que más compra", e.segmentoFavorito ? "Segmento: " + e.segmentoFavorito : ""],
        [e.colorFavorito ? '<span class="muestra grande" style="background:' + hexDeColor(e.colorFavorito) + '"></span>' + escapar(e.colorFavorito) : "—", "Color favorito", ""],
        [e.tallaFavorita || "—", "Talla más comprada", cuenta.talla ? "Declarada: " + escapar(cuenta.talla) : ""],
        [e.pctOferta + "%", "Compras en oferta", e.frecuencia ? "Compra cada ~" + e.frecuencia + " días" : (e.ultima ? "Última: " + fechaCorta(e.ultima) : "")]
    ]);
    html += '<div class="graficos-grilla">' +
        htmlLineaMensual("Gasto por mes (S/)", e.porMes, ultimosMeses(6), soles) +
        htmlBarras("Categorías que compra", mapaABarras(e.porCategoria, false, nombreCategoria), unidadesTexto) +
        htmlBarras("Segmento", mapaABarras(e.porSegmento), unidadesTexto) +
        htmlBarras("Línea de prenda", mapaABarras(e.porGeneroPrenda), unidadesTexto) +
        htmlBarras("Colores que elige", mapaABarras(e.porColor, true), unidadesTexto) +
        htmlBarras("Tallas", mapaABarras(e.porTalla), unidadesTexto) +
        htmlBarras("Método de pago", mapaABarras(e.porMetodo), function (v) { return v + (v === 1 ? " pedido" : " pedidos"); }) +
        "</div>";

    let top = ordenarMapa(e.productos).slice(0, 4);
    let vistos = ordenarMapa(e.vistas).slice(0, 4);
    let lista = function (items, sufijo) {
        return '<ul class="lista-mini">' + items.map(function (r) {
            let p = buscarProducto(r.clave);
            if (!p) { return ""; }
            return '<li><img src="' + escapar(p.imagen) + '" alt="" width="40" height="50"><a href="producto.html?id=' + encodeURIComponent(p.id) + '">' + escapar(p.nombre) + "</a><span>" + r.valor + " " + sufijo + "</span></li>";
        }).join("") + "</ul>";
    };
    html += '<div class="graficos-grilla dos">' +
        '<div class="grafico"><h4>Prendas que más compró</h4>' + (top.length ? lista(top, "und.") : '<p class="sin-datos">Sin compras.</p>') + "</div>" +
        '<div class="grafico"><h4>Prendas que más mira</h4>' + (vistos.length ? lista(vistos, "vistas") : '<p class="sin-datos">Aún no hay visitas registradas con su sesión.</p>') + "</div></div>";

    let recomendadas = recomendacionesPara(correo, 4);
    html += '<div class="grafico"><h4>Recomendado para ofrecerle</h4><ul class="lista-mini">' + recomendadas.map(function (p) {
        return '<li><img src="' + escapar(p.imagen) + '" alt="" width="40" height="50"><a href="producto.html?id=' + encodeURIComponent(p.id) + '">' + escapar(p.nombre) + "</a><span>" + formatoPrecio(precioFinal(p)) + "</span></li>";
    }).join("") + "</ul></div>";
    return html;
}

function abrirEstadisticasProducto(id) {
    let p = buscarProducto(id);
    if (p === null) {
        return;
    }
    abrirModal('<div class="perfil-cabecera"><img class="miniatura-grande" src="' + escapar(p.imagen) + '" alt="" width="64" height="80"><div>' +
        '<h2 id="modal-titulo">Estadísticas: ' + escapar(p.nombre) + "</h2><p>" + escapar(nombreCategoria(p.categoria)) + " · " + GENEROS[p.genero] + " · SKU " + escapar(p.sku) +
        " · " + formatoPrecio(precioFinal(p)) + "</p></div></div>" + panelEstadisticasProducto(id) +
        '<div class="botones-accion"><a class="boton" href="producto.html?id=' + encodeURIComponent(id) + '">Ver ficha</a>' +
        '<button type="button" class="boton boton-claro" data-accion="editar" data-id="' + escapar(id) + '">Editar prenda</button></div>', "modal-grande");
}

function abrirPerfilCliente(correo) {
    abrirModal(panelPerfilCliente(correo), "modal-grande");
}

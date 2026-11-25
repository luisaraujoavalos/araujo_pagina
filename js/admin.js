/* =====================================================
   NOVAK - admin.js
   Herramientas del administrador:
   1. Formulario de prenda (tallas, colores, ofertas y 4 vistas)
   2. Eliminar prenda y actualizar stock
   3. Panel admin.html: Resumen, Productos, Clientes, Pedidos, Ofertas
   Las acciones "estadisticas", "editar", "eliminar" y "perfil-cliente"
   funcionan en cualquier página si la sesión es de administrador.
===================================================== */

function exigirAdmin() {
    if (!esAdmin()) {
        mostrarToast("Solo el administrador puede hacer esto.", "error");
        return false;
    }
    return true;
}

function generarId(nombre) {
    let base = nombre.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "prenda";
    let id = base;
    let n = 2;
    while (buscarProducto(id) !== null) {
        id = base + "-" + n;
        n++;
    }
    return id;
}

// =====================================================
// 1. FORMULARIO DE PRENDA
// =====================================================
function campoImagen(nombre, etiqueta, valor) {
    return '<div class="campo-imagen">' +
        '<img class="vista-previa" src="' + escapar(valor || IMG_RESPALDO) + '" alt="" width="70" height="88" data-previa="' + nombre + '">' +
        '<div class="grupo-formulario"><label for="img-' + nombre + '">' + etiqueta + "</label>" +
        '<input type="text" id="img-' + nombre + '" name="img-' + nombre + '" value="' + escapar(valor) + '" placeholder="img/archivo.jpg o https://...">' +
        '<label class="subir-archivo">📷 Subir foto<input type="file" accept="image/*" data-subir="' + nombre + '" hidden></label></div></div>';
}

function camposStock(categoria, actuales) {
    let tallas = PLANTILLAS[categoria] ? PLANTILLAS[categoria].tallas : ["Única"];
    return tallas.map(function (t) {
        let v = actuales && t in actuales ? actuales[t] : 0;
        return '<label class="stock-talla"><span>' + escapar(t) + '</span><input type="number" min="0" step="1" name="stock-' + escapar(t) + '" value="' + escapar(v) + '" data-talla="' + escapar(t) + '"></label>';
    }).join("");
}

function abrirFormularioProducto(id) {
    if (!exigirAdmin()) {
        return;
    }
    let p = id ? buscarProducto(id) : null;
    let d = p || {
        nombre: "", categoria: "polos", genero: "unisex", descripcion: "", detalle: "", precio: "", descuento: 0, ofertaHasta: "",
        stockTallas: null, colores: [{ nombre: "Negro", hex: COLORES.Negro }], imagen: "", vistas: {}, nuevo: true, especificaciones: []
    };
    let espec = function (nombre) {
        let fila = (d.especificaciones || []).find(function (e) { return e[0] === nombre; });
        return fila ? fila[1] : (PLANTILLAS[d.categoria] ? { "Material": PLANTILLAS[d.categoria].material, "Fit / ajuste": PLANTILLAS[d.categoria].fit, "Cuidado": PLANTILLAS[d.categoria].cuidado }[nombre] || "" : "");
    };
    let opcionesCat = CATEGORIAS.map(function (c) {
        return '<option value="' + c.id + '"' + (d.categoria === c.id ? " selected" : "") + ">" + c.nombre + "</option>";
    }).join("");
    let opcionesGen = Object.keys(GENEROS).map(function (g) {
        return '<option value="' + g + '"' + (d.genero === g ? " selected" : "") + ">" + GENEROS[g] + "</option>";
    }).join("");
    let coloresTexto = d.colores.map(function (c) { return COLORES[c.nombre] === c.hex ? c.nombre : c.nombre + ":" + c.hex; }).join(", ");
    let hasta = d.ofertaHasta ? d.ofertaHasta.slice(0, 10) : "";

    abrirModal(
        '<h2 id="modal-titulo">' + (p ? "Editar prenda" : "Agregar prenda") + "</h2>" +
        '<form id="form-producto" novalidate data-id="' + (p ? escapar(p.id) : "") + '">' +
        '<fieldset><legend>Datos principales</legend>' +
        '<div class="grupo-formulario"><label for="pNombre">Nombre</label><input type="text" id="pNombre" name="nombre" value="' + escapar(d.nombre) + '" maxlength="50" placeholder="Ej. Hoodie oversize lila"></div>' +
        '<div class="fila-triple">' +
        '<div class="grupo-formulario"><label for="pCategoria">Categoría</label><select id="pCategoria" name="categoria">' + opcionesCat + "</select></div>" +
        '<div class="grupo-formulario"><label for="pGenero">Línea</label><select id="pGenero" name="genero">' + opcionesGen + "</select></div>" +
        '<div class="grupo-formulario"><label for="pPrecio">Precio normal (S/)</label><input type="number" id="pPrecio" name="precio" value="' + escapar(d.precio) + '" min="0.1" step="0.10"></div></div>' +
        '<div class="grupo-formulario"><label for="pDesc">Descripción corta</label><input type="text" id="pDesc" name="descripcion" value="' + escapar(d.descripcion) + '" maxlength="60"></div>' +
        '<div class="grupo-formulario"><label for="pDetalle">Descripción larga (ficha)</label><textarea id="pDetalle" name="detalle" rows="3">' + escapar(d.detalle) + "</textarea></div>" +
        '<label class="casilla"><input type="checkbox" name="nuevo"' + (d.nuevo ? " checked" : "") + "> Marcar como <b>Nuevo</b></label></fieldset>" +

        '<fieldset><legend>Oferta</legend><div class="fila-doble">' +
        '<div class="grupo-formulario"><label for="pDescuento">Descuento (%)</label><input type="number" id="pDescuento" name="descuento" value="' + escapar(d.descuento || 0) + '" min="0" max="90" step="1"></div>' +
        '<div class="grupo-formulario"><label for="pHasta">Válida hasta (vacío = sin fecha)</label><input type="date" id="pHasta" name="hasta" value="' + escapar(hasta) + '"></div></div>' +
        '<p class="nota" id="vista-precio-oferta"></p></fieldset>' +

        '<fieldset><legend>Tallas y stock</legend><div class="stock-tallas" id="stock-tallas">' + camposStock(d.categoria, d.stockTallas) + "</div></fieldset>" +

        '<fieldset><legend>Colores disponibles</legend>' +
        '<div class="grupo-formulario"><label for="pColores">Separados por coma. Puedes usar: ' + Object.keys(COLORES).join(", ") + '. O un color propio así: Lila:#b39ddb</label>' +
        '<input type="text" id="pColores" name="colores" value="' + escapar(coloresTexto) + '"></div></fieldset>' +

        '<fieldset><legend>Fotos: las 4 vistas</legend><p class="nota">Puedes escribir la ruta (por ejemplo <code>img/polos-03-espalda.jpg</code>), pegar un enlace o subir la foto. Las fotos subidas se reducen y se guardan en este navegador.</p>' +
        '<div class="grilla-imagenes">' +
        campoImagen("frente", "Frente (principal)", d.imagen) +
        campoImagen("espalda", "Espalda", (d.vistas || {}).espalda) +
        campoImagen("izquierda", "Lado izquierdo", (d.vistas || {}).izquierda) +
        campoImagen("derecha", "Lado derecho", (d.vistas || {}).derecha) +
        "</div></fieldset>" +

        '<fieldset><legend>Especificaciones</legend>' +
        '<div class="grupo-formulario"><label for="pMaterial">Material</label><input type="text" id="pMaterial" name="material" value="' + escapar(espec("Material")) + '"></div>' +
        '<div class="fila-doble"><div class="grupo-formulario"><label for="pFit">Fit / ajuste</label><input type="text" id="pFit" name="fit" value="' + escapar(espec("Fit / ajuste")) + '"></div>' +
        '<div class="grupo-formulario"><label for="pCuidado">Cuidado</label><input type="text" id="pCuidado" name="cuidado" value="' + escapar(espec("Cuidado")) + '"></div></div></fieldset>' +

        '<div class="botones-accion"><button type="submit" class="boton">' + (p ? "Guardar cambios" : "Agregar prenda") + "</button>" +
        '<button type="button" class="boton boton-claro" data-accion="cerrar-modal">Cancelar</button></div>' +
        '<p class="mensaje" role="alert" hidden></p></form>', "modal-grande");
    actualizarVistaOferta();
}

function actualizarVistaOferta() {
    let f = document.getElementById("form-producto");
    let nota = document.getElementById("vista-precio-oferta");
    if (!f || !nota) {
        return;
    }
    let precio = parseFloat(f.precio.value);
    let dcto = parseInt(f.descuento.value, 10) || 0;
    nota.textContent = (precio > 0 && dcto > 0)
        ? "Precio con oferta: " + formatoPrecio(redondear(precio * (1 - dcto / 100))) + " (antes " + formatoPrecio(precio) + ")"
        : "Sin descuento: el cliente verá el precio normal.";
}

// Reduce la foto subida y la convierte en texto (data URL) para guardarla
function procesarFotoSubida(input) {
    let archivo = input.files[0];
    if (!archivo) {
        return;
    }
    let lector = new FileReader();
    lector.onload = function () {
        let img = new Image();
        img.onload = function () {
            let escala = Math.min(1, 700 / Math.max(img.width, img.height));
            let lienzo = document.createElement("canvas");
            lienzo.width = Math.round(img.width * escala);
            lienzo.height = Math.round(img.height * escala);
            lienzo.getContext("2d").drawImage(img, 0, 0, lienzo.width, lienzo.height);
            let datos = lienzo.toDataURL("image/jpeg", 0.8);
            let nombre = input.dataset.subir;
            document.getElementById("img-" + nombre).value = datos;
            document.querySelector('[data-previa="' + nombre + '"]').src = datos;
            mostrarToast("Foto lista (" + Math.round(datos.length / 1024) + " KB). Guarda para aplicarla.", "ok");
        };
        img.src = lector.result;
    };
    lector.readAsDataURL(archivo);
}

function rutaValida(texto) {
    return texto === "" || /^(https?:\/\/|data:image\/|\.?\.?\/?[\w\-./ ]+\.(jpe?g|png|webp|gif|avif)$)/i.test(texto);
}

function guardarFormularioProducto(f) {
    let nombre = f.nombre.value.trim();
    let precio = parseFloat(f.precio.value);
    let descuento = parseInt(f.descuento.value, 10) || 0;
    if (nombre.length < 3) {
        mostrarMensaje(f, "El nombre debe tener al menos 3 letras.", true);
        return;
    }
    if (isNaN(precio) || precio <= 0) {
        mostrarMensaje(f, "Ingresa un precio mayor que 0.", true);
        return;
    }
    if (descuento < 0 || descuento > 90) {
        mostrarMensaje(f, "El descuento debe estar entre 0 y 90%.", true);
        return;
    }
    let stockTallas = {};
    let errorStock = false;
    f.querySelectorAll("[data-talla]").forEach(function (input) {
        let v = parseInt(input.value, 10);
        if (isNaN(v) || v < 0) { errorStock = true; }
        stockTallas[input.dataset.talla] = Math.max(0, v || 0);
    });
    if (errorStock) {
        mostrarMensaje(f, "El stock de cada talla debe ser 0 o más.", true);
        return;
    }
    let colores = [];
    let errorColor = "";
    f.colores.value.split(",").map(function (c) { return c.trim(); }).filter(Boolean).forEach(function (c) {
        let partes = c.split(":");
        let nombreColor = partes[0].trim();
        nombreColor = nombreColor.charAt(0).toUpperCase() + nombreColor.slice(1).toLowerCase();
        let hex = partes[1] ? partes[1].trim() : COLORES[nombreColor];
        if (!hex || !/^#[0-9a-f]{3,6}$/i.test(hex)) {
            errorColor = c;
        } else {
            colores.push({ nombre: nombreColor, hex: hex });
        }
    });
    if (errorColor) {
        mostrarMensaje(f, 'No reconozco el color "' + errorColor + '". Usa uno de la lista o escribe Nombre:#hex.', true);
        return;
    }
    if (colores.length === 0) {
        mostrarMensaje(f, "Agrega al menos un color.", true);
        return;
    }
    let rutas = {};
    let rutaMala = "";
    ["frente", "espalda", "izquierda", "derecha"].forEach(function (v) {
        rutas[v] = f["img-" + v].value.trim();
        if (!rutaValida(rutas[v])) { rutaMala = v; }
    });
    if (rutaMala) {
        mostrarMensaje(f, "La foto de " + rutaMala + " debe ser una ruta de imagen (img/archivo.jpg), un enlace https:// o una foto subida.", true);
        return;
    }

    let datos = {
        nombre: nombre, categoria: f.categoria.value, genero: f.genero.value,
        descripcion: f.descripcion.value.trim(), detalle: f.detalle.value.trim(),
        precio: redondear(precio), descuento: descuento,
        ofertaHasta: descuento > 0 && f.hasta.value ? new Date(f.hasta.value + "T23:59:59").toISOString() : "",
        stockTallas: stockTallas, colores: colores, nuevo: f.nuevo.checked,
        imagen: rutas.frente, vistas: { espalda: rutas.espalda, izquierda: rutas.izquierda, derecha: rutas.derecha }
    };
    let id = f.dataset.id;
    let p = id ? buscarProducto(id) : null;
    let especificaciones = (p ? p.especificaciones : []).filter(function (e) {
        return !["Material", "Fit / ajuste", "Cuidado"].includes(e[0]);
    });
    datos.especificaciones = [["Material", f.material.value.trim()], ["Fit / ajuste", f.fit.value.trim()], ["Cuidado", f.cuidado.value.trim()]]
        .filter(function (e) { return e[1] !== ""; }).concat(especificaciones);

    let mensaje;
    if (p) {
        Object.assign(p, datos);
        mensaje = "Prenda actualizada: " + nombre;
    } else {
        datos.id = generarId(nombre);
        datos.sku = "NVK-" + datos.id.toUpperCase().replace(/[^A-Z0-9]/g, "");
        datos.fecha = new Date().toLocaleDateString("es-PE");
        productos.unshift(datos);
        mensaje = "Prenda agregada: " + nombre;
    }
    if (!guardarLocal(CLAVES.productos, productos)) {
        mostrarMensaje(f, "No se pudo guardar: el navegador se quedó sin espacio. Usa rutas img/... en vez de subir fotos pesadas.", true);
        return;
    }
    limpiarCarrito();
    guardarLocal(CLAVES.carrito, carrito);
    cerrarModal();
    mostrarToast(mensaje, "ok");
    if (typeof redibujarPagina === "function") { redibujarPagina(); }
}

// =====================================================
// 2. ELIMINAR Y STOCK
// =====================================================
function eliminarProducto(id) {
    if (!exigirAdmin()) {
        return;
    }
    let p = buscarProducto(id);
    if (p === null || !confirm('¿Eliminar "' + p.nombre + '" de la tienda? Esta acción no se puede deshacer.')) {
        return;
    }
    productos = productos.filter(function (x) { return x.id !== id; });
    guardarProductos();
    limpiarCarrito();
    guardarLocal(CLAVES.carrito, carrito);
    mostrarToast("Prenda eliminada: " + p.nombre, "ok");
    if (pagina === "producto") {
        window.location.href = "catalogo.html";
        return;
    }
    if (typeof redibujarPagina === "function") { redibujarPagina(); }
}

function abrirStockRapido(id) {
    if (!exigirAdmin()) {
        return;
    }
    let p = buscarProducto(id);
    abrirModal('<h2 id="modal-titulo">Stock de ' + escapar(p.nombre) + "</h2>" +
        '<form id="form-stock" data-id="' + escapar(id) + '" novalidate><div class="stock-tallas">' + camposStock(p.categoria, p.stockTallas) + "</div>" +
        '<div class="botones-accion"><button class="boton" type="submit">Guardar stock</button><button type="button" class="boton boton-claro" data-accion="cerrar-modal">Cancelar</button></div>' +
        '<p class="mensaje" role="alert" hidden></p></form>', "modal-mediano");
}

// Eventos del administrador (sirven en todas las páginas)
document.addEventListener("click", function (evento) {
    let boton = evento.target.closest("[data-accion]");
    if (boton === null) {
        return;
    }
    let id = boton.dataset.id;
    switch (boton.dataset.accion) {
        case "nuevo": abrirFormularioProducto(null); break;
        case "editar": abrirFormularioProducto(id); break;
        case "eliminar": eliminarProducto(id); break;
        case "stock": abrirStockRapido(id); break;
        case "estadisticas": if (exigirAdmin()) { abrirEstadisticasProducto(id); } break;
        case "perfil-cliente": if (exigirAdmin()) { abrirPerfilCliente(boton.dataset.correo); } break;
    }
});

document.addEventListener("change", function (evento) {
    let t = evento.target;
    if (t.dataset && t.dataset.subir) {
        procesarFotoSubida(t);
    }
    if (t.id === "pCategoria") {
        let actuales = {};
        document.querySelectorAll("#stock-tallas [data-talla]").forEach(function (i) { actuales[i.dataset.talla] = i.value; });
        document.getElementById("stock-tallas").innerHTML = camposStock(t.value, actuales);
    }
});

document.addEventListener("input", function (evento) {
    let t = evento.target;
    if (t.id === "pPrecio" || t.id === "pDescuento") {
        actualizarVistaOferta();
    }
    if (t.id && t.id.indexOf("img-") === 0 && rutaValida(t.value.trim()) && t.value.trim()) {
        let previa = document.querySelector('[data-previa="' + t.id.slice(4) + '"]');
        if (previa) { previa.src = t.value.trim(); }
    }
});

document.addEventListener("submit", function (evento) {
    let f = evento.target;
    if (f.id === "form-producto") {
        evento.preventDefault();
        guardarFormularioProducto(f);
    } else if (f.id === "form-stock") {
        evento.preventDefault();
        let p = buscarProducto(f.dataset.id);
        let nuevo = {};
        let malo = false;
        f.querySelectorAll("[data-talla]").forEach(function (i) {
            let v = parseInt(i.value, 10);
            if (isNaN(v) || v < 0) { malo = true; }
            nuevo[i.dataset.talla] = Math.max(0, v || 0);
        });
        if (malo) {
            mostrarMensaje(f, "Cada talla debe tener 0 o más unidades.", true);
            return;
        }
        p.stockTallas = nuevo;
        guardarProductos();
        limpiarCarrito();
        guardarLocal(CLAVES.carrito, carrito);
        cerrarModal();
        mostrarToast("Stock actualizado: " + stockTotal(p) + " unidades de " + p.nombre, "ok");
        if (typeof redibujarPagina === "function") { redibujarPagina(); }
    }
});

// =====================================================
// 3. PÁGINA admin.html
// =====================================================
let pestanaAdmin = "resumen";

function iniciarAdmin() {
    if (!esAdmin()) {
        window.location.replace("login.html?volver=admin.html");
        return;
    }
    let hash = location.hash.replace("#", "");
    if (document.getElementById("tab-" + hash)) {
        pestanaAdmin = hash;
    }
    let filtroCat = document.getElementById("filtro-cat-admin");
    filtroCat.innerHTML = '<option value="">Todas las categorías</option>' + CATEGORIAS.map(function (c) {
        return '<option value="' + c.id + '">' + c.nombre + "</option>";
    }).join("");
    let ofertaCat = document.getElementById("oferta-categoria");
    ofertaCat.innerHTML = '<option value="todas">Toda la tienda</option>' + CATEGORIAS.map(function (c) {
        return '<option value="' + c.id + '">' + c.nombre + "</option>";
    }).join("");
    document.getElementById("estado-filtro").innerHTML = '<option value="">Todos los estados</option>' + ESTADOS_PEDIDO.map(function (e) {
        return "<option>" + e + "</option>";
    }).join("");
    mostrarPestana(pestanaAdmin);

    document.addEventListener("click", function (evento) {
        let tab = evento.target.closest("[data-tab]");
        if (tab) {
            mostrarPestana(tab.dataset.tab);
            history.replaceState(null, "", "#" + tab.dataset.tab);
        }
        let b = evento.target.closest("[data-accion]");
        if (!b) {
            return;
        }
        switch (b.dataset.accion) {
            case "quitar-oferta": {
                let p = buscarProducto(b.dataset.id);
                p.descuento = 0; p.ofertaHasta = "";
                guardarProductos(); dibujarOfertasAdmin();
                mostrarToast("Oferta quitada de " + p.nombre, "ok");
                break;
            }
            case "alternar-cupon": {
                let c = cupones.find(function (x) { return x.codigo === b.dataset.codigo; });
                c.activo = !c.activo; guardarCupones(); dibujarOfertasAdmin();
                break;
            }
            case "borrar-cupon":
                if (confirm("¿Eliminar el cupón " + b.dataset.codigo + "?")) {
                    cupones = cupones.filter(function (x) { return x.codigo !== b.dataset.codigo; });
                    guardarCupones(); dibujarOfertasAdmin();
                }
                break;
            case "ver-pedido": abrirDetallePedido(b.dataset.pedido); break;
        }
    });
    document.addEventListener("input", function (evento) {
        if (["buscar-producto-admin", "buscar-cliente-admin"].includes(evento.target.id)) {
            redibujarPagina();
        }
    });
    document.addEventListener("change", function (evento) {
        let t = evento.target;
        if (["rango-resumen", "filtro-cat-admin", "estado-filtro", "orden-productos-admin"].includes(t.id)) {
            redibujarPagina();
        }
        if (t.dataset.estadoPedido) {
            cambiarEstadoPedido(t.dataset.estadoPedido, t.value, t);
        }
        if (t.dataset.dctoProducto) {
            let p = buscarProducto(t.dataset.dctoProducto);
            let v = parseInt(t.value, 10);
            if (isNaN(v) || v < 0 || v > 90) {
                mostrarToast("El descuento debe estar entre 0 y 90%.", "error");
                t.value = p.descuento;
                return;
            }
            p.descuento = v;
            if (v === 0) { p.ofertaHasta = ""; }
            guardarProductos(); dibujarOfertasAdmin();
            mostrarToast("Descuento de " + p.nombre + ": " + v + "%", "ok");
        }
    });
    document.addEventListener("submit", function (evento) {
        let f = evento.target;
        if (f.id === "form-campana") {
            evento.preventDefault();
            if (!f.fin.value) {
                mostrarMensaje(f, "Elige la fecha y hora de término.", true);
                return;
            }
            let anterior = campana.fin;
            campana = { nombre: f.nombre.value.trim() || "Ofertas NOVAK", subtitulo: f.subtitulo.value.trim(), fin: new Date(f.fin.value).toISOString() };
            // Las ofertas que terminaban con la campaña anterior se extienden a la nueva fecha
            productos.forEach(function (p) {
                if (p.descuento > 0 && (p.ofertaHasta === anterior || !p.ofertaHasta || f.extender.checked)) {
                    p.ofertaHasta = campana.fin;
                }
            });
            guardarCampana(); guardarProductos();
            mostrarMensaje(f, "Campaña guardada. La cuenta regresiva y las ofertas ya usan la nueva fecha.", false);
            dibujarOfertasAdmin();
        } else if (f.id === "form-oferta-masiva") {
            evento.preventDefault();
            let pct = parseInt(f.porcentaje.value, 10);
            if (isNaN(pct) || pct < 0 || pct > 90) {
                mostrarMensaje(f, "El porcentaje debe estar entre 0 y 90.", true);
                return;
            }
            let cat = f.categoria.value;
            let cuenta = 0;
            productos.forEach(function (p) {
                if (cat === "todas" || p.categoria === cat) {
                    p.descuento = pct;
                    p.ofertaHasta = pct > 0 ? campana.fin : "";
                    cuenta++;
                }
            });
            guardarProductos();
            mostrarMensaje(f, pct > 0 ? pct + "% aplicado a " + cuenta + " prendas hasta el fin de la campaña." : "Se quitó la oferta a " + cuenta + " prendas.", false);
            dibujarOfertasAdmin();
        } else if (f.id === "form-cupon") {
            evento.preventDefault();
            let codigo = f.codigo.value.trim().toUpperCase().replace(/\s+/g, "");
            let valor = parseFloat(f.valor.value) || 0;
            let minimo = parseFloat(f.minimo.value) || 0;
            if (!/^[A-Z0-9]{4,15}$/.test(codigo)) {
                mostrarMensaje(f, "El código debe tener de 4 a 15 letras o números.", true);
                return;
            }
            if (cupones.some(function (c) { return c.codigo === codigo; })) {
                mostrarMensaje(f, "Ese código ya existe.", true);
                return;
            }
            if (f.tipo.value !== "envio" && (valor <= 0 || (f.tipo.value === "porcentaje" && valor > 90))) {
                mostrarMensaje(f, "Ingresa un valor válido (porcentaje hasta 90).", true);
                return;
            }
            let descripcion = f.tipo.value === "porcentaje" ? valor + "% de descuento" : (f.tipo.value === "monto" ? "S/ " + valor + " de descuento" : "Envío gratis");
            if (minimo > 0) { descripcion += " desde " + formatoPrecio(minimo); }
            cupones.push({ codigo: codigo, tipo: f.tipo.value, valor: valor, minimo: minimo, activo: true, descripcion: descripcion });
            guardarCupones();
            f.reset();
            mostrarToast("Cupón " + codigo + " creado.", "ok");
            dibujarOfertasAdmin();
        }
    });
}

function mostrarPestana(nombre) {
    pestanaAdmin = nombre;
    document.querySelectorAll("[data-tab]").forEach(function (b) {
        b.classList.toggle("activa", b.dataset.tab === nombre);
        b.setAttribute("aria-selected", b.dataset.tab === nombre);
    });
    document.querySelectorAll(".pestana-panel").forEach(function (p) {
        p.hidden = p.id !== "tab-" + nombre;
    });
    redibujarPagina();
}

function redibujarAdmin() {
    if (pestanaAdmin === "resumen") { dibujarResumenAdmin(); }
    if (pestanaAdmin === "productos") { dibujarProductosAdmin(); }
    if (pestanaAdmin === "clientes") { dibujarClientesAdmin(); }
    if (pestanaAdmin === "pedidos") { dibujarPedidosAdmin(); }
    if (pestanaAdmin === "ofertas") { dibujarOfertasAdmin(); }
    activarImagenesDeRespaldo(document.getElementById("contenido"));
}

function dibujarResumenAdmin() {
    let dias = parseInt(document.getElementById("rango-resumen").value, 10) || 0;
    let e = estadisticasGlobales(dias);
    let bajos = productos.filter(function (p) { return stockTotal(p) <= 5; });
    document.getElementById("resumen-kpis").innerHTML = htmlIndicadores([
        [soles(e.ventas), "Ventas", e.pedidos + " pedidos"],
        [soles(e.ticket), "Ticket promedio", e.unidades + " prendas vendidas"],
        [e.totalClientes, "Clientes que compraron", listaClientes().length + " registrados"],
        [e.conversion.toFixed(1) + "%", "Conversión de la tienda", "unidades vendidas / vistas"],
        [productos.filter(ofertaVigente).length, "Prendas en oferta", "Termina: " + fechaCorta(campana.fin)],
        [bajos.length, "Con stock bajo", "5 unidades o menos"]
    ]);
    let ranking = rankingProductos(dias).slice(0, 8);
    document.getElementById("resumen-graficos").innerHTML =
        '<div class="graficos-grilla">' +
        htmlLineaMensual("Ventas por mes (S/)", e.porMes, ultimosMeses(6), soles) +
        htmlBarras("Ventas por categoría (S/)", mapaABarras(e.porCategoria, false, nombreCategoria), soles, 12) +
        htmlBarras("Segmento más vendido", mapaABarras(e.porSegmento), unidadesTexto) +
        htmlBarras("Clientes por edad", mapaABarras(e.porEdad), function (v) { return v + " clientes"; }) +
        htmlBarras("Clientes por género", mapaABarras(e.porGenero), function (v) { return v + " clientes"; }) +
        htmlBarras("Colores más vendidos", mapaABarras(e.porColor, true), unidadesTexto) +
        htmlBarras("Métodos de pago", mapaABarras(e.porMetodo), function (v) { return v + " pedidos"; }) +
        "</div>" +
        '<div class="graficos-grilla dos"><div class="grafico"><h4>Top prendas más vendidas</h4><ol class="lista-ranking">' + ranking.map(function (r) {
            let p = buscarProducto(r.id);
            return p ? '<li><button type="button" class="enlace" data-accion="estadisticas" data-id="' + escapar(p.id) + '">' + escapar(p.nombre) + "</button><span>" + r.unidades + " und. · " + soles(r.ingresos) + "</span></li>" : "";
        }).join("") + "</ol></div>" +
        '<div class="grafico"><h4>⚠ Reponer stock</h4>' + (bajos.length ? '<ul class="lista-ranking">' + bajos.slice(0, 8).map(function (p) {
            return '<li><span>' + escapar(p.nombre) + '</span><button type="button" class="boton boton-claro boton-chico" data-accion="stock" data-id="' + escapar(p.id) + '">' + stockTotal(p) + " und. · Reponer</button></li>";
        }).join("") + "</ul>" : '<p class="sin-datos">Todo el stock está en buen nivel.</p>') + "</div></div>";
}

function dibujarProductosAdmin() {
    let texto = document.getElementById("buscar-producto-admin").value.trim().toLowerCase();
    let cat = document.getElementById("filtro-cat-admin").value;
    let orden = document.getElementById("orden-productos-admin").value;
    let ventas = {};
    rankingProductos().forEach(function (r) { ventas[r.id] = r; });
    let lista = productos.filter(function (p) {
        return (!cat || p.categoria === cat) && (p.nombre + " " + p.sku).toLowerCase().includes(texto);
    });
    lista.sort(function (a, b) {
        if (orden === "vendidos") { return ((ventas[b.id] || {}).unidades || 0) - ((ventas[a.id] || {}).unidades || 0); }
        if (orden === "stock") { return stockTotal(a) - stockTotal(b); }
        if (orden === "vistas") { return (eventos.vistas[b.id] || 0) - (eventos.vistas[a.id] || 0); }
        return 0;
    });
    let cuerpo = document.getElementById("cuerpo-inventario");
    cuerpo.innerHTML = lista.map(function (p) {
        let st = stockTotal(p);
        let clase = st <= 0 ? " agotado" : (st <= 5 ? " poco" : "");
        let v = ventas[p.id] || { unidades: 0, ingresos: 0 };
        return "<tr>" +
            '<td><div class="celda-producto"><img class="miniatura" src="' + escapar(p.imagen || IMG_RESPALDO) + '" alt="" width="44" height="55"><span><a href="producto.html?id=' + encodeURIComponent(p.id) + '">' + escapar(p.nombre) + "</a><small>" + escapar(p.sku) + " · " + GENEROS[p.genero] + "</small></span></div></td>" +
            "<td>" + escapar(nombreCategoria(p.categoria)) + "</td>" +
            "<td>" + formatoPrecio(precioFinal(p)) + (ofertaVigente(p) ? ' <span class="pastilla-dcto">-' + p.descuento + "%</span>" : "") + "</td>" +
            '<td><span class="stock-pastilla' + clase + '" title="' + escapar(Object.keys(p.stockTallas).map(function (t) { return t + ": " + p.stockTallas[t]; }).join(" · ")) + '">' + st + "</span></td>" +
            "<td>" + v.unidades + "</td><td>" + (eventos.vistas[p.id] || 0) + "</td>" +
            '<td><div class="acciones-fila">' +
            '<button type="button" class="boton boton-chico" data-accion="estadisticas" data-id="' + escapar(p.id) + '">Estadísticas</button>' +
            '<button type="button" class="boton boton-claro boton-chico" data-accion="editar" data-id="' + escapar(p.id) + '">Editar</button>' +
            '<button type="button" class="boton boton-claro boton-chico" data-accion="stock" data-id="' + escapar(p.id) + '">Stock</button>' +
            '<button type="button" class="boton boton-peligro boton-chico" data-accion="eliminar" data-id="' + escapar(p.id) + '">Eliminar</button>' +
            "</div></td></tr>";
    }).join("");
    document.getElementById("sin-inventario").hidden = lista.length > 0;
    document.getElementById("conteo-productos").textContent = lista.length + " de " + productos.length + " prendas";
}

function dibujarClientesAdmin() {
    let texto = document.getElementById("buscar-cliente-admin").value.trim().toLowerCase();
    let filas = listaClientes().filter(function (c) {
        return ((c.nombre || "") + " " + c.correo).toLowerCase().includes(texto);
    }).map(function (c) {
        return { c: c, e: estadisticasCliente(c.correo) };
    }).sort(function (a, b) { return b.e.gastado - a.e.gastado; });

    document.getElementById("cuerpo-clientes").innerHTML = filas.map(function (f) {
        let edad = calcularEdad(f.c.nacimiento);
        return "<tr>" +
            '<td><div class="celda-producto"><span class="avatar chico">' + escapar((f.c.nombre || "?").charAt(0)) + "</span><span>" + escapar(f.c.nombre || f.c.correo) + "<small>" + escapar(f.c.correo) + "</small></span></div></td>" +
            "<td>" + (edad !== null ? edad + " años" : "—") + "</td>" +
            "<td>" + (f.e.categoriaFavorita ? escapar(nombreCategoria(f.e.categoriaFavorita)) + "<small>" + escapar(f.e.segmentoFavorito) + "</small>" : "—") + "</td>" +
            "<td>" + (f.e.colorFavorito ? '<span class="muestra" style="background:' + hexDeColor(f.e.colorFavorito) + '"></span>' + escapar(f.e.colorFavorito) : "—") + "</td>" +
            "<td>" + (f.e.tallaFavorita || "—") + "</td>" +
            "<td>" + f.e.pedidos + "</td><td><b>" + soles(f.e.gastado) + "</b></td>" +
            "<td>" + (f.e.ultima ? fechaCorta(f.e.ultima) : "—") + "</td>" +
            '<td><button type="button" class="boton boton-chico" data-accion="perfil-cliente" data-correo="' + escapar(f.c.correo) + '">Ver estadísticas</button></td></tr>';
    }).join("");
    document.getElementById("conteo-clientes").textContent = filas.length + " clientes";
}

function dibujarPedidosAdmin() {
    let estado = document.getElementById("estado-filtro").value;
    let lista = pedidos.filter(function (p) { return !estado || p.estado === estado; }).slice().reverse();
    document.getElementById("cuerpo-pedidos").innerHTML = lista.slice(0, 150).map(function (p) {
        let opciones = ESTADOS_PEDIDO.map(function (e) {
            return "<option" + (e === p.estado ? " selected" : "") + ">" + e + "</option>";
        }).join("");
        return "<tr>" +
            '<td><button type="button" class="enlace" data-accion="ver-pedido" data-pedido="' + escapar(p.id) + '">' + escapar(p.id) + "</button></td>" +
            "<td>" + fechaCorta(p.fecha) + "</td>" +
            '<td><button type="button" class="enlace" data-accion="perfil-cliente" data-correo="' + escapar(p.cliente) + '">' + escapar(p.nombre) + "</button></td>" +
            "<td>" + p.items.reduce(function (s, i) { return s + i.cantidad; }, 0) + "</td>" +
            "<td>" + escapar(METODOS_PAGO[p.metodo] || p.metodo) + "</td>" +
            "<td><b>" + soles(p.total) + "</b></td>" +
            '<td><select class="selector-estado estado-' + p.estado.toLowerCase().replace(/\s+/g, "-") + '" data-estado-pedido="' + escapar(p.id) + '"' + (p.estado === "Cancelado" ? " disabled" : "") + ' aria-label="Estado del pedido ' + escapar(p.id) + '">' + opciones + "</select></td></tr>";
    }).join("");
    document.getElementById("conteo-pedidos").textContent = lista.length + " pedidos" + (lista.length > 150 ? " (se muestran los 150 más recientes)" : "");
}

function cambiarEstadoPedido(idPedido, nuevo, selector) {
    let pedido = pedidos.find(function (p) { return p.id === idPedido; });
    if (!pedido) {
        return;
    }
    if (nuevo === "Cancelado") {
        if (!confirm("¿Cancelar el pedido " + idPedido + "? Si es una compra real de la tienda, el stock se devuelve.")) {
            selector.value = pedido.estado;
            return;
        }
        if (!pedido.semilla) {
            pedido.items.forEach(function (i) {
                let p = buscarProducto(i.id);
                if (p && i.talla in p.stockTallas) { p.stockTallas[i.talla] += i.cantidad; }
            });
            guardarProductos();
        }
    }
    pedido.estado = nuevo;
    guardarPedidos();
    mostrarToast("Pedido " + idPedido + ": " + nuevo, "ok");
    dibujarPedidosAdmin();
}

function htmlDetallePedido(p) {
    return '<ul class="resumen-pedido">' + p.items.map(function (i) {
        return '<li><span><img src="' + escapar(i.imagen || (buscarProducto(i.id) || {}).imagen || IMG_RESPALDO) + '" alt="" width="40" height="50">' +
            i.cantidad + " × " + escapar(i.nombre) + " <small>Talla " + escapar(i.talla) + " · " + escapar(i.color) + (i.oferta ? " · en oferta" : "") + "</small></span><span>" + formatoPrecio(i.precio * i.cantidad) + "</span></li>";
    }).join("") +
        "<li><span>Subtotal</span><span>" + formatoPrecio(p.subtotal) + "</span></li>" +
        (p.descuentoCupon ? "<li><span>Cupón " + escapar(p.cupon) + "</span><span>-" + formatoPrecio(p.descuentoCupon) + "</span></li>" : "") +
        "<li><span>Envío</span><span>" + (p.envio ? formatoPrecio(p.envio) : "Gratis") + "</span></li>" +
        '<li class="total"><span>Total</span><span>' + formatoPrecio(p.total) + "</span></li></ul>";
}

function abrirDetallePedido(id) {
    let p = pedidos.find(function (x) { return x.id === id; });
    if (!p) {
        return;
    }
    abrirModal('<h2 id="modal-titulo">Pedido ' + escapar(p.id) + "</h2>" +
        "<p>" + fechaCorta(p.fecha) + " · " + escapar(p.nombre) + " (" + escapar(p.cliente) + ")<br>" +
        "Pago: " + escapar(METODOS_PAGO[p.metodo] || p.metodo) + (p.pagoDetalle ? " · " + escapar(p.pagoDetalle) : "") + "<br>" +
        "Entrega: " + (p.entrega.tipo === "recojo" ? "Recojo en tienda" : escapar((p.entrega.direccion || "") + ", " + (p.entrega.distrito || ""))) +
        '<br>Estado: <b>' + escapar(p.estado) + "</b></p>" + htmlDetallePedido(p), "modal-mediano");
}

function dibujarOfertasAdmin() {
    let f = document.getElementById("form-campana");
    f.nombre.value = campana.nombre;
    f.subtitulo.value = campana.subtitulo;
    let fin = new Date(campana.fin);
    f.fin.value = new Date(fin.getTime() - fin.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById("estado-campana").innerHTML = tiempoRestante(campana.fin).terminado
        ? '<span class="estado-chip rojo">Terminada</span> Las ofertas con esta fecha ya no se aplican. Elige una nueva fecha para reactivarlas.'
        : '<span class="estado-chip verde">Activa</span> Termina en: <span class="cuenta-regresiva chica" data-cuenta-regresiva="' + campana.fin + '"></span>';

    let enOferta = productos.filter(function (p) { return p.descuento > 0; });
    document.getElementById("cuerpo-ofertas").innerHTML = enOferta.map(function (p) {
        let vigente = ofertaVigente(p);
        return "<tr><td><div class=\"celda-producto\"><img class=\"miniatura\" src=\"" + escapar(p.imagen) + '" alt="" width="44" height="55"><span>' + escapar(p.nombre) + "</span></div></td>" +
            "<td>" + formatoPrecio(p.precio) + "</td>" +
            '<td><input type="number" class="input-chico" min="0" max="90" value="' + p.descuento + '" data-dcto-producto="' + escapar(p.id) + '" aria-label="Descuento de ' + escapar(p.nombre) + '"> %</td>' +
            "<td><b>" + formatoPrecio(redondear(p.precio * (1 - p.descuento / 100))) + "</b></td>" +
            "<td>" + (p.ofertaHasta ? fechaCorta(p.ofertaHasta) : "Sin fecha") + (vigente ? "" : ' <span class="estado-chip rojo">Vencida</span>') + "</td>" +
            '<td><button type="button" class="boton boton-peligro boton-chico" data-accion="quitar-oferta" data-id="' + escapar(p.id) + '">Quitar</button></td></tr>';
    }).join("") || '<tr><td colspan="6">No hay prendas con descuento.</td></tr>';

    let usos = {};
    pedidos.forEach(function (p) { if (p.cupon) { usos[p.cupon] = (usos[p.cupon] || 0) + 1; } });
    document.getElementById("cuerpo-cupones").innerHTML = cupones.map(function (c) {
        return "<tr><td><code>" + escapar(c.codigo) + "</code></td><td>" + escapar(c.descripcion) + "</td><td>" + (usos[c.codigo] || 0) + "</td>" +
            "<td>" + (c.activo ? '<span class="estado-chip verde">Activo</span>' : '<span class="estado-chip">Pausado</span>') + "</td>" +
            '<td><div class="acciones-fila"><button type="button" class="boton boton-claro boton-chico" data-accion="alternar-cupon" data-codigo="' + escapar(c.codigo) + '">' + (c.activo ? "Pausar" : "Activar") + "</button>" +
            '<button type="button" class="boton boton-peligro boton-chico" data-accion="borrar-cupon" data-codigo="' + escapar(c.codigo) + '">Eliminar</button></div></td></tr>';
    }).join("");
}

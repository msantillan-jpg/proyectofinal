// ---------- Filtros de los listados ----------
// Cada listado arranca sin mostrar registros: aparecen cuando se elige un filtro,
// se escribe en el buscador o se toca "Ver todo".

var CONFIG_FILTROS = [
    { tabla: "tabla-personal", buscar: true,
      selects: [{ titulo: "Rango", col: 4 }, { titulo: "Estado", col: 7 }] },

    { tabla: "tabla-vehiculos", buscar: true,
      selects: [{ titulo: "Tipo", col: 3 }, { titulo: "Estado", col: 4 }] },

    { tabla: "tabla-guardias",
      fecha: { titulo: "Fecha", col: 1 } },

    { tabla: "tabla-inventario", buscar: true,
      selects: [{ titulo: "Estado", col: 3 }, { titulo: "Vehículo", col: 4 }] },

    { tabla: "tabla-novedades", buscar: true,
      selects: [{ titulo: "Tipo de evento", col: 3 }, { titulo: "Vehículo", col: 5 }],
      fecha: { titulo: "Fecha de la guardia", col: 1 } },

    { tabla: "tabla-notas", buscar: true, vencimiento: true,
      selects: [{ titulo: "Tipo", col: 4 }, { titulo: "Estado", col: 6 }],
      fecha: { titulo: "Fecha del evento", col: 5 } },

    { tabla: "tabla-alertas", buscar: true,
      selects: [{ titulo: "Tipo", col: 2 }, { titulo: "Estado", col: 5 }],
      fecha: { titulo: "Fecha de recepción", col: 1 } },

    { tabla: "tabla-usuarios", buscar: true, ultimaEsAccion: true,
      selects: [{ titulo: "Rol", col: 3 }, { titulo: "Estado", col: 4 }] }
];

function normalizar(texto) {
    return String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Las tablas muestran fechas en dos formatos; acá se pasan los dos a AAAA-MM-DD
function aISO(texto) {
    var t = String(texto || "").trim();
    var m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[1] + "-" + m[2] + "-" + m[3];
    m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if (m) return m[3] + "-" + m[2] + "-" + m[1];
    return "";
}

function textoCelda(fila, columna) {
    return fila.cells[columna] ? fila.cells[columna].textContent.trim() : "";
}

function crearFiltros(config) {
    var tabla = document.getElementById(config.tabla);
    if (!tabla) return;
    var cuerpo = tabla.querySelector("tbody");

    var estado = { verTodo: false };

    var barra = document.createElement("div");
    barra.className = "barra-filtros";

    var controles = document.createElement("div");
    controles.className = "filtros-controles";
    barra.appendChild(controles);

    function agregarControl(titulo, elemento) {
        var grupo = document.createElement("div");
        grupo.className = "filtro-grupo";
        var rotulo = document.createElement("span");
        rotulo.textContent = titulo;
        grupo.appendChild(rotulo);
        grupo.appendChild(elemento);
        controles.appendChild(grupo);
    }

    // ----- Buscador de texto -----
    var buscador = null;
    if (config.buscar) {
        buscador = document.createElement("input");
        buscador.type = "search";
        buscador.placeholder = "Escribí para buscar...";
        buscador.setAttribute("aria-label", "Buscar");
        buscador.addEventListener("input", aplicar);
        agregarControl("Buscar", buscador);
    }

    // ----- Desplegables (sus opciones se arman con lo que hay en la tabla) -----
    var selects = (config.selects || []).map(function (definicion) {
        var elemento = document.createElement("select");
        elemento.setAttribute("aria-label", definicion.titulo);
        elemento.addEventListener("change", aplicar);
        agregarControl(definicion.titulo, elemento);
        return { def: definicion, el: elemento };
    });

    // ----- Vencimiento (solo Notas) -----
    var selVencimiento = null;
    if (config.vencimiento) {
        selVencimiento = document.createElement("select");
        selVencimiento.setAttribute("aria-label", "Vencimiento");
        [["", "Todos"], ["vencida", "Vencidas"], ["proxima", "Vencen en 7 días"]].forEach(function (par) {
            var opcion = document.createElement("option");
            opcion.value = par[0];
            opcion.textContent = par[1];
            selVencimiento.appendChild(opcion);
        });
        selVencimiento.addEventListener("change", aplicar);
        agregarControl("Vencimiento", selVencimiento);
    }

    // ----- Rango de fechas -----
    var desde = null;
    var hasta = null;
    if (config.fecha) {
        desde = document.createElement("input");
        desde.type = "date";
        desde.setAttribute("aria-label", config.fecha.titulo + " desde");
        desde.addEventListener("change", aplicar);
        agregarControl(config.fecha.titulo + " - desde", desde);

        hasta = document.createElement("input");
        hasta.type = "date";
        hasta.setAttribute("aria-label", config.fecha.titulo + " hasta");
        hasta.addEventListener("change", aplicar);
        agregarControl("hasta", hasta);
    }

    // ----- Botones y contador -----
    var acciones = document.createElement("div");
    acciones.className = "filtros-acciones";

    var botonVerTodo = document.createElement("button");
    botonVerTodo.type = "button";
    botonVerTodo.className = "btn-chico";
    botonVerTodo.textContent = "Ver todo";

    var botonLimpiar = document.createElement("button");
    botonLimpiar.type = "button";
    botonLimpiar.className = "btn-chico";
    botonLimpiar.textContent = "Limpiar filtros";

    var contador = document.createElement("span");
    contador.className = "filtros-contador";

    acciones.appendChild(botonVerTodo);
    acciones.appendChild(botonLimpiar);
    acciones.appendChild(contador);
    barra.appendChild(acciones);

    var aviso = document.createElement("p");
    aviso.className = "aviso-filtros";

    tabla.parentNode.insertBefore(barra, tabla);
    tabla.parentNode.insertBefore(aviso, tabla.nextSibling);

    botonVerTodo.addEventListener("click", function () {
        estado.verTodo = true;
        aplicar();
    });

    botonLimpiar.addEventListener("click", function () {
        if (buscador) buscador.value = "";
        selects.forEach(function (s) { s.el.value = ""; });
        if (selVencimiento) selVencimiento.value = "";
        if (desde) desde.value = "";
        if (hasta) hasta.value = "";
        estado.verTodo = false;
        aplicar();
    });

    function filasDeDatos() {
        // Las filas con una sola celda son avisos de "no hay datos", no registros
        return Array.prototype.filter.call(cuerpo.rows, function (fila) {
            return fila.cells.length > 1;
        });
    }

    function actualizarOpciones(filas) {
        selects.forEach(function (s) {
            var anterior = s.el.value;
            var valores = [];

            filas.forEach(function (fila) {
                var texto = textoCelda(fila, s.def.col);
                if (texto && valores.indexOf(texto) === -1) valores.push(texto);
            });
            valores.sort(function (a, b) { return a.localeCompare(b, "es"); });

            s.el.innerHTML = "";
            var todos = document.createElement("option");
            todos.value = "";
            todos.textContent = "Todos";
            s.el.appendChild(todos);

            valores.forEach(function (valor) {
                var opcion = document.createElement("option");
                opcion.value = valor;
                opcion.textContent = valor;
                s.el.appendChild(opcion);
            });

            if (valores.indexOf(anterior) !== -1) s.el.value = anterior;
        });
    }

    function aplicar() {
        var filas = filasDeDatos();
        var texto = buscador ? normalizar(buscador.value.trim()) : "";

        var hayFiltro = texto !== "";
        selects.forEach(function (s) { if (s.el.value) hayFiltro = true; });
        if (selVencimiento && selVencimiento.value) hayFiltro = true;
        if (desde && desde.value) hayFiltro = true;
        if (hasta && hasta.value) hayFiltro = true;

        var activo = hayFiltro || estado.verTodo;
        var visibles = 0;

        // Los avisos de "no hay datos" de la tabla siempre se ocultan
        Array.prototype.forEach.call(cuerpo.rows, function (fila) {
            if (fila.cells.length <= 1) fila.hidden = true;
        });

        filas.forEach(function (fila) {
            var mostrar = activo;

            if (mostrar && texto) {
                var cantidad = fila.cells.length - (config.ultimaEsAccion ? 1 : 0);
                var contenido = "";
                for (var i = 0; i < cantidad; i++) {
                    contenido += " " + fila.cells[i].textContent;
                }
                mostrar = normalizar(contenido).indexOf(texto) !== -1;
            }

            if (mostrar) {
                selects.forEach(function (s) {
                    if (s.el.value && textoCelda(fila, s.def.col) !== s.el.value) mostrar = false;
                });
            }

            if (mostrar && selVencimiento && selVencimiento.value) {
                var clase = (selVencimiento.value === "vencida") ? "nota-vencida" : "nota-proxima";
                if (!fila.classList.contains(clase)) mostrar = false;
            }

            if (mostrar && ((desde && desde.value) || (hasta && hasta.value))) {
                var fecha = aISO(textoCelda(fila, config.fecha.col));
                if (!fecha) {
                    mostrar = false;
                } else {
                    if (desde.value && fecha < desde.value) mostrar = false;
                    if (hasta.value && fecha > hasta.value) mostrar = false;
                }
            }

            fila.hidden = !mostrar;
            if (mostrar) visibles++;
        });

        var total = filas.length;

        if (total === 0) {
            aviso.textContent = "Todavía no hay registros.";
            aviso.hidden = false;
            contador.textContent = "";
        } else if (!activo) {
            aviso.textContent = "Elegí un filtro o escribí en el buscador para ver resultados.";
            aviso.hidden = false;
            contador.textContent = "Hay " + total + (total === 1 ? " registro" : " registros") + " en total.";
        } else if (visibles === 0) {
            aviso.textContent = "No hay resultados con esos filtros.";
            aviso.hidden = false;
            contador.textContent = "Mostrando 0 de " + total;
        } else {
            aviso.hidden = true;
            contador.textContent = "Mostrando " + visibles + " de " + total;
        }

        botonVerTodo.hidden = activo || total === 0;
    }

    // Cuando la tabla se vuelve a dibujar (por ejemplo, después de guardar),
    // se rearman las opciones y se vuelve a aplicar lo que estaba elegido
    var observador = new MutationObserver(function () {
        actualizarOpciones(filasDeDatos());
        aplicar();
    });
    observador.observe(cuerpo, { childList: true });

    actualizarOpciones(filasDeDatos());
    aplicar();
}

CONFIG_FILTROS.forEach(crearFiltros);
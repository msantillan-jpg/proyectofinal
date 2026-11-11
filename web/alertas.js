// ---------- ALERTAS DE LA COMUNIDAD ----------
// Posición de cada dato en las filas que devuelve el servidor
var COL = {
    ID: 0, FECHA: 1, TIPO: 2, REFERENCIA: 3, LATITUD: 4, LONGITUD: 5,
    VICTIMAS: 6, ATRAPADOS: 7, CANT_VEHICULOS: 8, TIPOS_VEHICULOS: 9,
    NOMBRE: 10, TELEFONO: 11, NOTA: 12, ESTADO: 13, GESTIONADO_POR: 14, FECHA_GESTION: 15
};

var tablaAlertasBody = document.querySelector("#tabla-alertas tbody");
var filtroEstadoAlerta = document.getElementById("filtro-estado-alerta");
var alertasCargadas = [];
var alertaAbierta = null;
var mapaAlerta = null;
var marcadorAlerta = null;

// ---------- Utilidades ----------
function formatearFecha(texto) {
    if (!texto) return "";
    var partes = String(texto).split(" ");
    var fecha = partes[0].split("-");
    var hora = partes[1] ? partes[1].substring(0, 5) : "";
    if (fecha.length !== 3) return String(texto);
    return fecha[2] + "/" + fecha[1] + "/" + fecha[0] + (hora ? " " + hora : "");
}

function claseEstado(estado) {
    if (estado === "Nueva") return "estado-nueva";
    if (estado === "Confirmada") return "estado-confirmada";
    if (estado === "Atendida") return "estado-atendida";
    return "estado-falsa";
}

function crearEtiquetaEstado(estado) {
    var etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-estado " + claseEstado(estado);
    etiqueta.textContent = estado;
    return etiqueta;
}

function textoLugar(alerta) {
    if (alerta[COL.REFERENCIA]) return alerta[COL.REFERENCIA];
    if (alerta[COL.LATITUD] !== null) return "Marcado en el mapa";
    return "";
}

function textoVehiculos(alerta) {
    var cantidad = alerta[COL.CANT_VEHICULOS];
    var tipos = alerta[COL.TIPOS_VEHICULOS];
    if (!cantidad && !tipos) return "";
    if (cantidad && tipos) return cantidad + " (" + tipos + ")";
    return cantidad || tipos;
}

function textoGestion(alerta) {
    if (!alerta[COL.GESTIONADO_POR]) return "";
    return alerta[COL.ESTADO] + " por " + alerta[COL.GESTIONADO_POR] +
        " el " + formatearFecha(alerta[COL.FECHA_GESTION]);
}

// ---------- Contador de alertas nuevas (barra lateral e inicio) ----------
async function actualizarInsignia() {
    var cantidad = await eel.js_contar_alertas_nuevas()();
    var insignia = document.getElementById("insignia-alertas");
    var tarjeta = document.getElementById("num-alertas");

    if (insignia) {
        insignia.textContent = cantidad > 99 ? "99+" : cantidad;
        insignia.hidden = !(cantidad > 0);
    }
    if (tarjeta) {
        tarjeta.textContent = cantidad;
    }
}

// ---------- Listado ----------
async function cargarAlertas() {
    alertasCargadas = await eel.js_listar_alertas()();
    mostrarAlertas();
    actualizarInsignia();
}

function mostrarAlertas() {
    var filtro = filtroEstadoAlerta.value;
    tablaAlertasBody.innerHTML = "";

    var visibles = alertasCargadas.filter(function (alerta) {
        return !filtro || alerta[COL.ESTADO] === filtro;
    });

    if (visibles.length === 0) {
        var filaVacia = document.createElement("tr");
        var celdaVacia = document.createElement("td");
        celdaVacia.colSpan = 6;
        celdaVacia.textContent = "No hay alertas para mostrar.";
        filaVacia.appendChild(celdaVacia);
        tablaAlertasBody.appendChild(filaVacia);
        return;
    }

    visibles.forEach(function (alerta) {
        var fila = document.createElement("tr");
        if (alerta[COL.ESTADO] === "Nueva") {
            fila.classList.add("alerta-fila-nueva");
        }

        var valores = [
            "#" + alerta[COL.ID],
            formatearFecha(alerta[COL.FECHA]),
            alerta[COL.TIPO],
            textoLugar(alerta),
            alerta[COL.VICTIMAS] || "-"
        ];

        valores.forEach(function (valor) {
            var celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        var celdaEstado = document.createElement("td");
        celdaEstado.appendChild(crearEtiquetaEstado(alerta[COL.ESTADO]));
        fila.appendChild(celdaEstado);

        fila.addEventListener("click", function () {
            abrirAlerta(alerta);
        });
        tablaAlertasBody.appendChild(fila);
    });
}

function mostrarVistaAlertas(vista) {
    document.getElementById("vista-alertas-listado").classList.toggle("active", vista === "listado");
    document.getElementById("vista-alertas-detalle").classList.toggle("active", vista === "detalle");
}

// ---------- Detalle ----------
function ponerDato(idContenedor, idValor, texto) {
    var contenedor = document.getElementById(idContenedor);
    var valor = document.getElementById(idValor);
    if (!texto) {
        contenedor.hidden = true;
        valor.textContent = "";
        return;
    }
    contenedor.hidden = false;
    valor.textContent = texto;
}

function mostrarContacto(nombre, telefono) {
    var destino = document.getElementById("alerta-contacto");
    destino.innerHTML = "";

    if (nombre) {
        destino.appendChild(document.createTextNode(nombre + " - "));
    }

    var enlace = document.createElement("a");
    enlace.href = "tel:" + String(telefono).replace(/[^\d+]/g, "");
    enlace.textContent = telefono;
    destino.appendChild(enlace);
}

function abrirAlerta(alerta) {
    alertaAbierta = alerta;

    document.getElementById("alerta-titulo").textContent =
        "Alerta #" + alerta[COL.ID] + " - " + alerta[COL.TIPO];

    var etiqueta = document.getElementById("alerta-estado");
    etiqueta.className = "etiqueta-estado " + claseEstado(alerta[COL.ESTADO]);
    etiqueta.textContent = alerta[COL.ESTADO];

    ponerDato("dato-fecha", "alerta-fecha", formatearFecha(alerta[COL.FECHA]));
    ponerDato("dato-referencia", "alerta-referencia", textoLugar(alerta));
    ponerDato("dato-victimas", "alerta-victimas", alerta[COL.VICTIMAS]);
    ponerDato("dato-atrapados", "alerta-atrapados", alerta[COL.ATRAPADOS]);
    ponerDato("dato-vehiculos", "alerta-vehiculos", textoVehiculos(alerta));
    ponerDato("dato-nota", "alerta-nota", alerta[COL.NOTA]);
    ponerDato("dato-gestion", "alerta-gestion", textoGestion(alerta));
    mostrarContacto(alerta[COL.NOMBRE], alerta[COL.TELEFONO]);

    dibujarAcciones(alerta);

    // Primero se muestra la vista y recién después se arma el mapa, así toma bien el tamaño
    mostrarVistaAlertas("detalle");
    mostrarMapaAlerta(alerta[COL.LATITUD], alerta[COL.LONGITUD]);
}

function mostrarMapaAlerta(latitud, longitud) {
    var contenedor = document.getElementById("mapa-alerta");
    var aviso = document.getElementById("mapa-alerta-aviso");
    var enlace = document.getElementById("enlace-mapa-alerta");

    if (latitud === null || longitud === null) {
        contenedor.hidden = true;
        enlace.hidden = true;
        aviso.textContent = "Esta alerta no tiene ubicación en el mapa. Mirá la referencia del lugar.";
        aviso.hidden = false;
        return;
    }

    enlace.href = "https://www.openstreetmap.org/?mlat=" + latitud + "&mlon=" + longitud +
        "#map=18/" + latitud + "/" + longitud;
    enlace.hidden = false;

    if (typeof L === "undefined") {
        contenedor.hidden = true;
        aviso.textContent = "No se pudo cargar el mapa (hace falta conexión a internet). Podés abrir la ubicación con el enlace.";
        aviso.hidden = false;
        return;
    }

    aviso.hidden = true;
    contenedor.hidden = false;

    if (!mapaAlerta) {
        mapaAlerta = L.map("mapa-alerta");
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapaAlerta);
    }

    var punto = [latitud, longitud];
    if (marcadorAlerta) {
        marcadorAlerta.setLatLng(punto);
    } else {
        marcadorAlerta = L.marker(punto).addTo(mapaAlerta);
    }

    mapaAlerta.setView(punto, 17);
    setTimeout(function () {
        mapaAlerta.invalidateSize();
        mapaAlerta.setView(punto, 17);
    }, 80);
}

// ---------- Estados ----------
function dibujarAcciones(alerta) {
    var contenedor = document.getElementById("acciones-alerta");
    contenedor.innerHTML = "";

    var estado = alerta[COL.ESTADO];
    var opciones = [];

    if (estado === "Nueva") {
        opciones = [
            { estado: "Confirmada", texto: "Confirmar alerta", clase: "btn-principal" },
            { estado: "Falsa alarma", texto: "Marcar como falsa alarma", clase: "btn-peligro" }
        ];
    } else if (estado === "Confirmada") {
        opciones = [
            { estado: "Atendida", texto: "Marcar como atendida", clase: "btn-principal" },
            { estado: "Falsa alarma", texto: "Marcar como falsa alarma", clase: "btn-peligro" }
        ];
    }

    if (opciones.length === 0) {
        var aviso = document.createElement("p");
        aviso.className = "ayuda-lista";
        aviso.textContent = "Esta alerta ya está cerrada.";
        contenedor.appendChild(aviso);
        return;
    }

    opciones.forEach(function (opcion) {
        var boton = document.createElement("button");
        boton.type = "button";
        boton.className = opcion.clase;
        boton.textContent = opcion.texto;
        boton.addEventListener("click", function () {
            cambiarEstado(opcion.estado);
        });
        contenedor.appendChild(boton);
    });
}

async function cambiarEstado(nuevoEstado) {
    if (!alertaAbierta) return;

    if (nuevoEstado === "Falsa alarma") {
        if (!confirm("¿Marcar esta alerta como falsa alarma?")) return;
    }

    await eel.js_cambiar_estado_alerta(alertaAbierta[COL.ID], nuevoEstado)();
    await cargarAlertas();
    mostrarVistaAlertas("listado");
}

// ---------- Eventos ----------
document.getElementById("btn-volver-alertas").addEventListener("click", function () {
    mostrarVistaAlertas("listado");
});

document.getElementById("btn-actualizar-alertas").addEventListener("click", cargarAlertas);
filtroEstadoAlerta.addEventListener("change", mostrarAlertas);

// Al entrar a la sección siempre se arranca por el listado, con datos frescos
document.querySelector('.nav-item[data-tab="alertas"]').addEventListener("click", function () {
    mostrarVistaAlertas("listado");
    cargarAlertas();
});

cargarAlertas();
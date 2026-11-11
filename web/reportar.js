// ---------- Formulario público de emergencia ----------
var CENTRO = [-27.3425, -65.5937];   // Concepción, Tucumán
var TIPO_ACCIDENTE = "Accidente de tránsito";
var TIPOS_CON_ATRAPADOS = ["Accidente de tránsito", "Incendio de vivienda o vehículo", "Rescate"];

var formulario = document.getElementById("form-emergencia");
var mensajeError = document.getElementById("mensaje-error");
var estadoUbicacion = document.getElementById("estado-ubicacion");
var botonEnviar = document.getElementById("btn-enviar");
var botonUbicacion = document.getElementById("btn-ubicacion");

var mapa = null;
var marcador = null;
var ubicacion = null;

// ---------- Mapa ----------
function iniciarMapa() {
    var contenedor = document.getElementById("mapa-reporte");

    // Si no hay internet, el mapa no carga: el aviso se puede enviar igual con una referencia
    if (typeof L === "undefined") {
        contenedor.innerHTML = '<p class="mapa-aviso">No se pudo cargar el mapa. Escribí una referencia del lugar.</p>';
        botonUbicacion.hidden = true;
        estadoUbicacion.textContent = "";
        return;
    }

    mapa = L.map("mapa-reporte").setView(CENTRO, 14);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(mapa);

    mapa.on("click", function (evento) {
        ponerMarcador(evento.latlng);
        estadoUbicacion.textContent = "Lugar marcado. Podés mover el pin para ajustarlo.";
    });
}

function ponerMarcador(latlng) {
    if (marcador) {
        marcador.setLatLng(latlng);
    } else {
        marcador = L.marker(latlng, { draggable: true }).addTo(mapa);
        marcador.on("dragend", function () {
            ubicacion = marcador.getLatLng();
        });
    }
    ubicacion = latlng;
}

function usarMiUbicacion() {
    if (!navigator.geolocation) {
        estadoUbicacion.textContent = "Tu navegador no permite obtener la ubicación. Tocá el mapa para marcar el lugar.";
        return;
    }

    estadoUbicacion.textContent = "Buscando tu ubicación...";

    navigator.geolocation.getCurrentPosition(
        function (posicion) {
            var punto = L.latLng(posicion.coords.latitude, posicion.coords.longitude);
            ponerMarcador(punto);
            mapa.setView(punto, 17);
            estadoUbicacion.textContent = "Ubicación marcada. Si no es exacta, mové el pin.";
        },
        function () {
            estadoUbicacion.textContent = "No pudimos obtener tu ubicación. Tocá el mapa para marcar el lugar.";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

botonUbicacion.addEventListener("click", usarMiUbicacion);

// ---------- Preguntas que dependen del tipo de emergencia ----------
function valorRadio(nombre) {
    var marcado = document.querySelector('input[name="' + nombre + '"]:checked');
    return marcado ? marcado.value : "";
}

function valoresMarcados(nombre) {
    var marcados = document.querySelectorAll('input[name="' + nombre + '"]:checked');
    return Array.prototype.map.call(marcados, function (input) { return input.value; });
}

function desmarcar(nombre) {
    document.querySelectorAll('input[name="' + nombre + '"]').forEach(function (input) {
        input.checked = false;
    });
}

function actualizarPreguntas() {
    var tipo = valorRadio("tipo");

    var mostrarAtrapados = TIPOS_CON_ATRAPADOS.indexOf(tipo) !== -1;
    var mostrarVehiculos = (tipo === TIPO_ACCIDENTE);

    document.getElementById("bloque-atrapados").hidden = !mostrarAtrapados;
    document.getElementById("bloque-vehiculos").hidden = !mostrarVehiculos;

    // Si una pregunta deja de corresponder, se borra lo que se había marcado
    if (!mostrarAtrapados) desmarcar("atrapados");
    if (!mostrarVehiculos) {
        desmarcar("cantidad_vehiculos");
        desmarcar("tipos_vehiculos");
    }
}

document.querySelectorAll('input[name="tipo"]').forEach(function (input) {
    input.addEventListener("change", actualizarPreguntas);
});

// ---------- Envío ----------
function mostrarError(texto) {
    mensajeError.textContent = texto;
    mensajeError.scrollIntoView({ behavior: "smooth", block: "center" });
}

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    mensajeError.textContent = "";

    var tipo = valorRadio("tipo");
    var referencia = document.getElementById("referencia").value.trim();
    var telefono = document.getElementById("telefono").value.trim();

    if (!tipo) {
        mostrarError("Elegí qué está pasando.");
        return;
    }
    if (!ubicacion && !referencia) {
        mostrarError("Marcá el lugar en el mapa o escribí una referencia.");
        return;
    }
    if (telefono.replace(/\D/g, "").length < 6) {
        mostrarError("Escribí un teléfono de contacto para que podamos llamarte.");
        return;
    }

    var datos = {
        tipo: tipo,
        referencia: referencia,
        latitud: ubicacion ? ubicacion.lat : "",
        longitud: ubicacion ? ubicacion.lng : "",
        victimas: valorRadio("victimas"),
        atrapados: valorRadio("atrapados"),
        cantidad_vehiculos: valorRadio("cantidad_vehiculos"),
        tipos_vehiculos: valoresMarcados("tipos_vehiculos"),
        nota: document.getElementById("nota").value.trim(),
        telefono: telefono,
        nombre: document.getElementById("nombre").value.trim(),
        sitio_web: document.getElementById("sitio_web").value
    };

    botonEnviar.disabled = true;
    botonEnviar.textContent = "Enviando...";

    try {
        var respuesta = await fetch("/api-publico/reportar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos)
        });

        var resultado = await respuesta.json().catch(function () { return {}; });

        if (!respuesta.ok) {
            mostrarError(resultado.detail || "No se pudo enviar el aviso. Llamá al 425252.");
            return;
        }

        var textoNumero = document.getElementById("texto-numero");
        textoNumero.textContent = resultado.id > 0 ? "Número de aviso: #" + resultado.id : "";

        formulario.hidden = true;
        document.getElementById("exito").hidden = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
        mostrarError("No hay conexión. Si es urgente, llamá al 425252.");
    } finally {
        botonEnviar.disabled = false;
        botonEnviar.textContent = "Enviar aviso";
    }
});

document.getElementById("btn-otro").addEventListener("click", function () {
    window.location.reload();
});

iniciarMapa();
actualizarPreguntas();
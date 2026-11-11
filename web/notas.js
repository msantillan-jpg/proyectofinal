// ---------- NOTAS Y GESTIONES ----------
const formNota = document.getElementById("form-nota");
const tablaNotasBody = document.querySelector("#tabla-notas tbody");
const filtroEstadoNota = document.getElementById("filtro-estado-nota");
let notasCargadas = [];

function fechaHoy() {
    const ahora = new Date();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    return ahora.getFullYear() + "-" + mes + "-" + dia;
}

function diasHasta(fechaISO) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fecha = new Date(fechaISO + "T00:00:00");
    return Math.round((fecha - hoy) / 86400000);
}

function claseDeNota(nota) {
    const fechaEvento = nota[5];
    const estado = nota[6];
    if (estado === "Realizada" || !fechaEvento) return "";

    const dias = diasHasta(fechaEvento);
    if (dias < 0) return "nota-vencida";
    if (dias <= 7) return "nota-proxima";
    return "";
}

async function cargarTablaNotas() {
    notasCargadas = await eel.js_listar_notas()();
    mostrarNotas();
}

function mostrarNotas() {
    const filtro = filtroEstadoNota.value;
    tablaNotasBody.innerHTML = "";

    notasCargadas
        .filter(nota => !filtro || nota[6] === filtro)
        .forEach(nota => {
            const fila = document.createElement("tr");
            const clase = claseDeNota(nota);
            if (clase) fila.classList.add(clase);

            const valores = [nota[0], nota[1], nota[2] || "", nota[3], nota[4], nota[5] || "", nota[6], nota[7] || ""];
            valores.forEach(valor => {
                const celda = document.createElement("td");
                celda.textContent = valor;
                fila.appendChild(celda);
            });

            fila.addEventListener("click", () => seleccionarNota(nota, fila));
            tablaNotasBody.appendChild(fila);
        });
}

function seleccionarNota(nota, fila) {
    document.querySelectorAll("#tabla-notas tbody tr").forEach(f => f.classList.remove("seleccionada"));
    fila.classList.add("seleccionada");

    document.getElementById("no-id").value = nota[0];
    document.getElementById("no-fecha-ingreso").value = nota[1];
    document.getElementById("no-remitente").value = nota[2] || "";
    document.getElementById("no-asunto").value = nota[3];
    document.getElementById("no-tipo").value = nota[4];
    document.getElementById("no-fecha-evento").value = nota[5] || "";
    document.getElementById("no-estado").value = nota[6];
    document.getElementById("no-observaciones").value = nota[7] || "";
}

function limpiarFormNota() {
    formNota.reset();
    document.getElementById("no-id").value = "";
    document.getElementById("no-fecha-ingreso").value = fechaHoy();
    document.querySelectorAll("#tabla-notas tbody tr").forEach(f => f.classList.remove("seleccionada"));
}

function leerFormNota() {
    return [
        document.getElementById("no-fecha-ingreso").value,
        document.getElementById("no-remitente").value,
        document.getElementById("no-asunto").value,
        document.getElementById("no-tipo").value,
        document.getElementById("no-fecha-evento").value,
        document.getElementById("no-estado").value,
        document.getElementById("no-observaciones").value
    ];
}

formNota.addEventListener("submit", async (e) => {
    e.preventDefault();
    await eel.js_alta_nota(...leerFormNota())();
    limpiarFormNota();
    await cargarTablaNotas();
    cargarResumenInicio();
});

document.getElementById("btn-modificar-nota").addEventListener("click", async () => {
    const id = document.getElementById("no-id").value;
    if (!id) {
        alert("Seleccioná una nota de la tabla para modificar");
        return;
    }

    await eel.js_modificar_nota(id, ...leerFormNota())();
    limpiarFormNota();
    await cargarTablaNotas();
    cargarResumenInicio();
});

document.getElementById("btn-eliminar-nota").addEventListener("click", async () => {
    const id = document.getElementById("no-id").value;
    if (!id) {
        alert("Seleccioná una nota de la tabla para eliminar");
        return;
    }

    if (confirm("¿Seguro que querés eliminar esta nota?")) {
        await eel.js_eliminar_nota(id)();
        limpiarFormNota();
        await cargarTablaNotas();
        cargarResumenInicio();
    }
});

document.getElementById("btn-limpiar-nota").addEventListener("click", limpiarFormNota);
filtroEstadoNota.addEventListener("change", mostrarNotas);

limpiarFormNota();
cargarTablaNotas();
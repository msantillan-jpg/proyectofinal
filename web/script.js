// ---------- Manejo de pestañas ----------
document.querySelectorAll(".tab-btn").forEach(boton => {
    boton.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));

        boton.classList.add("active");
        document.getElementById("tab-" + boton.dataset.tab).classList.add("active");
    });
});

// ---------- PERSONAL ----------
const formPersonal = document.getElementById("form-personal");
const tablaPersonalBody = document.querySelector("#tabla-personal tbody");

async function cargarTablaPersonal() {
    const personal = await eel.js_listar_personal()();
    tablaPersonalBody.innerHTML = "";

    personal.forEach(persona => {
        const fila = document.createElement("tr");
        fila.dataset.id = persona[0];
        fila.innerHTML = `
            <td>${persona[0]}</td>
            <td>${persona[1]}</td>
            <td>${persona[2]}</td>
            <td>${persona[3]}</td>
            <td>${persona[4] || ""}</td>
            <td>${persona[5] || ""}</td>
            <td>${persona[6] || ""}</td>
        `;
        fila.addEventListener("click", () => seleccionarPersonal(persona, fila));
        tablaPersonalBody.appendChild(fila);
    });
}

function seleccionarPersonal(persona, fila) {
    document.querySelectorAll("#tabla-personal tbody tr").forEach(f => f.classList.remove("seleccionada"));
    fila.classList.add("seleccionada");

    document.getElementById("p-id").value = persona[0];
    document.getElementById("p-dni").value = persona[1];
    document.getElementById("p-nombre").value = persona[2];
    document.getElementById("p-apellido").value = persona[3];
    document.getElementById("p-rango").value = persona[4] || "";
    document.getElementById("p-telefono").value = persona[5] || "";
    document.getElementById("p-fecha").value = persona[6] || "";
}

function limpiarFormPersonal() {
    formPersonal.reset();
    document.getElementById("p-id").value = "";
    document.querySelectorAll("#tabla-personal tbody tr").forEach(f => f.classList.remove("seleccionada"));
}

formPersonal.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dni = document.getElementById("p-dni").value;
    const nombre = document.getElementById("p-nombre").value;
    const apellido = document.getElementById("p-apellido").value;
    const rango = document.getElementById("p-rango").value;
    const telefono = document.getElementById("p-telefono").value;
    const fecha = document.getElementById("p-fecha").value;

    await eel.js_alta_personal(dni, nombre, apellido, rango, telefono, fecha)();
    limpiarFormPersonal();
    cargarTablaPersonal();
});

document.getElementById("btn-modificar-personal").addEventListener("click", async () => {
    const id = document.getElementById("p-id").value;
    if (!id) {
        alert("Seleccioná un bombero de la tabla para modificar");
        return;
    }

    const dni = document.getElementById("p-dni").value;
    const nombre = document.getElementById("p-nombre").value;
    const apellido = document.getElementById("p-apellido").value;
    const rango = document.getElementById("p-rango").value;
    const telefono = document.getElementById("p-telefono").value;
    const fecha = document.getElementById("p-fecha").value;

    await eel.js_modificar_personal(id, dni, nombre, apellido, rango, telefono, fecha)();
    limpiarFormPersonal();
    cargarTablaPersonal();
});

document.getElementById("btn-baja-personal").addEventListener("click", async () => {
    const id = document.getElementById("p-id").value;
    if (!id) {
        alert("Seleccioná un bombero de la tabla para dar de baja");
        return;
    }

    if (confirm("¿Seguro que querés dar de baja a este bombero?")) {
        await eel.js_baja_personal(id)();
        limpiarFormPersonal();
        cargarTablaPersonal();
    }
});

document.getElementById("btn-limpiar-personal").addEventListener("click", limpiarFormPersonal);

// ---------- Carga inicial ----------
cargarTablaPersonal();
// ---------- VEHICULOS ----------
// ---------- VEHICULOS ----------
const formVehiculo = document.getElementById("form-vehiculo");
const tablaVehiculosBody = document.querySelector("#tabla-vehiculos tbody");

async function cargarTablaVehiculos() {
    const vehiculos = await eel.js_listar_vehiculos()();
    tablaVehiculosBody.innerHTML = "";

    vehiculos.forEach(vehiculo => {
        const fila = document.createElement("tr");
        fila.dataset.id = vehiculo[0];
        fila.innerHTML = `
            <td>${vehiculo[0]}</td>
            <td>${vehiculo[1] || ""}</td>
            <td>${vehiculo[2]}</td>
            <td>${vehiculo[3]}</td>
            <td>${vehiculo[4] || ""}</td>
        `;
        fila.addEventListener("click", () => seleccionarVehiculo(vehiculo, fila));
        tablaVehiculosBody.appendChild(fila);
    });
}

function seleccionarVehiculo(vehiculo, fila) {
    document.querySelectorAll("#tabla-vehiculos tbody tr").forEach(f => f.classList.remove("seleccionada"));
    fila.classList.add("seleccionada");

    document.getElementById("v-id").value = vehiculo[0];
    document.getElementById("v-numero-movil").value = vehiculo[1] || "";
    document.getElementById("v-patente").value = vehiculo[2];
    document.getElementById("v-tipo").value = vehiculo[3];
    document.getElementById("v-estado").value = vehiculo[4];
}

function limpiarFormVehiculo() {
    formVehiculo.reset();
    document.getElementById("v-id").value = "";
    document.querySelectorAll("#tabla-vehiculos tbody tr").forEach(f => f.classList.remove("seleccionada"));
}

formVehiculo.addEventListener("submit", async (e) => {
    e.preventDefault();

    const numeroMovil = document.getElementById("v-numero-movil").value;
    const patente = document.getElementById("v-patente").value;
    const tipo = document.getElementById("v-tipo").value;
    const estado = document.getElementById("v-estado").value;

    await eel.js_alta_vehiculo(numeroMovil, patente, tipo, estado)();

    limpiarFormVehiculo();
    cargarTablaVehiculos();
});

document.getElementById("btn-modificar-vehiculo").addEventListener("click", async () => {
    const id = document.getElementById("v-id").value;
    if (!id) {
        alert("Seleccioná un vehículo de la tabla para modificar");
        return;
    }

    const numeroMovil = document.getElementById("v-numero-movil").value;
    const patente = document.getElementById("v-patente").value;
    const tipo = document.getElementById("v-tipo").value;
    const estado = document.getElementById("v-estado").value;

    await eel.js_modificar_vehiculo(id, numeroMovil, patente, tipo, estado)();
    limpiarFormVehiculo();
    cargarTablaVehiculos();
});

document.getElementById("btn-eliminar-vehiculo").addEventListener("click", async () => {
    const id = document.getElementById("v-id").value;
    if (!id) {
        alert("Seleccioná un vehículo de la tabla para eliminar");
        return;
    }

    if (confirm("¿Seguro que querés eliminar este vehículo?")) {
        await eel.js_eliminar_vehiculo(id)();
        limpiarFormVehiculo();
        cargarTablaVehiculos();
    }
});

document.getElementById("btn-limpiar-vehiculo").addEventListener("click", limpiarFormVehiculo);

cargarTablaVehiculos();
// ---------- GUARDIAS ----------
const formGuardia = document.getElementById("form-guardia");
const tablaGuardiasBody = document.querySelector("#tabla-guardias tbody");
let idGuardiaActual = null; // guarda qué guardia está abierta en el modal

async function cargarTablaGuardias() {
    const guardias = await eel.js_listar_guardias()();
    tablaGuardiasBody.innerHTML = "";

    guardias.forEach(guardia => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${guardia[0]}</td>
            <td>${guardia[1]}</td>
            <td>${guardia[2]}</td>
            <td>${guardia[3]}</td>
            <td class="acciones-tabla">
                <button class="btn-asignar-tabla" data-id="${guardia[0]}" data-fecha="${guardia[1]}">Asignar Personal</button>
                <button class="btn-eliminar-tabla" data-id="${guardia[0]}">Eliminar</button>
            </td>
        `;
        tablaGuardiasBody.appendChild(fila);
    });

    // Enganchar los botones recién creados
    document.querySelectorAll(".btn-asignar-tabla").forEach(btn => {
        btn.addEventListener("click", () => abrirModalAsignar(btn.dataset.id, btn.dataset.fecha));
    });

    document.querySelectorAll(".btn-eliminar-tabla").forEach(btn => {
        btn.addEventListener("click", () => eliminarGuardia(btn.dataset.id));
    });
}

formGuardia.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fecha = document.getElementById("g-fecha").value;
    const inicio = document.getElementById("g-hora-inicio").value;
    const fin = document.getElementById("g-hora-fin").value;

    await eel.js_alta_guardia(fecha, inicio, fin)();
    formGuardia.reset();
    cargarTablaGuardias();
});

async function eliminarGuardia(id) {
    if (confirm("¿Eliminar esta guardia y sus asignaciones de personal?")) {
        await eel.js_eliminar_guardia(id)();
        cargarTablaGuardias();
    }
}

// ---------- Modal de asignación ----------
const modal = document.getElementById("modal-asignar");
const listaDisponible = document.getElementById("lista-disponible");
const listaAsignados = document.getElementById("lista-asignados");

async function abrirModalAsignar(idGuardia, fechaGuardia) {
    idGuardiaActual = idGuardia;
    document.getElementById("modal-titulo").textContent = 'Asignar Personal - Guardia ' + fechaGuardia;
    modal.classList.add("activo");

    await cargarListasModal();
}

async function cargarListasModal() {
    const todoElPersonal = await eel.js_listar_personal_para_modal()();
    const asignados = await eel.js_listar_personal_de_guardia(idGuardiaActual)();
    const idsAsignados = asignados.map(p => p[0]);

    // Lista de disponibles (todos, incluso los ya asignados se muestran, pero al hacer click no duplican gracias a INSERT OR IGNORE)
    listaDisponible.innerHTML = "";
    todoElPersonal.forEach(persona => {
        const li = document.createElement("li");
        li.textContent = '${persona[2]} ${persona[3]} (${persona[4] || "Sin rango"})';
        li.addEventListener("click", async () => {
            await eel.js_asignar_personal_a_guardia(idGuardiaActual, persona[0])();
            cargarListasModal();
        });
        listaDisponible.appendChild(li);
    });

    // Lista de asignados a esta guardia
    listaAsignados.innerHTML = "";
    asignados.forEach(persona => {
        const li = document.createElement("li");
        li.textContent = '${persona[1]} ${persona[2]} (${persona[3] || "Sin rango"})';
        li.title = "Click para quitar";
        li.addEventListener("click", async () => {
            await eel.js_quitar_personal_de_guardia(idGuardiaActual, persona[0])();
            cargarListasModal();
        });
        listaAsignados.appendChild(li);
    });
}

document.getElementById("modal-cerrar").addEventListener("click", () => {
    modal.classList.remove("activo");
    idGuardiaActual = null;
});

// Cerrar el modal si se hace click afuera de la caja
modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.classList.remove("activo");
        idGuardiaActual = null;
    }
});

cargarTablaGuardias();
// ---------- INVENTARIO ----------
const formInventario = document.getElementById("form-inventario");
const tablaInventarioBody = document.querySelector("#tabla-inventario tbody");
const selectVehiculo = document.getElementById("i-vehiculo");

async function cargarSelectVehiculos() {
    const vehiculos = await eel.js_listar_vehiculos_para_select()();

    // Guardamos el valor actual para no perderlo al recargar las opciones
    const valorActual = selectVehiculo.value;

    selectVehiculo.innerHTML = '<option value="">-- Sin vehículo asignado --</option>';
    vehiculos.forEach(vehiculo => {
        const option = document.createElement("option");
        option.value = vehiculo[0];
        option.textContent = '${vehiculo[1]} (${vehiculo[2]})';
        selectVehiculo.appendChild(option);
    });

    selectVehiculo.value = valorActual;
}

async function cargarTablaInventario() {
    const items = await eel.js_listar_items()();
    tablaInventarioBody.innerHTML = "";

    items.forEach(item => {
        const fila = document.createElement("tr");
        fila.dataset.id = item[0];
        fila.dataset.idVehiculo = item[4] || "";
        fila.innerHTML = `
            <td>${item[0]}</td>
            <td>${item[1]}</td>
            <td>${item[2]}</td>
            <td>${item[3] || ""}</td>
            <td>${item[5] || "Sin vehículo"}</td>
        `;
        fila.addEventListener("click", () => seleccionarItem(item, fila));
        tablaInventarioBody.appendChild(fila);
    });
}

function seleccionarItem(item, fila) {
    document.querySelectorAll("#tabla-inventario tbody tr").forEach(f => f.classList.remove("seleccionada"));
    fila.classList.add("seleccionada");

    document.getElementById("i-id").value = item[0];
    document.getElementById("i-nombre").value = item[1];
    document.getElementById("i-cantidad").value = item[2];
    document.getElementById("i-estado").value = item[3] || "";
    selectVehiculo.value = item[4] || "";
}

function limpiarFormInventario() {
    formInventario.reset();
    document.getElementById("i-id").value = "";
    selectVehiculo.value = "";
    document.querySelectorAll("#tabla-inventario tbody tr").forEach(f => f.classList.remove("seleccionada"));
}

formInventario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("i-nombre").value;
    const cantidad = document.getElementById("i-cantidad").value;
    const estado = document.getElementById("i-estado").value;
    const idVehiculo = selectVehiculo.value;

    await eel.js_alta_item(nombre, cantidad, estado, idVehiculo)();
    limpiarFormInventario();
    cargarTablaInventario();
});

document.getElementById("btn-modificar-item").addEventListener("click", async () => {
    const id = document.getElementById("i-id").value;
    if (!id) {
        alert("Seleccioná un ítem de la tabla para modificar");
        return;
    }

    const nombre = document.getElementById("i-nombre").value;
    const cantidad = document.getElementById("i-cantidad").value;
    const estado = document.getElementById("i-estado").value;
    const idVehiculo = selectVehiculo.value;

    await eel.js_modificar_item(id, nombre, cantidad, estado, idVehiculo)();
    limpiarFormInventario();
    cargarTablaInventario();
});

document.getElementById("btn-eliminar-item").addEventListener("click", async () => {
    const id = document.getElementById("i-id").value;
    if (!id) {
        alert("Seleccioná un ítem de la tabla para eliminar");
        return;
    }

    if (confirm("¿Seguro que querés eliminar este ítem?")) {
        await eel.js_eliminar_item(id)();
        limpiarFormInventario();
        cargarTablaInventario();
    }
});

document.getElementById("btn-limpiar-item").addEventListener("click", limpiarFormInventario);

cargarSelectVehiculos();
cargarTablaInventario();
// ---------- NOVEDADES ----------
const formNovedad = document.getElementById("form-novedad");
const tablaNovedadesBody = document.querySelector("#tabla-novedades tbody");
const selectGuardiaNovedad = document.getElementById("n-guardia");
const selectVehiculoNovedad = document.getElementById("n-vehiculo");

async function cargarSelectGuardias() {
    const guardias = await eel.js_listar_guardias_para_select()();
    const valorActual = selectGuardiaNovedad.value;

    selectGuardiaNovedad.innerHTML = '<option value="">-- Seleccioná una guardia --</option>';
    guardias.forEach(guardia => {
        const option = document.createElement("option");
        option.value = guardia[0];
        option.textContent = `${guardia[1]} (${guardia[2]} - ${guardia[3]})`;
        selectGuardiaNovedad.appendChild(option);
    });

    selectGuardiaNovedad.value = valorActual;
}

async function cargarSelectVehiculosNovedad() {
    const vehiculos = await eel.js_listar_vehiculos_para_select()();
    const valorActual = selectVehiculoNovedad.value;

    selectVehiculoNovedad.innerHTML = '<option value="">-- Sin vehículo asignado --</option>';
    vehiculos.forEach(vehiculo => {
        const option = document.createElement("option");
        option.value = vehiculo[0];
        option.textContent = `${vehiculo[1]} (${vehiculo[2]})`;
        selectVehiculoNovedad.appendChild(option);
    });

    selectVehiculoNovedad.value = valorActual;
}

async function cargarTablaNovedades() {
    const novedades = await eel.js_listar_novedades()();
    tablaNovedadesBody.innerHTML = "";

    novedades.forEach(novedad => {
        const fila = document.createElement("tr");
        fila.dataset.id = novedad[0];
        fila.dataset.idGuardia = novedad[6];
        fila.dataset.idVehiculo = novedad[7] || "";
        fila.innerHTML = `
            <td>${novedad[0]}</td>
            <td>${novedad[1]}</td>
            <td>${novedad[2]}</td>
            <td>${novedad[3] || ""}</td>
            <td>${novedad[4] || ""}</td>
            <td>${novedad[5] || "Sin vehículo"}</td>
        `;
        fila.addEventListener("click", () => seleccionarNovedad(novedad, fila));
        tablaNovedadesBody.appendChild(fila);
    });
}

function seleccionarNovedad(novedad, fila) {
    document.querySelectorAll("#tabla-novedades tbody tr").forEach(f => f.classList.remove("seleccionada"));
    fila.classList.add("seleccionada");

    document.getElementById("n-id").value = novedad[0];
    selectGuardiaNovedad.value = novedad[6];
    document.getElementById("n-hora").value = novedad[2];
    document.getElementById("n-tipo").value = novedad[3] || "";
    document.getElementById("n-descripcion").value = novedad[4] || "";
    selectVehiculoNovedad.value = novedad[7] || "";
}

function limpiarFormNovedad() {
    formNovedad.reset();
    document.getElementById("n-id").value = "";
    selectGuardiaNovedad.value = "";
    selectVehiculoNovedad.value = "";
    document.querySelectorAll("#tabla-novedades tbody tr").forEach(f => f.classList.remove("seleccionada"));
}

formNovedad.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idGuardia = selectGuardiaNovedad.value;
    const hora = document.getElementById("n-hora").value;
    const tipo = document.getElementById("n-tipo").value;
    const descripcion = document.getElementById("n-descripcion").value;
    const idVehiculo = selectVehiculoNovedad.value;

    if (!idGuardia) {
        alert("Seleccioná una guardia");
        return;
    }

    await eel.js_alta_novedad(idGuardia, hora, tipo, descripcion, idVehiculo)();
    limpiarFormNovedad();
    cargarTablaNovedades();
});

document.getElementById("btn-modificar-novedad").addEventListener("click", async () => {
    const id = document.getElementById("n-id").value;
    if (!id) {
        alert("Seleccioná una novedad de la tabla para modificar");
        return;
    }

    const hora = document.getElementById("n-hora").value;
    const tipo = document.getElementById("n-tipo").value;
    const descripcion = document.getElementById("n-descripcion").value;
    const idVehiculo = selectVehiculoNovedad.value;

    await eel.js_modificar_novedad(id, hora, tipo, descripcion, idVehiculo)();
    limpiarFormNovedad();
    cargarTablaNovedades();
});

document.getElementById("btn-eliminar-novedad").addEventListener("click", async () => {
    const id = document.getElementById("n-id").value;
    if (!id) {
        alert("Seleccioná una novedad de la tabla para eliminar");
        return;
    }

    if (confirm("¿Seguro que querés eliminar esta novedad?")) {
        await eel.js_eliminar_novedad(id)();
        limpiarFormNovedad();
        cargarTablaNovedades();
    }
});

document.getElementById("btn-limpiar-novedad").addEventListener("click", limpiarFormNovedad);

cargarSelectGuardias();
cargarSelectVehiculosNovedad();
cargarTablaNovedades();
// ---------- Manejo de sub-pestañas (dentro de Inventario) ----------
document.querySelectorAll(".subtab-btn").forEach(boton => {
    boton.addEventListener("click", () => {
        document.querySelectorAll(".subtab-btn").forEach(b => b.classList.remove("active"));
        document.querySelectorAll(".subtab-content").forEach(c => c.classList.remove("active"));

        boton.classList.add("active");
        document.getElementById("subtab-" + boton.dataset.subtab).classList.add("active");
    });
});
// ---------- Vista "Por Camión" ----------
const selectCamionVisual = document.getElementById("select-camion-visual");
const panelCamionVisual = document.getElementById("panel-camion-visual");
const contenedorSvg = document.getElementById("contenedor-svg-camion");
const panelDetalleGabeta = document.getElementById("panel-detalle-gabeta");
const tituloGabeta = document.getElementById("titulo-gabeta");
const listaItemsGabeta = document.getElementById("lista-items-gabeta");
const selectItemSinGabeta = document.getElementById("select-item-sin-gabeta");

let idGabetaSeleccionada = null;
let gabetasDelCamionActual = [];

async function cargarSelectCamionVisual() {
    const vehiculos = await eel.js_listar_vehiculos_para_select()();
    selectCamionVisual.innerHTML = '<option value="">-- Seleccioná un vehículo --</option>';
    vehiculos.forEach(vehiculo => {
        const option = document.createElement("option");
        option.value = vehiculo[0];
        option.textContent = `Móvil ${vehiculo[1] || "S/N"} - ${vehiculo[3]}`;
        selectCamionVisual.appendChild(option);
    });
}

selectCamionVisual.addEventListener("change", async () => {
    const idVehiculo = selectCamionVisual.value;
    panelDetalleGabeta.style.display = "none";

    if (!idVehiculo) {
        panelCamionVisual.style.display = "none";
        return;
    }

    gabetasDelCamionActual = await eel.js_listar_gabetas_de_vehiculo(idVehiculo)();

    if (gabetasDelCamionActual.length === 0) {
        contenedorSvg.innerHTML = "<p style='color:#666; padding:20px;'>Este vehículo todavía no tiene gabetas cargadas.</p>";
        panelCamionVisual.style.display = "block";
        return;
    }

    dibujarCamion();
    panelCamionVisual.style.display = "block";
});

function dibujarCamion() {
    const posiciones = [
        { x: 130, y: 175, w: 85, h: 75 },
        { x: 220, y: 175, w: 85, h: 75 },
        { x: 310, y: 175, w: 85, h: 75 },
        { x: 400, y: 175, w: 85, h: 75 },
        { x: 490, y: 175, w: 85, h: 75 },
        { x: 130, y: 105, w: 220, h: 65 },
        { x: 355, y: 105, w: 220, h: 65 },
        { x: 490, y: 105, w: 0,  h: 0  },
    ];

    let gabetasSvg = "";
    gabetasDelCamionActual.forEach((gabeta, i) => {
        const pos = posiciones[i] || posiciones[posiciones.length - 2];
        let lineas = "";
        for (let l = 1; l < 5; l++) {
            const ly = pos.y + (pos.h / 5) * l;
            lineas += `<line x1="${pos.x}" y1="${ly}" x2="${pos.x + pos.w}" y2="${ly}" stroke="#999" stroke-width="1" pointer-events="none"/>`;
        }
        gabetasSvg += `
            <rect class="gabeta-zona" data-id-gabeta="${gabeta[0]}" data-nombre="${gabeta[2]}"
                  x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}"
                  rx="3" fill="#d8d8d8" stroke="#333" stroke-width="2" />
            ${lineas}
            <text x="${pos.x + pos.w/2}" y="${pos.y + pos.h/2}" text-anchor="middle"
                  fill="#333" font-size="10" font-weight="bold" pointer-events="none">${gabeta[1]}</text>
        `;
    });

    contenedorSvg.innerHTML = `
        <svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg">
            <rect x="15" y="235" width="640" height="10" fill="#222"/>
            <rect x="125" y="95" width="460" height="150" fill="#c0392b" stroke="#000" stroke-width="2"/>
            <rect x="125" y="160" width="460" height="10" fill="#f5b800"/>
            <rect x="15" y="80" width="115" height="155" rx="6" fill="#c0392b" stroke="#000" stroke-width="2"/>
            <rect x="25" y="90" width="40" height="40" rx="3" fill="#8fd0ff" stroke="#000" stroke-width="1.5"/>
            <rect x="75" y="90" width="40" height="40" rx="3" fill="#8fd0ff" stroke="#000" stroke-width="1.5"/>
            <line x1="70" y1="90" x2="70" y2="130" stroke="#000" stroke-width="1.5"/>
            <rect x="15" y="160" width="115" height="6" fill="#f5b800"/>
            <rect x="15" y="70" width="570" height="14" fill="#f5b800"/>
            <text x="300" y="80" text-anchor="middle" fill="#7a0000" font-size="10" font-weight="bold">BOMBEROS VOLUNTARIOS CONCEPCIÓN - TUC.</text>
            <circle cx="105" cy="200" r="16" fill="#f5b800" stroke="#000" stroke-width="1.5"/>
            <text x="105" y="205" text-anchor="middle" fill="#000" font-size="14" font-weight="bold">14</text>
            <rect x="140" y="55" width="430" height="12" fill="#ccc" stroke="#666" stroke-width="1"/>
            <line x1="160" y1="55" x2="160" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="200" y1="55" x2="200" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="240" y1="55" x2="240" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="280" y1="55" x2="280" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="320" y1="55" x2="320" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="360" y1="55" x2="360" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="400" y1="55" x2="400" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="440" y1="55" x2="440" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="480" y1="55" x2="480" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="520" y1="55" x2="520" y2="67" stroke="#888" stroke-width="1.5"/>
            <line x1="560" y1="55" x2="560" y2="67" stroke="#888" stroke-width="1.5"/>
            <rect x="330" y="45" width="24" height="10" rx="3" fill="#1a4fc4" stroke="#000" stroke-width="1"/>
            ${gabetasSvg}
            <circle cx="75" cy="248" r="26" fill="#1a1a1a" stroke="#444" stroke-width="3"/>
            <circle cx="75" cy="248" r="9" fill="#777"/>
            <circle cx="480" cy="248" r="26" fill="#1a1a1a" stroke="#444" stroke-width="3"/>
            <circle cx="480" cy="248" r="9" fill="#777"/>
            <circle cx="545" cy="248" r="26" fill="#1a1a1a" stroke="#444" stroke-width="3"/>
            <circle cx="545" cy="248" r="9" fill="#777"/>
        </svg>
    `;

    document.querySelectorAll(".gabeta-zona").forEach(zona => {
        zona.addEventListener("click", () => abrirDetalleGabeta(zona.dataset.idGabeta, zona.dataset.nombre));
    });

    marcarGabetasConItems();
}

async function marcarGabetasConItems() {
    for (const gabeta of gabetasDelCamionActual) {
        const items = await eel.js_listar_items_de_gabeta(gabeta[0])();
        if (items.length > 0) {
            const zona = document.querySelector(`.gabeta-zona[data-id-gabeta="${gabeta[0]}"]`);
            if (zona) zona.classList.add("con-items");
        }
    }
}

async function abrirDetalleGabeta(idGabeta, nombreGabeta) {
    idGabetaSeleccionada = idGabeta;
    tituloGabeta.textContent = `Contenido: ${nombreGabeta}`;
    panelDetalleGabeta.style.display = "block";

    await cargarDetalleGabeta();
}

async function cargarDetalleGabeta() {
    const items = await eel.js_listar_items_de_gabeta(idGabetaSeleccionada)();

    listaItemsGabeta.innerHTML = "";
    if (items.length === 0) {
        listaItemsGabeta.innerHTML = "<li style='cursor:default;'>Vacía por ahora</li>";
    } else {
        items.forEach(item => {
            const li = document.createElement("li");
            li.textContent = `${item[1]} - Cant: ${item[2]} (${item[3] || ""})`;
            li.title = "Click para quitar de esta gabeta";
            li.addEventListener("click", async () => {
                await eel.js_quitar_item_de_gabeta(item[0])();
                cargarDetalleGabeta();
                cargarSelectItemsSinGabeta();
                marcarGabetasConItems();
            });
            listaItemsGabeta.appendChild(li);
        });
    }

    cargarSelectItemsSinGabeta();
}

async function cargarSelectItemsSinGabeta() {
    const items = await eel.js_listar_items_sin_gabeta()();
    selectItemSinGabeta.innerHTML = "";
    if (items.length === 0) {
        selectItemSinGabeta.innerHTML = '<option value="">-- No hay ítems sin gabeta --</option>';
        return;
    }
    items.forEach(item => {
        const option = document.createElement("option");
        option.value = item[0];
        option.textContent = `${item[1]} (Cant: ${item[2]})`;
        selectItemSinGabeta.appendChild(option);
    });
}

document.getElementById("btn-agregar-a-gabeta").addEventListener("click", async () => {
    const idItem = selectItemSinGabeta.value;
    if (!idItem) {
        alert("No hay ítem seleccionado para agregar");
        return;
    }
    await eel.js_asignar_item_a_gabeta(idItem, idGabetaSeleccionada)();
    cargarDetalleGabeta();
    marcarGabetasConItems();
});

cargarSelectCamionVisual();
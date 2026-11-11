// ---------- Menú lateral, pantalla de inicio y celular ----------
const sidebar = document.getElementById("sidebar");
const velo = document.getElementById("velo");
const btnMenu = document.getElementById("btn-menu");
const tituloSeccion = document.getElementById("titulo-seccion");

function abrirMenu() {
    sidebar.classList.add("abierta");
    velo.classList.add("activo");
}

function cerrarMenu() {
    sidebar.classList.remove("abierta");
    velo.classList.remove("activo");
}

btnMenu.addEventListener("click", () => {
    if (sidebar.classList.contains("abierta")) {
        cerrarMenu();
    } else {
        abrirMenu();
    }
});

velo.addEventListener("click", cerrarMenu);

// El cambio de sección lo hace script.js; acá solo actualizamos el título,
// cerramos el menú en el celular y refrescamos los números del inicio.
document.querySelectorAll(".nav-item").forEach(boton => {
    boton.addEventListener("click", () => {
        const textoNav = boton.querySelector(".nav-texto");
        const titulo = textoNav ? textoNav.textContent : boton.textContent;
        tituloSeccion.textContent = titulo.trim();
        cerrarMenu();
        if (boton.dataset.tab === "inicio") {
            cargarResumenInicio();
        }
    });
});

async function cargarResumenInicio() {
    const datos = await eel.js_resumen_inicio()();
    if (!datos) return;

    document.getElementById("num-personal").textContent = datos.personal_activo;
    document.getElementById("num-vehiculos").textContent = datos.vehiculos_operativos;
    document.getElementById("num-guardias").textContent = datos.guardias_mes;
    document.getElementById("num-novedades").textContent = datos.novedades_mes;
    document.getElementById("num-notas").textContent = datos.notas_pendientes;
}

async function cargarSaludo() {
    try {
        const respuesta = await fetch("/api/yo");
        if (!respuesta.ok) return;
        const yo = await respuesta.json();
        document.getElementById("saludo-nombre").textContent = yo.nombre;
    } catch (e) {
        console.error("No se pudo cargar el saludo", e);
    }
}

cargarSaludo();
cargarResumenInicio();
// ---------- Vistas separadas: Listado / Formulario ----------
// Cada sección tiene dos vistas. Este archivo solo cambia cuál se muestra;
// la lógica de guardar, modificar y eliminar sigue en script.js, notas.js y usuarios.js.

const SECCIONES_CON_VISTAS = [
    {
        id: "personal",
        tabla: "tabla-personal",
        limpiar: "btn-limpiar-personal",
        editable: true,
        soloAdmin: true,   // el usuario común solo ve el listado
        etiquetaNuevo: "Nuevo bombero",
        etiquetaEditar: "Editar bombero"
    },
    {
        id: "vehiculos",
        tabla: "tabla-vehiculos",
        limpiar: "btn-limpiar-vehiculo",
        editable: true,
        soloAdmin: false,
        etiquetaNuevo: "Nuevo vehículo",
        etiquetaEditar: "Editar vehículo"
    },
    {
        id: "guardias",
        tabla: "tabla-guardias",
        formulario: "form-guardia",   // no tiene botón Limpiar: se reinicia el formulario
        editable: false,              // las acciones están en cada fila
        soloAdmin: false,
        etiquetaNuevo: "Nueva guardia",
        etiquetaEditar: "Nueva guardia"
    },
    {
        id: "novedades",
        tabla: "tabla-novedades",
        limpiar: "btn-limpiar-novedad",
        editable: true,
        soloAdmin: false,
        etiquetaNuevo: "Nueva novedad",
        etiquetaEditar: "Editar novedad"
    },
    {
        id: "notas",
        tabla: "tabla-notas",
        limpiar: "btn-limpiar-nota",
        editable: true,
        soloAdmin: false,
        etiquetaNuevo: "Nueva nota",
        etiquetaEditar: "Editar nota"
    },
    {
        id: "usuarios",
        tabla: "tabla-usuarios",
        limpiar: "btn-limpiar-usuario",
        editable: false,              // las acciones están en cada fila
        soloAdmin: true,
        etiquetaNuevo: "Nuevo usuario",
        etiquetaEditar: "Nuevo usuario"
    }
];

function mostrarVista(seccion, vista, modoEdicion) {
    const panelLista = document.getElementById("vista-" + seccion.id + "-listado");
    const panelForm = document.getElementById("vista-" + seccion.id + "-formulario");
    const botonLista = document.getElementById("btn-vista-" + seccion.id + "-listado");
    const botonForm = document.getElementById("btn-vista-" + seccion.id + "-formulario");

    const verLista = (vista === "listado");

    panelLista.classList.toggle("active", verLista);
    panelForm.classList.toggle("active", !verLista);
    botonLista.classList.toggle("active", verLista);
    botonForm.classList.toggle("active", !verLista);

    if (verLista || !modoEdicion) {
        botonForm.textContent = seccion.etiquetaNuevo;
    } else {
        botonForm.textContent = seccion.etiquetaEditar;
    }
}

function formularioVisible(seccion) {
    return document.getElementById("vista-" + seccion.id + "-formulario").classList.contains("active");
}

function abrirFormularioNuevo(seccion) {
    // Se vacía el formulario para no arrastrar datos de un registro seleccionado antes
    if (seccion.limpiar) {
        document.getElementById(seccion.limpiar).click();
    } else if (seccion.formulario) {
        document.getElementById(seccion.formulario).reset();
    }
    mostrarVista(seccion, "formulario", false);
}

SECCIONES_CON_VISTAS.forEach(seccion => {
    const botonLista = document.getElementById("btn-vista-" + seccion.id + "-listado");
    const botonForm = document.getElementById("btn-vista-" + seccion.id + "-formulario");
    const tabla = document.getElementById(seccion.tabla);
    const cuerpo = document.querySelector("#" + seccion.tabla + " tbody");

    // Pestaña "Listado"
    botonLista.addEventListener("click", () => mostrarVista(seccion, "listado"));

    // Pestaña "Nuevo": si ya estás en el formulario (por ejemplo editando), no borra nada
    botonForm.addEventListener("click", () => {
        if (formularioVisible(seccion)) return;
        abrirFormularioNuevo(seccion);
    });

    // Click en una fila: abre el formulario con los datos ya cargados
    if (seccion.editable) {
        tabla.addEventListener("click", (evento) => {
            if (!evento.target.closest("tbody tr")) return;
            if (seccion.soloAdmin && document.body.classList.contains("rol-usuario")) return;
            mostrarVista(seccion, "formulario", true);
        });
    }

    // Cuando la tabla se vuelve a dibujar (después de guardar, modificar o eliminar
    // con éxito), se vuelve al listado. Si algo falla, la tabla no se redibuja
    // y te quedás en el formulario con tus datos.
    const observador = new MutationObserver(() => mostrarVista(seccion, "listado"));
    observador.observe(cuerpo, { childList: true });
});
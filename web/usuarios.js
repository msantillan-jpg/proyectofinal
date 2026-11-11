// ---------- USUARIOS (solo administrador) ----------
const formUsuario = document.getElementById("form-usuario");
const tablaUsuariosBody = document.querySelector("#tabla-usuarios tbody");
const modalPassword = document.getElementById("modal-password");
const formPassword = document.getElementById("form-password");

let usuarioActual = "";
let idUsuarioPassword = null;

async function cargarTablaUsuarios() {
    const usuarios = await eel.js_listar_usuarios()();
    tablaUsuariosBody.innerHTML = "";

    usuarios.forEach(usuario => {
        // usuario = [id_usuario, usuario, nombre, rol, activo]
        const fila = document.createElement("tr");
        if (!usuario[4]) fila.classList.add("usuario-inactivo");

        const valores = [
            usuario[0],
            usuario[1],
            usuario[2],
            usuario[3] === "admin" ? "Administrador" : "Usuario",
            usuario[4] ? "Activo" : "Inactivo"
        ];
        valores.forEach(valor => {
            const celda = document.createElement("td");
            celda.textContent = valor;
            fila.appendChild(celda);
        });

        const celdaAcciones = document.createElement("td");
        celdaAcciones.className = "acciones-tabla";

        const botonPassword = document.createElement("button");
        botonPassword.type = "button";
        botonPassword.textContent = "Cambiar contraseña";
        botonPassword.className = "btn-tabla-naranja";
        botonPassword.addEventListener("click", () => abrirModalPassword(usuario));
        celdaAcciones.appendChild(botonPassword);

        // Nadie puede desactivarse a sí mismo
        if (usuario[1] !== usuarioActual) {
            const botonEstado = document.createElement("button");
            botonEstado.type = "button";
            botonEstado.textContent = usuario[4] ? "Desactivar" : "Reactivar";
            botonEstado.className = usuario[4] ? "btn-tabla-rojo" : "btn-tabla-verde";
            botonEstado.addEventListener("click", () => cambiarEstadoUsuario(usuario));
            celdaAcciones.appendChild(botonEstado);
        }

        fila.appendChild(celdaAcciones);
        tablaUsuariosBody.appendChild(fila);
    });
}

async function cambiarEstadoUsuario(usuario) {
    const activar = !usuario[4];
    let mensaje;
    if (activar) {
        mensaje = "¿Reactivar a " + usuario[2] + "?";
    } else {
        mensaje = "¿Desactivar a " + usuario[2] + "? Ya no va a poder ingresar al sistema.";
    }

    if (!confirm(mensaje)) return;

    await eel.js_cambiar_estado_usuario(usuario[0], activar)();
    await cargarTablaUsuarios();
}

function limpiarFormUsuario() {
    formUsuario.reset();
}

formUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("us-password").value;
    const repetir = document.getElementById("us-password2").value;

    if (password !== repetir) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    await eel.js_crear_usuario(
        document.getElementById("us-usuario").value,
        document.getElementById("us-nombre").value,
        password,
        document.getElementById("us-rol").value
    )();

    limpiarFormUsuario();
    await cargarTablaUsuarios();
});

document.getElementById("btn-limpiar-usuario").addEventListener("click", limpiarFormUsuario);

// ---------- Ventana para cambiar la contraseña ----------
function abrirModalPassword(usuario) {
    idUsuarioPassword = usuario[0];
    document.getElementById("modal-password-titulo").textContent = "Cambiar contraseña: " + usuario[1];
    formPassword.reset();
    modalPassword.classList.add("activo");
    document.getElementById("pw-nueva").focus();
}

function cerrarModalPassword() {
    modalPassword.classList.remove("activo");
    formPassword.reset();
    idUsuarioPassword = null;
}

formPassword.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nueva = document.getElementById("pw-nueva").value;
    const repetir = document.getElementById("pw-repetir").value;

    if (nueva !== repetir) {
        alert("Las contraseñas no coinciden.");
        return;
    }

    await eel.js_cambiar_password_usuario(idUsuarioPassword, nueva)();
    cerrarModalPassword();
    alert("Contraseña actualizada.");
});

document.getElementById("modal-password-cerrar").addEventListener("click", cerrarModalPassword);
document.getElementById("btn-cancelar-password").addEventListener("click", cerrarModalPassword);
modalPassword.addEventListener("click", (e) => {
    if (e.target === modalPassword) cerrarModalPassword();
});

// ---------- Carga inicial: solo si quien ingresó es administrador ----------
async function iniciarUsuarios() {
    try {
        const respuesta = await fetch("/api/yo");
        if (!respuesta.ok) return;
        const yo = await respuesta.json();
        usuarioActual = yo.usuario;

        if (yo.rol === "admin") {
            await cargarTablaUsuarios();
        }
    } catch (e) {
        console.error("No se pudo cargar la sección de usuarios", e);
    }
}

iniciarUsuarios();
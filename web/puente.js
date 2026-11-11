// Puente que reemplaza a Eel: mantiene la misma forma de llamar a las funciones
// (eel.js_algo(args)()) pero ahora viaja por HTTP hacia FastAPI.

async function llamarApi(nombre, args) {
    const respuesta = await fetch("/api/" + nombre, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ args: args })
    });

    if (respuesta.status === 401) {
        window.location.href = "/login";
        return;
    }

    if (!respuesta.ok) {
        const error = await respuesta.json().catch(() => ({}));
        const mensaje = error.detail || "Ocurrió un error en el servidor";
        alert(mensaje);
        throw new Error(mensaje);
    }

    return respuesta.json();
}

const eel = new Proxy({}, {
    get(_, nombre) {
        return (...args) => () => llamarApi(nombre, args);
    }
});

// ---------- Datos del usuario en la barra superior y control de roles ----------
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const respuesta = await fetch("/api/yo");
        if (!respuesta.ok) return;
        const yo = await respuesta.json();

        // El CSS usa esta clase para ocultar lo que el usuario común no puede usar
        document.body.classList.add("rol-" + yo.rol);

        const info = document.getElementById("info-usuario");
        if (info) {
            const rol = (yo.rol === "admin") ? "Administrador" : "Usuario";
            info.textContent = yo.nombre + " (" + rol + ")";
        }
    } catch (e) {
        console.error("No se pudo cargar el usuario actual", e);
    }
});
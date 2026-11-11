// ---------- Modo día / modo noche ----------
// La primera parte se ejecuta en el <head>, antes de dibujar la pantalla,
// para que no haya parpadeo al cargar. La elección se guarda en cada dispositivo.
(function () {
    var tema = null;
    try {
        tema = localStorage.getItem("tema");
    } catch (e) {
        tema = null;
    }

    // Si todavía no eligió, se usa el modo que tenga configurado el dispositivo
    if (tema !== "dia" && tema !== "noche") {
        var claro = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
        tema = claro ? "dia" : "noche";
    }

    document.documentElement.setAttribute("data-tema", tema);
})();

function actualizarBotonTema() {
    var boton = document.getElementById("btn-tema");
    if (!boton) return;

    var esDia = document.documentElement.getAttribute("data-tema") === "dia";
    var icono = boton.querySelector(".tema-icono");
    var texto = boton.querySelector(".tema-texto");

    // El botón muestra el modo al que se va a cambiar
    if (icono) icono.textContent = esDia ? "🌙" : "☀️";
    if (texto) texto.textContent = esDia ? "Modo noche" : "Modo día";
    boton.title = esDia ? "Cambiar a modo noche" : "Cambiar a modo día";
}

function alternarTema() {
    var esDia = document.documentElement.getAttribute("data-tema") === "dia";
    var nuevo = esDia ? "noche" : "dia";

    document.documentElement.setAttribute("data-tema", nuevo);
    try {
        localStorage.setItem("tema", nuevo);
    } catch (e) {
        // Si el navegador no deja guardar, el cambio vale igual para esta sesión
    }
    actualizarBotonTema();
}

document.addEventListener("DOMContentLoaded", function () {
    var boton = document.getElementById("btn-tema");
    if (boton) boton.addEventListener("click", alternarTema);
    actualizarBotonTema();
});
import hashlib
import re
import secrets
import sqlite3
import threading
import traceback
import webbrowser
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware

from auth import (autenticar, crear_tabla_usuarios, crear_usuario, listar_usuarios,
                  buscar_usuario_por_id, cambiar_estado_usuario, cambiar_password, usuario_activo)
from conexion import obtener_conexion
from personal import (preparar_personal, alta_personal, listar_personal, listar_personal_disponible,
                      modificar_personal, baja_personal, ESTADOS as ESTADOS_PERSONAL)
from vehiculos import alta_vehiculo, listar_vehiculos, modificar_vehiculo, eliminar_vehiculo
from guardias import (alta_guardia, listar_guardias, asignar_personal_a_guardia,
                      quitar_personal_de_guardia, listar_personal_de_guardia, eliminar_guardia)
from inventario import alta_item, listar_items, modificar_item, eliminar_item
from novedades import alta_novedad, listar_novedades, modificar_novedad, eliminar_novedad
from gabetas import listar_gabetas_de_vehiculo, listar_items_de_gabeta, asignar_item_a_gabeta, quitar_item_de_gabeta
from notas import crear_tabla_notas, alta_nota, listar_notas, modificar_nota, eliminar_nota
from alertas import (crear_tabla_alertas, alta_alerta, contar_alertas_recientes, listar_alertas,
                     obtener_estado_alerta, cambiar_estado_alerta, contar_alertas_nuevas)

HOST = "127.0.0.1"   # Más adelante lo cambiamos a "0.0.0.0" para probar desde el celular
PUERTO = 8000

BASE = Path(__file__).parent
WEB = BASE / "web"

# Archivos de la carpeta web que se pueden entregar al navegador
TIPOS_ARCHIVO = {
    ".css": "text/css",
    ".js": "text/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
}

# ---------- Reglas del aviso de emergencia de la comunidad ----------
TELEFONO_GUARDIA = "425252"
LIMITE_AVISOS = 3          # avisos permitidos...
VENTANA_MINUTOS = 10       # ...cada tantos minutos por conexión

TIPOS_EMERGENCIA = (
    "Incendio de vivienda o vehículo",
    "Incendio de pastizal o forestal",
    "Accidente de tránsito",
    "Rescate",
    "Pérdida de gas",
    "Persona descompensada",
    "Otro",
)
TIPOS_CON_ATRAPADOS = ("Accidente de tránsito", "Incendio de vivienda o vehículo", "Rescate")
TIPO_ACCIDENTE = "Accidente de tránsito"
OPCIONES_VICTIMAS = ("No hay", "1", "2", "3 o más", "No sé")
OPCIONES_ATRAPADOS = ("Sí", "No", "No sé")
OPCIONES_CANT_VEHICULOS = ("1", "2", "3 o más")
TIPOS_VEHICULOS = ("Auto", "Moto", "Camión o colectivo", "Bicicleta", "Peatón")

# Estados de una alerta: desde cuál se puede pasar a cuál
TRANSICIONES_ALERTA = {
    "Nueva": ("Confirmada", "Falsa alarma"),
    "Confirmada": ("Atendida", "Falsa alarma"),
}


class ErrorValidacion(Exception):
    """Error que se le muestra tal cual al usuario (por ejemplo, 'contraseña muy corta')."""
    pass


def obtener_clave_secreta():
    """Clave que firma las sesiones. Se genera una vez y se guarda en un archivo."""
    ruta = BASE / "clave_secreta.txt"
    if not ruta.exists():
        ruta.write_text(secrets.token_hex(32))
    return ruta.read_text().strip()


SAL_IP = obtener_clave_secreta()[:16]

# Al arrancar se crean o actualizan las tablas que hagan falta
crear_tabla_usuarios()
crear_tabla_notas()
crear_tabla_alertas()
preparar_personal()

app = FastAPI(title="Sistema de Guardia - Bomberos Voluntarios")
app.add_middleware(
    SessionMiddleware,
    secret_key=obtener_clave_secreta(),
    max_age=60 * 60 * 12,   # la sesión dura 12 horas
    same_site="lax",
)


def sesion_valida(request):
    """La sesión sirve solo si el usuario sigue existiendo y activo.
    Así, al desactivar a alguien, pierde el acceso en su próxima acción."""
    usuario = request.session.get("usuario")
    if not usuario:
        return False
    if not usuario_activo(usuario):
        request.session.clear()
        return False
    return True


def limpiar_texto(valor, maximo):
    if valor is None:
        return ""
    return str(valor).strip()[:maximo]


def leer_coordenada(valor, minimo, maximo):
    try:
        numero = float(valor)
    except (TypeError, ValueError):
        return None
    if minimo <= numero <= maximo:
        return numero
    return None


def huella_conexion(request):
    """No se guarda la IP real: solo una huella para contar avisos repetidos."""
    ip = request.client.host if request.client else "desconocida"
    return hashlib.sha256((SAL_IP + ip).encode("utf-8")).hexdigest()[:20]


def validar_estado_personal(estado):
    if estado not in ESTADOS_PERSONAL:
        raise ErrorValidacion("El estado del bombero no es válido.")


# ---------- Ayudas para eliminar sin afectar otros datos ----------
def contar_relacionados(consulta, identificador):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute(consulta, (identificador,))
    cantidad = cursor.fetchone()[0]
    conexion.close()
    return cantidad


def texto_cantidad(cantidad, singular, plural_texto):
    return str(cantidad) + " " + (singular if cantidad == 1 else plural_texto)


def unir_con_y(partes):
    """['8 gabetas', '5 novedades'] -> '8 gabetas y 5 novedades'"""
    if len(partes) <= 1:
        return "".join(partes)
    return ", ".join(partes[:-1]) + " y " + partes[-1]


# ==================================================
# Registro de funciones disponibles para el navegador
# ==================================================
FUNCIONES = {}


def api(admin=False, sesion=False):
    """Registra una función para que el navegador pueda llamarla.
    admin=True: solo los administradores pueden usarla.
    sesion=True: la función recibe los datos de la sesión como primer argumento."""
    def decorador(func):
        FUNCIONES[func.__name__] = {"func": func, "admin": admin, "sesion": sesion}
        return func
    return decorador


# ---------- Inicio ----------
@api()
def js_resumen_inicio():
    conexion = obtener_conexion()
    cursor = conexion.cursor()

    cursor.execute("SELECT COUNT(*) FROM Personal WHERE estado = 'Activo'")
    personal = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Vehiculos WHERE estado = 'Operativo'")
    vehiculos = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM Guardias
        WHERE substr(fecha, 1, 7) = strftime('%Y-%m', 'now', 'localtime')
    """)
    guardias = cursor.fetchone()[0]

    cursor.execute("""
        SELECT COUNT(*) FROM Novedades
        JOIN Guardias ON Novedades.id_guardia = Guardias.id_guardia
        WHERE substr(Guardias.fecha, 1, 7) = strftime('%Y-%m', 'now', 'localtime')
    """)
    novedades = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM Notas WHERE estado != 'Realizada'")
    notas = cursor.fetchone()[0]

    conexion.close()
    return {
        "personal_activo": personal,
        "vehiculos_operativos": vehiculos,
        "guardias_mes": guardias,
        "novedades_mes": novedades,
        "notas_pendientes": notas,
    }


# ---------- Personal ----------
@api(admin=True)
def js_alta_personal(dni, nombre, apellido, rango, telefono, fecha_ingreso, estado="Activo"):
    validar_estado_personal(estado)
    alta_personal(dni, nombre, apellido, rango, telefono, fecha_ingreso, estado)
    return True

@api()
def js_listar_personal():
    return listar_personal()

@api(admin=True)
def js_modificar_personal(id_personal, dni, nombre, apellido, rango, telefono, fecha_ingreso, estado="Activo"):
    validar_estado_personal(estado)
    modificar_personal(id_personal, dni, nombre, apellido, rango, telefono, fecha_ingreso, estado)
    return True

@api(admin=True)
def js_baja_personal(id_personal):
    baja_personal(id_personal)
    return True


# ---------- Vehículos ----------
@api()
def js_alta_vehiculo(numero_movil, patente, tipo, estado):
    alta_vehiculo(numero_movil, patente, tipo, estado)
    return True

@api()
def js_listar_vehiculos():
    return listar_vehiculos()

@api()
def js_modificar_vehiculo(id_vehiculo, numero_movil, patente, tipo, estado):
    modificar_vehiculo(id_vehiculo, numero_movil, patente, tipo, estado)
    return True

@api(admin=True)
def js_eliminar_vehiculo(id_vehiculo):
    gabetas = contar_relacionados("SELECT COUNT(*) FROM Gabetas WHERE id_vehiculo = ?", id_vehiculo)
    items = contar_relacionados("SELECT COUNT(*) FROM Inventario WHERE id_vehiculo = ?", id_vehiculo)
    novedades = contar_relacionados("SELECT COUNT(*) FROM Novedades WHERE id_vehiculo = ?", id_vehiculo)

    en_uso = []
    if gabetas:
        en_uso.append(texto_cantidad(gabetas, "gabeta", "gabetas"))
    if items:
        en_uso.append(texto_cantidad(items, "ítem de inventario", "ítems de inventario"))
    if novedades:
        en_uso.append(texto_cantidad(novedades, "novedad", "novedades"))

    if en_uso:
        raise ErrorValidacion(
            "No se puede eliminar este vehículo porque está en uso: tiene " + unir_con_y(en_uso) + ". "
            "Para sacarlo de circulación, cambiá su estado a «Fuera de servicio»."
        )

    eliminar_vehiculo(id_vehiculo)
    return True

@api()
def js_listar_vehiculos_para_select():
    return listar_vehiculos()


# ---------- Guardias ----------
@api()
def js_alta_guardia(fecha, hora_inicio, hora_fin):
    return alta_guardia(fecha, hora_inicio, hora_fin)

@api()
def js_listar_guardias():
    return listar_guardias()

@api(admin=True)
def js_eliminar_guardia(id_guardia):
    novedades = contar_relacionados("SELECT COUNT(*) FROM Novedades WHERE id_guardia = ?", id_guardia)

    if novedades:
        raise ErrorValidacion(
            "No se puede eliminar esta guardia porque tiene "
            + texto_cantidad(novedades, "novedad registrada", "novedades registradas")
            + ". Para eliminarla, primero hay que eliminar esas novedades."
        )

    # Se borran sus asignaciones de personal y la guardia en una sola operación
    eliminar_guardia(id_guardia)
    return True

@api()
def js_asignar_personal_a_guardia(id_guardia, id_personal):
    asignar_personal_a_guardia(id_guardia, id_personal)
    return True

@api()
def js_quitar_personal_de_guardia(id_guardia, id_personal):
    quitar_personal_de_guardia(id_guardia, id_personal)
    return True

@api()
def js_listar_personal_de_guardia(id_guardia):
    return listar_personal_de_guardia(id_guardia)

@api()
def js_listar_personal_para_modal():
    # Solo el personal Activo se puede asignar a una guardia
    return listar_personal_disponible()

@api()
def js_listar_guardias_para_select():
    return listar_guardias()


# ---------- Inventario ----------
@api()
def js_alta_item(nombre, cantidad, estado, id_vehiculo):
    id_vehiculo = int(id_vehiculo) if id_vehiculo else None
    alta_item(nombre, int(cantidad), estado, id_vehiculo)
    return True

@api()
def js_listar_items():
    return listar_items()

@api()
def js_modificar_item(id_item, nombre, cantidad, estado, id_vehiculo):
    id_vehiculo = int(id_vehiculo) if id_vehiculo else None
    modificar_item(id_item, nombre, int(cantidad), estado, id_vehiculo)
    return True

@api(admin=True)
def js_eliminar_item(id_item):
    eliminar_item(id_item)
    return True

@api()
def js_listar_items_sin_gabeta():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT id_item, nombre, cantidad, estado FROM Inventario WHERE id_gabeta IS NULL")
    resultado = cursor.fetchall()
    conexion.close()
    return resultado


# ---------- Gabetas ----------
@api()
def js_listar_gabetas_de_vehiculo(id_vehiculo):
    return listar_gabetas_de_vehiculo(id_vehiculo)

@api()
def js_listar_items_de_gabeta(id_gabeta):
    return listar_items_de_gabeta(id_gabeta)

@api()
def js_asignar_item_a_gabeta(id_item, id_gabeta):
    asignar_item_a_gabeta(id_item, id_gabeta)
    return True

@api()
def js_quitar_item_de_gabeta(id_item):
    quitar_item_de_gabeta(id_item)
    return True


# ---------- Novedades ----------
@api()
def js_alta_novedad(id_guardia, hora, tipo_evento, descripcion, id_vehiculo):
    id_vehiculo = int(id_vehiculo) if id_vehiculo else None
    alta_novedad(id_guardia, hora, tipo_evento, descripcion, id_vehiculo)
    return True

@api()
def js_listar_novedades():
    return listar_novedades()

@api()
def js_modificar_novedad(id_novedad, hora, tipo_evento, descripcion, id_vehiculo):
    id_vehiculo = int(id_vehiculo) if id_vehiculo else None
    modificar_novedad(id_novedad, hora, tipo_evento, descripcion, id_vehiculo)
    return True

@api(admin=True)
def js_eliminar_novedad(id_novedad):
    eliminar_novedad(id_novedad)
    return True


# ---------- Notas y Gestiones ----------
@api()
def js_alta_nota(fecha_ingreso, remitente, asunto, tipo, fecha_evento, estado, observaciones):
    alta_nota(fecha_ingreso, remitente, asunto, tipo, fecha_evento or None, estado, observaciones)
    return True

@api()
def js_listar_notas():
    return listar_notas()

@api()
def js_modificar_nota(id_nota, fecha_ingreso, remitente, asunto, tipo, fecha_evento, estado, observaciones):
    modificar_nota(id_nota, fecha_ingreso, remitente, asunto, tipo, fecha_evento or None, estado, observaciones)
    return True

@api(admin=True)
def js_eliminar_nota(id_nota):
    eliminar_nota(id_nota)
    return True


# ---------- Alertas de la comunidad (las ve el personal con sesión) ----------
@api()
def js_listar_alertas():
    return listar_alertas()

@api()
def js_contar_alertas_nuevas():
    return contar_alertas_nuevas()

@api(sesion=True)
def js_cambiar_estado_alerta(sesion, id_alerta, nuevo_estado):
    estado_actual = obtener_estado_alerta(id_alerta)
    if estado_actual is None:
        raise ErrorValidacion("La alerta no existe.")
    if nuevo_estado not in TRANSICIONES_ALERTA.get(estado_actual, ()):
        raise ErrorValidacion("Esa alerta ya está en estado " + estado_actual + " y no se puede pasar a " + str(nuevo_estado) + ".")

    quien = sesion.get("nombre") or sesion.get("usuario")
    cambiar_estado_alerta(id_alerta, nuevo_estado, quien)
    return True


# ---------- Usuarios (solo administrador) ----------
@api(admin=True)
def js_listar_usuarios():
    return listar_usuarios()

@api(admin=True)
def js_crear_usuario(usuario, nombre, password, rol):
    usuario = str(usuario).strip().lower()
    nombre = str(nombre).strip()
    password = str(password)

    if not usuario or " " in usuario:
        raise ErrorValidacion("El usuario no puede estar vacío ni tener espacios.")
    if not nombre:
        raise ErrorValidacion("Escribí el nombre completo.")
    if len(password) < 6:
        raise ErrorValidacion("La contraseña debe tener al menos 6 caracteres.")
    if rol not in ("admin", "usuario"):
        raise ErrorValidacion("El rol no es válido.")

    try:
        crear_usuario(usuario, nombre, password, rol)
    except sqlite3.IntegrityError:
        raise ErrorValidacion("Ya existe un usuario con ese nombre.")
    return True

@api(admin=True, sesion=True)
def js_cambiar_estado_usuario(sesion, id_usuario, activo):
    objetivo = buscar_usuario_por_id(id_usuario)
    if objetivo is None:
        raise ErrorValidacion("El usuario no existe.")
    if objetivo[1] == sesion.get("usuario") and not activo:
        raise ErrorValidacion("No podés desactivar tu propio usuario.")
    cambiar_estado_usuario(id_usuario, 1 if activo else 0)
    return True

@api(admin=True)
def js_cambiar_password_usuario(id_usuario, password_nueva):
    if buscar_usuario_por_id(id_usuario) is None:
        raise ErrorValidacion("El usuario no existe.")
    if len(str(password_nueva)) < 6:
        raise ErrorValidacion("La contraseña debe tener al menos 6 caracteres.")
    cambiar_password(id_usuario, str(password_nueva))
    return True


# ==================================================
# Rutas: login, páginas y API
# ==================================================
@app.get("/login")
def pagina_login(request: Request):
    if sesion_valida(request):
        return RedirectResponse("/")
    return FileResponse(WEB / "login.html")


@app.post("/login")
async def hacer_login(request: Request):
    datos = await request.json()
    usuario = autenticar(str(datos.get("usuario", "")).strip().lower(), str(datos.get("password", "")))
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    request.session["usuario"] = usuario["usuario"]
    request.session["nombre"] = usuario["nombre"]
    request.session["rol"] = usuario["rol"]
    return {"ok": True}


@app.get("/salir")
def cerrar_sesion(request: Request):
    request.session.clear()
    return RedirectResponse("/login")


@app.get("/api/yo")
def quien_soy(request: Request):
    if not sesion_valida(request):
        raise HTTPException(status_code=401, detail="No autenticado")
    return {
        "usuario": request.session["usuario"],
        "nombre": request.session["nombre"],
        "rol": request.session["rol"],
    }


@app.post("/api/{nombre}")
async def llamar_funcion(nombre: str, request: Request):
    if not sesion_valida(request):
        raise HTTPException(status_code=401, detail="No autenticado")

    entrada = FUNCIONES.get(nombre)
    if entrada is None:
        raise HTTPException(status_code=404, detail="Función no encontrada")

    if entrada["admin"] and request.session.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Esta acción requiere permisos de administrador")

    datos = await request.json()
    argumentos = datos.get("args", [])

    try:
        if entrada["sesion"]:
            return entrada["func"](request.session, *argumentos)
        return entrada["func"](*argumentos)
    except ErrorValidacion as error:
        raise HTTPException(status_code=400, detail=str(error))
    except sqlite3.IntegrityError as error:
        if "UNIQUE" in str(error):
            detalle = "Ya existe un registro con ese dato (por ejemplo, un DNI o una patente repetidos)."
        else:
            detalle = "No se puede completar la acción porque el dato está relacionado con otros registros."
        raise HTTPException(status_code=400, detail=detalle)
    except Exception:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Ocurrió un error en el servidor. Revisá la terminal.")


# ---------- Pantalla principal y archivos de la carpeta web ----------
@app.get("/")
def inicio(request: Request):
    if not sesion_valida(request):
        return RedirectResponse("/login")
    return FileResponse(WEB / "index.html", headers={"Cache-Control": "no-cache"})


@app.get("/eel.js")   # Tu index.html pide /eel.js: ahora le respondemos con el puente nuevo
def archivo_puente():
    return FileResponse(WEB / "puente.js", media_type="text/javascript",
                        headers={"Cache-Control": "no-cache"})


# ---------- Aviso de emergencia de la comunidad (público, sin login) ----------
@app.get("/reportar")
def pagina_reportar():
    return FileResponse(WEB / "reportar.html", headers={"Cache-Control": "no-cache"})


@app.post("/api-publico/reportar")
async def recibir_reporte(request: Request):
    try:
        datos = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo leer el aviso.")
    if not isinstance(datos, dict):
        raise HTTPException(status_code=400, detail="No se pudo leer el aviso.")

    # Campo trampa: las personas no lo ven, los robots sí lo completan.
    # Se responde "ok" para no darles pistas, pero no se guarda nada.
    if datos.get("sitio_web"):
        return {"ok": True, "id": 0}

    tipo = limpiar_texto(datos.get("tipo"), 60)
    if tipo not in TIPOS_EMERGENCIA:
        raise HTTPException(status_code=400, detail="Elegí qué está pasando.")

    referencia = limpiar_texto(datos.get("referencia"), 150)
    latitud = leer_coordenada(datos.get("latitud"), -90, 90)
    longitud = leer_coordenada(datos.get("longitud"), -180, 180)
    if latitud is None or longitud is None:
        latitud = None
        longitud = None
    if not referencia and latitud is None:
        raise HTTPException(status_code=400, detail="Marcá el lugar en el mapa o escribí una referencia.")

    telefono = limpiar_texto(datos.get("telefono"), 25)
    cantidad_digitos = len(re.sub(r"\D", "", telefono))
    if cantidad_digitos < 6 or cantidad_digitos > 15:
        raise HTTPException(status_code=400, detail="Escribí un teléfono de contacto válido para que podamos llamarte.")

    victimas = limpiar_texto(datos.get("victimas"), 20)
    if victimas not in OPCIONES_VICTIMAS:
        victimas = None

    atrapados = limpiar_texto(datos.get("atrapados"), 20)
    if tipo not in TIPOS_CON_ATRAPADOS or atrapados not in OPCIONES_ATRAPADOS:
        atrapados = None

    cantidad_vehiculos = None
    tipos_vehiculos = None
    if tipo == TIPO_ACCIDENTE:
        cantidad = limpiar_texto(datos.get("cantidad_vehiculos"), 20)
        if cantidad in OPCIONES_CANT_VEHICULOS:
            cantidad_vehiculos = cantidad

        lista = datos.get("tipos_vehiculos")
        if isinstance(lista, list):
            elegidos = []
            for elemento in lista:
                if elemento in TIPOS_VEHICULOS and elemento not in elegidos:
                    elegidos.append(elemento)
            if elegidos:
                tipos_vehiculos = ", ".join(elegidos)

    nombre = limpiar_texto(datos.get("nombre"), 80) or None
    nota = limpiar_texto(datos.get("nota"), 300) or None

    # Límite de avisos por conexión
    huella = huella_conexion(request)
    if contar_alertas_recientes(huella, VENTANA_MINUTOS) >= LIMITE_AVISOS:
        raise HTTPException(
            status_code=429,
            detail="Enviaste varios avisos seguidos. Esperá unos minutos o llamá al " + TELEFONO_GUARDIA + "."
        )

    id_alerta = alta_alerta(tipo, referencia or None, latitud, longitud, victimas, atrapados,
                            cantidad_vehiculos, tipos_vehiculos, nombre, telefono, nota, huella)
    print("[ALERTA #" + str(id_alerta) + "] " + tipo)
    return {"ok": True, "id": id_alerta}


# ---------- Archivos de la carpeta web ----------
@app.get("/{archivo}")
def archivo_estatico(archivo: str, request: Request):
    ruta = (WEB / archivo).resolve()
    tipo = TIPOS_ARCHIVO.get(ruta.suffix.lower())

    if tipo is None or ruta.parent != WEB.resolve() or not ruta.is_file():
        raise HTTPException(status_code=404, detail="No encontrado")

    # Los archivos que empiezan con "privado-" solo se entregan a usuarios con sesión
    if archivo.startswith("privado-") and not sesion_valida(request):
        raise HTTPException(status_code=401, detail="No autenticado")

    return FileResponse(ruta, media_type=tipo, headers={"Cache-Control": "no-cache"})


if __name__ == "__main__":
    threading.Timer(1.5, lambda: webbrowser.open(f"http://localhost:{PUERTO}")).start()
    uvicorn.run(app, host=HOST, port=PUERTO)
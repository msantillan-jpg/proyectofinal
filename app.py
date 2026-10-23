import eel
from personal import alta_personal, listar_personal, modificar_personal, baja_personal
from vehiculos import alta_vehiculo, listar_vehiculos, modificar_vehiculo, eliminar_vehiculo
from guardias import alta_guardia, listar_guardias, asignar_personal_a_guardia, quitar_personal_de_guardia, listar_personal_de_guardia, eliminar_guardia
from inventario import alta_item, listar_items, modificar_item, eliminar_item
from novedades import alta_novedad, listar_novedades, modificar_novedad, eliminar_novedad
from gabetas import listar_gabetas_de_vehiculo, listar_items_de_gabeta, asignar_item_a_gabeta, quitar_item_de_gabeta, crear_gabeta, eliminar_gabeta

eel.init("web")

# ---------- Funciones expuestas para Personal ----------
@eel.expose
def js_alta_personal(dni, nombre, apellido, rango, telefono, fecha_ingreso):
    alta_personal(dni, nombre, apellido, rango, telefono, fecha_ingreso)
    return True

@eel.expose
def js_listar_personal():
    return listar_personal()

@eel.expose
def js_modificar_personal(id_personal, dni, nombre, apellido, rango, telefono, fecha_ingreso):
    modificar_personal(id_personal, dni, nombre, apellido, rango, telefono, fecha_ingreso)
    return True

@eel.expose
def js_baja_personal(id_personal):
    baja_personal(id_personal)
    return True

# ---------- Funciones expuestas para Vehículos ----------
@eel.expose
def js_alta_vehiculo(numero_movil, patente, tipo, estado):
    alta_vehiculo(numero_movil, patente, tipo, estado)
    return True

@eel.expose
def js_listar_vehiculos():
    return listar_vehiculos()

@eel.expose
def js_modificar_vehiculo(id_vehiculo, numero_movil, patente, tipo, estado):
    modificar_vehiculo(id_vehiculo, numero_movil, patente, tipo, estado)
    return True

@eel.expose
def js_eliminar_vehiculo(id_vehiculo):
    eliminar_vehiculo(id_vehiculo)
    return True

# ---------- Funciones expuestas para Guardias ----------
@eel.expose
def js_alta_guardia(fecha, hora_inicio, hora_fin):
    return alta_guardia(fecha, hora_inicio, hora_fin)

@eel.expose
def js_listar_guardias():
    return listar_guardias()

@eel.expose
def js_eliminar_guardia(id_guardia):
    eliminar_guardia(id_guardia)
    return True

@eel.expose
def js_asignar_personal_a_guardia(id_guardia, id_personal):
    asignar_personal_a_guardia(id_guardia, id_personal)
    return True

@eel.expose
def js_quitar_personal_de_guardia(id_guardia, id_personal):
    quitar_personal_de_guardia(id_guardia, id_personal)
    return True

@eel.expose
def js_listar_personal_de_guardia(id_guardia):
    return listar_personal_de_guardia(id_guardia)

@eel.expose
def js_listar_personal_para_modal():
    return listar_personal()

# ---------- Funciones expuestas para Inventario ----------
@eel.expose
def js_alta_item(nombre, cantidad, estado, id_vehiculo):
    id_vehiculo = int(id_vehiculo) if id_vehiculo else None
    alta_item(nombre, int(cantidad), estado, id_vehiculo)
    return True

@eel.expose
def js_listar_items():
    return listar_items()

@eel.expose
def js_modificar_item(id_item, nombre, cantidad, estado, id_vehiculo):
    id_vehiculo = int(id_vehiculo) if id_vehiculo else None
    modificar_item(id_item, nombre, int(cantidad), estado, id_vehiculo)
    return True

@eel.expose
def js_eliminar_item(id_item):
    eliminar_item(id_item)
    return True

@eel.expose
def js_listar_vehiculos_para_select():
    return listar_vehiculos()

# Iniciar la aplicación (SIEMPRE al final del archivo)
# ---------- Funciones expuestas para Novedades ----------
@eel.expose
def js_alta_novedad(id_guardia, hora, tipo_evento, descripcion, id_vehiculo):
    id_vehiculo = int(id_vehiculo) if id_vehiculo else None
    alta_novedad(id_guardia, hora, tipo_evento, descripcion, id_vehiculo)
    return True

@eel.expose
def js_listar_novedades():
    return listar_novedades()

@eel.expose
def js_modificar_novedad(id_novedad, hora, tipo_evento, descripcion, id_vehiculo):
    id_vehiculo = int(id_vehiculo) if id_vehiculo else None
    modificar_novedad(id_novedad, hora, tipo_evento, descripcion, id_vehiculo)
    return True

@eel.expose
def js_eliminar_novedad(id_novedad):
    eliminar_novedad(id_novedad)
    return True

@eel.expose
def js_listar_guardias_para_select():
    return listar_guardias()
# ---------- Funciones expuestas para Gabetas ----------
@eel.expose
def js_listar_gabetas_de_vehiculo(id_vehiculo):
    return listar_gabetas_de_vehiculo(id_vehiculo)

@eel.expose
def js_listar_items_de_gabeta(id_gabeta):
    return listar_items_de_gabeta(id_gabeta)

@eel.expose
def js_asignar_item_a_gabeta(id_item, id_gabeta):
    asignar_item_a_gabeta(id_item, id_gabeta)
    return True

@eel.expose
def js_quitar_item_de_gabeta(id_item):
    quitar_item_de_gabeta(id_item)
    return True

@eel.expose
def js_listar_items_sin_gabeta():
    """
    Devuelve los ítems de Inventario que no tienen gabeta asignada,
    para poder elegir cuáles asignar a una gabeta específica.
    """
    todos = listar_items()
    # listar_items() devuelve: id, nombre, cantidad, estado, id_vehiculo, patente
    # Filtramos según si tienen o no id_gabeta consultando directo a la base
    from conexion import obtener_conexion
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT id_item, nombre, cantidad, estado FROM Inventario WHERE id_gabeta IS NULL")
    resultado = cursor.fetchall()
    conexion.close()
    return resultado
eel.start("index.html", size=(1000, 700))
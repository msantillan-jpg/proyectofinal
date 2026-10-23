from conexion import obtener_conexion

def alta_personal(dni, nombre, apellido, rango, telefono, fecha_ingreso):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Personal (dni, nombre, apellido, rango, telefono, fecha_ingreso)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (dni, nombre, apellido, rango, telefono, fecha_ingreso))
    conexion.commit()
    conexion.close()

def listar_personal():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM Personal WHERE activo = 1")
    resultados = cursor.fetchall()
    conexion.close()
    return resultados

def modificar_personal(id_personal, dni, nombre, apellido, rango, telefono, fecha_ingreso):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Personal
        SET dni = ?, nombre = ?, apellido = ?, rango = ?, telefono = ?, fecha_ingreso = ?
        WHERE id_personal = ?
    """, (dni, nombre, apellido, rango, telefono, fecha_ingreso, id_personal))
    conexion.commit()
    conexion.close()

def baja_personal(id_personal):
    """
    Baja lógica: en vez de borrar el registro, lo marcamos como inactivo.
    Así no se pierde el historial (por ejemplo, si ese bombero
    participó en guardias o novedades anteriores).
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("UPDATE Personal SET activo = 0 WHERE id_personal = ?", (id_personal,))
    conexion.commit()
    conexion.close()
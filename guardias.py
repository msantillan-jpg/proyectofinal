from conexion import obtener_conexion

def alta_guardia(fecha, hora_inicio, hora_fin):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Guardias (fecha, hora_inicio, hora_fin)
        VALUES (?, ?, ?)
    """, (fecha, hora_inicio, hora_fin))
    conexion.commit()
    id_nueva_guardia = cursor.lastrowid  # id que acaba de generarse
    conexion.close()
    return id_nueva_guardia

def listar_guardias():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT * FROM Guardias ORDER BY fecha DESC")
    resultados = cursor.fetchall()
    conexion.close()
    return resultados

def asignar_personal_a_guardia(id_guardia, id_personal):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT OR IGNORE INTO Guardia_Personal (id_guardia, id_personal)
        VALUES (?, ?)
    """, (id_guardia, id_personal))
    conexion.commit()
    conexion.close()

def quitar_personal_de_guardia(id_guardia, id_personal):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        DELETE FROM Guardia_Personal
        WHERE id_guardia = ? AND id_personal = ?
    """, (id_guardia, id_personal))
    conexion.commit()
    conexion.close()

def listar_personal_de_guardia(id_guardia):
    """
    Devuelve el personal asignado a una guardia específica,
    haciendo un JOIN entre Guardia_Personal y Personal
    para traer nombre y apellido en lugar de solo el id.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Personal.id_personal, Personal.nombre, Personal.apellido, Personal.rango
        FROM Guardia_Personal
        JOIN Personal ON Guardia_Personal.id_personal = Personal.id_personal
        WHERE Guardia_Personal.id_guardia = ?
    """, (id_guardia,))
    resultados = cursor.fetchall()
    conexion.close()
    return resultados

def eliminar_guardia(id_guardia):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM Guardia_Personal WHERE id_guardia = ?", (id_guardia,))
    cursor.execute("DELETE FROM Guardias WHERE id_guardia = ?", (id_guardia,))
    conexion.commit()
    conexion.close()
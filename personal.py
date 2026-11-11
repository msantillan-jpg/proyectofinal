from conexion import obtener_conexion

ESTADOS = ("Activo", "De licencia", "Baja")

COLUMNAS = "id_personal, dni, nombre, apellido, rango, telefono, fecha_ingreso, estado"

# Primero los activos, después los de licencia y al final los de baja
ORDEN = """
    ORDER BY CASE estado WHEN 'Activo' THEN 0 WHEN 'De licencia' THEN 1 ELSE 2 END,
             apellido COLLATE NOCASE, nombre COLLATE NOCASE
"""


def preparar_personal():
    """Agrega la columna 'estado' si todavía no existe (se puede correr las veces que haga falta)."""
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("PRAGMA table_info(Personal)")
    columnas = [fila[1] for fila in cursor.fetchall()]

    if "estado" not in columnas:
        cursor.execute("ALTER TABLE Personal ADD COLUMN estado TEXT NOT NULL DEFAULT 'Activo'")
        # Los que ya estaban dados de baja pasan a tener estado Baja
        cursor.execute("UPDATE Personal SET estado = 'Baja' WHERE activo = 0")
        conexion.commit()

    conexion.close()


def alta_personal(dni, nombre, apellido, rango, telefono, fecha_ingreso, estado="Activo"):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Personal (dni, nombre, apellido, rango, telefono, fecha_ingreso, estado, activo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (dni, nombre, apellido, rango, telefono, fecha_ingreso, estado, 0 if estado == "Baja" else 1))
    conexion.commit()
    conexion.close()


def listar_personal():
    """Todo el personal, con su estado."""
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT " + COLUMNAS + " FROM Personal " + ORDEN)
    resultados = cursor.fetchall()
    conexion.close()
    return resultados


def listar_personal_disponible():
    """Solo el personal Activo: es el que se puede asignar a una guardia."""
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT " + COLUMNAS + " FROM Personal WHERE estado = 'Activo' " + ORDEN)
    resultados = cursor.fetchall()
    conexion.close()
    return resultados


def modificar_personal(id_personal, dni, nombre, apellido, rango, telefono, fecha_ingreso, estado="Activo"):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Personal
        SET dni = ?, nombre = ?, apellido = ?, rango = ?, telefono = ?,
            fecha_ingreso = ?, estado = ?, activo = ?
        WHERE id_personal = ?
    """, (dni, nombre, apellido, rango, telefono, fecha_ingreso, estado,
          0 if estado == "Baja" else 1, id_personal))
    conexion.commit()
    conexion.close()


def baja_personal(id_personal):
    """
    Baja lógica: no se borra el registro, queda con estado Baja.
    Así se conserva el historial de guardias y novedades.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("UPDATE Personal SET estado = 'Baja', activo = 0 WHERE id_personal = ?", (id_personal,))
    conexion.commit()
    conexion.close()
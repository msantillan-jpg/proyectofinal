from conexion import obtener_conexion


def crear_tabla_notas():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Notas (
            id_nota INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha_ingreso TEXT NOT NULL,
            remitente TEXT,
            asunto TEXT NOT NULL,
            tipo TEXT NOT NULL DEFAULT 'Nota',
            fecha_evento TEXT,
            estado TEXT NOT NULL DEFAULT 'Pendiente',
            observaciones TEXT
        )
    """)
    conexion.commit()
    conexion.close()


def alta_nota(fecha_ingreso, remitente, asunto, tipo, fecha_evento, estado, observaciones):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Notas (fecha_ingreso, remitente, asunto, tipo, fecha_evento, estado, observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (fecha_ingreso, remitente, asunto, tipo, fecha_evento, estado, observaciones))
    conexion.commit()
    conexion.close()


def listar_notas():
    """
    Orden: primero lo que no está realizado, después lo que tiene fecha
    (la más cercana arriba) y al final lo que no tiene fecha.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT id_nota, fecha_ingreso, remitente, asunto, tipo,
               fecha_evento, estado, observaciones
        FROM Notas
        ORDER BY
            CASE WHEN estado = 'Realizada' THEN 1 ELSE 0 END,
            CASE WHEN fecha_evento IS NULL OR fecha_evento = '' THEN 1 ELSE 0 END,
            fecha_evento ASC,
            fecha_ingreso DESC
    """)
    resultados = cursor.fetchall()
    conexion.close()
    return resultados


def modificar_nota(id_nota, fecha_ingreso, remitente, asunto, tipo, fecha_evento, estado, observaciones):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Notas
        SET fecha_ingreso = ?, remitente = ?, asunto = ?, tipo = ?,
            fecha_evento = ?, estado = ?, observaciones = ?
        WHERE id_nota = ?
    """, (fecha_ingreso, remitente, asunto, tipo, fecha_evento, estado, observaciones, id_nota))
    conexion.commit()
    conexion.close()


def eliminar_nota(id_nota):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM Notas WHERE id_nota = ?", (id_nota,))
    conexion.commit()
    conexion.close()
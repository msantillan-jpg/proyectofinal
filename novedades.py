from conexion import obtener_conexion

def alta_novedad(id_guardia, hora, tipo_evento, descripcion, id_vehiculo=None):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Novedades (id_guardia, id_vehiculo, hora, tipo_evento, descripcion)
        VALUES (?, ?, ?, ?, ?)
    """, (id_guardia, id_vehiculo, hora, tipo_evento, descripcion))
    conexion.commit()
    conexion.close()

def listar_novedades():
    """
    JOIN con Guardias (para mostrar la fecha) y LEFT JOIN con Vehiculos
    (porque el vehículo es opcional, puede no haber ninguno asociado).
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Novedades.id_novedad, Guardias.fecha, Novedades.hora,
               Novedades.tipo_evento, Novedades.descripcion,
               Vehiculos.patente, Novedades.id_guardia, Novedades.id_vehiculo
        FROM Novedades
        JOIN Guardias ON Novedades.id_guardia = Guardias.id_guardia
        LEFT JOIN Vehiculos ON Novedades.id_vehiculo = Vehiculos.id_vehiculo
        ORDER BY Guardias.fecha DESC, Novedades.hora DESC
    """)
    resultados = cursor.fetchall()
    conexion.close()
    return resultados

def modificar_novedad(id_novedad, hora, tipo_evento, descripcion, id_vehiculo=None):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Novedades
        SET hora = ?, tipo_evento = ?, descripcion = ?, id_vehiculo = ?
        WHERE id_novedad = ?
    """, (hora, tipo_evento, descripcion, id_vehiculo, id_novedad))
    conexion.commit()
    conexion.close()

def eliminar_novedad(id_novedad):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM Novedades WHERE id_novedad = ?", (id_novedad,))
    conexion.commit()
    conexion.close()
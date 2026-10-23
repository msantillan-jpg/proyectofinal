from conexion import obtener_conexion

def alta_item(nombre, cantidad, estado, id_vehiculo=None):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Inventario (id_vehiculo, nombre, cantidad, estado)
        VALUES (?, ?, ?, ?)
    """, (id_vehiculo, nombre, cantidad, estado))
    conexion.commit()
    conexion.close()

def listar_items():
    """
    Trae todos los ítems, con un JOIN para mostrar la patente
    del vehículo en lugar de solo el id (cuando corresponde).
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT Inventario.id_item, Inventario.nombre, Inventario.cantidad,
               Inventario.estado, Inventario.id_vehiculo, Vehiculos.patente
        FROM Inventario
        LEFT JOIN Vehiculos ON Inventario.id_vehiculo = Vehiculos.id_vehiculo
    """)
    resultados = cursor.fetchall()
    conexion.close()
    return resultados

def modificar_item(id_item, nombre, cantidad, estado, id_vehiculo=None):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Inventario
        SET nombre = ?, cantidad = ?, estado = ?, id_vehiculo = ?
        WHERE id_item = ?
    """, (nombre, cantidad, estado, id_vehiculo, id_item))
    conexion.commit()
    conexion.close()

def eliminar_item(id_item):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM Inventario WHERE id_item = ?", (id_item,))
    conexion.commit()
    conexion.close()
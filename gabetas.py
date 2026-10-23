from conexion import obtener_conexion

def crear_gabeta(id_vehiculo, numero, nombre):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Gabetas (id_vehiculo, numero, nombre)
        VALUES (?, ?, ?)
    """, (id_vehiculo, numero, nombre))
    conexion.commit()
    conexion.close()

def listar_gabetas_de_vehiculo(id_vehiculo):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT id_gabeta, numero, nombre
        FROM Gabetas
        WHERE id_vehiculo = ?
        ORDER BY numero
    """, (id_vehiculo,))
    resultados = cursor.fetchall()
    conexion.close()
    return resultados

def listar_items_de_gabeta(id_gabeta):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT id_item, nombre, cantidad, estado
        FROM Inventario
        WHERE id_gabeta = ?
    """, (id_gabeta,))
    resultados = cursor.fetchall()
    conexion.close()
    return resultados

def asignar_item_a_gabeta(id_item, id_gabeta):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Inventario SET id_gabeta = ? WHERE id_item = ?
    """, (id_gabeta, id_item))
    conexion.commit()
    conexion.close()

def quitar_item_de_gabeta(id_item):
    """Saca el ítem de la gabeta (vuelve a quedar 'sin gabeta asignada')."""
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Inventario SET id_gabeta = NULL WHERE id_item = ?
    """, (id_item,))
    conexion.commit()
    conexion.close()

def eliminar_gabeta(id_gabeta):
    """
    Antes de borrar la gabeta, hay que 'soltar' los ítems que tenía asignados
    (dejarlos sin gabeta), para no dejar referencias rotas.
    """
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("UPDATE Inventario SET id_gabeta = NULL WHERE id_gabeta = ?", (id_gabeta,))
    cursor.execute("DELETE FROM Gabetas WHERE id_gabeta = ?", (id_gabeta,))
    conexion.commit()
    conexion.close()
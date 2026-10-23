from conexion import obtener_conexion

def alta_vehiculo(numero_movil, patente, tipo, estado="Operativo"):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Vehiculos (numero_movil, patente, tipo, estado)
        VALUES (?, ?, ?, ?)
    """, (numero_movil, patente, tipo, estado))
    conexion.commit()
    conexion.close()

def listar_vehiculos():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT id_vehiculo, numero_movil, patente, tipo, estado FROM Vehiculos")
    resultados = cursor.fetchall()
    conexion.close()
    return resultados

def modificar_vehiculo(id_vehiculo, numero_movil, patente, tipo, estado):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Vehiculos
        SET numero_movil = ?, patente = ?, tipo = ?, estado = ?
        WHERE id_vehiculo = ?
    """, (numero_movil, patente, tipo, estado, id_vehiculo))
    conexion.commit()
    conexion.close()

def eliminar_vehiculo(id_vehiculo):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("DELETE FROM Vehiculos WHERE id_vehiculo = ?", (id_vehiculo,))
    conexion.commit()
    conexion.close()
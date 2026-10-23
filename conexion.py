import sqlite3

def obtener_conexion():
    """
    Crea y devuelve una conexión a la base de datos.
    Todas las funciones de los demás módulos van a usar esta función
    en lugar de repetir sqlite3.connect() en cada lugar.
    """
    conexion = sqlite3.connect("guardia_bomberos.db")
    conexion.execute("PRAGMA foreign_keys = ON")  # activa las claves foráneas
    return conexion
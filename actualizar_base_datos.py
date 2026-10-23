import sqlite3

conexion = sqlite3.connect("guardia_bomberos.db")
cursor = conexion.cursor()

# Nueva tabla: Gabetas (compartimentos de cada camión)
cursor.execute("""
CREATE TABLE IF NOT EXISTS Gabetas (
    id_gabeta INTEGER PRIMARY KEY AUTOINCREMENT,
    id_vehiculo INTEGER NOT NULL,
    numero INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    FOREIGN KEY (id_vehiculo) REFERENCES Vehiculos(id_vehiculo)
)
""")

# Agregamos la columna id_gabeta a Inventario (si no existe todavía)
try:
    cursor.execute("ALTER TABLE Inventario ADD COLUMN id_gabeta INTEGER REFERENCES Gabetas(id_gabeta)")
    print("Columna id_gabeta agregada a Inventario.")
except sqlite3.OperationalError:
    print("La columna id_gabeta ya existía, no se hicieron cambios.")
# Agregamos la columna numero_movil a Vehiculos (si no existe todavía)
try:
    cursor.execute("ALTER TABLE Vehiculos ADD COLUMN numero_movil TEXT")
    print("Columna numero_movil agregada a Vehiculos.")
except sqlite3.OperationalError:
    print("La columna numero_movil ya existía, no se hicieron cambios.")
conexion.commit()
conexion.close()

print("Base de datos actualizada correctamente.")

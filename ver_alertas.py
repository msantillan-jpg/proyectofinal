from conexion import obtener_conexion

conexion = obtener_conexion()
cursor = conexion.cursor()
cursor.execute("""
    SELECT id_alerta, fecha_hora, tipo, referencia, latitud, longitud,
           victimas, atrapados, cantidad_vehiculos, tipos_vehiculos,
           telefono_contacto, estado
    FROM Alertas
    ORDER BY id_alerta DESC
    LIMIT 10
""")

filas = cursor.fetchall()
conexion.close()

if not filas:
    print("Todavía no hay alertas guardadas.")

for fila in filas:
    print("-" * 60)
    print("Aviso #" + str(fila[0]) + " | " + str(fila[1]) + " | Estado: " + str(fila[11]))
    print("Tipo: " + str(fila[2]))
    print("Referencia: " + str(fila[3]))
    print("Coordenadas: " + str(fila[4]) + ", " + str(fila[5]))
    print("Víctimas: " + str(fila[6]) + " | Atrapados: " + str(fila[7]))
    print("Vehículos: " + str(fila[8]) + " (" + str(fila[9]) + ")")
    print("Teléfono: " + str(fila[10]))
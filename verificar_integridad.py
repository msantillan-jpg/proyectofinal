from conexion import obtener_conexion

conexion = obtener_conexion()
cursor = conexion.cursor()

print("=" * 55)
print("VERIFICACIÓN DE INTEGRIDAD DE LA BASE DE DATOS")
print("=" * 55)

cursor.execute("PRAGMA integrity_check")
resultado = cursor.fetchone()[0]
print("Estructura de la base:", "OK" if resultado == "ok" else resultado)

cursor.execute("PRAGMA foreign_key_check")
huerfanos = cursor.fetchall()
print("Datos huérfanos (apuntan a algo que no existe):", len(huerfanos))
for fila in huerfanos:
    print("  - Tabla " + str(fila[0]) + ", fila " + str(fila[1]) + " apunta a " + str(fila[2]))

print("-" * 55)
print("Registros por tabla:")
for tabla in ("Personal", "Vehiculos", "Guardias", "Guardia_Personal", "Gabetas",
              "Inventario", "Novedades", "Notas", "Alertas", "Usuarios"):
    try:
        cursor.execute("SELECT COUNT(*) FROM " + tabla)
        print("  " + tabla + ": " + str(cursor.fetchone()[0]))
    except Exception:
        print("  " + tabla + ": (no existe)")

conexion.close()
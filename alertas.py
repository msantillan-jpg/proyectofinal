from conexion import obtener_conexion

COLUMNAS = """id_alerta, fecha_hora, tipo, referencia, latitud, longitud, victimas, atrapados,
              cantidad_vehiculos, tipos_vehiculos, nombre_contacto, telefono_contacto, nota,
              estado, gestionado_por, fecha_gestion"""


def crear_tabla_alertas():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Alertas (
            id_alerta INTEGER PRIMARY KEY AUTOINCREMENT,
            fecha_hora TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
            tipo TEXT NOT NULL,
            referencia TEXT,
            latitud REAL,
            longitud REAL,
            victimas TEXT,
            atrapados TEXT,
            cantidad_vehiculos TEXT,
            tipos_vehiculos TEXT,
            nombre_contacto TEXT,
            telefono_contacto TEXT NOT NULL,
            nota TEXT,
            estado TEXT NOT NULL DEFAULT 'Nueva',
            gestionado_por TEXT,
            fecha_gestion TEXT,
            ip_hash TEXT
        )
    """)
    conexion.commit()
    conexion.close()


def alta_alerta(tipo, referencia, latitud, longitud, victimas, atrapados,
                cantidad_vehiculos, tipos_vehiculos, nombre_contacto,
                telefono_contacto, nota, ip_hash):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Alertas (tipo, referencia, latitud, longitud, victimas, atrapados,
                             cantidad_vehiculos, tipos_vehiculos, nombre_contacto,
                             telefono_contacto, nota, ip_hash)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (tipo, referencia, latitud, longitud, victimas, atrapados,
          cantidad_vehiculos, tipos_vehiculos, nombre_contacto,
          telefono_contacto, nota, ip_hash))
    conexion.commit()
    id_alerta = cursor.lastrowid
    conexion.close()
    return id_alerta


def contar_alertas_recientes(ip_hash, minutos):
    """Cuántos avisos mandó esa conexión en los últimos minutos (para frenar el spam)."""
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT COUNT(*) FROM Alertas
        WHERE ip_hash = ? AND fecha_hora >= datetime('now', 'localtime', ?)
    """, (ip_hash, "-" + str(int(minutos)) + " minutes"))
    cantidad = cursor.fetchone()[0]
    conexion.close()
    return cantidad


def listar_alertas():
    """Las nuevas primero, después las confirmadas y al final las cerradas."""
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT " + COLUMNAS + """
        FROM Alertas
        ORDER BY
            CASE estado WHEN 'Nueva' THEN 0 WHEN 'Confirmada' THEN 1 ELSE 2 END,
            fecha_hora DESC
    """)
    resultados = cursor.fetchall()
    conexion.close()
    return resultados


def obtener_estado_alerta(id_alerta):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT estado FROM Alertas WHERE id_alerta = ?", (id_alerta,))
    fila = cursor.fetchone()
    conexion.close()
    return fila[0] if fila else None


def cambiar_estado_alerta(id_alerta, estado, gestionado_por):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        UPDATE Alertas
        SET estado = ?, gestionado_por = ?, fecha_gestion = datetime('now', 'localtime')
        WHERE id_alerta = ?
    """, (estado, gestionado_por, id_alerta))
    conexion.commit()
    conexion.close()


def contar_alertas_nuevas():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT COUNT(*) FROM Alertas WHERE estado = 'Nueva'")
    cantidad = cursor.fetchone()[0]
    conexion.close()
    return cantidad
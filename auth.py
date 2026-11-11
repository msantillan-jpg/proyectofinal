import hashlib
import hmac
import os
from conexion import obtener_conexion

ITERACIONES = 200_000


def crear_tabla_usuarios():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Usuarios (
            id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario TEXT NOT NULL UNIQUE,
            nombre TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            rol TEXT NOT NULL CHECK (rol IN ('admin', 'usuario')),
            activo INTEGER DEFAULT 1
        )
    """)
    conexion.commit()
    conexion.close()


def hashear_password(password):
    """Devuelve 'salt$hash'. La contraseña nunca se guarda en texto plano."""
    salt = os.urandom(16)
    hash_bytes = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, ITERACIONES)
    return salt.hex() + "$" + hash_bytes.hex()


def verificar_password(password, guardado):
    salt_hex, hash_hex = guardado.split("$")
    hash_bytes = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), bytes.fromhex(salt_hex), ITERACIONES
    )
    return hmac.compare_digest(hash_bytes.hex(), hash_hex)


def crear_usuario(usuario, nombre, password, rol):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        INSERT INTO Usuarios (usuario, nombre, password_hash, rol)
        VALUES (?, ?, ?, ?)
    """, (usuario, nombre, hashear_password(password), rol))
    conexion.commit()
    conexion.close()


def autenticar(usuario, password):
    """Devuelve los datos del usuario si la contraseña es correcta, o None."""
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT usuario, nombre, password_hash, rol
        FROM Usuarios
        WHERE usuario = ? AND activo = 1
    """, (usuario,))
    fila = cursor.fetchone()
    conexion.close()

    if fila and verificar_password(password, fila[2]):
        return {"usuario": fila[0], "nombre": fila[1], "rol": fila[3]}
    return None


def usuario_activo(usuario):
    """True si el usuario existe y no fue desactivado."""
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("SELECT activo FROM Usuarios WHERE usuario = ?", (usuario,))
    fila = cursor.fetchone()
    conexion.close()
    return bool(fila and fila[0])


def listar_usuarios():
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT id_usuario, usuario, nombre, rol, activo
        FROM Usuarios
        ORDER BY activo DESC, nombre COLLATE NOCASE
    """)
    resultados = cursor.fetchall()
    conexion.close()
    return resultados


def buscar_usuario_por_id(id_usuario):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("""
        SELECT id_usuario, usuario, nombre, rol, activo
        FROM Usuarios
        WHERE id_usuario = ?
    """, (id_usuario,))
    fila = cursor.fetchone()
    conexion.close()
    return fila


def cambiar_estado_usuario(id_usuario, activo):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute("UPDATE Usuarios SET activo = ? WHERE id_usuario = ?", (activo, id_usuario))
    conexion.commit()
    conexion.close()


def cambiar_password(id_usuario, password_nueva):
    conexion = obtener_conexion()
    cursor = conexion.cursor()
    cursor.execute(
        "UPDATE Usuarios SET password_hash = ? WHERE id_usuario = ?",
        (hashear_password(password_nueva), id_usuario)
    )
    conexion.commit()
    conexion.close()
import getpass
import sqlite3
from auth import crear_tabla_usuarios, crear_usuario

crear_tabla_usuarios()

print("=== Crear usuario del sistema ===")
usuario = input("Nombre de usuario (sin espacios): ").strip().lower()
nombre = input("Nombre completo: ").strip()
opcion = input("Rol (escribí 1 para Administrador, 2 para Usuario): ").strip()
rol = "admin" if opcion == "1" else "usuario"

password = getpass.getpass("Contraseña (no se ve mientras escribís): ")
repetir = getpass.getpass("Repetí la contraseña: ")

if password != repetir:
    raise SystemExit("Las contraseñas no coinciden. Volvé a correr el script.")
if len(password) < 6:
    raise SystemExit("La contraseña debe tener al menos 6 caracteres.")
if not usuario or not nombre:
    raise SystemExit("El usuario y el nombre no pueden estar vacíos.")

try:
    crear_usuario(usuario, nombre, password, rol)
    print(f"Usuario '{usuario}' creado con rol: {rol}")
except sqlite3.IntegrityError:
    print("Ya existe un usuario con ese nombre.")
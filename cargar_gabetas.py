from vehiculos import listar_vehiculos
from gabetas import crear_gabeta

# Nombres típicos de gabetas de una autobomba (ajustá si tu camión es distinto)
GABETAS_MODELO = [
    "Gabeta Delantera Izquierda",
    "Gabeta Delantera Derecha",
    "Gabeta Central Izquierda",
    "Gabeta Central Derecha",
    "Gabeta Trasera Izquierda",
    "Gabeta Trasera Derecha",
    "Gabeta Superior",
    "Gabeta Bombero (mangueras)",
]

vehiculos = listar_vehiculos()

print("Vehículos encontrados:")
for v in vehiculos:
    numero_movil = v[1] or "Sin número"
    print(f"  ID {v[0]}: Móvil {numero_movil} - {v[3]} (patente: {v[2]})")

id_vehiculo = input("\nIngresá el ID del vehículo al que le querés cargar gabetas: ")

for i, nombre in enumerate(GABETAS_MODELO, start=1):
    crear_gabeta(int(id_vehiculo), i, nombre)

print(f"\n{len(GABETAS_MODELO)} gabetas cargadas para el vehículo {id_vehiculo}.")
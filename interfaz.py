import tkinter as tk
from tkinter import ttk, messagebox
from personal import alta_personal, listar_personal, modificar_personal, baja_personal
from vehiculos import alta_vehiculo, listar_vehiculos, modificar_vehiculo, eliminar_vehiculo
from guardias import alta_guardia, listar_guardias, asignar_personal_a_guardia, quitar_personal_de_guardia, listar_personal_de_guardia, eliminar_guardia

ventana = tk.Tk()
ventana.title("Sistema de Guardia - Bomberos Voluntarios")
ventana.geometry("750x550")

notebook = ttk.Notebook(ventana)
notebook.pack(fill="both", expand=True)

# ==================================================
# PESTAÑA 1: PERSONAL
# ==================================================
tab_personal = tk.Frame(notebook)
notebook.add(tab_personal, text="Personal")

frame_form_p = tk.Frame(tab_personal, padx=10, pady=10)
frame_form_p.pack(fill="x")

campos_p = ["DNI", "Nombre", "Apellido", "Rango", "Teléfono", "Fecha Ingreso (AAAA-MM-DD)"]
entradas_p = {}

for i, campo in enumerate(campos_p):
    tk.Label(frame_form_p, text=campo).grid(row=i, column=0, sticky="w", pady=2)
    entrada = tk.Entry(frame_form_p, width=30)
    entrada.grid(row=i, column=1, pady=2)
    entradas_p[campo] = entrada

id_personal_seleccionado = None

def limpiar_campos_personal():
    global id_personal_seleccionado
    for entrada in entradas_p.values():
        entrada.delete(0, tk.END)
    id_personal_seleccionado = None

def guardar_personal():
    dni = entradas_p["DNI"].get()
    nombre = entradas_p["Nombre"].get()
    apellido = entradas_p["Apellido"].get()
    rango = entradas_p["Rango"].get()
    telefono = entradas_p["Teléfono"].get()
    fecha = entradas_p["Fecha Ingreso (AAAA-MM-DD)"].get()

    if not dni or not nombre or not apellido:
        messagebox.showwarning("Faltan datos", "DNI, Nombre y Apellido son obligatorios")
        return

    alta_personal(dni, nombre, apellido, rango, telefono, fecha)
    messagebox.showinfo("Éxito", "Bombero cargado correctamente")
    limpiar_campos_personal()
    actualizar_tabla_personal()

def seleccionar_fila_personal(event):
    global id_personal_seleccionado
    seleccion = tabla_personal.focus()
    if not seleccion:
        return
    valores = tabla_personal.item(seleccion, "values")
    id_personal_seleccionado = valores[0]
    claves = list(entradas_p.keys())
    for i, clave in enumerate(claves):
        entradas_p[clave].delete(0, tk.END)
        entradas_p[clave].insert(0, valores[i + 1])

def modificar_personal_ui():
    if id_personal_seleccionado is None:
        messagebox.showwarning("Sin selección", "Seleccioná un bombero de la tabla")
        return
    valores = [entradas_p[c].get() for c in campos_p]
    modificar_personal(id_personal_seleccionado, *valores)
    messagebox.showinfo("Éxito", "Datos actualizados correctamente")
    limpiar_campos_personal()
    actualizar_tabla_personal()

def dar_de_baja_personal():
    if id_personal_seleccionado is None:
        messagebox.showwarning("Sin selección", "Seleccioná un bombero de la tabla")
        return
    if messagebox.askyesno("Confirmar", "¿Seguro que querés dar de baja a este bombero?"):
        baja_personal(id_personal_seleccionado)
        messagebox.showinfo("Éxito", "Bombero dado de baja")
        limpiar_campos_personal()
        actualizar_tabla_personal()

def actualizar_tabla_personal():
    for fila in tabla_personal.get_children():
        tabla_personal.delete(fila)
    for persona in listar_personal():
        tabla_personal.insert("", tk.END, values=persona)

frame_botones_p = tk.Frame(tab_personal, pady=10)
frame_botones_p.pack()
tk.Button(frame_botones_p, text="Guardar", command=guardar_personal, bg="#ff7a00", fg="white", width=15).pack(side="left", padx=5)
tk.Button(frame_botones_p, text="Modificar", command=modificar_personal_ui, width=15).pack(side="left", padx=5)
tk.Button(frame_botones_p, text="Dar de baja", command=dar_de_baja_personal, bg="#c0392b", fg="white", width=15).pack(side="left", padx=5)
tk.Button(frame_botones_p, text="Limpiar", command=limpiar_campos_personal, width=15).pack(side="left", padx=5)

columnas_p = ("id", "dni", "nombre", "apellido", "rango", "telefono", "fecha_ingreso", "activo")
tabla_personal = ttk.Treeview(tab_personal, columns=columnas_p, show="headings", height=8)
for col in columnas_p:
    tabla_personal.heading(col, text=col.capitalize())
    tabla_personal.column(col, width=80)
tabla_personal.pack(fill="both", expand=True, padx=10, pady=10)
tabla_personal.bind("<<TreeviewSelect>>", seleccionar_fila_personal)

actualizar_tabla_personal()

# ==================================================
# PESTAÑA 2: VEHICULOS
# ==================================================
tab_vehiculos = tk.Frame(notebook)
notebook.add(tab_vehiculos, text="Vehículos")

frame_form_v = tk.Frame(tab_vehiculos, padx=10, pady=10)
frame_form_v.pack(fill="x")

campos_v = ["Patente", "Tipo", "Estado"]
entradas_v = {}

for i, campo in enumerate(campos_v):
    tk.Label(frame_form_v, text=campo).grid(row=i, column=0, sticky="w", pady=2)
    entrada = tk.Entry(frame_form_v, width=30)
    entrada.grid(row=i, column=1, pady=2)
    entradas_v[campo] = entrada

id_vehiculo_seleccionado = None

def limpiar_campos_vehiculo():
    global id_vehiculo_seleccionado
    for entrada in entradas_v.values():
        entrada.delete(0, tk.END)
    id_vehiculo_seleccionado = None

def guardar_vehiculo():
    patente = entradas_v["Patente"].get()
    tipo = entradas_v["Tipo"].get()
    estado = entradas_v["Estado"].get() or "Operativo"

    if not patente or not tipo:
        messagebox.showwarning("Faltan datos", "Patente y Tipo son obligatorios")
        return

    alta_vehiculo(patente, tipo, estado)
    messagebox.showinfo("Éxito", "Vehículo cargado correctamente")
    limpiar_campos_vehiculo()
    actualizar_tabla_vehiculos()

def seleccionar_fila_vehiculo(event):
    global id_vehiculo_seleccionado
    seleccion = tabla_vehiculos.focus()
    if not seleccion:
        return
    valores = tabla_vehiculos.item(seleccion, "values")
    id_vehiculo_seleccionado = valores[0]
    claves = list(entradas_v.keys())
    for i, clave in enumerate(claves):
        entradas_v[clave].delete(0, tk.END)
        entradas_v[clave].insert(0, valores[i + 1])

def modificar_vehiculo_ui():
    if id_vehiculo_seleccionado is None:
        messagebox.showwarning("Sin selección", "Seleccioná un vehículo de la tabla")
        return
    valores = [entradas_v[c].get() for c in campos_v]
    modificar_vehiculo(id_vehiculo_seleccionado, *valores)
    messagebox.showinfo("Éxito", "Vehículo actualizado correctamente")
    limpiar_campos_vehiculo()
    actualizar_tabla_vehiculos()

def eliminar_vehiculo_ui():
    if id_vehiculo_seleccionado is None:
        messagebox.showwarning("Sin selección", "Seleccioná un vehículo de la tabla")
        return
    if messagebox.askyesno("Confirmar", "¿Seguro que querés eliminar este vehículo?"):
        eliminar_vehiculo(id_vehiculo_seleccionado)
        messagebox.showinfo("Éxito", "Vehículo eliminado")
        limpiar_campos_vehiculo()
        actualizar_tabla_vehiculos()

def actualizar_tabla_vehiculos():
    for fila in tabla_vehiculos.get_children():
        tabla_vehiculos.delete(fila)
    for vehiculo in listar_vehiculos():
        tabla_vehiculos.insert("", tk.END, values=vehiculo)

frame_botones_v = tk.Frame(tab_vehiculos, pady=10)
frame_botones_v.pack()
tk.Button(frame_botones_v, text="Guardar", command=guardar_vehiculo, bg="#ff7a00", fg="white", width=15).pack(side="left", padx=5)
tk.Button(frame_botones_v, text="Modificar", command=modificar_vehiculo_ui, width=15).pack(side="left", padx=5)
tk.Button(frame_botones_v, text="Eliminar", command=eliminar_vehiculo_ui, bg="#c0392b", fg="white", width=15).pack(side="left", padx=5)
tk.Button(frame_botones_v, text="Limpiar", command=limpiar_campos_vehiculo, width=15).pack(side="left", padx=5)

columnas_v = ("id", "patente", "tipo", "estado")
tabla_vehiculos = ttk.Treeview(tab_vehiculos, columns=columnas_v, show="headings", height=8)
for col in columnas_v:
    tabla_vehiculos.heading(col, text=col.capitalize())
    tabla_vehiculos.column(col, width=100)
tabla_vehiculos.pack(fill="both", expand=True, padx=10, pady=10)
tabla_vehiculos.bind("<<TreeviewSelect>>", seleccionar_fila_vehiculo)

actualizar_tabla_vehiculos()
# ==================================================
# PESTAÑA 3: GUARDIAS
# ==================================================
tab_guardias = tk.Frame(notebook)
notebook.add(tab_guardias, text="Guardias")

frame_form_g = tk.Frame(tab_guardias, padx=10, pady=10)
frame_form_g.pack(fill="x")

campos_g = ["Fecha (AAAA-MM-DD)", "Hora Inicio (HH:MM)", "Hora Fin (HH:MM)"]
entradas_g = {}

for i, campo in enumerate(campos_g):
    tk.Label(frame_form_g, text=campo).grid(row=i, column=0, sticky="w", pady=2)
    entrada = tk.Entry(frame_form_g, width=30)
    entrada.grid(row=i, column=1, pady=2)
    entradas_g[campo] = entrada

def limpiar_campos_guardia():
    for entrada in entradas_g.values():
        entrada.delete(0, tk.END)

def guardar_guardia():
    fecha = entradas_g["Fecha (AAAA-MM-DD)"].get()
    inicio = entradas_g["Hora Inicio (HH:MM)"].get()
    fin = entradas_g["Hora Fin (HH:MM)"].get()

    if not fecha or not inicio or not fin:
        messagebox.showwarning("Faltan datos", "Todos los campos son obligatorios")
        return

    alta_guardia(fecha, inicio, fin)
    messagebox.showinfo("Éxito", "Guardia creada correctamente")
    limpiar_campos_guardia()
    actualizar_tabla_guardias()

def eliminar_guardia_ui():
    seleccion = tabla_guardias.focus()
    if not seleccion:
        messagebox.showwarning("Sin selección", "Seleccioná una guardia de la tabla")
        return
    valores = tabla_guardias.item(seleccion, "values")
    id_guardia = valores[0]
    if messagebox.askyesno("Confirmar", "¿Eliminar esta guardia y sus asignaciones de personal?"):
        eliminar_guardia(id_guardia)
        messagebox.showinfo("Éxito", "Guardia eliminada")
        actualizar_tabla_guardias()

def actualizar_tabla_guardias():
    for fila in tabla_guardias.get_children():
        tabla_guardias.delete(fila)
    for guardia in listar_guardias():
        tabla_guardias.insert("", tk.END, values=guardia)

def abrir_asignar_personal():
    seleccion = tabla_guardias.focus()
    if not seleccion:
        messagebox.showwarning("Sin selección", "Seleccioná una guardia de la tabla")
        return
    valores = tabla_guardias.item(seleccion, "values")
    id_guardia = valores[0]
    fecha_guardia = valores[1]

    popup = tk.Toplevel(ventana)
    popup.title(f"Asignar Personal - Guardia {fecha_guardia}")
    popup.geometry("450x400")

    tk.Label(popup, text="Personal disponible:").pack(pady=(10, 0))
    lista_disponible = tk.Listbox(popup, width=50)
    lista_disponible.pack(pady=5)

    todo_el_personal = listar_personal()
    for persona in todo_el_personal:
        lista_disponible.insert(tk.END, f"{persona[0]} - {persona[2]} {persona[3]} ({persona[4]})")

    def asignar():
        seleccion_idx = lista_disponible.curselection()
        if not seleccion_idx:
            return
        texto = lista_disponible.get(seleccion_idx[0])
        id_personal = int(texto.split(" - ")[0])
        asignar_personal_a_guardia(id_guardia, id_personal)
        actualizar_lista_asignados()

    def quitar():
        seleccion_idx = lista_asignados.curselection()
        if not seleccion_idx:
            return
        texto = lista_asignados.get(seleccion_idx[0])
        id_personal = int(texto.split(" - ")[0])
        quitar_personal_de_guardia(id_guardia, id_personal)
        actualizar_lista_asignados()

    tk.Button(popup, text="Asignar →", command=asignar, bg="#ff7a00", fg="white").pack(pady=5)

    tk.Label(popup, text="Personal asignado a esta guardia:").pack(pady=(10, 0))
    lista_asignados = tk.Listbox(popup, width=50)
    lista_asignados.pack(pady=5)

    tk.Button(popup, text="← Quitar", command=quitar, bg="#c0392b", fg="white").pack(pady=5)

    def actualizar_lista_asignados():
        lista_asignados.delete(0, tk.END)
        for persona in listar_personal_de_guardia(id_guardia):
            lista_asignados.insert(tk.END, f"{persona[0]} - {persona[1]} {persona[2]} ({persona[3]})")

    actualizar_lista_asignados()

frame_botones_g = tk.Frame(tab_guardias, pady=10)
frame_botones_g.pack()
tk.Button(frame_botones_g, text="Crear Guardia", command=guardar_guardia, bg="#ff7a00", fg="white", width=15).pack(side="left", padx=5)
tk.Button(frame_botones_g, text="Asignar Personal", command=abrir_asignar_personal, width=18).pack(side="left", padx=5)
tk.Button(frame_botones_g, text="Eliminar Guardia", command=eliminar_guardia_ui, bg="#c0392b", fg="white", width=15).pack(side="left", padx=5)

columnas_g = ("id", "fecha", "hora_inicio", "hora_fin")
tabla_guardias = ttk.Treeview(tab_guardias, columns=columnas_g, show="headings", height=8)
for col in columnas_g:
    tabla_guardias.heading(col, text=col.capitalize())
    tabla_guardias.column(col, width=100)
tabla_guardias.pack(fill="both", expand=True, padx=10, pady=10)

actualizar_tabla_guardias()

ventana.mainloop()
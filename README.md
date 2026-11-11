# Sistema de Guardia — Bomberos Voluntarios Concepción (Tucumán)

Sistema web para organizar la guardia de un cuerpo de bomberos voluntarios y recibir avisos de emergencia de la comunidad. Funciona en computadora y en celular, tiene modo día y modo noche, y distingue entre administradores y usuarios.

Proyecto final de la Tecnicatura en Programación.

## Qué hace

| Sección | Qué permite |
|---|---|
| **Inicio** | Resumen con personal activo, vehículos operativos, guardias y novedades del mes, notas pendientes y alertas nuevas |
| **Alertas** | Recibe los avisos de la comunidad, muestra el detalle con mapa y permite confirmar, marcar como atendida o descartar como falsa alarma |
| **Personal** | Alta, modificación y estado de cada bombero: Activo, De licencia o Baja. La baja no borra nada y se conserva el historial |
| **Vehículos** | Móviles con número, patente, tipo y estado |
| **Guardias** | Crear guardias y asignarles personal activo |
| **Inventario** | Listado general y vista por camión: un dibujo del móvil con sus gabetas, que muestra qué hay en cada una |
| **Novedades** | Parte de cada guardia: tipo de evento, hora, descripción y móvil que salió |
| **Notas y Gestiones** | Notas que ingresan, charlas y eventos pendientes, con estado y fecha de vencimiento resaltada |
| **Usuarios** | Solo administradores: crear usuarios, desactivarlos y cambiar contraseñas |

Todos los listados tienen **filtros** (buscador, desplegables y fechas) y arrancan vacíos: muestran solo lo que se elige.

## Roles

| | Administrador | Usuario |
|---|---|---|
| Ver todos los listados y las alertas | Sí | Sí |
| Cargar y modificar vehículos, guardias, inventario, novedades, notas | Sí | Sí |
| Gestionar alertas | Sí | Sí |
| Alta, modificación y baja de personal | Sí | No |
| Eliminar registros | Sí | No |
| Gestionar usuarios | Sí | No |

Los permisos se controlan en el servidor, no solo ocultando botones en la pantalla.

## Aviso de emergencia de la comunidad

Cualquier persona puede enviar un aviso desde `/reportar`, sin iniciar sesión:

- Elige el tipo de emergencia con botones grandes.
- Marca el lugar tocando el mapa o con **Usar mi ubicación actual**.
- Responde preguntas rápidas según el caso: víctimas, personas atrapadas, vehículos involucrados.
- Deja un teléfono para que la guardia pueda llamar a verificar.

El formulario aclara que ante una emergencia en curso hay que **llamar al 425252**: es un canal complementario y no reemplaza la llamada.

Todo aviso entra como **Nueva** para que la guardia lo verifique. Nunca genera una novedad por sí solo. Para frenar el spam hay un límite de 3 avisos cada 10 minutos por conexión y un campo trampa para robots.

## Tecnologías

- **Python 3** con **FastAPI** y **Uvicorn** (servidor web)
- **SQLite** (base de datos)
- **HTML, CSS y JavaScript** sin frameworks
- **Leaflet** y **OpenStreetMap** para los mapas (gratuitos, sin cuentas)
- **itsdangerous** para firmar las sesiones

## Seguridad

- Las contraseñas se guardan con hash (PBKDF2) y sal, nunca en texto plano.
- Las sesiones están firmadas y se vuelven a validar en cada pedido: si se desactiva a un usuario, pierde el acceso en su próxima acción.
- Los datos de contacto de quienes avisan solo los ve el personal con sesión iniciada.
- Del formulario público no se guarda la IP, solo una huella irreversible para contar envíos repetidos.
- Los datos escritos por personas se muestran como texto plano para evitar la inyección de código.
- Los datos de cada tabla están protegidos por claves foráneas: no se puede borrar un dato que otro todavía usa.

## Base de datos

Tablas: `Personal`, `Vehiculos`, `Guardias`, `Guardia_Personal`, `Novedades`, `Inventario`, `Gabetas`, `Notas`, `Alertas` y `Usuarios`.

Relaciones principales:

- Personal y Guardias: **muchos a muchos**, a través de `Guardia_Personal`.
- Guardias y Novedades: uno a muchos, obligatoria.
- Vehículos y Novedades: uno a muchos, opcional.
- Vehículos y Gabetas: uno a muchos.
- Vehículos y Gabetas con Inventario: un ítem puede estar en un vehículo o en una gabeta, o suelto.

Qué pasa al eliminar:

- Un **bombero** no se elimina: queda con estado Baja.
- Un **vehículo** con gabetas, ítems o novedades no se puede eliminar. Se marca «Fuera de servicio».
- Una **guardia** con novedades no se puede eliminar.
- Una **alerta** no se elimina: pasa por estados, con registro de quién la gestionó y cuándo.

`verificar_integridad.py` revisa la base y muestra cuántos datos huérfanos hay (tiene que dar 0).

## Estructura del proyecto

```
main.py                    Servidor FastAPI y rutas
auth.py                    Usuarios, contraseñas y sesiones
conexion.py                Conexión a la base de datos
personal.py, vehiculos.py, guardias.py, inventario.py,
novedades.py, gabetas.py, notas.py, alertas.py
                           Lógica de cada módulo
crear_base_datos.py        Crea las tablas iniciales
actualizar_base_datos.py   Agrega gabetas y número de móvil
crear_usuario.py           Crea usuarios desde la terminal
cargar_gabetas.py          Carga las gabetas modelo de un camión
verificar_integridad.py    Comprueba que no haya datos huérfanos
ver_alertas.py             Muestra por terminal los últimos avisos
web/                       Pantallas (HTML, CSS y JavaScript)
app.py, interfaz.py        Versiones anteriores (Eel y Tkinter)
```

## Cómo ponerlo a funcionar

En Windows, con Python 3 instalado y desde la carpeta del proyecto (en otros sistemas, `python` o `python3` en lugar de `py`):

```
py -m pip install fastapi uvicorn itsdangerous
py crear_base_datos.py
py actualizar_base_datos.py
py crear_usuario.py
py main.py
```

1. Instala lo necesario.
2. Crea la base de datos y la actualiza.
3. Crea al menos un usuario administrador. Mientras escribís la contraseña no se ve nada, es normal.
4. Inicia el sistema. Se abre en `http://localhost:8000`.

El formulario público está en `http://localhost:8000/reportar`.

Las tablas de usuarios, notas y alertas, y la columna de estado del personal, se crean solas al arrancar.

Opcional: `py cargar_gabetas.py` carga las gabetas modelo para un vehículo.

Los mapas necesitan conexión a internet. El botón de ubicación exacta del formulario público funciona en la misma computadora y, desde otros dispositivos, cuando el sistema se publique con `https`.

## Qué no incluye este repositorio

- La **base de datos** (`guardia_bomberos.db`): tiene datos personales reales.
- `clave_secreta.txt`: firma las sesiones y se genera sola al arrancar.
- Las **fotos de personas**: la portada del inicio no se sube. Sin ella, el sistema funciona igual.

## Próximas etapas

- Alarma en tiempo real, con ventana y sonido, cuando entra un aviso.
- Pasar una alerta confirmada a una novedad.
- Mapa de calor de zonas con más incidentes, para planificar campañas de prevención.
- Fotos de referencia de cada herramienta y carga directa del material de cada gabeta.
- Número de móvil dinámico en el dibujo del camión.
- Publicación en internet con `https` y prueba en celulares.
- Pasar a PostgreSQL si hay muchos usuarios a la vez.

## Cómo fue evolucionando

1. **Tkinter y SQLite:** primera versión de escritorio.
2. **Eel:** misma lógica con una interfaz web dentro de una ventana de escritorio.
3. **FastAPI:** servidor web con login, roles, formulario público para la comunidad y diseño para celular.

La lógica de cada módulo se mantuvo separada de la interfaz, y por eso se pudo cambiar la capa de presentación sin reescribir las tablas.

## Autora

Marisa Santillán — Bomberos Voluntarios Concepción, Tucumán.
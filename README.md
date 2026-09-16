# 🌿 BendiceMe

BendiceMe es una aplicación web pensada para facilitar la organización de los jóvenes que participan en la preparación, bendición y reparto de la Santa Cena.

La aplicación permite que cada joven indique su disponibilidad para los próximos domingos y que un asesor pueda organizar el equipo, asignar responsabilidades y realizar el seguimiento de las confirmaciones.

## ✨ Funcionalidades

### 👤 Jóvenes

- Selección del joven.
- Filtro por oficio:
  - Todos.
  - Presbíteros.
  - Maestros.
- Listado ordenado alfabéticamente.
- Selección de disponibilidad para los próximos domingos.
- Posibilidad de modificar la disponibilidad posteriormente.
- Visualización de asignaciones.
- Confirmación o rechazo de un turno asignado.
- Persistencia del joven seleccionado en el dispositivo.

### 🧑‍💼 Asesor

- Acceso protegido mediante autenticación.
- Selección del domingo a organizar.
- Visualización de jóvenes disponibles.
- Asignación de responsabilidades:
  - Bendecir.
  - Repartir.
  - Preparar la Santa Cena.
- Restricciones según oficio:
  - Los presbíteros pueden bendecir, repartir y preparar.
  - Los maestros pueden repartir y preparar.
- Máximo de:
  - 2 jóvenes para bendecir.
  - 3 jóvenes para repartir.
- Al menos 2 integrantes del equipo pueden ser asignados a preparación.
- Posibilidad de guardar equipos incompletos y continuar organizándolos posteriormente.
- Estado de las asignaciones:
  - Pendiente.
  - Confirmada.
  - Rechazada.
- Actualización en tiempo real mediante Supabase Realtime.
- Resumen del equipo y estado de conformación.
- Diseño responsive para escritorio y dispositivos móviles.

## 🙏 Equipo esperado por domingo

La conformación ideal del equipo es:

| Responsabilidad | Cantidad |
|---|---:|
| 🙏 Bendecir | 2 |
| 🤲 Repartir | 3 |
| 🍞 Preparar | mínimo 2 |

Los jóvenes encargados de preparar forman parte de los mismos cinco integrantes asignados para bendecir o repartir.

## 🛠️ Tecnologías

- ⚡ Next.js
- ⚛️ React
- 🟨 JavaScript
- 🎨 Tailwind CSS
- 🧩 shadcn/ui
- 🟢 Supabase
- 🔐 Supabase Auth
- 🔄 Supabase Realtime
- 🐘 PostgreSQL
- 🎬 Motion
- 🔷 Lucide React
- 📦 pnpm

## 🚀 Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd bendiceme
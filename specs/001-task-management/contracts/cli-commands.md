# Contrato de comandos: task-cli

Binario: `task-cli`. Las opciones y los valores de estado y prioridad van en inglés; los mensajes al usuario, en español.

**Reglas generales**
- Éxito: código de salida 0; mensajes por `stdout`.
- Error: código de salida 1; mensaje claro y accionable por `stderr`, sin stack trace.
- Un `<id>` debe ser un entero positivo; un valor no numérico, negativo o cero produce error.
- Los valores válidos son: estado `todo|in-progress|done`, prioridad `high|medium|low`.

## `task-cli add <title> [--priority <p>] [--description <text>]`

| Elemento | Detalle |
|----------|---------|
| Argumento `title` | Obligatorio; si solo tiene espacios se trata como vacío |
| `-p, --priority` | Opcional; por defecto `medium` |
| `-d, --description` | Opcional |
| Éxito | Confirma con el ID asignado, por ejemplo "Tarea 1 creada." |
| Errores | Título vacío o ausente; prioridad inválida (indica los valores válidos) |

## `task-cli list [--status <s>] [--priority <p>]`

| Elemento | Detalle |
|----------|---------|
| `-s, --status` | Filtro opcional por estado |
| `-p, --priority` | Filtro opcional por prioridad |
| Éxito | Tabla con ID, título, estado, prioridad y fecha de creación local, de más reciente a más antigua. Estado y prioridad con color |
| Sin tareas | "No hay tareas." (código 0) |
| Sin coincidencias | "No hay tareas que coincidan con los filtros." (código 0) |
| Errores | Valor de filtro inválido (indica los valores válidos) |

## `task-cli status <id> <status>`

| Elemento | Detalle |
|----------|---------|
| Éxito | Confirma el cambio, por ejemplo "Tarea 1: todo → in-progress." |
| Errores | ID inválido o inexistente; estado inválido; transición no permitida (indica las transiciones permitidas desde el estado actual, la tarea no cambia) |

## `task-cli update <id> [--title <t>] [--description <text>] [--priority <p>]`

| Elemento | Detalle |
|----------|---------|
| Opciones | Una o varias; solo cambian los campos indicados |
| Éxito | Confirma la actualización |
| Errores | ID inexistente; título vacío; prioridad inválida; ninguna opción indicada ("Indica al menos un campo a modificar: --title, --description o --priority") |

## `task-cli delete <id> [--force]`

| Elemento | Detalle |
|----------|---------|
| `-f, --force` | Elimina sin pedir confirmación |
| Confirmación | Pregunta `s/N` en la terminal; solo una respuesta afirmativa elimina |
| Rechazo | La tarea se conserva y se informa "Eliminación cancelada." (código 0) |
| Sin entrada interactiva | Sin `--force`, se cancela y no se elimina |
| Errores | ID inválido o inexistente |

## Error de almacenamiento (todos los comandos)

Si el archivo `~/.task-cli/tasks.db` está dañado o es ilegible: mensaje con la ubicación del archivo, código de salida 1 y sin modificar ni sobrescribir el archivo.

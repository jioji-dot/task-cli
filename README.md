# task-cli

CLI para gestionar tareas personales desde la terminal. Los datos se guardan en `~/.task-cli/tasks.db` (SQLite).

## Instalación

Requiere Node.js LTS y npm.

```bash
npm install
npm run build
npm install -g .      # o: npm link
```

En desarrollo se puede ejecutar sin compilar con `npm run dev -- <comando>`.

## Comandos

| Comando | Descripción |
|---------|-------------|
| `task-cli add <title> [-p <priority>] [-d <text>]` | Crea una tarea (estado `todo`, prioridad `medium` por defecto) |
| `task-cli list [-s <status>] [-p <priority>]` | Lista las tareas, de la más reciente a la más antigua |
| `task-cli status <id> <status>` | Cambia el estado de una tarea |
| `task-cli update <id> [-t <title>] [-d <text>] [-p <priority>]` | Modifica los campos indicados |
| `task-cli delete <id> [-f]` | Elimina una tarea (pide confirmación salvo con `--force`) |

Valores válidos: estado `todo`, `in-progress`, `done`; prioridad `high`, `medium`, `low`.

### Transiciones de estado permitidas

- `todo` → `in-progress`
- `in-progress` → `done` o `todo`
- `done` → `todo` (reabrir)

Cualquier otra transición (por ejemplo `todo` → `done`) se rechaza sin modificar la tarea.

## Ejemplos

```bash
task-cli add "Escribir informe"
task-cli add "Revisar PR" -p high -d "Cambios de login"
task-cli list --status todo --priority high
task-cli status 1 in-progress
task-cli update 2 --title "Revisar PR #12"
task-cli delete 2          # pregunta s/N
task-cli delete 2 --force  # sin preguntar
```

Todos los comandos devuelven código de salida 0 si tienen éxito y 1 si fallan, y muestran los errores sin trazas.

## Desarrollo

```bash
npm test        # pruebas con Vitest
npm run build   # compila a dist/
```

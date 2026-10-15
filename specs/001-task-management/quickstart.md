# Quickstart: validación de task-cli

Guía para comprobar de extremo a extremo que la funcionalidad cumple la spec. Los detalles de comandos están en [contracts/cli-commands.md](./contracts/cli-commands.md) y los de datos en [data-model.md](./data-model.md).

## Requisitos previos

- Node.js LTS y npm.
- Dependencias instaladas con `npm install`.
- Para no tocar tus datos reales, haz copia de `~/.task-cli/tasks.db` si existe, o bórrala para probar el primer uso.

## Preparación

```bash
npm run build
npm link          # o: npm install -g .
```

En desarrollo se puede usar `npx tsx src/index.ts <comando>` en lugar de `task-cli`.

## Pruebas automáticas

```bash
npm test
```

Resultado esperado: todas las pruebas de Vitest pasan.

## Escenarios manuales

| # | Comando | Resultado esperado |
|---|---------|--------------------|
| 1 | `task-cli list` (sin datos) | Mensaje de que no hay tareas, código 0 |
| 2 | `task-cli add "Escribir informe"` | Tarea 1 creada, estado `todo`, prioridad `medium` |
| 3 | `task-cli add "Revisar PR" -p high -d "Cambios de login"` | ID 2 con prioridad `high` y descripción |
| 4 | `task-cli add ""` | Error por título vacío, código 1 |
| 5 | `task-cli add "X" -p urgent` | Error con los valores válidos, código 1 |
| 6 | `task-cli list` | Tabla con la tarea 2 primero y la 1 después |
| 7 | `task-cli status 1 done` | Rechazo: debe pasar por `in-progress`; el estado no cambia |
| 8 | `task-cli status 1 in-progress` y luego `task-cli status 1 done` | Ambos cambios se aplican |
| 9 | `task-cli status 1 in-progress` (estando en `done`) | Rechazo con las transiciones permitidas |
| 10 | `task-cli status 1 todo` (reabrir) | Cambio aplicado |
| 11 | `task-cli list --status todo --priority high` | Solo las tareas que cumplen ambos filtros |
| 12 | `task-cli list --status foo` | Error con los valores válidos |
| 13 | `task-cli update 2 --title "Revisar PR #12"` | Solo cambia el título |
| 14 | `task-cli update 2` | Error: indica al menos un campo |
| 15 | `task-cli delete 2` y responder `n` | Tarea conservada, "Eliminación cancelada." |
| 16 | `task-cli delete 2 --force` | Tarea eliminada sin preguntar |
| 17 | `task-cli add "Nueva"` tras borrar la última | El ID nuevo no reutiliza el eliminado |
| 18 | `echo | task-cli delete 1` (sin terminal interactiva) | Se cancela, la tarea se conserva |
| 19 | `task-cli status abc done` y `task-cli delete 0` | Error por ID inválido, código 1 |
| 20 | Dañar `~/.task-cli/tasks.db` (copia de prueba) y ejecutar `task-cli list` | Error con la ubicación del archivo, código 1, archivo sin cambios |

## Comprobaciones transversales

- Comprobar el código de salida tras cada comando (`echo $?`): 0 en éxito, 1 en error.
- Ninguna salida muestra stack traces.
- Los colores aparecen solo en las columnas de estado y prioridad.
- Con 1.000 tareas, `task-cli list` responde en menos de 1 segundo.

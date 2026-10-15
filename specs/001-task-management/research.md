# Research: task-cli

No quedan marcadores NEEDS CLARIFICATION: la constitución fija el stack y la sesión de clarificación cerró el comportamiento ante un archivo dañado. Estas son las decisiones de diseño restantes.

## Decisiones

### 1. IDs que no se reutilizan (FR-004)
- **Decisión**: `id INTEGER PRIMARY KEY AUTOINCREMENT`.
- **Justificación**: sin `AUTOINCREMENT`, SQLite puede reutilizar el rowid máximo tras borrar la última fila. Con él, usa `sqlite_sequence` y nunca repite IDs.
- **Alternativas**: contador propio en otra tabla (más código sin beneficio).

### 2. Fecha de creación y orden (FR-005, FR-007)
- **Decisión**: guardar `created_at` como texto ISO 8601 en UTC y mostrarlo en la zona horaria local. Ordenar con `ORDER BY created_at DESC, id DESC`.
- **Justificación**: el `id` desempata tareas creadas en el mismo instante, de modo que el orden sea siempre determinista.
- **Alternativas**: timestamp numérico (menos legible al inspeccionar la base).

### 3. Estados y prioridades (FR-002, FR-009)
- **Decisión**: columnas `TEXT` con restricciones `CHECK` y validación previa en `utils/validation.ts`.
- **Justificación**: la validación pura da mensajes accionables y los `CHECK` protegen la integridad de los datos.

### 4. Transiciones (FR-010, FR-011)
- **Decisión**: mapa constante `todo→[in-progress]`, `in-progress→[done, todo]`, `done→[todo]` en `utils/transitions.ts`.
- **Justificación**: es una función pura, fácil de probar, y genera el mensaje con las transiciones permitidas desde el estado actual.

### 5. Confirmación de borrado (FR-013, Edge Cases)
- **Decisión**: `node:readline` con pregunta `s/N`. Si `process.stdin.isTTY` es falso y no hay `--force`, se cancela sin borrar.
- **Justificación**: no requiere dependencias (principio VIII). Aceptan `s`, `si`, `sí`, `y` y `yes`; cualquier otra entrada cancela.

### 6. Archivo de datos dañado (FR-014, aclaración 2026-10-01)
- **Decisión**: si `better-sqlite3` falla al abrir o leer la base (por ejemplo `SQLITE_NOTADB` o `SQLITE_CORRUPT`), el manejador global muestra "No se pudo leer la base de datos en `<ruta>`" con el motivo resumido, sale con código 1 y no escribe en ese archivo.
- **Justificación**: evita sobrescribir datos recuperables y no expone trazas.

### 7. Errores y códigos de salida (FR-015)
- **Decisión**: clase de error `AppError` con mensaje para el usuario. `index.ts` captura todo, imprime el mensaje en `stderr` y llama a `process.exit(1)`. Los errores de uso de Commander también se convierten a código 1 con `exitOverride`.
- **Justificación**: cumple el principio VI. Las funciones no llaman a `process.exit` directamente, lo que las hace testeables.

### 8. Colores (FR-016)
- **Decisión**: colorear solo las columnas estado (`todo` gris, `in-progress` amarillo, `done` verde) y prioridad (`high` rojo, `medium` amarillo, `low` azul) con `styleText` de `node:util` o códigos ANSI. `cli-table3` se usa sin colores en cabeceras o bordes.
- **Justificación**: sin librería de colores (principio VIII) y colores solo donde lo exige el principio IX.

### 9. Empaquetado global (principio X)
- **Decisión**: compilar con `tsc` a `dist/`, con `"bin": { "task-cli": "dist/index.js" }`, shebang `#!/usr/bin/env node` y `files: ["dist"]`. Desarrollo con `tsx src/index.ts`.
- **Justificación**: `npm install -g` necesita JavaScript ejecutable; `tsx` queda solo para desarrollo.
- **Nota**: `better-sqlite3` es un módulo nativo. Se instala con binarios precompilados para las versiones LTS habituales.

### 10. Pruebas
- **Decisión**: Vitest para `validation`, `transitions` y `db/tasks.ts`. Las pruebas de base de datos usan `:memory:` mediante una función `openDb(path)` que recibe la ruta.
- **Justificación**: cubre la lógica de negocio sin tocar el directorio real del usuario.

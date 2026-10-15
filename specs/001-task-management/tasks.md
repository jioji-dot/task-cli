---

description: "Lista de tareas para implementar task-cli — Gestión de tareas personales"
---

# Tasks: task-cli — Gestión de tareas personales

**Input**: Documentos de diseño en `/specs/001-task-management/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cli-commands.md

**Tests**: Se incluyen tareas de pruebas con Vitest porque la constitución (principio VII) exige tests para toda la lógica de negocio.

**Organization**: Las tareas se agrupan por historia de usuario para poder implementar y probar cada una de forma independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Se puede ejecutar en paralelo (archivos distintos, sin dependencias)
- **[Story]**: Historia de usuario a la que pertenece (US1…US5)
- Todas las rutas son relativas a la raíz del repositorio

## Path Conventions

Proyecto único y plano: `src/commands/`, `src/db/`, `src/utils/` y `tests/` (ver plan.md). Los tipos compartidos (`Task`, `TaskStatus`, `TaskPriority`) viven en `src/utils/types.ts`.

---

## Phase 1: Setup (Infraestructura compartida)

**Purpose**: Inicializar el proyecto TypeScript

- [X] T001 Crear `package.json` con `name: "task-cli"`, `type: "module"`, `bin: { "task-cli": "dist/index.js" }`, `files: ["dist"]`, scripts `build` (`tsc`), `dev` (`tsx src/index.ts`) y `test` (`vitest run`), dependencias `commander`, `better-sqlite3`, `cli-table3` y devDependencies `typescript`, `tsx`, `vitest`, `@types/node`, `@types/better-sqlite3`, en `package.json`
- [X] T002 [P] Crear `tsconfig.json` con `strict: true`, `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext`, `outDir: dist`, `rootDir: src` e incluir solo `src/` en `tsconfig.json`
- [X] T003 [P] Crear `.gitignore` con `node_modules/` y `dist/` en `.gitignore`
- [X] T004 Ejecutar `npm install` en la raíz y comprobar que `better-sqlite3` se instala sin errores

---

## Phase 2: Foundational (Prerrequisitos bloqueantes)

**Purpose**: Infraestructura que DEBE estar completa antes de cualquier historia de usuario

**⚠️ CRITICAL**: Ninguna historia puede empezar hasta terminar esta fase

- [X] T005 [P] Crear los tipos `TaskStatus = 'todo' | 'in-progress' | 'done'`, `TaskPriority = 'high' | 'medium' | 'low'` e interfaz `Task` (`id: number`, `title: string`, `description: string | null`, `status`, `priority`, `createdAt: string`), además de las constantes `STATUSES` y `PRIORITIES`, en `src/utils/types.ts`
- [X] T006 [P] Crear la clase `AppError extends Error` (mensaje en español pensado para el usuario) y la función `formatError(err: unknown): string` que devuelve el mensaje de `AppError` o un mensaje genérico sin stack trace en `src/utils/errors.ts`
- [X] T007 Implementar `openDb(path: string)` en `src/db/connection.ts`: crea el directorio padre si no existe (salvo `:memory:`), abre la base con `better-sqlite3` y ejecuta `CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in-progress','done')), priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')), created_at TEXT NOT NULL)`. Si la apertura o la lectura del esquema falla con `SQLITE_NOTADB` o `SQLITE_CORRUPT`, lanzar `AppError` con "No se pudo leer la base de datos en <ruta>" sin modificar el archivo. Exportar también `getDefaultDbPath()` que devuelve `~/.task-cli/tasks.db` (con `os.homedir()`)
- [X] T008 Crear el programa Commander en `src/index.ts` con shebang `#!/usr/bin/env node`, nombre `task-cli`, `exitOverride()` para convertir los errores de uso de Commander en código de salida 1, y un `try/catch` global que imprime `formatError(err)` por `stderr` y llama a `process.exit(1)` (nunca stack traces); dejar sin registrar los comandos, que se añaden en cada historia
- [X] T009 [P] Crear `formatDate(iso: string): string` (fecha legible en zona horaria local) y `colorStatus` / `colorPriority` (`todo` gris, `in-progress` amarillo, `done` verde; `high` rojo, `medium` amarillo, `low` azul, usando códigos ANSI o `styleText` de `node:util`) en `src/utils/format.ts`
- [X] T010 [P] Escribir prueba de `openDb` con `:memory:` (esquema creado, `AUTOINCREMENT` no reutiliza IDs tras borrar la última fila) y prueba de que un archivo temporal con contenido no SQLite lanza `AppError` con la ruta y queda sin modificar, en `tests/connection.test.ts`

**Checkpoint**: Base lista; las historias pueden empezar

---

## Phase 3: User Story 1 - Crear y listar tareas (Priority: P1) 🎯 MVP

**Goal**: Crear tareas con título (y opcionalmente prioridad y descripción) y verlas en una tabla.

**Independent Test**: Crear varias tareas con distintas prioridades y ejecutar `list`; se ve una tabla con ID, título, estado, prioridad y fecha, de la más reciente a la más antigua.

### Tests for User Story 1

> Escribir primero y comprobar que fallan antes de implementar

- [X] T011 [P] [US1] Escribir pruebas de `validateTitle` (recorta con `trim()`; vacío o solo espacios → `AppError`; sin límite de longitud) y `validatePriority` (acepta `high|medium|low`; otro valor → `AppError` que lista los valores válidos) en `tests/validation.test.ts`
- [X] T012 [P] [US1] Escribir pruebas de `insertTask` (primera tarea con ID 1, estado `todo`, prioridad `medium`, descripción `null`; IDs consecutivos; conserva prioridad y descripción) y `listTasks` (orden `created_at DESC, id DESC`; lista vacía) sobre una base `:memory:` en `tests/tasks-db.test.ts`

### Implementation for User Story 1

- [X] T013 [US1] Implementar `validateTitle(raw: string): string` y `validatePriority(raw: string): TaskPriority` como funciones puras que lanzan `AppError` con mensajes accionables en `src/utils/validation.ts`
- [X] T014 [US1] Implementar `insertTask(db, { title, description, priority })` (con `status` `todo` y `created_at` en ISO 8601 UTC, consulta preparada con parámetros) y `listTasks(db)` con `ORDER BY created_at DESC, id DESC`, mapeando columnas a `Task` (`created_at` → `createdAt`) en `src/db/tasks.ts`
- [X] T015 [P] [US1] Implementar `renderTaskTable(tasks: Task[]): string` con `cli-table3` y columnas ID, Título, Estado, Prioridad, Creada; estado y prioridad coloreados con `colorStatus`/`colorPriority`, el resto sin color, y títulos largos con ajuste de línea (`wordWrap`) para que la tabla siga legible, en `src/utils/format.ts`
- [X] T016 [US1] Implementar el comando `add <title>` con opciones `-p, --priority <priority>` y `-d, --description <text>` (valida título y prioridad, inserta y muestra "Tarea <id> creada.") en `src/commands/add.ts`
- [X] T017 [US1] Implementar el comando `list` (sin filtros todavía): si no hay tareas muestra "No hay tareas." con código 0; si las hay, imprime `renderTaskTable` en `src/commands/list.ts`
- [X] T018 [US1] Registrar `add` y `list` en el programa de `src/index.ts`, abriendo la base con `openDb(getDefaultDbPath())`

**Checkpoint**: La historia 1 funciona y se puede probar sola (MVP)

---

## Phase 4: User Story 2 - Avanzar el estado de una tarea (Priority: P2)

**Goal**: Cambiar el estado respetando las transiciones permitidas.

**Independent Test**: Crear una tarea, pasarla a `in-progress` y luego a `done`; intentar saltar de `todo` a `done` y verificar el rechazo sin cambios.

### Tests for User Story 2

- [X] T019 [P] [US2] Escribir pruebas de `canTransition` y `assertTransition` cubriendo las 4 transiciones permitidas (`todo→in-progress`, `in-progress→done`, `in-progress→todo`, `done→todo`) y todas las demás combinaciones rechazadas (incluida `todo→done` y cambiar al mismo estado), verificando que el mensaje de error menciona las transiciones permitidas desde el estado actual, en `tests/transitions.test.ts`
- [X] T020 [P] [US2] Escribir pruebas de `validateId` (rechaza no numérico, negativo, cero y decimales) y `validateStatus` (acepta `todo|in-progress|done`; otro valor → `AppError` con los valores válidos) añadiéndolas a `tests/validation.test.ts`
- [X] T021 [P] [US2] Escribir pruebas de `getTaskById` (devuelve `undefined` si no existe) y `updateTaskStatus` añadiéndolas a `tests/tasks-db.test.ts`

### Implementation for User Story 2

- [X] T022 [P] [US2] Implementar el mapa constante de transiciones (`todo→['in-progress']`, `in-progress→['done','todo']`, `done→['todo']`) y las funciones puras `canTransition(from, to)` y `assertTransition(from, to)` que lanza `AppError` con las transiciones permitidas desde `from` en `src/utils/transitions.ts`
- [X] T023 [P] [US2] Implementar `validateId(raw: string): number` (entero positivo) y `validateStatus(raw: string): TaskStatus` en `src/utils/validation.ts`
- [X] T024 [US2] Implementar `getTaskById(db, id)` y `updateTaskStatus(db, id, status)` en `src/db/tasks.ts`
- [X] T025 [US2] Implementar el comando `status <id> <status>`: valida ID y estado, lanza `AppError` si la tarea no existe, aplica `assertTransition`, actualiza y muestra "Tarea <id>: <anterior> → <nuevo>." en `src/commands/status.ts`
- [X] T026 [US2] Registrar el comando `status` en `src/index.ts`

**Checkpoint**: Las historias 1 y 2 funcionan de forma independiente

---

## Phase 5: User Story 3 - Filtrar el listado (Priority: P3)

**Goal**: Filtrar el listado por estado y/o prioridad.

**Independent Test**: Con tareas en distintos estados y prioridades, `list --status`, `--priority` y ambos combinados muestran solo las coincidentes.

### Tests for User Story 3

- [X] T027 [P] [US3] Escribir pruebas de `listTasks(db, { status?, priority? })` para filtro de estado, de prioridad y ambos combinados con AND, y para resultado vacío, añadiéndolas a `tests/tasks-db.test.ts`

### Implementation for User Story 3

- [X] T028 [US3] Extender `listTasks` para aceptar filtros opcionales `{ status?, priority? }` construyendo el `WHERE` con parámetros preparados (nunca concatenando valores) y manteniendo `ORDER BY created_at DESC, id DESC`, en `src/db/tasks.ts`
- [X] T029 [US3] Añadir las opciones `-s, --status <status>` y `-p, --priority <priority>` a `list`, validadas con `validateStatus` y `validatePriority`; si hay filtros y no hay resultados, mostrar "No hay tareas que coincidan con los filtros." (código 0), en `src/commands/list.ts`

**Checkpoint**: Las historias 1, 2 y 3 funcionan

---

## Phase 6: User Story 4 - Actualizar una tarea (Priority: P3)

**Goal**: Modificar título, descripción y/o prioridad de una tarea existente.

**Independent Test**: Modificar cada campo por separado y comprobar en el listado que solo cambió ese campo.

### Tests for User Story 4

- [X] T030 [P] [US4] Escribir pruebas de `updateTask(db, id, { title?, description?, priority? })`: cambia solo los campos indicados, no toca `status` ni `created_at`, y devuelve que no existe para un ID inexistente, añadiéndolas a `tests/tasks-db.test.ts`

### Implementation for User Story 4

- [X] T031 [US4] Implementar `updateTask(db, id, fields)` generando el `SET` solo con los campos presentes y parámetros preparados en `src/db/tasks.ts`
- [X] T032 [US4] Implementar el comando `update <id>` con `-t, --title <title>`, `-d, --description <text>` y `-p, --priority <priority>`: valida ID, título (`validateTitle`) y prioridad; si no se indica ningún campo falla con "Indica al menos un campo a modificar: --title, --description o --priority"; si la tarea no existe falla con error claro; en éxito confirma la actualización, en `src/commands/update.ts`
- [X] T033 [US4] Registrar el comando `update` en `src/index.ts`

**Checkpoint**: Las historias 1 a 4 funcionan

---

## Phase 7: User Story 5 - Eliminar una tarea (Priority: P3)

**Goal**: Eliminar tareas con confirmación previa y opción `--force`.

**Independent Test**: Eliminar confirmando, cancelando y con `--force`, y verificar el resultado en cada caso.

### Tests for User Story 5

- [X] T034 [P] [US5] Escribir pruebas de `isAffirmative(answer: string): boolean` (acepta `s`, `si`, `sí`, `y`, `yes` sin distinguir mayúsculas ni espacios; cualquier otra entrada, incluida la vacía, es falsa) en `tests/confirm.test.ts`
- [X] T035 [P] [US5] Escribir pruebas de `deleteTask(db, id)` (elimina y devuelve `true`; devuelve `false` si no existe) y de que el ID eliminado no se reutiliza al insertar, añadiéndolas a `tests/tasks-db.test.ts`

### Implementation for User Story 5

- [X] T036 [P] [US5] Implementar `isAffirmative` (pura) y `confirm(question: string): Promise<boolean>` con `node:readline`: si `process.stdin.isTTY` es falso devuelve `false` sin preguntar, en `src/utils/confirm.ts`
- [X] T037 [US5] Implementar `deleteTask(db, id)` en `src/db/tasks.ts`
- [X] T038 [US5] Implementar el comando `delete <id>` con `-f, --force`: valida ID, falla con error claro si no existe, pide confirmación `s/N` salvo con `--force`; si se rechaza o no hay entrada interactiva muestra "Eliminación cancelada." con código 0 y conserva la tarea; si se confirma elimina y muestra "Tarea <id> eliminada.", en `src/commands/delete.ts`
- [X] T039 [US5] Registrar el comando `delete` en `src/index.ts`

**Checkpoint**: Las cinco historias funcionan de forma independiente

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Mejoras que afectan a varias historias

- [X] T040 Ejecutar `npm run build` y corregir los errores de tipos; comprobar que `dist/index.js` conserva el shebang
- [X] T041 Ejecutar `npm test` y comprobar que todas las pruebas de Vitest pasan
- [X] T042 Instalar con `npm link` (o `npm install -g .`) y recorrer los 20 escenarios de `specs/001-task-management/quickstart.md`, anotando cualquier desviación
- [X] T043 [P] Comprobar que ningún comando muestra stack traces y que los códigos de salida son 0 en éxito y 1 en error (incluidos los errores de uso de Commander), corrigiendo `src/index.ts` si hace falta
- [X] T044 [P] Medir `task-cli list` con 1.000 tareas insertadas y verificar que responde en menos de 1 segundo (SC-002)
- [X] T045 [P] Escribir `README.md` en español con instalación (`npm install -g`), comandos y ejemplos de uso, en `README.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias; puede empezar de inmediato
- **Foundational (Phase 2)**: depende de Setup; BLOQUEA todas las historias
- **User Stories (Phase 3+)**: dependen de Foundational
  - US1 es el MVP y se hace primero
  - US2, US3, US4 y US5 solo requieren la base de US1 (`insertTask`, `listTasks`, `src/index.ts`); pueden hacerse en paralelo entre sí, pero comparten `src/db/tasks.ts`, `src/utils/validation.ts` e `index.ts`, así que esas ediciones deben ser secuenciales
- **Polish (Phase 8)**: depende de las historias deseadas

### User Story Dependencies

- **US1 (P1)**: tras Foundational; sin dependencias de otras historias
- **US2 (P2)**: tras US1 (necesita crear tareas y el módulo `db/tasks.ts`)
- **US3 (P3)**: tras US1 (extiende `list` y `listTasks`)
- **US4 (P3)**: tras US1; reutiliza `validateId` de US2 (T023), por lo que va después de US2
- **US5 (P3)**: tras US1; reutiliza `validateId` de US2 (T023), por lo que va después de US2

### Within Each User Story

- Las pruebas se escriben primero y deben fallar antes de implementar
- Validación y transiciones (puras) → base de datos → comandos → registro en `index.ts`

### Parallel Opportunities

- Setup: T002 y T003
- Foundational: T005, T006, T009 y T010 (T010 tras T007)
- US1: T011 y T012; T015 en paralelo con T013/T014
- US2: T019, T020 y T021; T022 y T023
- Tras US2, US3, US4 y US5 pueden avanzar en paralelo si sus ediciones en `tasks.ts` e `index.ts` se coordinan

---

## Parallel Example: User Story 1

```bash
# Pruebas de la historia 1 a la vez:
Task: "Pruebas de validateTitle y validatePriority en tests/validation.test.ts"
Task: "Pruebas de insertTask y listTasks en tests/tasks-db.test.ts"

# Piezas independientes de la historia 1:
Task: "validateTitle y validatePriority en src/utils/validation.ts"
Task: "renderTaskTable en src/utils/format.ts"
```

---

## Implementation Strategy

### MVP First (solo User Story 1)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (bloquea todo)
3. Completar Phase 3: User Story 1
4. **PARAR y VALIDAR**: probar `add` y `list` de forma independiente
5. Demostrar si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. US1 → probar → MVP
3. US2 → probar → entrega
4. US3, US4 y US5 → probar y entregar cada una
5. Cada historia aporta valor sin romper las anteriores

---

## Notes

- [P] = archivos distintos, sin dependencias
- La etiqueta [Story] relaciona cada tarea con su historia
- Verificar que las pruebas fallan antes de implementar
- Hacer commit tras cada tarea o grupo lógico, con el mensaje en español
- Evitar: tareas vagas, conflictos en el mismo archivo y dependencias entre historias que rompan la independencia

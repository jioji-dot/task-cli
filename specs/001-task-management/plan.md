# Implementation Plan: task-cli — Gestión de tareas personales

**Branch**: `001-task-management` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-task-management/spec.md`

## Summary

CLI `task-cli` para crear, listar, cambiar de estado, actualizar y eliminar tareas personales. Se implementa en TypeScript sobre Node.js LTS con Commander.js para los comandos, SQLite (`better-sqlite3`, SQL directo) en `~/.task-cli/tasks.db` para la persistencia y `cli-table3` para los listados. La lógica de negocio (validación y transiciones de estado) se escribe como funciones puras en `utils/`, probadas con Vitest.

## Technical Context

**Language/Version**: TypeScript (strict) sobre Node.js LTS

**Primary Dependencies**: `commander`, `better-sqlite3`, `cli-table3`; dev: `typescript`, `tsx`, `vitest`, `@types/better-sqlite3`, `@types/node`

**Storage**: SQLite en `~/.task-cli/tasks.db` (el directorio se crea si no existe)

**Testing**: Vitest (unitarios de lógica de negocio; la capa `db/` se prueba con una base SQLite en memoria o temporal)

**Target Platform**: Terminal en Windows, macOS y Linux

**Project Type**: CLI

**Performance Goals**: Listado de 1.000 tareas en menos de 1 s (SC-002)

**Constraints**: Sin stack traces al usuario; código de salida 0 en éxito y 1 en error; colores solo en estados y prioridades; instalable con `npm install -g`

**Scale/Scope**: Un único usuario local; del orden de miles de tareas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Cumplimiento |
|-----------|--------------|
| I. TypeScript sobre Node.js LTS (`tsx`) | OK |
| II. SQLite con `better-sqlite3` en `~/.task-cli/tasks.db` | OK |
| III. Estructura plana `commands/`, `db/`, `utils/` | OK, sin capas adicionales |
| IV. Funcional sobre clases | OK, solo funciones; `PascalCase` solo para tipos |
| V. Commander.js | OK |
| VI. Errores claros, sin trazas, exit 0/1 | OK, manejador de errores central |
| VII. Vitest para la lógica de negocio | OK |
| VIII. Sin dependencias innecesarias ni ORM | OK, la confirmación usa `node:readline` y los colores `node:util` `styleText` o códigos ANSI, sin librerías extra |
| IX. Tablas legibles, color solo en estado/prioridad | OK, `cli-table3` |
| X. Instalable globalmente | OK, campo `bin` + compilación a `dist/` |

**Resultado**: sin violaciones. Se repite la evaluación tras el diseño de la Fase 1: sigue sin haber violaciones.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-management/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── cli-commands.md
└── tasks.md             # Lo genera /speckit-tasks
```

### Source Code (repository root)

```text
src/
├── index.ts             # Entrada: define el programa Commander y el manejo global de errores
├── commands/
│   ├── add.ts
│   ├── list.ts
│   ├── status.ts
│   ├── update.ts
│   └── delete.ts
├── db/
│   ├── connection.ts    # Abre/crea ~/.task-cli/tasks.db y aplica el esquema
│   └── tasks.ts         # Consultas SQL directas (insert, select, update, delete)
└── utils/
    ├── validation.ts    # Prioridad, estado, ID, título (funciones puras)
    ├── transitions.ts   # Transiciones de estado permitidas (funciones puras)
    ├── errors.ts        # AppError y mensajes en español
    ├── format.ts        # Tabla, colores y fecha local
    └── confirm.ts       # Confirmación interactiva con node:readline

tests/
├── validation.test.ts
├── transitions.test.ts
└── tasks-db.test.ts

package.json             # bin: { "task-cli": "dist/index.js" }, scripts build/test/dev
tsconfig.json
```

**Structure Decision**: Proyecto único y plano organizado por funcionalidad (`commands/`, `db/`, `utils/`), según los principios III y IV. Cada comando es una función que recibe los argumentos ya parseados por Commander.

## Complexity Tracking

Sin violaciones de la constitución; no se requiere justificación.

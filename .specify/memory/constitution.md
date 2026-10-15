<!--
Sync Impact Report
- Version change: (plantilla sin rellenar) → 1.0.0
- Principios modificados: ninguno renombrado; se definen I–X por primera vez
- Secciones añadidas: Core Principles (I–X), Restricciones Técnicas, Flujo de Desarrollo, Governance
- Secciones eliminadas: ninguna
- TODOs pendientes: ninguno
-->
# task-cli Constitution

## Core Principles

### I. TypeScript sobre Node.js LTS
El proyecto MUST escribirse en TypeScript y ejecutarse sobre una versión LTS de Node.js.
Para ejecución directa MUST usarse `tsx` o una herramienta equivalente.

### II. SQLite con better-sqlite3
La persistencia MUST usar SQLite mediante `better-sqlite3`. La base de datos MUST almacenarse
en un archivo local en el directorio del usuario: `~/.task-cli/tasks.db`.

### III. Estructura simple y plana
La estructura MUST ser simple y plana, organizada por funcionalidad en `commands/`, `db/` y
`utils/`. NO se deben usar (MUST NOT) clean architecture ni capas adicionales: es excesivo para un CLI de
este tamaño.

### IV. Funcional sobre clases
Se MUST preferir funciones sobre clases y funciones puras siempre que sea posible. Convenciones
de nombres: `camelCase` para variables y funciones; `PascalCase` solo para tipos e interfaces.

### V. Commander.js como framework CLI
El parseo de argumentos y comandos MUST hacerse con Commander.js.

### VI. Manejo de errores claro
Se MUST NOT mostrar stack traces al usuario. Los errores MUST ser mensajes claros y
accionables. Los códigos de salida MUST ser 0 en éxito y 1 en error.

### VII. Testing con Vitest
Los tests unitarios MUST escribirse con Vitest. No se exige cobertura mínima, pero toda lógica
de negocio MUST tener tests.

### VIII. Sin dependencias innecesarias
MUST NOT agregarse librerías para lo que se resuelve con pocas líneas de código. MUST NOT usarse
ORMs; las consultas SQL se escriben directamente con `better-sqlite3`.

### IX. Salida legible
Toda salida al terminal MUST ser legible. Los listados MUST mostrarse como tablas (con
`cli-table3` o similar). Los colores MUST usarse solo para estados y prioridades.

### X. Instalable globalmente
El CLI MUST poder instalarse globalmente con `npm install -g`, con el `bin` y la configuración
de empaquetado necesarios en `package.json`.

## Restricciones Técnicas

- Stack permitido: TypeScript, Node.js LTS, better-sqlite3, Commander.js, Vitest, cli-table3
  (o equivalente para tablas), tsx.
- Cualquier dependencia adicional MUST justificarse conforme al principio VIII.
- Los datos del usuario residen únicamente en `~/.task-cli/tasks.db`; el CLI MUST crear el
  directorio si no existe.

## Flujo de Desarrollo

- Todo cambio con lógica de negocio MUST incluir tests Vitest antes de integrarse.
- Las revisiones MUST verificar el cumplimiento de los principios I–X.
- Documentación, comentarios y mensajes de commit se escriben en español; los términos técnicos
  e identificadores del código permanecen en inglés.

## Governance

Esta constitución prevalece sobre cualquier otra práctica del proyecto. Las enmiendas MUST
documentarse, indicar el motivo y, si afectan código existente, incluir un plan de migración.
El versionado sigue semver: MAJOR para eliminar o redefinir principios de forma incompatible,
MINOR para añadir principios o ampliar guías de forma material, PATCH para aclaraciones y
redacción. Toda revisión de código MUST comprobar el cumplimiento; las desviaciones MUST
justificarse explícitamente.

**Version**: 1.0.0 | **Ratified**: 2026-09-30 | **Last Amended**: 2026-09-30

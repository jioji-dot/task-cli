# Feature Specification: task-cli — Gestión de tareas personales

**Feature Branch**: `001-task-management`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Construir un CLI llamado \"task-cli\" para gestión de tareas personales desde la terminal (crear, listar, cambiar estado, actualizar y eliminar tareas)."

## Clarifications

### Session 2026-10-01

- Q: Si el archivo donde se guardan las tareas está dañado o no se puede leer, ¿qué debe hacer el CLI? → A: Mostrar un error claro indicando la ubicación del archivo, terminar con código distinto de 0 y no modificar ni sobrescribir el archivo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear y listar tareas (Priority: P1)

Como persona que organiza su trabajo desde la terminal, quiero crear tareas con un título (y opcionalmente prioridad y descripción) y ver todas mis tareas en una tabla, para saber qué tengo pendiente.

**Why this priority**: Es el núcleo del producto: sin crear y ver tareas no hay valor. Por sí sola ya constituye un MVP utilizable.

**Independent Test**: Crear varias tareas con distintas prioridades y ejecutar el listado; se ve una tabla con ID, título, estado, prioridad y fecha de creación.

**Acceptance Scenarios**:

1. **Given** no existen tareas, **When** el usuario crea una tarea solo con título, **Then** se crea con ID 1, estado "todo" y prioridad "medium", y se confirma con un mensaje.
2. **Given** existen tareas, **When** el usuario crea otra con prioridad "high" y descripción, **Then** recibe el siguiente ID numérico consecutivo y conserva prioridad y descripción.
3. **Given** el usuario intenta crear una tarea sin título, **When** ejecuta el comando, **Then** se muestra un mensaje de error claro y no se crea nada.
4. **Given** el usuario indica una prioridad distinta de high, medium o low, **When** ejecuta el comando, **Then** se rechaza con un mensaje que indica los valores válidos.
5. **Given** existen varias tareas, **When** el usuario lista las tareas, **Then** se muestran en tabla con ID, título, estado, prioridad y fecha de creación, ordenadas de la más reciente a la más antigua.
6. **Given** no existen tareas, **When** el usuario lista, **Then** se muestra un mensaje indicando que no hay tareas.

---

### User Story 2 - Avanzar el estado de una tarea (Priority: P2)

Como usuario, quiero cambiar el estado de una tarea según su progreso (todo → in-progress → done) y poder devolverla o reabrirla, para reflejar el avance real de mi trabajo.

**Why this priority**: Es lo que convierte una lista en un gestor de tareas; depende de poder crear tareas (P1).

**Independent Test**: Crear una tarea, pasarla a in-progress y luego a done; intentar saltar de todo a done y verificar el rechazo.

**Acceptance Scenarios**:

1. **Given** una tarea en "todo", **When** se cambia a "in-progress", **Then** el cambio se aplica.
2. **Given** una tarea en "in-progress", **When** se cambia a "done" o a "todo", **Then** el cambio se aplica en ambos casos.
3. **Given** una tarea en "done", **When** se cambia a "todo" (reabrir), **Then** el cambio se aplica.
4. **Given** una tarea en "todo", **When** se intenta cambiar directamente a "done", **Then** se rechaza con un mensaje que explica que debe pasar primero por "in-progress", y el estado no cambia.
5. **Given** una tarea en "done", **When** se intenta cambiar a "in-progress", **Then** se rechaza indicando las transiciones permitidas desde ese estado.
6. **Given** un ID inexistente o un estado inválido, **When** se ejecuta el cambio, **Then** se muestra un error claro.

---

### User Story 3 - Filtrar el listado (Priority: P3)

Como usuario con muchas tareas, quiero filtrar el listado por estado y/o prioridad, para enfocarme en lo relevante.

**Why this priority**: Mejora la usabilidad del listado, pero el producto funciona sin ello.

**Independent Test**: Con tareas en distintos estados y prioridades, listar con `--status` y `--priority` (solos y combinados) y comprobar que solo aparecen las coincidentes.

**Acceptance Scenarios**:

1. **Given** tareas en distintos estados, **When** se lista con `--status in-progress`, **Then** solo aparecen las tareas en ese estado.
2. **Given** tareas con distintas prioridades, **When** se lista con `--priority high`, **Then** solo aparecen las de prioridad alta.
3. **Given** ambos filtros, **When** se lista con `--status todo --priority high`, **Then** aparecen solo las que cumplen ambas condiciones.
4. **Given** un valor de filtro inválido, **When** se ejecuta el listado, **Then** se muestra un error con los valores válidos.
5. **Given** filtros sin coincidencias, **When** se lista, **Then** se informa de que no hay tareas que coincidan.

---

### User Story 4 - Actualizar una tarea (Priority: P3)

Como usuario, quiero modificar el título, la descripción o la prioridad de una tarea existente, para corregirla o reajustarla.

**Why this priority**: Es útil pero no bloquea el flujo principal.

**Independent Test**: Modificar cada campo de una tarea por separado y comprobar en el listado que solo cambió ese campo.

**Acceptance Scenarios**:

1. **Given** una tarea existente, **When** se actualiza su título, descripción o prioridad (uno o varios), **Then** solo cambian los campos indicados.
2. **Given** un ID inexistente, **When** se intenta actualizar, **Then** se muestra un error claro.
3. **Given** un título vacío o una prioridad inválida, **When** se intenta actualizar, **Then** se rechaza y la tarea no cambia.
4. **Given** una actualización sin ningún campo a modificar, **When** se ejecuta, **Then** se informa de que debe indicarse al menos un campo.

---

### User Story 5 - Eliminar una tarea (Priority: P3)

Como usuario, quiero eliminar tareas que ya no necesito, con confirmación previa para evitar borrados accidentales.

**Why this priority**: Mantenimiento de la lista; el riesgo de pérdida de datos exige confirmación.

**Independent Test**: Eliminar una tarea confirmando, cancelando y usando `--force`, y verificar el resultado en cada caso.

**Acceptance Scenarios**:

1. **Given** una tarea existente, **When** se elimina y el usuario confirma, **Then** la tarea desaparece del listado.
2. **Given** una tarea existente, **When** se elimina y el usuario rechaza la confirmación, **Then** la tarea se conserva y se informa de la cancelación.
3. **Given** una tarea existente, **When** se elimina con `--force`, **Then** se elimina sin pedir confirmación.
4. **Given** un ID inexistente, **When** se intenta eliminar, **Then** se muestra un error claro.

---

### Edge Cases

- Un ID no numérico, negativo o cero: se rechaza con un mensaje claro.
- Un título compuesto solo de espacios se trata como vacío.
- Los IDs de tareas eliminadas no se reutilizan.
- Títulos o descripciones muy largos: se aceptan; la tabla del listado debe seguir siendo legible.
- Primer uso, sin datos previos: el CLI funciona sin configuración manual.
- Confirmación de borrado sin entrada interactiva disponible: se cancela salvo que se use `--force`.
- Archivo de datos dañado o ilegible: se muestra un error claro con la ubicación del archivo, se termina con código distinto de 0 y el archivo no se modifica ni se sobrescribe.
- Cualquier error se comunica con un mensaje accionable, sin trazas técnicas, y con código de salida de error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST permitir crear una tarea con un título obligatorio.
- **FR-002**: El sistema MUST permitir asignar opcionalmente una prioridad (high, medium, low), con "medium" por defecto.
- **FR-003**: El sistema MUST permitir asignar opcionalmente una descripción a la tarea.
- **FR-004**: El sistema MUST asignar a cada tarea un ID numérico autoincremental único, que no se reutiliza tras eliminar.
- **FR-005**: El sistema MUST crear cada tarea con estado "todo" y registrar su fecha de creación.
- **FR-006**: El sistema MUST listar las tareas en formato tabla mostrando ID, título, estado, prioridad y fecha de creación.
- **FR-007**: El sistema MUST ordenar el listado por fecha de creación, de más reciente a más antigua.
- **FR-008**: El sistema MUST permitir filtrar el listado por estado (todo, in-progress, done) y por prioridad (high, medium, low), de forma individual o combinada.
- **FR-009**: El sistema MUST permitir cambiar el estado de una tarea por su ID, aceptando solo los estados todo, in-progress y done.
- **FR-010**: El sistema MUST permitir únicamente las transiciones todo → in-progress, in-progress → done, in-progress → todo y done → todo.
- **FR-011**: El sistema MUST rechazar cualquier otra transición (incluida todo → done) con un mensaje que indique las transiciones permitidas, sin modificar la tarea.
- **FR-012**: El sistema MUST permitir modificar título, descripción y/o prioridad de una tarea existente por su ID, validando los valores.
- **FR-013**: El sistema MUST permitir eliminar una tarea por su ID, pidiendo confirmación previa salvo que se use `--force`.
- **FR-014**: El sistema MUST conservar las tareas entre ejecuciones del CLI y, si el archivo de datos está dañado o es ilegible, MUST mostrar un error claro con su ubicación, finalizar con código distinto de 0 y no modificar ni sobrescribir dicho archivo.
- **FR-015**: El sistema MUST mostrar mensajes de error claros y accionables ante entradas inválidas o IDs inexistentes, y finalizar con código de salida 0 en éxito y distinto de 0 en error.
- **FR-016**: El sistema MUST mostrar los estados y prioridades de forma visualmente diferenciada en el listado, y mantener el resto de la salida legible.

### Key Entities

- **Tarea (Task)**: Unidad de trabajo personal. Atributos: ID numérico único, título (obligatorio), descripción (opcional), estado (todo, in-progress o done), prioridad (high, medium o low) y fecha de creación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede crear una tarea y verla en el listado en menos de 10 segundos y con un solo comando para cada paso.
- **SC-002**: El listado de hasta 1.000 tareas se muestra en menos de 1 segundo.
- **SC-003**: El 100 % de las transiciones de estado no permitidas son rechazadas sin alterar la tarea.
- **SC-004**: El 100 % de los errores de uso (entradas inválidas, ID inexistente) muestran un mensaje comprensible que indica cómo corregirlo, sin información técnica interna.
- **SC-005**: Ninguna tarea se elimina sin confirmación explícita, salvo que el usuario use `--force`.
- **SC-006**: Las tareas creadas en una ejecución están disponibles en la siguiente en el 100 % de los casos.

## Assumptions

- El usuario es una única persona usando su propia máquina; no hay usuarios múltiples ni autenticación.
- Los datos son locales y no se sincronizan con servicios externos.
- La fecha de creación se muestra en formato legible y en la zona horaria local.
- Los filtros de estado y prioridad pueden combinarse (se aplican con AND).
- Los comandos y opciones (`--status`, `--priority`, `--force`) y los valores de estado y prioridad se mantienen en inglés; los mensajes al usuario se muestran en español.
- Fuera de alcance en esta versión: sistema de usuarios y autenticación, sincronización externa, fechas de vencimiento, subtareas y dependencias, tags o categorías, interfaz web y API REST.

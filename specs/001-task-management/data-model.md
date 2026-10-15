# Modelo de datos: task-cli

## Entidad: Task (tarea)

| Campo | Tipo en SQLite | Tipo en TypeScript | Reglas |
|-------|----------------|--------------------|--------|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | `number` | Único, autoincremental, no se reutiliza tras eliminar (FR-004) |
| `title` | `TEXT NOT NULL` | `string` | Obligatorio; se recorta con `trim()` y no puede quedar vacío (FR-001). Sin límite de longitud |
| `description` | `TEXT` | `string \| null` | Opcional (FR-003) |
| `status` | `TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in-progress','done'))` | `TaskStatus` | Estado inicial `todo` (FR-005) |
| `priority` | `TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low'))` | `TaskPriority` | Por defecto `medium` (FR-002) |
| `created_at` | `TEXT NOT NULL` | `string` | ISO 8601 en UTC, asignado al crear (FR-005) |

## Esquema

```sql
CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'todo'   CHECK (status IN ('todo','in-progress','done')),
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  created_at  TEXT NOT NULL
);
```

## Tipos

```ts
type TaskStatus = 'todo' | 'in-progress' | 'done';
type TaskPriority = 'high' | 'medium' | 'low';
```

## Transiciones de estado (FR-010, FR-011)

```text
todo ──► in-progress ──► done
  ▲          │             │
  └──────────┘             │
  ▲                        │
  └────────────────────────┘
```

| Desde | Hacia permitido |
|-------|-----------------|
| `todo` | `in-progress` |
| `in-progress` | `done`, `todo` |
| `done` | `todo` |

Cualquier otra transición, incluida `todo → done`, se rechaza sin modificar la tarea. Pasar al mismo estado en que ya está la tarea también se rechaza, porque no figura entre las permitidas.

## Consultas principales

- Listado: `SELECT ... FROM tasks [WHERE status = ? AND priority = ?] ORDER BY created_at DESC, id DESC`.
- Los filtros opcionales se combinan con AND (FR-008).
- Todas las consultas usan parámetros preparados, nunca concatenación de texto.

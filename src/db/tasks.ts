import type Database from 'better-sqlite3';
import type { Task, TaskPriority, TaskStatus } from '../utils/types.js';

interface TaskRow {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
}

const COLUMNS = 'id, title, description, status, priority, created_at';

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    createdAt: row.created_at,
  };
}

export interface NewTask {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
}

export function insertTask(db: Database.Database, input: NewTask): Task {
  const result = db
    .prepare(
      `INSERT INTO tasks (title, description, status, priority, created_at)
       VALUES (?, ?, 'todo', ?, ?)`,
    )
    .run(input.title, input.description ?? null, input.priority ?? 'medium', new Date().toISOString());
  const row = db
    .prepare(`SELECT ${COLUMNS} FROM tasks WHERE id = ?`)
    .get(result.lastInsertRowid) as TaskRow;
  return toTask(row);
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export function listTasks(db: Database.Database, filters: TaskFilters = {}): Task[] {
  const conditions: string[] = [];
  const params: string[] = [];
  if (filters.status !== undefined) {
    conditions.push('status = ?');
    params.push(filters.status);
  }
  if (filters.priority !== undefined) {
    conditions.push('priority = ?');
    params.push(filters.priority);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db
    .prepare(`SELECT ${COLUMNS} FROM tasks ${where} ORDER BY created_at DESC, id DESC`)
    .all(...params) as TaskRow[];
  return rows.map(toTask);
}

export function getTaskById(db: Database.Database, id: number): Task | undefined {
  const row = db.prepare(`SELECT ${COLUMNS} FROM tasks WHERE id = ?`).get(id) as TaskRow | undefined;
  return row === undefined ? undefined : toTask(row);
}

export function updateTaskStatus(db: Database.Database, id: number, status: TaskStatus): boolean {
  return db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run(status, id).changes > 0;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: TaskPriority;
}

export function updateTask(db: Database.Database, id: number, fields: TaskUpdate): boolean {
  const sets: string[] = [];
  const params: string[] = [];
  if (fields.title !== undefined) {
    sets.push('title = ?');
    params.push(fields.title);
  }
  if (fields.description !== undefined) {
    sets.push('description = ?');
    params.push(fields.description);
  }
  if (fields.priority !== undefined) {
    sets.push('priority = ?');
    params.push(fields.priority);
  }
  if (sets.length === 0) {
    return getTaskById(db, id) !== undefined;
  }
  return db.prepare(`UPDATE tasks SET ${sets.join(', ')} WHERE id = ?`).run(...params, id).changes > 0;
}

export function deleteTask(db: Database.Database, id: number): boolean {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
}

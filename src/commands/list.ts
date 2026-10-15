import type Database from 'better-sqlite3';
import { listTasks } from '../db/tasks.js';
import { renderTaskTable } from '../utils/format.js';
import { validatePriority, validateStatus } from '../utils/validation.js';

export interface ListOptions {
  status?: string;
  priority?: string;
}

export function listCommand(db: Database.Database, options: ListOptions = {}): void {
  const status = options.status === undefined ? undefined : validateStatus(options.status);
  const priority = options.priority === undefined ? undefined : validatePriority(options.priority);
  const tasks = listTasks(db, { status, priority });
  if (tasks.length === 0) {
    const filtered = status !== undefined || priority !== undefined;
    console.log(filtered ? 'No hay tareas que coincidan con los filtros.' : 'No hay tareas.');
    return;
  }
  console.log(renderTaskTable(tasks));
}

import type Database from 'better-sqlite3';
import { getTaskById, updateTaskStatus } from '../db/tasks.js';
import { AppError } from '../utils/errors.js';
import { assertTransition } from '../utils/transitions.js';
import { validateId, validateStatus } from '../utils/validation.js';

export function statusCommand(db: Database.Database, rawId: string, rawStatus: string): void {
  const id = validateId(rawId);
  const status = validateStatus(rawStatus);
  const task = getTaskById(db, id);
  if (task === undefined) {
    throw new AppError(`No existe la tarea ${id}.`);
  }
  assertTransition(task.status, status);
  updateTaskStatus(db, id, status);
  console.log(`Tarea ${id}: ${task.status} → ${status}.`);
}

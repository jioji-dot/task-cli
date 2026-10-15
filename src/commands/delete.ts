import type Database from 'better-sqlite3';
import { deleteTask, getTaskById } from '../db/tasks.js';
import { confirm } from '../utils/confirm.js';
import { AppError } from '../utils/errors.js';
import { validateId } from '../utils/validation.js';

export interface DeleteOptions {
  force?: boolean;
}

export async function deleteCommand(
  db: Database.Database,
  rawId: string,
  options: DeleteOptions,
): Promise<void> {
  const id = validateId(rawId);
  const task = getTaskById(db, id);
  if (task === undefined) {
    throw new AppError(`No existe la tarea ${id}.`);
  }
  if (!options.force && !(await confirm(`¿Eliminar la tarea ${id} "${task.title}"? (s/N) `))) {
    console.log('Eliminación cancelada.');
    return;
  }
  deleteTask(db, id);
  console.log(`Tarea ${id} eliminada.`);
}

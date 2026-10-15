import type Database from 'better-sqlite3';
import { updateTask } from '../db/tasks.js';
import { AppError } from '../utils/errors.js';
import { validateId, validatePriority, validateTitle } from '../utils/validation.js';

export interface UpdateOptions {
  title?: string;
  description?: string;
  priority?: string;
}

export function updateCommand(db: Database.Database, rawId: string, options: UpdateOptions): void {
  const id = validateId(rawId);
  if (
    options.title === undefined &&
    options.description === undefined &&
    options.priority === undefined
  ) {
    throw new AppError('Indica al menos un campo a modificar: --title, --description o --priority');
  }
  const title = options.title === undefined ? undefined : validateTitle(options.title);
  const priority = options.priority === undefined ? undefined : validatePriority(options.priority);
  if (!updateTask(db, id, { title, description: options.description, priority })) {
    throw new AppError(`No existe la tarea ${id}.`);
  }
  console.log(`Tarea ${id} actualizada.`);
}

import type Database from 'better-sqlite3';
import { insertTask } from '../db/tasks.js';
import { validatePriority, validateTitle } from '../utils/validation.js';

export interface AddOptions {
  priority?: string;
  description?: string;
}

export function addCommand(db: Database.Database, title: string, options: AddOptions): void {
  const validTitle = validateTitle(title);
  const priority = options.priority === undefined ? undefined : validatePriority(options.priority);
  const task = insertTask(db, { title: validTitle, description: options.description, priority });
  console.log(`Tarea ${task.id} creada.`);
}

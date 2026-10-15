import { AppError } from './errors.js';
import { PRIORITIES, STATUSES, type TaskPriority, type TaskStatus } from './types.js';

export function validateId(raw: string): number {
  if (!/^\d+$/.test(raw.trim()) || Number(raw) < 1) {
    throw new AppError(`ID inválido "${raw}". Debe ser un entero positivo.`);
  }
  return Number(raw);
}

export function validateStatus(raw: string): TaskStatus {
  if (!(STATUSES as readonly string[]).includes(raw)) {
    throw new AppError(`Estado inválido "${raw}". Valores válidos: ${STATUSES.join(', ')}.`);
  }
  return raw as TaskStatus;
}

export function validateTitle(raw: string): string {
  const title = raw.trim();
  if (title === '') {
    throw new AppError('El título no puede estar vacío.');
  }
  return title;
}

export function validatePriority(raw: string): TaskPriority {
  if (!(PRIORITIES as readonly string[]).includes(raw)) {
    throw new AppError(`Prioridad inválida "${raw}". Valores válidos: ${PRIORITIES.join(', ')}.`);
  }
  return raw as TaskPriority;
}

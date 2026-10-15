import { AppError } from './errors.js';
import type { TaskStatus } from './types.js';

const TRANSITIONS: Record<TaskStatus, readonly TaskStatus[]> = {
  todo: ['in-progress'],
  'in-progress': ['done', 'todo'],
  done: ['todo'],
};

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertTransition(from: TaskStatus, to: TaskStatus): void {
  if (!canTransition(from, to)) {
    throw new AppError(
      `No se puede pasar de "${from}" a "${to}". Desde "${from}" solo se permite: ${TRANSITIONS[from].join(', ')}.`,
    );
  }
}

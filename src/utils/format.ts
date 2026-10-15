import { styleText } from 'node:util';
import Table from 'cli-table3';
import type { Task, TaskPriority, TaskStatus } from './types.js';

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
}

export function colorStatus(status: TaskStatus): string {
  switch (status) {
    case 'todo':
      return styleText('gray', status);
    case 'in-progress':
      return styleText('yellow', status);
    case 'done':
      return styleText('green', status);
  }
}

export function colorPriority(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return styleText('red', priority);
    case 'medium':
      return styleText('yellow', priority);
    case 'low':
      return styleText('blue', priority);
  }
}

export function renderTaskTable(tasks: Task[]): string {
  const table = new Table({
    head: ['ID', 'Título', 'Estado', 'Prioridad', 'Creada'],
    style: { head: [], border: [] },
    colWidths: [null, 40, null, null, null],
    wordWrap: true,
  });
  for (const task of tasks) {
    table.push([
      String(task.id),
      task.title,
      colorStatus(task.status),
      colorPriority(task.priority),
      formatDate(task.createdAt),
    ]);
  }
  return table.toString();
}

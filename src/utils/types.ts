export const STATUSES = ['todo', 'in-progress', 'done'] as const;
export const PRIORITIES = ['high', 'medium', 'low'] as const;

export type TaskStatus = (typeof STATUSES)[number];
export type TaskPriority = (typeof PRIORITIES)[number];

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

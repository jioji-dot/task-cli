import { beforeEach, describe, expect, it } from 'vitest';
import type Database from 'better-sqlite3';
import { openDb } from '../src/db/connection.js';
import {
  deleteTask,
  getTaskById,
  insertTask,
  listTasks,
  updateTask,
  updateTaskStatus,
} from '../src/db/tasks.js';

let db: Database.Database;

beforeEach(() => {
  db = openDb(':memory:');
});

describe('insertTask', () => {
  it('crea la primera tarea con ID 1, estado todo, prioridad medium y descripción null', () => {
    const task = insertTask(db, { title: 'Primera' });
    expect(task.id).toBe(1);
    expect(task.status).toBe('todo');
    expect(task.priority).toBe('medium');
    expect(task.description).toBeNull();
    expect(Number.isNaN(new Date(task.createdAt).getTime())).toBe(false);
  });

  it('asigna IDs consecutivos', () => {
    expect(insertTask(db, { title: 'a' }).id).toBe(1);
    expect(insertTask(db, { title: 'b' }).id).toBe(2);
  });

  it('conserva prioridad y descripción', () => {
    const task = insertTask(db, { title: 'a', priority: 'high', description: 'detalle' });
    expect(task.priority).toBe('high');
    expect(task.description).toBe('detalle');
  });
});

describe('listTasks', () => {
  it('devuelve lista vacía sin tareas', () => {
    expect(listTasks(db)).toEqual([]);
  });

  it('ordena por created_at DESC y desempata por id DESC', () => {
    const insert = db.prepare('INSERT INTO tasks (title, created_at) VALUES (?, ?)');
    insert.run('vieja', '2026-01-01T00:00:00.000Z');
    insert.run('nueva', '2026-03-01T00:00:00.000Z');
    insert.run('nueva-2', '2026-03-01T00:00:00.000Z');
    expect(listTasks(db).map((t) => t.title)).toEqual(['nueva-2', 'nueva', 'vieja']);
  });

  describe('filtros', () => {
    beforeEach(() => {
      insertTask(db, { title: 'a', priority: 'high' });
      insertTask(db, { title: 'b', priority: 'low' });
      insertTask(db, { title: 'c', priority: 'high' });
      updateTaskStatus(db, 1, 'in-progress');
      updateTaskStatus(db, 3, 'in-progress');
    });

    it('filtra por estado', () => {
      expect(listTasks(db, { status: 'in-progress' }).map((t) => t.title).sort()).toEqual(['a', 'c']);
      expect(listTasks(db, { status: 'todo' }).map((t) => t.title)).toEqual(['b']);
    });

    it('filtra por prioridad', () => {
      expect(listTasks(db, { priority: 'low' }).map((t) => t.title)).toEqual(['b']);
    });

    it('combina estado y prioridad con AND', () => {
      updateTaskStatus(db, 2, 'in-progress');
      const result = listTasks(db, { status: 'in-progress', priority: 'low' });
      expect(result.map((t) => t.title)).toEqual(['b']);
    });

    it('devuelve vacío si nada coincide', () => {
      expect(listTasks(db, { status: 'done' })).toEqual([]);
      expect(listTasks(db, { status: 'todo', priority: 'high' })).toEqual([]);
    });
  });
});

describe('getTaskById', () => {
  it('devuelve la tarea si existe', () => {
    insertTask(db, { title: 'a' });
    expect(getTaskById(db, 1)?.title).toBe('a');
  });

  it('devuelve undefined si no existe', () => {
    expect(getTaskById(db, 99)).toBeUndefined();
  });
});

describe('updateTaskStatus', () => {
  it('cambia el estado y devuelve true', () => {
    insertTask(db, { title: 'a' });
    expect(updateTaskStatus(db, 1, 'in-progress')).toBe(true);
    expect(getTaskById(db, 1)?.status).toBe('in-progress');
  });

  it('devuelve false si la tarea no existe', () => {
    expect(updateTaskStatus(db, 99, 'done')).toBe(false);
  });
});

describe('updateTask', () => {
  it('cambia solo los campos indicados sin tocar status ni created_at', () => {
    const original = insertTask(db, { title: 'a', description: 'd', priority: 'low' });
    updateTaskStatus(db, 1, 'in-progress');

    expect(updateTask(db, 1, { title: 'nuevo' })).toBe(true);
    let task = getTaskById(db, 1)!;
    expect(task).toMatchObject({ title: 'nuevo', description: 'd', priority: 'low', status: 'in-progress' });
    expect(task.createdAt).toBe(original.createdAt);

    updateTask(db, 1, { priority: 'high' });
    task = getTaskById(db, 1)!;
    expect(task).toMatchObject({ title: 'nuevo', description: 'd', priority: 'high' });

    updateTask(db, 1, { description: 'otra' });
    task = getTaskById(db, 1)!;
    expect(task).toMatchObject({ title: 'nuevo', description: 'otra', priority: 'high' });
  });

  it('devuelve false para un ID inexistente', () => {
    expect(updateTask(db, 99, { title: 'x' })).toBe(false);
  });
});

describe('deleteTask', () => {
  it('elimina y devuelve true', () => {
    insertTask(db, { title: 'a' });
    expect(deleteTask(db, 1)).toBe(true);
    expect(getTaskById(db, 1)).toBeUndefined();
  });

  it('devuelve false si no existe', () => {
    expect(deleteTask(db, 99)).toBe(false);
  });

  it('no reutiliza el ID eliminado', () => {
    insertTask(db, { title: 'a' });
    insertTask(db, { title: 'b' });
    deleteTask(db, 2);
    expect(insertTask(db, { title: 'c' }).id).toBe(3);
  });
});

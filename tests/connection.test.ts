import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { openDb } from '../src/db/connection.js';
import { AppError } from '../src/utils/errors.js';

describe('openDb', () => {
  it('crea el esquema en una base :memory:', () => {
    const db = openDb(':memory:');
    const cols = db.prepare('PRAGMA table_info(tasks)').all() as { name: string }[];
    expect(cols.map((c) => c.name)).toEqual([
      'id',
      'title',
      'description',
      'status',
      'priority',
      'created_at',
    ]);
  });

  it('no reutiliza IDs tras borrar la última fila', () => {
    const db = openDb(':memory:');
    const insert = db.prepare("INSERT INTO tasks (title, created_at) VALUES (?, '2026-01-01T00:00:00Z')");
    insert.run('a');
    const second = insert.run('b');
    db.prepare('DELETE FROM tasks WHERE id = ?').run(second.lastInsertRowid);
    const third = insert.run('c');
    expect(Number(third.lastInsertRowid)).toBe(3);
  });

  it('lanza AppError con la ruta si el archivo no es SQLite y no lo modifica', () => {
    const dir = mkdtempSync(join(tmpdir(), 'task-cli-'));
    const path = join(dir, 'tasks.db');
    const content = 'esto no es una base de datos sqlite, solo texto plano '.repeat(10);
    writeFileSync(path, content);
    try {
      expect(() => openDb(path)).toThrow(AppError);
      expect(() => openDb(path)).toThrow(path);
      expect(readFileSync(path, 'utf8')).toBe(content);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

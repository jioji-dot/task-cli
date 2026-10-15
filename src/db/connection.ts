import { mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import Database from 'better-sqlite3';
import { AppError } from '../utils/errors.js';

const SCHEMA = `CREATE TABLE IF NOT EXISTS tasks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL DEFAULT 'todo'   CHECK (status IN ('todo','in-progress','done')),
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  created_at  TEXT NOT NULL
)`;

export function getDefaultDbPath(): string {
  return join(homedir(), '.task-cli', 'tasks.db');
}

export function openDb(path: string): Database.Database {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  let db: Database.Database | undefined;
  try {
    db = new Database(path);
    db.exec(SCHEMA);
    return db;
  } catch (err) {
    db?.close();
    const code = (err as { code?: string }).code;
    if (code === 'SQLITE_NOTADB' || code === 'SQLITE_CORRUPT') {
      throw new AppError(`No se pudo leer la base de datos en ${path}`);
    }
    throw err;
  }
}

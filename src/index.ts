#!/usr/bin/env node
import { Command, CommanderError } from 'commander';
import { addCommand } from './commands/add.js';
import { deleteCommand } from './commands/delete.js';
import { listCommand } from './commands/list.js';
import { statusCommand } from './commands/status.js';
import { updateCommand } from './commands/update.js';
import { getDefaultDbPath, openDb } from './db/connection.js';
import { formatError } from './utils/errors.js';

const program = new Command();

program.name('task-cli').description('Gestión de tareas personales').exitOverride();

program
  .command('add <title>')
  .description('Crea una tarea nueva')
  .option('-p, --priority <priority>', 'prioridad: high, medium o low')
  .option('-d, --description <text>', 'descripción de la tarea')
  .action((title: string, options) => {
    addCommand(openDb(getDefaultDbPath()), title, options);
  });

program
  .command('list')
  .description('Lista las tareas')
  .option('-s, --status <status>', 'filtra por estado: todo, in-progress o done')
  .option('-p, --priority <priority>', 'filtra por prioridad: high, medium o low')
  .action((options) => {
    listCommand(openDb(getDefaultDbPath()), options);
  });

program
  .command('status <id> <status>')
  .description('Cambia el estado de una tarea')
  .action((id: string, status: string) => {
    statusCommand(openDb(getDefaultDbPath()), id, status);
  });

program
  .command('update <id>')
  .description('Modifica el título, la descripción o la prioridad de una tarea')
  .option('-t, --title <title>', 'nuevo título')
  .option('-d, --description <text>', 'nueva descripción')
  .option('-p, --priority <priority>', 'nueva prioridad: high, medium o low')
  .action((id: string, options) => {
    updateCommand(openDb(getDefaultDbPath()), id, options);
  });

program
  .command('delete <id>')
  .description('Elimina una tarea')
  .option('-f, --force', 'elimina sin pedir confirmación')
  .action(async (id: string, options) => {
    await deleteCommand(openDb(getDefaultDbPath()), id, options);
  });

try {
  await program.parseAsync(process.argv);
} catch (err) {
  if (err instanceof CommanderError) {
    // Commander ya imprimió el mensaje de uso; ayuda y versión salen con código 0.
    process.exit(err.exitCode === 0 ? 0 : 1);
  }
  console.error(formatError(err));
  process.exit(1);
}

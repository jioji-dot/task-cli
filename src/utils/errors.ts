// Error con mensaje en español pensado para mostrarse tal cual al usuario.
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

export function formatError(err: unknown): string {
  if (err instanceof AppError) {
    return err.message;
  }
  return 'Ocurrió un error inesperado.';
}

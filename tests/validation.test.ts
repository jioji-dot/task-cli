import { describe, expect, it } from 'vitest';
import { AppError } from '../src/utils/errors.js';
import {
  validateId,
  validatePriority,
  validateStatus,
  validateTitle,
} from '../src/utils/validation.js';

describe('validateTitle', () => {
  it('recorta espacios con trim()', () => {
    expect(validateTitle('  Escribir informe  ')).toBe('Escribir informe');
  });

  it('rechaza título vacío o solo espacios', () => {
    expect(() => validateTitle('')).toThrow(AppError);
    expect(() => validateTitle('   ')).toThrow(AppError);
  });

  it('no limita la longitud', () => {
    const long = 'x'.repeat(5000);
    expect(validateTitle(long)).toBe(long);
  });
});

describe('validatePriority', () => {
  it.each(['high', 'medium', 'low'])('acepta %s', (p) => {
    expect(validatePriority(p)).toBe(p);
  });

  it('rechaza otro valor y lista los válidos', () => {
    expect(() => validatePriority('urgent')).toThrow(AppError);
    expect(() => validatePriority('urgent')).toThrow(/high.*medium.*low/);
  });
});

describe('validateId', () => {
  it('acepta enteros positivos', () => {
    expect(validateId('1')).toBe(1);
    expect(validateId('42')).toBe(42);
  });

  it.each(['abc', '-1', '0', '1.5', '', ' ', '1e3'])('rechaza "%s"', (raw) => {
    expect(() => validateId(raw)).toThrow(AppError);
  });
});

describe('validateStatus', () => {
  it.each(['todo', 'in-progress', 'done'])('acepta %s', (s) => {
    expect(validateStatus(s)).toBe(s);
  });

  it('rechaza otro valor y lista los válidos', () => {
    expect(() => validateStatus('foo')).toThrow(AppError);
    expect(() => validateStatus('foo')).toThrow(/todo.*in-progress.*done/);
  });
});

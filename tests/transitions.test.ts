import { describe, expect, it } from 'vitest';
import { AppError } from '../src/utils/errors.js';
import { assertTransition, canTransition } from '../src/utils/transitions.js';
import { STATUSES, type TaskStatus } from '../src/utils/types.js';

const allowed: [TaskStatus, TaskStatus][] = [
  ['todo', 'in-progress'],
  ['in-progress', 'done'],
  ['in-progress', 'todo'],
  ['done', 'todo'],
];

describe('canTransition', () => {
  it.each(allowed)('permite %s → %s', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });

  it('rechaza todas las demás combinaciones (incluida todo → done y el mismo estado)', () => {
    for (const from of STATUSES) {
      for (const to of STATUSES) {
        const isAllowed = allowed.some(([f, t]) => f === from && t === to);
        if (!isAllowed) {
          expect(canTransition(from, to), `${from} → ${to}`).toBe(false);
        }
      }
    }
  });
});

describe('assertTransition', () => {
  it('no lanza en transiciones permitidas', () => {
    for (const [from, to] of allowed) {
      expect(() => assertTransition(from, to)).not.toThrow();
    }
  });

  it('lanza AppError que menciona las transiciones permitidas desde el estado actual', () => {
    expect(() => assertTransition('todo', 'done')).toThrow(AppError);
    expect(() => assertTransition('todo', 'done')).toThrow(/in-progress/);
    expect(() => assertTransition('in-progress', 'in-progress')).toThrow(/done.*todo/);
    expect(() => assertTransition('done', 'in-progress')).toThrow(/todo/);
  });
});

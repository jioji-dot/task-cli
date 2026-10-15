import { describe, expect, it } from 'vitest';
import { isAffirmative } from '../src/utils/confirm.js';

describe('isAffirmative', () => {
  it.each(['s', 'si', 'sí', 'y', 'yes', 'S', 'SI', 'SÍ', 'Y', 'YES', '  yes  ', ' s '])(
    'acepta "%s"',
    (answer) => {
      expect(isAffirmative(answer)).toBe(true);
    },
  );

  it.each(['', '  ', 'n', 'no', 'quizá', 'ss', 'yess'])('rechaza "%s"', (answer) => {
    expect(isAffirmative(answer)).toBe(false);
  });
});

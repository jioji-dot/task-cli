import { createInterface } from 'node:readline';

const AFFIRMATIVES = ['s', 'si', 'sí', 'y', 'yes'];

export function isAffirmative(answer: string): boolean {
  return AFFIRMATIVES.includes(answer.trim().toLowerCase());
}

export async function confirm(question: string): Promise<boolean> {
  if (!process.stdin.isTTY) {
    return false;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(isAffirmative(answer));
    });
  });
}

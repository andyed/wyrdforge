import type { DiceGroup } from '../types/play.ts';

/** Average value of a die (e.g. d8 → 4.5). */
export function dieAverage(sides: number): number {
  return (sides + 1) / 2;
}

/** Format a modifier as a signed string: +2, -1, +0. */
export function formatModifier(mod: number): string {
  if (!isFinite(mod)) return '+0';
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

/** Parse dice notation like "2d6" into a DiceGroup. Returns null for invalid input. */
export function parseDiceNotation(notation: string): DiceGroup | null {
  const match = notation.trim().match(/^(\d+)d(\d+)$/i);
  if (!match) return null;
  const count = parseInt(match[1], 10);
  const sides = parseInt(match[2], 10);
  if (!isFinite(count) || !isFinite(sides) || count < 1 || sides < 1) return null;
  return { count, sides };
}

/** Parse a full dice expression like "2d6+3" or "1d20+5" into dice groups + flat mod. */
export function parseDiceExpression(expr: string): { dice: DiceGroup[]; modifier: number } | null {
  const cleaned = expr.replace(/\s/g, '');
  const parts = cleaned.split(/(?=[+-])/);
  const dice: DiceGroup[] = [];
  let modifier = 0;

  for (const part of parts) {
    const diceMatch = part.match(/^([+-]?)(\d+)d(\d+)$/i);
    if (diceMatch) {
      const sign = diceMatch[1] === '-' ? -1 : 1;
      const count = parseInt(diceMatch[2], 10) * sign;
      const sides = parseInt(diceMatch[3], 10);
      if (isFinite(count) && isFinite(sides) && sides >= 1) {
        dice.push({ count: Math.abs(count), sides });
      }
    } else {
      const num = parseInt(part, 10);
      if (isFinite(num)) modifier += num;
    }
  }

  if (dice.length === 0 && modifier === 0) return null;
  return { dice, modifier };
}

/** Roll a single die using crypto.getRandomValues. Returns 1..sides. */
export function rollDie(sides: number): number {
  if (!isFinite(sides) || sides < 1) return 1;
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return (array[0] % sides) + 1;
}

/** Roll multiple dice and return individual results. */
export function rollDice(groups: DiceGroup[]): { sides: number; value: number }[] {
  const results: { sides: number; value: number }[] = [];
  for (const group of groups) {
    for (let i = 0; i < group.count; i++) {
      results.push({ sides: group.sides, value: rollDie(group.sides) });
    }
  }
  return results;
}

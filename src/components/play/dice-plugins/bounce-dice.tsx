import { useState, useEffect } from 'react';
import type { DiceAnimationPlugin, DiceAnimationProps } from './types.ts';
import { rollDie } from '../../../utils/dice.ts';
import { playRollSound, playCritSound, playFailSound } from '../../../utils/sound.ts';

const DIE_COLORS: Record<number, string> = {
  4: 'bg-amber-600',
  6: 'bg-emerald-700',
  8: 'bg-blue-700',
  10: 'bg-rose-700',
  12: 'bg-purple-700',
  20: 'bg-indigo-700',
  100: 'bg-stone-700',
};

/** Dice scale up to fill the stage. Single die = massive. Multiple = scale down. */
function getDieSize(sides: number, totalDice: number): string {
  if (totalDice === 1) {
    // Single die — fill the stage
    return sides === 20 ? 'w-40 h-40 text-8xl' : 'w-36 h-36 text-7xl';
  }
  if (totalDice <= 3) {
    return sides === 20 ? 'w-28 h-28 text-6xl' : 'w-24 h-24 text-5xl';
  }
  if (totalDice <= 6) {
    return sides === 20 ? 'w-20 h-20 text-4xl' : 'w-16 h-16 text-3xl';
  }
  // Many dice (e.g., 8d6 fireball)
  return 'w-12 h-12 text-xl';
}

function BounceDice({ dice, isRolling, isCriticalHit, isCriticalFail, onAnimationComplete, soundEnabled }: DiceAnimationProps) {
  const [displayValues, setDisplayValues] = useState<number[]>(dice.map((d) => d.value));
  const [animationDone, setAnimationDone] = useState(false);

  useEffect(() => {
    if (!isRolling) {
      setDisplayValues(dice.map((d) => d.value));
      setAnimationDone(true);
      return;
    }

    setAnimationDone(false);
    if (soundEnabled) playRollSound();

    const interval = setInterval(() => {
      setDisplayValues(dice.map((d) => rollDie(d.sides)));
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayValues(dice.map((d) => d.value));
      setAnimationDone(true);
      onAnimationComplete();
      if (soundEnabled) {
        if (isCriticalHit) playCritSound();
        else if (isCriticalFail) playFailSound();
      }
    }, 800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isRolling, dice, onAnimationComplete, soundEnabled, isCriticalHit, isCriticalFail]);

  if (dice.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center py-4">
      {dice.map((die, i) => {
        const color = DIE_COLORS[die.sides] ?? 'bg-stone-600';
        const size = getDieSize(die.sides, dice.length);
        const isD20 = die.sides === 20;
        const isCrit = animationDone && isD20 && isCriticalHit;
        const isFail = animationDone && isD20 && isCriticalFail;

        return (
          <div
            key={i}
            className={`
              ${color} ${size} text-white font-bold rounded-lg
              flex items-center justify-center shadow-lg
              select-none transition-all duration-200
              ${isRolling ? 'animate-bounce' : ''}
              ${isCrit ? 'crit-glow scale-110' : ''}
              ${isFail ? 'fail-glow animate-[shake_0.3s_ease-in-out]' : ''}
            `}
            style={{
              animationDelay: isRolling ? `${i * 80}ms` : '0ms',
            }}
          >
            {displayValues[i] ?? die.value}
          </div>
        );
      })}
    </div>
  );
}

export const BounceDicePlugin: DiceAnimationPlugin = {
  id: 'bounce',
  name: 'Bounce',
  description: 'Classic bouncing dice with number cycling and crit glow effects',
  responsive: true,
  component: BounceDice,
};

import { useState, useEffect } from 'react';
import type { DieResult } from '../../types/play.ts';
import { rollDie } from '../../utils/dice.ts';
import { usePlayStore } from '../../stores/play-store.ts';
import { playRollSound, playCritSound, playFailSound } from '../../utils/sound.ts';

const DIE_COLORS: Record<number, string> = {
  4: 'bg-amber-600',
  6: 'bg-emerald-700',
  8: 'bg-blue-700',
  10: 'bg-rose-700',
  12: 'bg-purple-700',
  20: 'bg-indigo-700',
  100: 'bg-stone-700',
};

const DIE_SIZES: Record<number, string> = {
  4: 'w-12 h-12 text-lg',
  6: 'w-14 h-14 text-xl',
  8: 'w-14 h-14 text-xl',
  10: 'w-14 h-14 text-xl',
  12: 'w-16 h-16 text-2xl',
  20: 'w-18 h-18 text-3xl',
  100: 'w-16 h-16 text-xl',
};

interface Props {
  dice: DieResult[];
  isRolling: boolean;
  isCriticalHit: boolean;
  isCriticalFail: boolean;
}

export function DiceAnimation({ dice, isRolling, isCriticalHit, isCriticalFail }: Props) {
  const [displayValues, setDisplayValues] = useState<number[]>(dice.map((d) => d.value));
  const [animationDone, setAnimationDone] = useState(false);
  const finishRolling = usePlayStore((s) => s.finishRolling);
  const soundEnabled = usePlayStore((s) => s.soundEnabled);

  // Cycle through random numbers during rolling
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
      finishRolling();
      // Play crit/fail sound after dice land
      if (soundEnabled) {
        if (isCriticalHit) playCritSound();
        else if (isCriticalFail) playFailSound();
      }
    }, 800);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isRolling, dice, finishRolling]);

  if (dice.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center py-4">
      {dice.map((die, i) => {
        const color = DIE_COLORS[die.sides] ?? 'bg-stone-600';
        const size = DIE_SIZES[die.sides] ?? 'w-14 h-14 text-xl';
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

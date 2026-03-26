import { useState } from 'react';
import { usePlayStore } from '../../stores/play-store.ts';
import type { DiceGroup } from '../../types/play.ts';

const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

export function CustomRollBuilder({ characterId }: { characterId: string }) {
  const executeRoll = usePlayStore((s) => s.executeRoll);
  const [dice, setDice] = useState<DiceGroup[]>([]);
  const [modifier, setModifier] = useState(0);
  const [label, setLabel] = useState('');

  function addDie(sides: number) {
    const existing = dice.find((d) => d.sides === sides);
    if (existing) {
      setDice(dice.map((d) => d.sides === sides ? { ...d, count: d.count + 1 } : d));
    } else {
      setDice([...dice, { count: 1, sides }]);
    }
  }

  function removeDie(sides: number) {
    setDice(dice
      .map((d) => d.sides === sides ? { ...d, count: d.count - 1 } : d)
      .filter((d) => d.count > 0)
    );
  }

  function handleRoll() {
    if (dice.length === 0 && modifier === 0) return;
    executeRoll({
      label: label || diceExpression(),
      characterId,
      rollType: 'custom',
      dice,
      flatModifier: modifier,
    });
  }

  function diceExpression(): string {
    const parts = dice.map((d) => `${d.count}d${d.sides}`);
    if (modifier > 0) parts.push(`+${modifier}`);
    else if (modifier < 0) parts.push(`${modifier}`);
    return parts.join('+') || '0';
  }

  function clear() {
    setDice([]);
    setModifier(0);
    setLabel('');
  }

  return (
    <div className="bg-stone-800 rounded-lg p-3 space-y-3">
      <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Custom Roll</div>

      {/* Dice buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {DICE_TYPES.map((sides) => {
          const group = dice.find((d) => d.sides === sides);
          return (
            <div key={sides} className="flex flex-col items-center gap-0.5">
              <button
                onClick={() => addDie(sides)}
                className="w-10 h-8 rounded bg-stone-700 hover:bg-stone-600 text-xs font-medium text-stone-300"
              >
                d{sides}
              </button>
              {group && (
                <div className="flex items-center gap-0.5">
                  <button onClick={() => removeDie(sides)} className="text-xs text-stone-500 hover:text-red-400 w-4">-</button>
                  <span className="text-xs text-stone-400 w-4 text-center">{group.count}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modifier */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500">Mod:</span>
        <button onClick={() => setModifier(modifier - 1)} className="w-6 h-6 rounded bg-stone-700 text-xs text-stone-300">-</button>
        <span className="text-sm font-mono text-stone-300 w-8 text-center">{modifier >= 0 ? '+' : ''}{modifier}</span>
        <button onClick={() => setModifier(modifier + 1)} className="w-6 h-6 rounded bg-stone-700 text-xs text-stone-300">+</button>
      </div>

      {/* Label */}
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Roll name (optional)"
        className="w-full bg-stone-700 border-none rounded px-2 py-1 text-sm text-stone-200 placeholder-stone-500"
      />

      {/* Expression preview + roll */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono text-stone-400 flex-1">{diceExpression()}</span>
        <button onClick={clear} className="text-xs text-stone-500 hover:text-stone-300 px-2 py-1">Clear</button>
        <button
          onClick={handleRoll}
          disabled={dice.length === 0 && modifier === 0}
          className="px-4 py-1.5 rounded bg-indigo-700 hover:bg-indigo-600 text-white text-sm font-medium disabled:opacity-40"
        >
          Roll
        </button>
      </div>
    </div>
  );
}

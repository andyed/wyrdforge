import { useState } from 'react';
import { usePlayStore } from '../../stores/play-store.ts';
import type { AdvantageMode, DiceGroup } from '../../types/play.ts';

const ADVANTAGE_OPTIONS: { value: AdvantageMode; label: string; color: string }[] = [
  { value: 'disadvantage', label: 'Disadv', color: 'bg-red-700' },
  { value: 'normal', label: 'Normal', color: 'bg-stone-600' },
  { value: 'advantage', label: 'Adv', color: 'bg-green-700' },
];

const COMMON_BONUS_DICE: { label: string; dice: DiceGroup }[] = [
  { label: 'Bless (d4)', dice: { count: 1, sides: 4 } },
  { label: 'Bardic Insp (d6)', dice: { count: 1, sides: 6 } },
  { label: 'Bardic Insp (d8)', dice: { count: 1, sides: 8 } },
];

export function RollControls() {
  const advantageMode = usePlayStore((s) => s.advantageMode);
  const setAdvantageMode = usePlayStore((s) => s.setAdvantageMode);
  const tempBonusDice = usePlayStore((s) => s.tempBonusDice);
  const setTempBonusDice = usePlayStore((s) => s.setTempBonusDice);
  const tempBonusFlat = usePlayStore((s) => s.tempBonusFlat);
  const setTempBonusFlat = usePlayStore((s) => s.setTempBonusFlat);
  const clearTempBonuses = usePlayStore((s) => s.clearTempBonuses);
  const soundEnabled = usePlayStore((s) => s.soundEnabled);
  const toggleSound = usePlayStore((s) => s.toggleSound);

  const [showBonuses, setShowBonuses] = useState(false);

  const hasBonus = tempBonusDice.length > 0 || tempBonusFlat !== 0;

  return (
    <div className="space-y-3">
      {/* Advantage toggle */}
      <div className="flex rounded-lg overflow-hidden border border-stone-300">
        {ADVANTAGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAdvantageMode(opt.value)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              advantageMode === opt.value
                ? `${opt.color} text-white`
                : 'bg-white text-stone-600 hover:bg-stone-50'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Temp bonus toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowBonuses(!showBonuses)}
          className={`flex-1 text-sm py-1.5 rounded border transition-colors ${
            hasBonus
              ? 'border-purple-400 bg-purple-50 text-purple-700'
              : 'border-stone-300 text-stone-600 hover:bg-stone-50'
          }`}
        >
          {hasBonus ? 'Bonuses Active' : 'Temp Bonuses'}
        </button>
        <button
          onClick={toggleSound}
          className={`px-3 py-1.5 rounded border text-sm ${
            soundEnabled ? 'border-stone-300 text-stone-600' : 'border-stone-300 text-stone-400'
          }`}
          title={soundEnabled ? 'Sound on' : 'Sound off'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      {/* Bonus panel */}
      {showBonuses && (
        <div className="bg-stone-50 rounded-lg p-3 space-y-2 border border-stone-200">
          <div className="text-xs font-medium text-stone-500">Bonus Dice</div>
          <div className="flex flex-wrap gap-1">
            {COMMON_BONUS_DICE.map((b) => {
              const active = tempBonusDice.some((d) => d.sides === b.dice.sides && d.count === b.dice.count);
              return (
                <button
                  key={b.label}
                  onClick={() => {
                    if (active) {
                      setTempBonusDice(tempBonusDice.filter((d) => d.sides !== b.dice.sides));
                    } else {
                      setTempBonusDice([...tempBonusDice, b.dice]);
                    }
                  }}
                  className={`text-xs px-2 py-1 rounded ${
                    active ? 'bg-purple-600 text-white' : 'bg-white border border-stone-300 text-stone-600'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-medium text-stone-500 mt-2">Flat Bonus</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTempBonusFlat(tempBonusFlat - 1)} className="w-7 h-7 rounded bg-white border text-sm">-</button>
            <span className="text-sm font-mono w-8 text-center">{tempBonusFlat >= 0 ? '+' : ''}{tempBonusFlat}</span>
            <button onClick={() => setTempBonusFlat(tempBonusFlat + 1)} className="w-7 h-7 rounded bg-white border text-sm">+</button>
          </div>

          {hasBonus && (
            <button onClick={clearTempBonuses} className="text-xs text-red-600 hover:underline">
              Clear All Bonuses
            </button>
          )}
        </div>
      )}
    </div>
  );
}

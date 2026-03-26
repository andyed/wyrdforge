import { useState } from 'react';
import type { Character, AbilityScores } from '../../types/character.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { ABILITIES, ABILITY_LABELS } from '../../types/rules.ts';
import { abilityModifier } from '../../utils/modifiers.ts';
import { formatModifier } from '../../utils/dice.ts';
import { computeFinalScores, computeModifiers } from '../../selectors/ability-scores.ts';

type Method = 'standard' | 'pointbuy' | 'manual';

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9,
};
const POINT_BUY_BUDGET = 27;

export function StepAbilities({ character }: { character: Character }) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const [method, setMethod] = useState<Method>('standard');
  const [standardAssignment, setStandardAssignment] = useState<Record<string, number>>({});

  const baseScores = character.baseAbilityScores;

  function setScore(ability: string, value: number) {
    const clamped = Math.max(3, Math.min(18, value));
    updateCharacter(character.id, {
      baseAbilityScores: { ...baseScores, [ability]: clamped },
    });
  }

  function handleStandardAssign(ability: string, value: number) {
    const newAssignment = { ...standardAssignment };
    // Remove any previous assignment of this value
    for (const [key, val] of Object.entries(newAssignment)) {
      if (val === value) delete newAssignment[key];
    }
    newAssignment[ability] = value;
    setStandardAssignment(newAssignment);

    // Apply to character
    const scores: AbilityScores = { strength: 8, dexterity: 8, constitution: 8, intelligence: 8, wisdom: 8, charisma: 8 };
    for (const [key, val] of Object.entries(newAssignment)) {
      scores[key as keyof AbilityScores] = val;
    }
    updateCharacter(character.id, { baseAbilityScores: scores });
  }

  // Point buy total
  const pointBuyTotal = ABILITIES.reduce((sum, a) => sum + (POINT_BUY_COSTS[baseScores[a]] ?? 0), 0);
  const pointBuyRemaining = POINT_BUY_BUDGET - pointBuyTotal;

  const finalScores = computeFinalScores(character);
  const mods = computeModifiers(finalScores);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Set Ability Scores</h3>

      {/* Method selector */}
      <div className="flex gap-2 mb-4">
        {(['standard', 'pointbuy', 'manual'] as Method[]).map((m) => (
          <button
            key={m}
            onClick={() => setMethod(m)}
            className={`px-3 py-1.5 rounded text-sm ${
              method === m ? 'bg-red-800 text-white' : 'bg-stone-200 text-stone-600'
            }`}
          >
            {m === 'standard' ? 'Standard Array' : m === 'pointbuy' ? 'Point Buy' : 'Manual'}
          </button>
        ))}
      </div>

      {method === 'pointbuy' && (
        <div className={`text-sm mb-3 ${pointBuyRemaining < 0 ? 'text-red-600 font-semibold' : 'text-stone-500'}`}>
          Points remaining: {pointBuyRemaining} / {POINT_BUY_BUDGET}
        </div>
      )}

      <div className="grid grid-cols-6 gap-3">
        {ABILITIES.map((ability) => (
          <div key={ability} className="text-center">
            <div className="text-xs font-semibold text-stone-500 mb-1">{ABILITY_LABELS[ability]}</div>
            <div className="text-2xl font-bold">{finalScores[ability]}</div>
            <div className="text-sm text-stone-500">{formatModifier(mods[ability])}</div>

            {method === 'standard' && (
              <select
                value={standardAssignment[ability] ?? ''}
                onChange={(e) => handleStandardAssign(ability, Number(e.target.value))}
                className="mt-2 w-full text-sm border rounded p-1"
              >
                <option value="">—</option>
                {STANDARD_ARRAY.map((v) => {
                  const usedBy = Object.entries(standardAssignment).find(([, val]) => val === v)?.[0];
                  const available = !usedBy || usedBy === ability;
                  return (
                    <option key={v} value={v} disabled={!available}>
                      {v} {usedBy && usedBy !== ability ? `(${ABILITY_LABELS[usedBy as keyof typeof ABILITY_LABELS]})` : ''}
                    </option>
                  );
                })}
              </select>
            )}

            {method === 'pointbuy' && (
              <div className="mt-2 flex items-center justify-center gap-1">
                <button
                  onClick={() => setScore(ability, baseScores[ability] - 1)}
                  disabled={baseScores[ability] <= 8}
                  className="w-6 h-6 rounded bg-stone-200 text-stone-600 text-xs disabled:opacity-30"
                >
                  -
                </button>
                <span className="text-sm w-6">{baseScores[ability]}</span>
                <button
                  onClick={() => setScore(ability, baseScores[ability] + 1)}
                  disabled={baseScores[ability] >= 15}
                  className="w-6 h-6 rounded bg-stone-200 text-stone-600 text-xs disabled:opacity-30"
                >
                  +
                </button>
              </div>
            )}

            {method === 'manual' && (
              <input
                type="number"
                min={3}
                max={18}
                value={baseScores[ability]}
                onChange={(e) => setScore(ability, Number(e.target.value))}
                className="mt-2 w-full text-sm text-center border rounded p-1"
              />
            )}

            <div className="text-xs text-stone-400 mt-1">Base: {baseScores[ability]}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-stone-400 mt-4">
        Final scores include bonuses from your background
        {character.speciesAsi ? ' and species' : ''}.
      </p>
    </div>
  );
}

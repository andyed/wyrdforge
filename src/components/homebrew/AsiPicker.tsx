import type { AsiChoice } from '../../types/content.ts';
import type { Ability } from '../../types/rules.ts';
import { ABILITIES, ABILITY_LABELS } from '../../types/rules.ts';

export function AsiPicker({
  value,
  onChange,
}: {
  value: AsiChoice;
  onChange: (asi: AsiChoice) => void;
}) {
  function handleModeChange(mode: 'two' | 'three') {
    if (mode === 'two') {
      onChange({ mode: 'two', plus2: 'strength', plus1: 'dexterity' });
    } else {
      onChange({ mode: 'three', abilities: ['strength', 'dexterity', 'constitution'] });
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => handleModeChange('two')}
          className={`text-sm px-3 py-1 rounded ${
            value.mode === 'two' ? 'bg-red-800 text-white' : 'bg-stone-200 text-stone-600'
          }`}
        >
          +2 / +1
        </button>
        <button
          onClick={() => handleModeChange('three')}
          className={`text-sm px-3 py-1 rounded ${
            value.mode === 'three' ? 'bg-red-800 text-white' : 'bg-stone-200 text-stone-600'
          }`}
        >
          +1 / +1 / +1
        </button>
      </div>

      {value.mode === 'two' && (
        <div className="flex gap-4">
          <div>
            <label className="text-xs text-stone-500">+2</label>
            <select
              value={value.plus2}
              onChange={(e) =>
                onChange({ ...value, plus2: e.target.value as Ability })
              }
              className="block border rounded px-2 py-1 text-sm"
            >
              {ABILITIES.map((a) => (
                <option key={a} value={a} disabled={a === value.plus1}>
                  {ABILITY_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-stone-500">+1</label>
            <select
              value={value.plus1}
              onChange={(e) =>
                onChange({ ...value, plus1: e.target.value as Ability })
              }
              className="block border rounded px-2 py-1 text-sm"
            >
              {ABILITIES.map((a) => (
                <option key={a} value={a} disabled={a === value.plus2}>
                  {ABILITY_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {value.mode === 'three' && (
        <div className="flex gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i}>
              <label className="text-xs text-stone-500">+1 ({i + 1})</label>
              <select
                value={value.abilities[i]}
                onChange={(e) => {
                  const newAbilities = [...value.abilities] as [Ability, Ability, Ability];
                  newAbilities[i] = e.target.value as Ability;
                  onChange({ mode: 'three', abilities: newAbilities });
                }}
                className="block border rounded px-2 py-1 text-sm"
              >
                {ABILITIES.map((a) => {
                  const usedByOther = value.abilities.some((ab, j) => j !== i && ab === a);
                  return (
                    <option key={a} value={a} disabled={usedByOther}>
                      {ABILITY_LABELS[a]}
                    </option>
                  );
                })}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

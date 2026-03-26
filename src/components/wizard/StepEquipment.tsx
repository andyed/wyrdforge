import type { Character } from '../../types/character.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { WEAPON_MASTERIES } from '../../types/rules.ts';
import type { WeaponMastery } from '../../types/rules.ts';

export function StepEquipment({ character }: { character: Character }) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const classDef = useContentStore((s) => s.classes[character.classId]);
  const weaponsMap = useContentStore((s) => s.weapons);
  const weapons = Object.values(weaponsMap);

  const masteryCount = classDef?.weaponMasteryCount ?? 0;

  function toggleMastery(mastery: WeaponMastery) {
    const current = character.weaponMasteries;
    if (current.includes(mastery)) {
      updateCharacter(character.id, {
        weaponMasteries: current.filter((m) => m !== mastery),
      });
    } else if (current.length < masteryCount) {
      updateCharacter(character.id, {
        weaponMasteries: [...current, mastery],
      });
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Equipment & Weapon Mastery</h3>

      {classDef && (
        <div className="mb-4 p-3 bg-stone-50 rounded">
          <span className="font-medium">Starting Equipment:</span>
          <ul className="text-sm text-stone-600 mt-1 list-disc list-inside">
            {classDef.startingEquipment.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {masteryCount > 0 && (
        <div>
          <h4 className="font-semibold mb-2">
            Weapon Mastery — Choose {masteryCount} ({character.weaponMasteries.length} selected)
          </h4>
          <p className="text-sm text-stone-500 mb-3">
            Select weapon mastery properties you've trained with. These apply to eligible weapons.
          </p>
          <div className="grid grid-cols-4 gap-2">
            {WEAPON_MASTERIES.map((mastery) => {
              const selected = character.weaponMasteries.includes(mastery);
              const weaponsWithMastery = weapons.filter((w) => w.mastery === mastery);
              return (
                <button
                  key={mastery}
                  onClick={() => toggleMastery(mastery)}
                  disabled={!selected && character.weaponMasteries.length >= masteryCount}
                  className={`text-left p-3 rounded border-2 text-sm transition-colors disabled:opacity-40 ${
                    selected ? 'border-red-700 bg-red-50' : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <div className="font-semibold capitalize">{mastery}</div>
                  <div className="text-xs text-stone-400 mt-1">
                    {weaponsWithMastery.map((w) => w.name).join(', ')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

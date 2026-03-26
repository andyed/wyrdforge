import type { Character } from '../../types/character.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { useUIStore } from '../../stores/ui-store.ts';
import { SKILL_LABELS, ABILITY_LABELS } from '../../types/rules.ts';

export function StepClass({ character }: { character: Character }) {
  const classesMap = useContentStore((s) => s.classes);
  const classesList = Object.values(classesMap);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const nextStep = useUIStore((s) => s.nextWizardStep);

  function handleSelect(classId: string) {
    const cls = useContentStore.getState().classes[classId];
    if (!cls) return;
    updateCharacter(character.id, {
      classId,
      armorProficiencies: [...cls.armorProficiencies],
      weaponProficiencies: [...cls.weaponProficiencies],
    });
  }

  const selectedClass = character.classId
    ? useContentStore.getState().classes[character.classId]
    : null;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Choose Your Class</h3>
      <div className="grid grid-cols-2 gap-3">
        {classesList.map((cls) => {
          const selected = character.classId === cls.id;
          return (
            <button
              key={cls.id}
              onClick={() => handleSelect(cls.id)}
              onDoubleClick={() => { handleSelect(cls.id); nextStep(); }}
              className={`text-left p-4 rounded-lg border-2 transition-colors ${
                selected
                  ? 'border-red-700 bg-red-50'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <div className="font-semibold">{cls.name}</div>
              <div className="text-sm text-stone-500 mt-1">
                Hit Die: d{cls.hitDie} · Saves: {cls.savingThrows.map((s) => ABILITY_LABELS[s]).join(', ')}
              </div>
              <div className="text-xs text-stone-400 mt-1">
                {cls.spellcasting ? `Spellcasting (${ABILITY_LABELS[cls.spellcasting.ability]})` : 'No spellcasting'}
                {cls.weaponMasteryCount ? ` · ${cls.weaponMasteryCount} Weapon Masteries` : ''}
              </div>
            </button>
          );
        })}
      </div>

      {selectedClass && (
        <div className="mt-4 p-4 bg-stone-50 rounded-lg space-y-3">
          <div>
            <span className="font-medium">Armor:</span> {selectedClass.armorProficiencies.join(', ') || 'None'}
          </div>
          <div>
            <span className="font-medium">Weapons:</span> {selectedClass.weaponProficiencies.join(', ')}
          </div>
          <div>
            <span className="font-medium">Skills:</span> Choose {selectedClass.skillChoices.count} from{' '}
            {selectedClass.skillChoices.from.map((s) => SKILL_LABELS[s]).join(', ')}
          </div>
          <div>
            <span className="font-medium">Level 1 Features:</span>
            {selectedClass.features
              .filter((f) => f.level === 1)
              .map((f) => (
                <div key={f.name} className="mt-2">
                  <span className="font-medium text-sm">{f.name}.</span>{' '}
                  <span className="text-sm text-stone-500">{f.description}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

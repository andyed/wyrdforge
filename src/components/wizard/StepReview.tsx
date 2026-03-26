import type { Character } from '../../types/character.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { ABILITIES, ABILITY_LABELS, SKILL_LABELS } from '../../types/rules.ts';
import { computeFinalScores, computeModifiers } from '../../selectors/ability-scores.ts';
import { computeMaxHP } from '../../selectors/hit-points.ts';
import { proficiencyBonus } from '../../utils/modifiers.ts';
import { formatModifier } from '../../utils/dice.ts';

export function StepReview({
  character,
  onFinalize,
}: {
  character: Character;
  onFinalize: () => void;
}) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const species = useContentStore((s) => s.species[character.speciesId]);
  const background = useContentStore((s) => s.backgrounds[character.backgroundId]);
  const classDef = useContentStore((s) => s.classes[character.classId]);
  const feats = useContentStore((s) => s.feats);

  const finalScores = computeFinalScores(character);
  const mods = computeModifiers(finalScores);
  const profBonus = proficiencyBonus(character.level);
  const maxHP = classDef ? computeMaxHP(classDef.hitDie, character.level, finalScores) : 10;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Review Your Character</h3>

      {/* Name input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-stone-600 mb-1">Character Name</label>
        <input
          type="text"
          value={character.name}
          onChange={(e) => updateCharacter(character.id, { name: e.target.value })}
          placeholder="Enter character name..."
          className="w-full border rounded px-3 py-2 text-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div><span className="font-medium">Species:</span> {species?.name ?? '—'}</div>
          <div><span className="font-medium">Background:</span> {background?.name ?? '—'}</div>
          <div><span className="font-medium">Class:</span> {classDef?.name ?? '—'} (Level {character.level})</div>
          <div><span className="font-medium">Hit Points:</span> {maxHP}</div>
          <div><span className="font-medium">Hit Die:</span> d{classDef?.hitDie ?? '?'}</div>
          <div><span className="font-medium">Proficiency Bonus:</span> {formatModifier(profBonus)}</div>
        </div>

        <div>
          <div className="font-medium mb-2">Ability Scores</div>
          <div className="grid grid-cols-3 gap-2">
            {ABILITIES.map((ability) => (
              <div key={ability} className="text-center bg-stone-50 rounded p-2">
                <div className="text-xs text-stone-500">{ABILITY_LABELS[ability]}</div>
                <div className="text-xl font-bold">{finalScores[ability]}</div>
                <div className="text-sm text-stone-500">{formatModifier(mods[ability])}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <div className="font-medium mb-1">Skill Proficiencies</div>
          <div className="text-sm text-stone-600">
            {character.skillProficiencies.map((s) => SKILL_LABELS[s]).join(', ') || '—'}
          </div>
        </div>
        <div>
          <div className="font-medium mb-1">Origin Feat</div>
          <div className="text-sm text-stone-600">
            {character.featIds.map((id) => feats[id]?.name).filter(Boolean).join(', ') || '—'}
          </div>
        </div>
      </div>

      {character.weaponMasteries.length > 0 && (
        <div className="mt-4">
          <div className="font-medium mb-1">Weapon Masteries</div>
          <div className="text-sm text-stone-600 capitalize">
            {character.weaponMasteries.join(', ')}
          </div>
        </div>
      )}
    </div>
  );
}

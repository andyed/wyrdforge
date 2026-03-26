import { useState } from 'react';
import type { Character } from '../../types/character.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { useUIStore } from '../../stores/ui-store.ts';
import { ABILITIES, ABILITY_LABELS, SKILL_LABELS } from '../../types/rules.ts';
import { computeFinalScores, computeModifiers } from '../../selectors/ability-scores.ts';
import { computeSkillModifiers } from '../../selectors/skills.ts';
import { computeAC, computeInitiative, computeSpellDC, computeSpellAttack } from '../../selectors/combat.ts';
import { proficiencyBonus } from '../../utils/modifiers.ts';
import { formatModifier } from '../../utils/dice.ts';
import { LevelUpBuilder } from './LevelUpBuilder.tsx';

export function CharacterSheet({ character }: { character: Character }) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const species = useContentStore((s) => s.species[character.speciesId]);
  const background = useContentStore((s) => s.backgrounds[character.backgroundId]);
  const classDef = useContentStore((s) => s.classes[character.classId]);
  const feats = useContentStore((s) => s.feats);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);

  const finalScores = computeFinalScores(character);
  const mods = computeModifiers(finalScores);
  const profBonus = proficiencyBonus(character.level);
  const skillMods = computeSkillModifiers(finalScores, profBonus, character.skillProficiencies, character.skillExpertise);
  const initiative = computeInitiative(finalScores);
  const ac = computeAC(finalScores); // unarmored default

  function adjustHP(delta: number) {
    const hp = character.hitPoints;
    const newCurrent = Math.max(0, Math.min(hp.max, hp.current + delta));
    updateCharacter(character.id, { hitPoints: { ...hp, current: newCurrent } });
  }

  function toggleDeathSave(type: 'successes' | 'failures', index: number) {
    const current = character.deathSaves[type];
    const newValue = index < current ? index : index + 1;
    updateCharacter(character.id, {
      deathSaves: { ...character.deathSaves, [type]: Math.min(newValue, 3) },
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-lg p-4 flex items-center gap-6">
        <button
          onClick={() => useUIStore.getState().setView('play')}
          className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          🎲 Play
        </button>
        <button
          onClick={() => setShowLevelUp(!showLevelUp)}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            showLevelUp ? 'bg-green-600 text-white' : 'bg-stone-700 hover:bg-stone-600 text-stone-200'
          }`}
        >
          ⬆ Level Up
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{character.name || 'Unnamed'}</h2>
          <div className="text-stone-400 text-sm">
            {species?.name} {classDef?.name} · Level {character.level} · {background?.name}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-stone-400">Proficiency</div>
          <div className="text-xl font-bold">{formatModifier(profBonus)}</div>
        </div>
      </div>

      {/* Level Up Builder */}
      {showLevelUp && (
        <LevelUpBuilder character={character} onClose={() => setShowLevelUp(false)} />
      )}

      <div className="grid grid-cols-12 gap-4">
        {/* Ability Scores - left column */}
        <div className="col-span-2 space-y-2">
          {ABILITIES.map((ability) => (
            <div key={ability} className="bg-white rounded-lg border border-stone-200 p-2 text-center">
              <div className="text-xs font-semibold text-stone-500">{ABILITY_LABELS[ability]}</div>
              <div className="text-2xl font-bold">{formatModifier(mods[ability])}</div>
              <div className="text-xs text-stone-400">{finalScores[ability]}</div>
              {character.savingThrowProficiencies.includes(ability) && (
                <div className="text-xs text-green-600 font-medium">
                  Save {formatModifier(mods[ability] + profBonus)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Center column - combat stats + skills */}
        <div className="col-span-5 space-y-4">
          {/* Combat stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-lg border border-stone-200 p-3 text-center">
              <div className="text-xs text-stone-500">AC</div>
              <div className="text-3xl font-bold">{ac}</div>
            </div>
            <div className="bg-white rounded-lg border border-stone-200 p-3 text-center">
              <div className="text-xs text-stone-500">Initiative</div>
              <div className="text-3xl font-bold">{formatModifier(initiative)}</div>
            </div>
            <div className="bg-white rounded-lg border border-stone-200 p-3 text-center">
              <div className="text-xs text-stone-500">Speed</div>
              <div className="text-3xl font-bold">{species?.speed ?? 30}</div>
              <div className="text-xs text-stone-400">ft</div>
            </div>
          </div>

          {/* HP tracker */}
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Hit Points</span>
              <span className="text-sm text-stone-500">Max: {character.hitPoints.max}</span>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => adjustHP(-1)} className="w-8 h-8 rounded bg-red-100 text-red-700 font-bold">-</button>
              <div className="text-3xl font-bold flex-1 text-center">
                {character.hitPoints.current}
                {character.hitPoints.temp > 0 && (
                  <span className="text-lg text-blue-500 ml-1">+{character.hitPoints.temp}</span>
                )}
              </div>
              <button onClick={() => adjustHP(1)} className="w-8 h-8 rounded bg-green-100 text-green-700 font-bold">+</button>
            </div>
            {/* HP bar */}
            <div className="mt-2 h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 transition-all"
                style={{ width: `${character.hitPoints.max > 0 ? (character.hitPoints.current / character.hitPoints.max) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Death Saves */}
          <div className="bg-white rounded-lg border border-stone-200 p-3">
            <div className="text-sm font-medium mb-2">Death Saves</div>
            <div className="flex gap-4">
              <div>
                <span className="text-xs text-stone-500">Successes</span>
                <div className="flex gap-1 mt-1">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      onClick={() => toggleDeathSave('successes', i)}
                      className={`w-5 h-5 rounded-full border-2 ${
                        i < character.deathSaves.successes
                          ? 'bg-green-500 border-green-500'
                          : 'border-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-stone-500">Failures</span>
                <div className="flex gap-1 mt-1">
                  {[0, 1, 2].map((i) => (
                    <button
                      key={i}
                      onClick={() => toggleDeathSave('failures', i)}
                      className={`w-5 h-5 rounded-full border-2 ${
                        i < character.deathSaves.failures
                          ? 'bg-red-500 border-red-500'
                          : 'border-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="text-sm font-medium mb-2">Skills</div>
            <div className="space-y-1">
              {skillMods.map(({ skill, modifier, proficient, expert }) => (
                <div key={skill} className="flex items-center text-sm">
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    expert ? 'bg-yellow-500' : proficient ? 'bg-green-500' : 'bg-stone-200'
                  }`} />
                  <span className="flex-1">{SKILL_LABELS[skill]}</span>
                  <span className="font-mono text-stone-700">{formatModifier(modifier)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - features, spells, equipment */}
        <div className="col-span-5 space-y-4">
          {/* Spellcasting (if applicable) */}
          {classDef?.spellcasting && (
            <div className="bg-white rounded-lg border border-stone-200 p-4">
              <div className="text-sm font-medium mb-2">Spellcasting</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-stone-500">Save DC:</span>{' '}
                  <span className="font-bold">
                    {computeSpellDC(finalScores, classDef.spellcasting.ability, profBonus)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-500">Attack:</span>{' '}
                  <span className="font-bold">
                    {formatModifier(computeSpellAttack(finalScores, classDef.spellcasting.ability, profBonus))}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Features */}
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="text-sm font-medium mb-2">Features & Traits</div>
            <div className="space-y-2 text-sm">
              {/* Species traits */}
              {species?.traits.map((t) => (
                <div key={t.id}>
                  <span className="font-medium">{t.name}.</span>{' '}
                  <span className="text-stone-500">{t.description}</span>
                </div>
              ))}
              {/* Class features */}
              {classDef?.features
                .filter((f) => f.level <= character.level)
                .map((f) => (
                  <div key={f.name}>
                    <span className="font-medium">{f.name}.</span>{' '}
                    <span className="text-stone-500">{f.description}</span>
                  </div>
                ))}
              {/* Feats */}
              {character.featIds.map((id) => {
                const feat = feats[id];
                if (!feat) return null;
                return (
                  <div key={id}>
                    <span className="font-medium">{feat.name}.</span>{' '}
                    <span className="text-stone-500">{feat.description}</span>
                  </div>
                );
              })}
              {/* Custom features from level-up */}
              {(character.customFeatures ?? [])
                .filter((f) => f.level <= character.level && f.name)
                .map((f, i) => (
                  <div key={`custom-${i}`}>
                    <span className="font-medium text-purple-700">{f.name}</span>
                    <span className="text-xs text-stone-400 ml-1">(Lvl {f.level})</span>
                    {f.description && (
                      <span className="text-stone-500"> — {f.description}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Weapon Masteries */}
          {character.weaponMasteries.length > 0 && (
            <div className="bg-white rounded-lg border border-stone-200 p-4">
              <div className="text-sm font-medium mb-2">Weapon Masteries</div>
              <div className="flex gap-2">
                {character.weaponMasteries.map((m) => (
                  <span key={m} className="text-sm bg-stone-100 px-2 py-1 rounded capitalize">{m}</span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg border border-stone-200 p-4">
            <div className="text-sm font-medium mb-2">Notes</div>
            <textarea
              value={character.notes.freeform}
              onChange={(e) =>
                updateCharacter(character.id, {
                  notes: { ...character.notes, freeform: e.target.value },
                })
              }
              placeholder="Character notes..."
              className="w-full border rounded p-2 text-sm min-h-[100px] resize-y"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { Character } from '../../types/character.ts';
import { usePlayStore } from '../../stores/play-store.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useRovingFocus } from '../../hooks/useRovingFocus.ts';
import { computeFinalScores, computeModifiers } from '../../selectors/ability-scores.ts';
import { computeSkillModifiers } from '../../selectors/skills.ts';
import { computeInitiative } from '../../selectors/combat.ts';
import { computeWeaponAttackMod, computeWeaponDamageMod } from '../../selectors/combat.ts';
import { proficiencyBonus } from '../../utils/modifiers.ts';
import { formatModifier, parseDiceNotation } from '../../utils/dice.ts';
import { ABILITIES, ABILITY_LABELS, SKILL_LABELS } from '../../types/rules.ts';

type Section = 'skills' | 'saves' | 'abilities' | 'attacks' | 'custom' | null;

export function QuickRollPanel({ character }: { character: Character }) {
  const [openSection, setOpenSection] = useState<Section>('skills');
  const quickRoll = usePlayStore((s) => s.quickRoll);
  const executeRoll = usePlayStore((s) => s.executeRoll);
  const weapons = useContentStore((s) => s.weapons);
  const { containerRef, handleKeyDown } = useRovingFocus('vertical');

  const finalScores = computeFinalScores(character);
  const mods = computeModifiers(finalScores);
  const profBonus = proficiencyBonus(character.level);
  const skillMods = computeSkillModifiers(finalScores, profBonus, character.skillProficiencies, character.skillExpertise);
  const initiative = computeInitiative(finalScores);

  function toggleSection(section: Section) {
    setOpenSection(openSection === section ? null : section);
  }

  function rollButton(label: string, modifier: number, rollType: 'skill' | 'save' | 'ability' | 'initiative', proficient?: boolean) {
    return (
      <button
        key={label}
        data-roving-item
        tabIndex={-1}
        onClick={() => quickRoll(label, character.id, rollType, modifier)}
        className="flex items-center justify-between w-full px-2 py-1.5 text-sm rounded
          hover:bg-stone-700 focus:bg-stone-700 focus:outline-none focus:ring-1 focus:ring-indigo-500
          transition-colors group"
      >
        <span className="flex items-center gap-1.5">
          {proficient !== undefined && (
            <span className={`w-1.5 h-1.5 rounded-full ${proficient ? 'bg-green-400' : 'bg-stone-600'}`} />
          )}
          <span className="text-stone-300 group-hover:text-white group-focus:text-white">{label}</span>
        </span>
        <span className="font-mono text-stone-400 group-hover:text-yellow-400 group-focus:text-yellow-400">
          {formatModifier(modifier)}
        </span>
      </button>
    );
  }

  function sectionHeader(label: string, section: Section, hint?: string) {
    const isOpen = openSection === section;
    return (
      <button
        data-roving-item
        tabIndex={-1}
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold text-stone-400 uppercase tracking-wider
          hover:text-stone-200 focus:text-stone-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
      >
        <span>{label} {hint && <span className="text-stone-600 normal-case font-normal">{hint}</span>}</span>
        <span className="text-stone-600">{isOpen ? '▾' : '▸'}</span>
      </button>
    );
  }

  // Show weapons the character is proficient with (all simple/martial as applicable)
  const proficientWeapons = Object.values(weapons).filter((w) => {
    // First check equipped equipment
    const isEquipped = character.equipment.some(
      (e) => e.name.toLowerCase() === w.name.toLowerCase() && e.equipped
    );
    if (isEquipped) return true;

    // If no equipment set, show weapons based on proficiency
    if (character.equipment.length === 0) {
      return (
        (character.weaponProficiencies.includes('Simple Weapons') && w.category === 'simple') ||
        (character.weaponProficiencies.includes('Martial Weapons') && w.category === 'martial') ||
        character.weaponProficiencies.some((p) => p.toLowerCase() === w.name.toLowerCase())
      );
    }
    return false;
  });

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="h-full overflow-y-auto space-y-1"
      role="listbox"
      aria-label="Quick rolls"
    >
      {/* Initiative */}
      <button
        data-roving-item
        tabIndex={0}
        onClick={() => quickRoll('Initiative', character.id, 'initiative', initiative)}
        className="w-full px-3 py-2 bg-indigo-900 hover:bg-indigo-800 focus:bg-indigo-800
          focus:outline-none focus:ring-1 focus:ring-indigo-400
          rounded-lg text-sm font-medium transition-colors flex items-center justify-between"
      >
        <span>Initiative</span>
        <span className="font-mono text-indigo-300">{formatModifier(initiative)}</span>
      </button>

      {/* Skills */}
      {sectionHeader('Skills', 'skills', '(↑↓ navigate, Enter to roll)')}
      {openSection === 'skills' && (
        <div className="space-y-0.5">
          {skillMods.map(({ skill, modifier, proficient }) =>
            rollButton(SKILL_LABELS[skill], modifier, 'skill', proficient)
          )}
        </div>
      )}

      {/* Saving Throws */}
      {sectionHeader('Saving Throws', 'saves')}
      {openSection === 'saves' && (
        <div className="space-y-0.5">
          {ABILITIES.map((ability) => {
            const mod = mods[ability];
            const proficient = character.savingThrowProficiencies.includes(ability);
            const total = mod + (proficient ? profBonus : 0);
            return rollButton(`${ABILITY_LABELS[ability]} Save`, total, 'save', proficient);
          })}
        </div>
      )}

      {/* Ability Checks */}
      {sectionHeader('Ability Checks', 'abilities')}
      {openSection === 'abilities' && (
        <div className="space-y-0.5">
          {ABILITIES.map((ability) =>
            rollButton(`${ABILITY_LABELS[ability]} Check`, mods[ability], 'ability')
          )}
        </div>
      )}

      {/* Attacks */}
      {sectionHeader('Attacks', 'attacks')}
      {openSection === 'attacks' && (
        <div className="space-y-1">
          {proficientWeapons.length === 0 && (
            <p className="text-xs text-stone-500 px-2 py-1">No proficient weapons found.</p>
          )}
          {proficientWeapons.map((weapon) => {
            const attackMod = computeWeaponAttackMod(weapon, finalScores, profBonus, character.weaponProficiencies);
            const damageMod = computeWeaponDamageMod(weapon, finalScores);
            const damageDice = parseDiceNotation(weapon.damage);

            return (
              <div key={weapon.id} className="px-2 py-1.5 rounded hover:bg-stone-700 transition-colors">
                <button
                  data-roving-item
                  tabIndex={-1}
                  onClick={() => quickRoll(`${weapon.name} Attack`, character.id, 'attack', attackMod)}
                  className="w-full flex items-center justify-between text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                >
                  <span className="text-stone-300">{weapon.name}</span>
                  <span className="font-mono text-stone-400">{formatModifier(attackMod)}</span>
                </button>
                {damageDice && (
                  <button
                    data-roving-item
                    tabIndex={-1}
                    onClick={() => executeRoll({
                      label: `${weapon.name} Damage`,
                      characterId: character.id,
                      rollType: 'damage',
                      dice: [damageDice],
                      flatModifier: damageMod,
                    })}
                    className="text-xs text-stone-500 hover:text-stone-300 focus:text-stone-300 focus:outline-none mt-0.5"
                  >
                    Damage: {weapon.damage} {formatModifier(damageMod)} {weapon.damageType}
                    {weapon.mastery && <span className="text-purple-400 ml-1">({weapon.mastery})</span>}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Custom Actions */}
      {(character.customActions ?? []).length > 0 && (
        <>
          {sectionHeader('Custom Actions', 'custom')}
          {openSection === 'custom' && (
            <div className="space-y-1">
              {(character.customActions ?? []).map((action) => (
                <div key={action.id} className="px-2 py-1.5 rounded hover:bg-stone-700 transition-colors">
                  <button
                    data-roving-item
                    tabIndex={-1}
                    onClick={() => executeRoll({
                      label: action.name || 'Custom',
                      characterId: character.id,
                      rollType: action.rollType,
                      dice: action.dice,
                      flatModifier: action.flatModifier,
                    })}
                    className="w-full flex items-center justify-between text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded"
                  >
                    <span className="text-stone-300">{action.name || 'Unnamed'}</span>
                    <span className="font-mono text-stone-400">
                      {action.dice.map((d) => `${d.count}d${d.sides}`).join('+')}
                      {action.flatModifier !== 0 && formatModifier(action.flatModifier)}
                    </span>
                  </button>
                  {action.description && (
                    <div className="text-xs text-stone-500 mt-0.5">{action.description}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Keyboard hints */}
      <div className="pt-4 px-2 text-xs text-stone-600 space-y-0.5">
        <div><kbd className="bg-stone-800 px-1 rounded">↑↓</kbd> Navigate</div>
        <div><kbd className="bg-stone-800 px-1 rounded">Enter</kbd> Roll / Re-roll last</div>
        <div><kbd className="bg-stone-800 px-1 rounded">A</kbd> Toggle Advantage</div>
        <div><kbd className="bg-stone-800 px-1 rounded">D</kbd> Toggle Disadvantage</div>
        <div><kbd className="bg-stone-800 px-1 rounded">Esc</kbd> Back to sheet</div>
      </div>
    </div>
  );
}

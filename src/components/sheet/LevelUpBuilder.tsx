import { useState } from 'react';
import type { Character, CustomAction, LevelFeature } from '../../types/character.ts';
import type { Ability, Skill } from '../../types/rules.ts';
import type { DiceGroup } from '../../types/play.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { usePartyStore } from '../../stores/party-store.ts';
import { computeFinalScores } from '../../selectors/ability-scores.ts';
import { computeMaxHP } from '../../selectors/hit-points.ts';
import { abilityModifier } from '../../utils/modifiers.ts';
import { rollDie, formatModifier } from '../../utils/dice.ts';
import { generateId } from '../../utils/ids.ts';
import { ABILITIES, ABILITY_LABELS, SKILLS, SKILL_LABELS } from '../../types/rules.ts';

type Tab = 'level' | 'scores' | 'skills' | 'actions' | 'features';

const ASI_LEVELS = [4, 8, 12, 16, 19];

export function LevelUpBuilder({ character, onClose }: { character: Character; onClose: () => void }) {
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const classDef = useContentStore((s) => s.classes[character.classId]);
  const snapshotCharacter = usePartyStore((s) => s.snapshotCharacter);
  const [tab, setTab] = useState<Tab>('level');

  const hitDie = classDef?.hitDie ?? 8;
  const finalScores = computeFinalScores(character);
  const conMod = abilityModifier(finalScores.constitution);
  const isAsiLevel = ASI_LEVELS.includes(character.level + 1);

  // === Level Tab ===
  function handleLevelUp() {
    // Snapshot current level first
    snapshotCharacter(character.id, character);

    const newLevel = character.level + 1;
    const avgHP = Math.floor((hitDie + 1) / 2) + conMod;
    const newMaxHP = character.hitPoints.max + Math.max(avgHP, 1);

    updateCharacter(character.id, {
      level: newLevel,
      hitPoints: { max: newMaxHP, current: newMaxHP, temp: 0 },
    });
  }

  function handleRollHP() {
    const roll = rollDie(hitDie);
    const hpGain = Math.max(roll + conMod, 1);
    const newMaxHP = character.hitPoints.max + hpGain;
    updateCharacter(character.id, {
      hitPoints: { max: newMaxHP, current: newMaxHP, temp: 0 },
    });
    alert(`Rolled d${hitDie}: ${roll} ${formatModifier(conMod)} CON = ${hpGain} HP gained`);
  }

  // === Ability Scores Tab ===
  function bumpAbility(ability: Ability, delta: number) {
    const current = character.baseAbilityScores[ability];
    const newVal = Math.max(1, Math.min(30, current + delta));
    updateCharacter(character.id, {
      baseAbilityScores: { ...character.baseAbilityScores, [ability]: newVal },
    });
  }

  // === Skills Tab ===
  function toggleSkill(skill: Skill) {
    const has = character.skillProficiencies.includes(skill);
    updateCharacter(character.id, {
      skillProficiencies: has
        ? character.skillProficiencies.filter((s) => s !== skill)
        : [...character.skillProficiencies, skill],
    });
  }

  function toggleExpertise(skill: Skill) {
    const has = character.skillExpertise.includes(skill);
    updateCharacter(character.id, {
      skillExpertise: has
        ? character.skillExpertise.filter((s) => s !== skill)
        : [...character.skillExpertise, skill],
    });
  }

  // === Custom Actions Tab ===
  function addAction() {
    const action: CustomAction = {
      id: generateId(),
      name: '',
      rollType: 'attack',
      dice: [{ count: 1, sides: 20 }],
      flatModifier: 0,
    };
    updateCharacter(character.id, {
      customActions: [...character.customActions, action],
    });
  }

  function updateAction(id: string, patch: Partial<CustomAction>) {
    updateCharacter(character.id, {
      customActions: character.customActions.map((a) => a.id === id ? { ...a, ...patch } : a),
    });
  }

  function removeAction(id: string) {
    updateCharacter(character.id, {
      customActions: character.customActions.filter((a) => a.id !== id),
    });
  }

  // === Custom Features Tab ===
  function addFeature() {
    const feat: LevelFeature = { level: character.level, name: '', description: '' };
    updateCharacter(character.id, {
      customFeatures: [...character.customFeatures, feat],
    });
  }

  function updateFeature(index: number, patch: Partial<LevelFeature>) {
    const updated = [...character.customFeatures];
    updated[index] = { ...updated[index], ...patch };
    updateCharacter(character.id, { customFeatures: updated });
  }

  function removeFeature(index: number) {
    updateCharacter(character.id, {
      customFeatures: character.customFeatures.filter((_, i) => i !== index),
    });
  }

  function tabButton(label: string, t: Tab) {
    return (
      <button
        onClick={() => setTab(t)}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          tab === t ? 'bg-indigo-700 text-white' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Level Up & Configure — Level {character.level}</h3>
        <button onClick={onClose} className="text-sm text-stone-500 hover:text-stone-700 px-3 py-1 rounded hover:bg-stone-100">
          Close
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {tabButton('Level & HP', 'level')}
        {tabButton('Ability Scores', 'scores')}
        {tabButton('Skills', 'skills')}
        {tabButton('Custom Actions', 'actions')}
        {tabButton('Features', 'features')}
      </div>

      {/* Level & HP */}
      {tab === 'level' && (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-stone-500">Current Level</div>
              <div className="text-3xl font-bold">{character.level}</div>
            </div>
            <button
              onClick={handleLevelUp}
              className="px-4 py-2 rounded bg-green-700 hover:bg-green-600 text-white font-medium"
            >
              Level Up to {character.level + 1}
            </button>
          </div>

          <div className="bg-stone-50 rounded-lg p-4">
            <div className="text-sm font-medium mb-2">HP: {character.hitPoints.max} max</div>
            <div className="text-sm text-stone-500 mb-3">
              Hit Die: d{hitDie} · CON modifier: {formatModifier(conMod)} ·
              Average gain: {Math.max(Math.floor((hitDie + 1) / 2) + conMod, 1)} HP
            </div>
            <div className="flex gap-2">
              <button onClick={handleRollHP} className="px-3 py-1.5 text-sm rounded bg-indigo-700 text-white hover:bg-indigo-600">
                Roll d{hitDie} for HP
              </button>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => updateCharacter(character.id, {
                    hitPoints: { ...character.hitPoints, max: character.hitPoints.max - 1, current: character.hitPoints.current - 1 }
                  })}
                  className="w-7 h-7 rounded bg-stone-200 text-sm"
                >-</button>
                <span className="text-sm font-mono w-12 text-center">{character.hitPoints.max}</span>
                <button
                  onClick={() => updateCharacter(character.id, {
                    hitPoints: { ...character.hitPoints, max: character.hitPoints.max + 1, current: character.hitPoints.current + 1 }
                  })}
                  className="w-7 h-7 rounded bg-stone-200 text-sm"
                >+</button>
              </div>
            </div>
          </div>

          {isAsiLevel && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="text-sm font-medium text-amber-800">
                Level {character.level + 1} grants an Ability Score Improvement or Feat!
              </div>
              <p className="text-xs text-amber-600 mt-1">
                Use the "Ability Scores" tab to bump stats, or add a feat via "Features".
              </p>
            </div>
          )}
        </div>
      )}

      {/* Ability Scores */}
      {tab === 'scores' && (
        <div className="space-y-3">
          <p className="text-sm text-stone-500">Adjust base ability scores. These are before background/species bonuses.</p>
          <div className="grid grid-cols-6 gap-3">
            {ABILITIES.map((ability) => (
              <div key={ability} className="text-center bg-stone-50 rounded-lg p-3">
                <div className="text-xs font-semibold text-stone-500">{ABILITY_LABELS[ability]}</div>
                <div className="text-2xl font-bold mt-1">{character.baseAbilityScores[ability]}</div>
                <div className="text-xs text-stone-400">Final: {finalScores[ability]}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <button onClick={() => bumpAbility(ability, -1)} className="w-6 h-6 rounded bg-stone-200 text-xs">-</button>
                  <button onClick={() => bumpAbility(ability, 1)} className="w-6 h-6 rounded bg-stone-200 text-xs">+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {tab === 'skills' && (
        <div className="space-y-2">
          <p className="text-sm text-stone-500">Toggle skill proficiencies and expertise.</p>
          <div className="grid grid-cols-2 gap-1">
            {SKILLS.map((skill) => {
              const proficient = character.skillProficiencies.includes(skill);
              const expert = character.skillExpertise.includes(skill);
              return (
                <div key={skill} className="flex items-center gap-2 py-1 px-2 rounded hover:bg-stone-50">
                  <button
                    onClick={() => toggleSkill(skill)}
                    className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      proficient ? 'bg-green-500 border-green-500' : 'border-stone-300'
                    }`}
                    title="Toggle proficiency"
                  />
                  <button
                    onClick={() => toggleExpertise(skill)}
                    disabled={!proficient}
                    className={`w-4 h-4 rounded-full border-2 transition-colors ${
                      expert ? 'bg-yellow-500 border-yellow-500' : 'border-stone-200'
                    } disabled:opacity-30`}
                    title="Toggle expertise"
                  />
                  <span className="text-sm">{SKILL_LABELS[skill]}</span>
                </div>
              );
            })}
          </div>
          <div className="text-xs text-stone-400 mt-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1 align-middle" /> Proficient
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1 ml-3 align-middle" /> Expertise
          </div>
        </div>
      )}

      {/* Custom Actions (rollable) */}
      {tab === 'actions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Define attacks, spells, or abilities you want to quick-roll in Play mode.</p>
            <button onClick={addAction} className="text-sm px-3 py-1.5 rounded bg-indigo-700 text-white hover:bg-indigo-600">
              + Add Action
            </button>
          </div>

          {character.customActions.length === 0 && (
            <p className="text-sm text-stone-400 py-4 text-center">No custom actions yet. Add one to see it in Play mode.</p>
          )}

          {character.customActions.map((action) => (
            <ActionEditor key={action.id} action={action} onChange={(patch) => updateAction(action.id, patch)} onRemove={() => removeAction(action.id)} />
          ))}
        </div>
      )}

      {/* Custom Features */}
      {tab === 'features' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Add class features, feats, or abilities gained at each level.</p>
            <button onClick={addFeature} className="text-sm px-3 py-1.5 rounded bg-indigo-700 text-white hover:bg-indigo-600">
              + Add Feature
            </button>
          </div>

          {character.customFeatures.length === 0 && (
            <p className="text-sm text-stone-400 py-4 text-center">No custom features yet.</p>
          )}

          {character.customFeatures.map((feat, i) => (
            <div key={i} className="bg-stone-50 rounded-lg p-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="number"
                  value={feat.level}
                  onChange={(e) => updateFeature(i, { level: Number(e.target.value) })}
                  className="w-16 border rounded px-2 py-1 text-sm"
                  min={1}
                  max={20}
                  title="Level gained"
                />
                <input
                  type="text"
                  value={feat.name}
                  onChange={(e) => updateFeature(i, { name: e.target.value })}
                  placeholder="Feature name"
                  className="flex-1 border rounded px-2 py-1 text-sm"
                />
                <button onClick={() => removeFeature(i)} className="text-red-500 text-sm px-2 hover:bg-red-50 rounded">Remove</button>
              </div>
              <textarea
                value={feat.description}
                onChange={(e) => updateFeature(i, { description: e.target.value })}
                placeholder="Description..."
                className="w-full border rounded px-2 py-1 text-sm min-h-[40px]"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Action Editor sub-component ---

function ActionEditor({ action, onChange, onRemove }: {
  action: CustomAction;
  onChange: (patch: Partial<CustomAction>) => void;
  onRemove: () => void;
}) {
  function updateDice(index: number, field: 'count' | 'sides', value: number) {
    const dice = [...action.dice];
    dice[index] = { ...dice[index], [field]: value };
    onChange({ dice });
  }

  function addDiceGroup() {
    onChange({ dice: [...action.dice, { count: 1, sides: 6 }] });
  }

  function removeDiceGroup(index: number) {
    onChange({ dice: action.dice.filter((_, i) => i !== index) });
  }

  return (
    <div className="bg-stone-50 rounded-lg p-3 space-y-2">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={action.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Action name (e.g., Fireball)"
          className="flex-1 border rounded px-2 py-1 text-sm"
        />
        <select
          value={action.rollType}
          onChange={(e) => onChange({ rollType: e.target.value as CustomAction['rollType'] })}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="attack">Attack</option>
          <option value="damage">Damage</option>
          <option value="save">Save</option>
          <option value="skill">Skill</option>
          <option value="ability">Ability</option>
          <option value="custom">Custom</option>
        </select>
        <button onClick={onRemove} className="text-red-500 text-sm px-2 hover:bg-red-50 rounded">Remove</button>
      </div>

      {/* Dice groups */}
      <div className="flex flex-wrap gap-2 items-center">
        {action.dice.map((group, i) => (
          <div key={i} className="flex items-center gap-1 bg-white rounded border px-2 py-1">
            <input
              type="number"
              value={group.count}
              onChange={(e) => updateDice(i, 'count', Math.max(1, Number(e.target.value)))}
              className="w-10 text-sm text-center border-none outline-none"
              min={1}
            />
            <span className="text-xs text-stone-400">d</span>
            <select
              value={group.sides}
              onChange={(e) => updateDice(i, 'sides', Number(e.target.value))}
              className="text-sm border-none outline-none"
            >
              {[4, 6, 8, 10, 12, 20, 100].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {action.dice.length > 1 && (
              <button onClick={() => removeDiceGroup(i)} className="text-red-400 text-xs ml-1">×</button>
            )}
          </div>
        ))}
        <button onClick={addDiceGroup} className="text-xs px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-600">+ dice</button>
      </div>

      {/* Flat modifier */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500">Modifier:</span>
        <button onClick={() => onChange({ flatModifier: action.flatModifier - 1 })} className="w-6 h-6 rounded bg-stone-200 text-xs">-</button>
        <span className="text-sm font-mono w-8 text-center">{formatModifier(action.flatModifier)}</span>
        <button onClick={() => onChange({ flatModifier: action.flatModifier + 1 })} className="w-6 h-6 rounded bg-stone-200 text-xs">+</button>
      </div>

      {/* Description */}
      <input
        type="text"
        value={action.description ?? ''}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Description (optional)"
        className="w-full border rounded px-2 py-1 text-sm"
      />
    </div>
  );
}

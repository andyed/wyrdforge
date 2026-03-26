import { useState, useEffect } from 'react';
import { useContentStore } from '../../stores/content-store.ts';
import { generateId } from '../../utils/ids.ts';
import { trackHomebrewCreated } from '../../utils/analytics.ts';
import { SKILLS, SKILL_LABELS } from '../../types/rules.ts';
import type { Skill } from '../../types/rules.ts';
import type { Background, AsiChoice } from '../../types/content.ts';
import { AsiPicker } from './AsiPicker.tsx';

interface Props {
  backgroundId: string | null; // null = creating new
  onClose: () => void;
}

export function BackgroundEditor({ backgroundId, onClose }: Props) {
  const existing = useContentStore((s) => backgroundId ? s.backgrounds[backgroundId] : null);
  const addBackground = useContentStore((s) => s.addBackground);
  const updateBackground = useContentStore((s) => s.updateBackground);
  const featsMap = useContentStore((s) => s.feats);
  const originFeats = Object.values(featsMap).filter((f) => f.category === 'origin');

  const [name, setName] = useState(existing?.name ?? '');
  const [skill1, setSkill1] = useState<Skill>(existing?.skillProficiencies[0] ?? 'athletics');
  const [skill2, setSkill2] = useState<Skill>(existing?.skillProficiencies[1] ?? 'perception');
  const [toolProficiency, setToolProficiency] = useState(existing?.toolProficiency ?? '');
  const [originFeatId, setOriginFeatId] = useState(existing?.originFeatId ?? originFeats[0]?.id ?? '');
  const [asi, setAsi] = useState<AsiChoice>(
    existing?.abilityScoreBonuses ?? { mode: 'three', abilities: ['strength', 'dexterity', 'constitution'] }
  );
  const [description, setDescription] = useState(existing?.description ?? '');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSkill1(existing.skillProficiencies[0]);
      setSkill2(existing.skillProficiencies[1]);
      setToolProficiency(existing.toolProficiency);
      setOriginFeatId(existing.originFeatId);
      setAsi(existing.abilityScoreBonuses);
      setDescription(existing.description);
    }
  }, [existing]);

  function handleSave() {
    if (!name.trim()) return;

    const bg: Background = {
      id: backgroundId ?? `bg-homebrew-${generateId()}`,
      source: 'homebrew',
      name: name.trim(),
      skillProficiencies: [skill1, skill2],
      toolProficiency: toolProficiency.trim(),
      originFeatId,
      abilityScoreBonuses: asi,
      description: description.trim(),
      equipment: [],
    };

    if (backgroundId) {
      updateBackground(backgroundId, bg);
    } else {
      addBackground(bg);
      trackHomebrewCreated('background', bg.name);
    }
    onClose();
  }

  return (
    <div className="bg-white rounded-lg border-2 border-purple-300 p-4 space-y-4">
      <h4 className="font-semibold">{backgroundId ? 'Edit' : 'New'} Background</h4>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Pirate Captain"
          className="w-full border rounded px-3 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Skill Proficiency 1</label>
          <select value={skill1} onChange={(e) => setSkill1(e.target.value as Skill)} className="w-full border rounded px-2 py-1.5 text-sm">
            {SKILLS.map((s) => (
              <option key={s} value={s} disabled={s === skill2}>{SKILL_LABELS[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Skill Proficiency 2</label>
          <select value={skill2} onChange={(e) => setSkill2(e.target.value as Skill)} className="w-full border rounded px-2 py-1.5 text-sm">
            {SKILLS.map((s) => (
              <option key={s} value={s} disabled={s === skill1}>{SKILL_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">Tool Proficiency</label>
        <input
          type="text"
          value={toolProficiency}
          onChange={(e) => setToolProficiency(e.target.value)}
          placeholder="e.g., Navigator's Tools"
          className="w-full border rounded px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">Origin Feat</label>
        <select value={originFeatId} onChange={(e) => setOriginFeatId(e.target.value)} className="w-full border rounded px-2 py-1.5 text-sm">
          {originFeats.map((f) => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">Ability Score Bonuses</label>
        <AsiPicker value={asi} onChange={setAsi} />
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Background story..."
          className="w-full border rounded px-3 py-1.5 text-sm min-h-[60px]"
        />
      </div>

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!name.trim()} className="px-4 py-1.5 rounded bg-green-700 text-white hover:bg-green-600 text-sm disabled:opacity-40">
          Save
        </button>
        <button onClick={onClose} className="px-4 py-1.5 rounded bg-stone-200 text-stone-700 hover:bg-stone-300 text-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}

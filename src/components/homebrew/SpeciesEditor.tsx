import { useState, useEffect } from 'react';
import { useContentStore } from '../../stores/content-store.ts';
import { generateId } from '../../utils/ids.ts';
import type { Species, Trait, AsiChoice } from '../../types/content.ts';
import type { Size } from '../../types/rules.ts';
import { AsiPicker } from './AsiPicker.tsx';

interface Props {
  speciesId: string | null;
  onClose: () => void;
}

export function SpeciesEditor({ speciesId, onClose }: Props) {
  const existing = useContentStore((s) => speciesId ? s.species[speciesId] : null);
  const addSpecies = useContentStore((s) => s.addSpecies);
  const updateSpecies = useContentStore((s) => s.updateSpecies);

  const [name, setName] = useState(existing?.name ?? '');
  const [size, setSize] = useState<Size>(
    existing ? (Array.isArray(existing.size) ? existing.size[0] : existing.size) : 'medium'
  );
  const [speed, setSpeed] = useState(existing?.speed ?? 30);
  const [traits, setTraits] = useState<Trait[]>(existing?.traits ?? []);
  const [languages, setLanguages] = useState(existing?.languages.join(', ') ?? 'Common');
  const [hasAsi, setHasAsi] = useState(!!existing?.abilityScoreBonuses);
  const [asi, setAsi] = useState<AsiChoice>(
    existing?.abilityScoreBonuses ?? { mode: 'three', abilities: ['strength', 'dexterity', 'constitution'] }
  );

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSize(Array.isArray(existing.size) ? existing.size[0] : existing.size);
      setSpeed(existing.speed);
      setTraits(existing.traits);
      setLanguages(existing.languages.join(', '));
      setHasAsi(!!existing.abilityScoreBonuses);
      if (existing.abilityScoreBonuses) setAsi(existing.abilityScoreBonuses);
    }
  }, [existing]);

  function addTrait() {
    setTraits([...traits, { id: `trait-${generateId()}`, name: '', description: '' }]);
  }

  function updateTrait(index: number, field: 'name' | 'description', value: string) {
    const updated = [...traits];
    updated[index] = { ...updated[index], [field]: value };
    setTraits(updated);
  }

  function removeTrait(index: number) {
    setTraits(traits.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!name.trim()) return;

    const sp: Species = {
      id: speciesId ?? `species-homebrew-${generateId()}`,
      source: 'homebrew',
      name: name.trim(),
      size,
      speed,
      traits: traits.filter((t) => t.name.trim()),
      languages: languages.split(',').map((l) => l.trim()).filter(Boolean),
      creatureType: 'Humanoid',
      ...(hasAsi ? { abilityScoreBonuses: asi } : {}),
    };

    if (speciesId) {
      updateSpecies(speciesId, sp);
    } else {
      addSpecies(sp);
    }
    onClose();
  }

  return (
    <div className="bg-white rounded-lg border-2 border-purple-300 p-4 space-y-4">
      <h4 className="font-semibold">{speciesId ? 'Edit' : 'New'} Species</h4>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-stone-600 mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Tiefling"
            className="w-full border rounded px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Size</label>
          <select value={size} onChange={(e) => setSize(e.target.value as Size)} className="w-full border rounded px-2 py-1.5 text-sm">
            <option value="tiny">Tiny</option>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Speed (ft)</label>
          <input
            type="number"
            min={5}
            max={60}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full border rounded px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">Languages (comma-separated)</label>
          <input
            type="text"
            value={languages}
            onChange={(e) => setLanguages(e.target.value)}
            placeholder="Common, Infernal"
            className="w-full border rounded px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* Racial bonuses toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasAsi"
          checked={hasAsi}
          onChange={(e) => setHasAsi(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="hasAsi" className="text-sm font-medium text-stone-600">
          Custom ability score bonuses (not standard in 2024 rules)
        </label>
      </div>

      {hasAsi && (
        <div className="pl-4 border-l-2 border-purple-200">
          <AsiPicker value={asi} onChange={setAsi} />
        </div>
      )}

      {/* Traits */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-stone-600">Racial Traits</label>
          <button onClick={addTrait} className="text-sm px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700">
            + Add Trait
          </button>
        </div>
        {traits.map((trait, i) => (
          <div key={trait.id} className="mb-2 p-3 bg-stone-50 rounded space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={trait.name}
                onChange={(e) => updateTrait(i, 'name', e.target.value)}
                placeholder="Trait name"
                className="flex-1 border rounded px-2 py-1 text-sm"
              />
              <button onClick={() => removeTrait(i)} className="text-red-500 text-sm px-2">Remove</button>
            </div>
            <textarea
              value={trait.description}
              onChange={(e) => updateTrait(i, 'description', e.target.value)}
              placeholder="Trait description..."
              className="w-full border rounded px-2 py-1 text-sm min-h-[40px]"
            />
          </div>
        ))}
        {traits.length === 0 && (
          <p className="text-xs text-stone-400">No traits added yet.</p>
        )}
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

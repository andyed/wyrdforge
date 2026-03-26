import { useState } from 'react';
import { useContentStore } from '../../stores/content-store.ts';
import { trackHomebrewImported } from '../../utils/analytics.ts';
import { BackgroundEditor } from './BackgroundEditor.tsx';
import { SpeciesEditor } from './SpeciesEditor.tsx';
import { SKILL_LABELS } from '../../types/rules.ts';
import type { HomebrewPack } from '../../types/homebrew.ts';

type Tab = 'backgrounds' | 'species';

export function HomebrewDashboard() {
  const [tab, setTab] = useState<Tab>('backgrounds');
  const [editingBg, setEditingBg] = useState<string | null>(null);
  const [editingSpecies, setEditingSpecies] = useState<string | null>(null);
  const [creatingBg, setCreatingBg] = useState(false);
  const [creatingSpecies, setCreatingSpecies] = useState(false);

  const backgroundsMap = useContentStore((s) => s.backgrounds);
  const speciesMap = useContentStore((s) => s.species);
  const homebrewBackgrounds = Object.values(backgroundsMap).filter((b) => b.source === 'homebrew');
  const homebrewSpecies = Object.values(speciesMap).filter((s) => s.source === 'homebrew');
  const removeBackground = useContentStore((s) => s.removeBackground);
  const removeSpecies = useContentStore((s) => s.removeSpecies);
  const exportHomebrew = useContentStore((s) => s.exportHomebrew);
  const importPack = useContentStore((s) => s.importPack);
  const feats = useContentStore((s) => s.feats);

  function handleExport() {
    const pack = exportHomebrew();
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'homebrew-pack.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const pack = JSON.parse(text) as HomebrewPack;
        if (pack.version !== 1) {
          alert('Unsupported homebrew pack version.');
          return;
        }
        const result = importPack(pack);
        if (result.added > 0) trackHomebrewImported(result.added);
        alert(`Imported ${result.added} items.${result.skipped.length > 0 ? `\nSkipped:\n${result.skipped.join('\n')}` : ''}`);
      } catch {
        alert('Failed to parse homebrew file.');
      }
    };
    input.click();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Homebrew Content</h2>
        <div className="flex gap-2">
          <button onClick={handleImport} className="text-sm px-3 py-1.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-700">
            Import JSON
          </button>
          <button onClick={handleExport} className="text-sm px-3 py-1.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-700">
            Export All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4">
        {(['backgrounds', 'species'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded text-sm font-medium capitalize ${
              tab === t ? 'bg-red-800 text-white' : 'bg-stone-200 text-stone-600'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Backgrounds tab */}
      {tab === 'backgrounds' && (
        <div>
          <button
            onClick={() => { setCreatingBg(true); setEditingBg(null); }}
            className="mb-4 px-4 py-2 rounded bg-red-700 text-white hover:bg-red-600 text-sm"
          >
            + New Background
          </button>

          {(creatingBg || editingBg) && (
            <div className="mb-4">
              <BackgroundEditor
                backgroundId={editingBg}
                onClose={() => { setCreatingBg(false); setEditingBg(null); }}
              />
            </div>
          )}

          {homebrewBackgrounds.length === 0 && !creatingBg && (
            <p className="text-stone-500 text-sm">No homebrew backgrounds yet. Create one above.</p>
          )}

          <div className="space-y-2">
            {homebrewBackgrounds.map((bg) => (
              <div key={bg.id} className="bg-white rounded-lg border border-stone-200 p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{bg.name}</div>
                  <div className="text-sm text-stone-500">
                    {bg.skillProficiencies.map((s) => SKILL_LABELS[s]).join(', ')}
                    {' · '}
                    {feats[bg.originFeatId]?.name ?? 'No feat'}
                  </div>
                </div>
                <button
                  onClick={() => { setEditingBg(bg.id); setCreatingBg(false); }}
                  className="text-sm px-3 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${bg.name}?`)) removeBackground(bg.id);
                  }}
                  className="text-sm px-3 py-1 rounded bg-stone-100 hover:bg-red-50 text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Species tab */}
      {tab === 'species' && (
        <div>
          <button
            onClick={() => { setCreatingSpecies(true); setEditingSpecies(null); }}
            className="mb-4 px-4 py-2 rounded bg-red-700 text-white hover:bg-red-600 text-sm"
          >
            + New Species
          </button>

          {(creatingSpecies || editingSpecies) && (
            <div className="mb-4">
              <SpeciesEditor
                speciesId={editingSpecies}
                onClose={() => { setCreatingSpecies(false); setEditingSpecies(null); }}
              />
            </div>
          )}

          {homebrewSpecies.length === 0 && !creatingSpecies && (
            <p className="text-stone-500 text-sm">No homebrew species yet. Create one above.</p>
          )}

          <div className="space-y-2">
            {homebrewSpecies.map((sp) => (
              <div key={sp.id} className="bg-white rounded-lg border border-stone-200 p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-semibold">{sp.name}</div>
                  <div className="text-sm text-stone-500">
                    Speed {sp.speed} ft · {Array.isArray(sp.size) ? sp.size.join('/') : sp.size}
                    {sp.abilityScoreBonuses && ' · Has racial bonuses'}
                  </div>
                </div>
                <button
                  onClick={() => { setEditingSpecies(sp.id); setCreatingSpecies(false); }}
                  className="text-sm px-3 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${sp.name}?`)) removeSpecies(sp.id);
                  }}
                  className="text-sm px-3 py-1 rounded bg-stone-100 hover:bg-red-50 text-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

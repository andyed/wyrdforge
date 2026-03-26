import type { Character } from '../../types/character.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useUIStore } from '../../stores/ui-store.ts';
import { useRovingFocus } from '../../hooks/useRovingFocus.ts';
import { trackCharacterExported, trackCharacterImported } from '../../utils/analytics.ts';

export function CharacterList() {
  const { containerRef, handleKeyDown } = useRovingFocus('vertical');
  const characterMap = useCharacterStore((s) => s.characters);
  const characters = Object.values(characterMap).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const setActive = useCharacterStore((s) => s.setActive);
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter);
  const duplicateCharacter = useCharacterStore((s) => s.duplicateCharacter);
  const createCharacter = useCharacterStore((s) => s.createCharacter);
  const updateCharacter = useCharacterStore((s) => s.updateCharacter);
  const { setView, setWizardStep } = useUIStore();
  const classes = useContentStore((s) => s.classes);
  const species = useContentStore((s) => s.species);

  function exportCharacter(char: Character) {
    const blob = new Blob([JSON.stringify(char, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(char.name || 'character').replace(/\s+/g, '-').toLowerCase()}.wyrdforge.json`;
    a.click();
    URL.revokeObjectURL(url);
    trackCharacterExported(char.name);
  }

  function importCharacter() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.multiple = true;
    input.onchange = async () => {
      if (!input.files) return;
      let imported = 0;
      for (const file of Array.from(input.files)) {
        try {
          const text = await file.text();
          const char = JSON.parse(text) as Character;
          if (!char.name && !char.classId) {
            alert(`${file.name} doesn't look like a WyrdForge character.`);
            continue;
          }
          // Create a new character and overwrite with imported data
          const now = new Date().toISOString();
          const newCharId = createCharacter();
          updateCharacter(newCharId, {
            ...char,
            id: newCharId,
            status: char.status ?? 'active',
            customActions: char.customActions ?? [],
            customFeatures: char.customFeatures ?? [],
            createdAt: now,
            updatedAt: now,
          });
          imported++;
        } catch {
          alert(`Failed to parse ${file.name}`);
        }
      }
      if (imported > 0) {
        trackCharacterImported(imported);
        alert(`Imported ${imported} character${imported > 1 ? 's' : ''}.`);
      }
    };
    input.click();
  }

  function handleOpen(id: string, status: 'draft' | 'active') {
    setActive(id);
    if (status === 'draft') {
      setWizardStep('species');
      setView('create');
    } else {
      setView('sheet');
    }
  }

  function handleNew() {
    createCharacter();
    setWizardStep('species');
    setView('create');
  }

  if (characters.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-stone-700 mb-2">No Characters Yet</h2>
        <p className="text-stone-500 mb-6">Create your first character to get started.</p>
        <button
          onClick={handleNew}
          className="bg-red-700 hover:bg-red-600 text-white px-6 py-2 rounded font-medium"
        >
          Create Character
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Your Characters</h2>
        <button
          onClick={importCharacter}
          className="text-sm px-3 py-1.5 rounded bg-stone-200 hover:bg-stone-300 text-stone-700"
        >
          Import Character
        </button>
      </div>
      <div className="grid gap-3" ref={containerRef} onKeyDown={handleKeyDown} role="listbox" aria-label="Characters">
        {characters.map((char, i) => {
          const cls = classes[char.classId];
          const sp = species[char.speciesId];
          return (
            <div
              key={char.id}
              data-roving-item
              tabIndex={i === 0 ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleOpen(char.id, char.status);
                }
              }}
              className="bg-white rounded-lg shadow-sm border border-stone-200 p-4 flex items-center gap-4
                focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-stone-800 truncate">
                  {char.name || 'Unnamed Character'}
                </div>
                <div className="text-sm text-stone-500">
                  {sp?.name ?? '—'} {cls?.name ?? '—'} · Level {char.level}
                  {char.status === 'draft' && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Draft</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpen(char.id, char.status)}
                  className="text-sm px-3 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  {char.status === 'draft' ? 'Continue' : 'Open'}
                </button>
                <button
                  onClick={() => exportCharacter(char)}
                  className="text-sm px-3 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-500"
                >
                  Export
                </button>
                <button
                  onClick={() => duplicateCharacter(char.id)}
                  className="text-sm px-3 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-500"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${char.name || 'this character'}?`)) {
                      deleteCharacter(char.id);
                    }
                  }}
                  className="text-sm px-3 py-1 rounded bg-stone-100 hover:bg-red-50 text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useCharacterStore } from '../../stores/character-store.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useUIStore } from '../../stores/ui-store.ts';
import { useRovingFocus } from '../../hooks/useRovingFocus.ts';

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
  const { setView, setWizardStep } = useUIStore();
  const classes = useContentStore((s) => s.classes);
  const species = useContentStore((s) => s.species);

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
      <h2 className="text-xl font-bold mb-4">Your Characters</h2>
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

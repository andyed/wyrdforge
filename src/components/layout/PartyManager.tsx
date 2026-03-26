import { useState, useEffect } from 'react';
import { usePartyStore } from '../../stores/party-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { useContentStore } from '../../stores/content-store.ts';

interface PartyManagerProps {
  editingPartyId: string | null;
  onClose: () => void;
}

export function PartyManager({ editingPartyId, onClose }: PartyManagerProps) {
  const parties = usePartyStore((s) => s.parties);
  const createParty = usePartyStore((s) => s.createParty);
  const updateParty = usePartyStore((s) => s.updateParty);
  const addToParty = usePartyStore((s) => s.addToParty);
  const removeFromParty = usePartyStore((s) => s.removeFromParty);
  const characters = useCharacterStore((s) => s.characters);
  const classes = useContentStore((s) => s.classes);
  const species = useContentStore((s) => s.species);

  const existingParty = editingPartyId ? parties[editingPartyId] : null;

  const [partyName, setPartyName] = useState(existingParty?.name ?? '');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(existingParty?.characterIds ?? [])
  );

  // Sync if the store changes while open (e.g. after addToParty persists)
  useEffect(() => {
    if (existingParty) {
      setSelectedIds(new Set(existingParty.characterIds));
    }
  }, [existingParty?.characterIds.length]);

  const characterList = Object.values(characters).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  function toggleCharacter(charId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(charId)) {
        next.delete(charId);
      } else {
        next.add(charId);
      }
      return next;
    });
  }

  function handleSave() {
    const trimmedName = partyName.trim();
    if (!trimmedName) return;

    if (editingPartyId && existingParty) {
      // Update existing party
      updateParty(editingPartyId, { name: trimmedName });

      // Reconcile membership: add new, remove old
      const currentIds = new Set(existingParty.characterIds);
      for (const id of selectedIds) {
        if (!currentIds.has(id)) {
          addToParty(editingPartyId, id);
        }
      }
      for (const id of currentIds) {
        if (!selectedIds.has(id)) {
          removeFromParty(editingPartyId, id);
        }
      }
    } else {
      // Create new party, then add members
      const newId = createParty(trimmedName);
      for (const charId of selectedIds) {
        addToParty(newId, charId);
      }
    }

    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-stone-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-stone-700">
          <h2 className="text-xl font-bold text-stone-100">
            {editingPartyId ? 'Edit Party' : 'Create Party'}
          </h2>
        </div>

        {/* Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Party name input */}
          <div>
            <label htmlFor="party-name" className="block text-sm font-medium text-stone-300 mb-1">
              Party Name
            </label>
            <input
              id="party-name"
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g. The Silver Blades"
              autoFocus
              className="w-full px-3 py-2 rounded bg-stone-800 border border-stone-600
                text-stone-100 placeholder-stone-500
                focus:outline-none focus:ring-2 focus:ring-red-700 focus:border-red-700"
            />
          </div>

          {/* Character selection */}
          <div>
            <p className="text-sm font-medium text-stone-300 mb-2">
              Members ({selectedIds.size} selected)
            </p>
            {characterList.length === 0 ? (
              <p className="text-stone-500 text-sm">No characters to add. Create some first.</p>
            ) : (
              <div className="space-y-1">
                {characterList.map((char) => {
                  const cls = classes[char.classId];
                  const sp = species[char.speciesId];
                  const checked = selectedIds.has(char.id);

                  return (
                    <label
                      key={char.id}
                      className={`flex items-center gap-3 p-2.5 rounded cursor-pointer transition-colors
                        ${checked ? 'bg-stone-700' : 'bg-stone-800 hover:bg-stone-750'}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCharacter(char.id)}
                        className="w-4 h-4 rounded border-stone-500 text-red-700 focus:ring-red-700 bg-stone-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-stone-100 text-sm font-medium truncate">
                          {char.name || 'Unnamed Character'}
                        </div>
                        <div className="text-stone-400 text-xs">
                          {sp?.name ?? '—'} {cls?.name ?? '—'} · Level {char.level}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-stone-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-sm font-medium text-stone-300 bg-stone-700 hover:bg-stone-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!partyName.trim()}
            className="px-4 py-2 rounded text-sm font-medium text-white bg-red-700 hover:bg-red-600
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {editingPartyId ? 'Save Changes' : 'Create Party'}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { usePartyStore } from '../../stores/party-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { useUIStore } from '../../stores/ui-store.ts';
import { CharacterList } from './CharacterList.tsx';
import { PartyManager } from './PartyManager.tsx';

export function LandingPage() {
  const parties = usePartyStore((s) => s.parties);
  const activePartyId = usePartyStore((s) => s.activePartyId);
  const setActiveParty = usePartyStore((s) => s.setActiveParty);
  const deleteParty = usePartyStore((s) => s.deleteParty);
  const characters = useCharacterStore((s) => s.characters);
  const classes = useContentStore((s) => s.classes);
  const setView = useUIStore((s) => s.setView);

  const [showPartyManager, setShowPartyManager] = useState(false);
  const [editingPartyId, setEditingPartyId] = useState<string | null>(null);

  const partyList = Object.values(parties).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  function handlePartyClick(partyId: string) {
    setActiveParty(partyId);
  }

  function handlePartyKeyDown(e: React.KeyboardEvent, partyId: string) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handlePartyClick(partyId);
    }
  }

  function handleEditParty(e: React.MouseEvent, partyId: string) {
    e.stopPropagation();
    setEditingPartyId(partyId);
    setShowPartyManager(true);
  }

  function handleDeleteParty(e: React.MouseEvent, partyId: string, partyName: string) {
    e.stopPropagation();
    if (confirm(`Delete party "${partyName}"?`)) {
      deleteParty(partyId);
    }
  }

  function handleCreateParty() {
    setEditingPartyId(null);
    setShowPartyManager(true);
  }

  function handleCloseManager() {
    setShowPartyManager(false);
    setEditingPartyId(null);
  }

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-8 mb-6">
        <h1 className="text-4xl font-bold">
          <span className="wyrd-text">Wyrd</span>
          <span className="text-stone-700">Forge</span>
        </h1>
        <p className="text-stone-500 mt-2">D&amp;D 2024 Character Manager</p>
      </div>

      {/* Parties Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-stone-800">Parties</h2>
          <button
            onClick={handleCreateParty}
            className="bg-red-700 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm font-medium"
          >
            Create Party
          </button>
        </div>

        {partyList.length === 0 ? (
          <p className="text-stone-500 text-sm">
            No parties yet. Create one to group your characters together.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partyList.map((party) => {
              const isActive = party.id === activePartyId;
              const memberChars = party.characterIds
                .map((cid) => characters[cid])
                .filter(Boolean);

              return (
                <div
                  key={party.id}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isActive}
                  onClick={() => handlePartyClick(party.id)}
                  onKeyDown={(e) => handlePartyKeyDown(e, party.id)}
                  className={`forge-metal rounded-lg p-4 cursor-pointer transition-all
                    focus:outline-none focus:ring-2 focus:ring-red-700
                    ${isActive ? 'ring-2 ring-red-700' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold wyrd-text text-lg truncate">
                      {party.name}
                    </h3>
                    {isActive && (
                      <span className="text-xs bg-red-700 text-white px-1.5 py-0.5 rounded ml-2 shrink-0">
                        Active
                      </span>
                    )}
                  </div>

                  <p className="text-stone-400 text-sm mb-2">
                    {memberChars.length} member{memberChars.length !== 1 ? 's' : ''}
                  </p>

                  {memberChars.length > 0 && (
                    <ul className="text-sm text-stone-300 space-y-0.5">
                      {memberChars.slice(0, 5).map((char) => {
                        const cls = classes[char.classId];
                        return (
                          <li key={char.id} className="truncate">
                            {char.name || 'Unnamed'} — {cls?.name ?? '—'} {char.level}
                          </li>
                        );
                      })}
                      {memberChars.length > 5 && (
                        <li className="text-stone-500">+{memberChars.length - 5} more</li>
                      )}
                    </ul>
                  )}

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={(e) => handleEditParty(e, party.id)}
                      className="text-xs px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDeleteParty(e, party.id, party.name)}
                      className="text-xs px-2 py-1 rounded bg-stone-700 hover:bg-red-900 text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Character List */}
      <CharacterList />

      {/* Party Manager Modal */}
      {showPartyManager && (
        <PartyManager
          editingPartyId={editingPartyId}
          onClose={handleCloseManager}
        />
      )}
    </div>
  );
}

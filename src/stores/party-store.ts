import { create } from 'zustand';
import type { Party, LevelSnapshot } from '../types/play.ts';
import type { Character } from '../types/character.ts';
import { generateId } from '../utils/ids.ts';
import { saveToStorage, loadFromStorage } from '../utils/persistence.ts';

const STORAGE_KEY = 'wyrdforge-parties';
const MAX_SNAPSHOTS_PER_CHARACTER = 10;

interface PartyState {
  parties: Record<string, Party>;
  activePartyId: string | null;
  characterSnapshots: Record<string, LevelSnapshot[]>;

  createParty: (name: string) => string;
  updateParty: (id: string, patch: Partial<Party>) => void;
  deleteParty: (id: string) => void;
  addToParty: (partyId: string, characterId: string) => void;
  removeFromParty: (partyId: string, characterId: string) => void;
  setActiveParty: (id: string | null) => void;

  snapshotCharacter: (characterId: string, character: Character) => void;
  getSnapshots: (characterId: string) => LevelSnapshot[];
}

export const usePartyStore = create<PartyState>((set, get) => {
  const saved = loadFromStorage<{
    parties: Record<string, Party>;
    activePartyId: string | null;
    characterSnapshots: Record<string, LevelSnapshot[]>;
  }>(STORAGE_KEY);

  function persist() {
    const state = get();
    saveToStorage(STORAGE_KEY, {
      parties: state.parties,
      activePartyId: state.activePartyId,
      characterSnapshots: state.characterSnapshots,
    });
  }

  return {
    parties: saved?.parties ?? {},
    activePartyId: saved?.activePartyId ?? null,
    characterSnapshots: saved?.characterSnapshots ?? {},

    createParty: (name) => {
      const now = new Date().toISOString();
      const party: Party = {
        id: generateId(),
        name,
        characterIds: [],
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({
        parties: { ...state.parties, [party.id]: party },
        activePartyId: party.id,
      }));
      persist();
      return party.id;
    },

    updateParty: (id, patch) => {
      set((state) => {
        const existing = state.parties[id];
        if (!existing) return state;
        return {
          parties: {
            ...state.parties,
            [id]: { ...existing, ...patch, updatedAt: new Date().toISOString() },
          },
        };
      });
      persist();
    },

    deleteParty: (id) => {
      set((state) => {
        const { [id]: _, ...rest } = state.parties;
        return {
          parties: rest,
          activePartyId: state.activePartyId === id ? null : state.activePartyId,
        };
      });
      persist();
    },

    addToParty: (partyId, characterId) => {
      set((state) => {
        const party = state.parties[partyId];
        if (!party || party.characterIds.includes(characterId)) return state;
        return {
          parties: {
            ...state.parties,
            [partyId]: {
              ...party,
              characterIds: [...party.characterIds, characterId],
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
      persist();
    },

    removeFromParty: (partyId, characterId) => {
      set((state) => {
        const party = state.parties[partyId];
        if (!party) return state;
        return {
          parties: {
            ...state.parties,
            [partyId]: {
              ...party,
              characterIds: party.characterIds.filter((id) => id !== characterId),
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
      persist();
    },

    setActiveParty: (id) => {
      set({ activePartyId: id });
      persist();
    },

    snapshotCharacter: (characterId, character) => {
      set((state) => {
        const existing = state.characterSnapshots[characterId] ?? [];
        // Don't duplicate snapshots for the same level
        if (existing.some((s) => s.level === character.level)) return state;
        const snapshot: LevelSnapshot = {
          level: character.level,
          snapshotAt: new Date().toISOString(),
          character: structuredClone(character),
        };
        const updated = [...existing, snapshot].slice(-MAX_SNAPSHOTS_PER_CHARACTER);
        return {
          characterSnapshots: { ...state.characterSnapshots, [characterId]: updated },
        };
      });
      persist();
    },

    getSnapshots: (characterId) => get().characterSnapshots[characterId] ?? [],
  };
});

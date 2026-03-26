import { create } from 'zustand';
import type { Character } from '../types/character.ts';
import { generateId } from '../utils/ids.ts';
import { saveToStorage, loadFromStorage } from '../utils/persistence.ts';

const STORAGE_KEY = 'dnd2024-characters';

interface CharacterState {
  characters: Record<string, Character>;
  activeCharacterId: string | null;

  // CRUD
  createCharacter: () => string;
  updateCharacter: (id: string, patch: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  duplicateCharacter: (id: string) => string | null;
  setActive: (id: string | null) => void;

  // Queries
  activeCharacter: () => Character | null;
  getCharacter: (id: string) => Character | null;
  getCharacterList: () => Character[];
}

function makeDefaultCharacter(): Character {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    status: 'draft',
    name: '',
    level: 1,
    speciesId: '',
    backgroundId: '',
    classId: '',
    subclass: '',
    baseAbilityScores: { strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
    backgroundAsi: { mode: 'three', abilities: ['strength', 'dexterity', 'constitution'] },
    hitPoints: { max: 0, current: 0, temp: 0 },
    deathSaves: { successes: 0, failures: 0 },
    skillProficiencies: [],
    skillExpertise: [],
    toolProficiencies: [],
    languages: ['Common'],
    armorProficiencies: [],
    weaponProficiencies: [],
    savingThrowProficiencies: [],
    featIds: [],
    weaponMasteries: [],
    spellsKnown: [],
    spellsPrepared: [],
    spellSlotsUsed: [],
    equipment: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    customActions: [],
    customFeatures: [],
    notes: {
      personalityTraits: '',
      ideals: '',
      bonds: '',
      flaws: '',
      backstory: '',
      freeform: '',
    },
    createdAt: now,
    updatedAt: now,
  };
}

export const useCharacterStore = create<CharacterState>((set, get) => {
  const saved = loadFromStorage<{
    characters: Record<string, Character>;
    activeCharacterId: string | null;
  }>(STORAGE_KEY);

  return {
    characters: saved?.characters ?? {},
    activeCharacterId: saved?.activeCharacterId ?? null,

    createCharacter: () => {
      const char = makeDefaultCharacter();
      set((state) => ({
        characters: { ...state.characters, [char.id]: char },
        activeCharacterId: char.id,
      }));
      persist(get);
      return char.id;
    },

    updateCharacter: (id, patch) => {
      set((state) => {
        const existing = state.characters[id];
        if (!existing) return state;
        return {
          characters: {
            ...state.characters,
            [id]: { ...existing, ...patch, updatedAt: new Date().toISOString() },
          },
        };
      });
      persist(get);
    },

    deleteCharacter: (id) => {
      set((state) => {
        const { [id]: _, ...rest } = state.characters;
        return {
          characters: rest,
          activeCharacterId: state.activeCharacterId === id ? null : state.activeCharacterId,
        };
      });
      persist(get);
    },

    duplicateCharacter: (id) => {
      const original = get().characters[id];
      if (!original) return null;
      const newChar: Character = {
        ...original,
        id: generateId(),
        name: `${original.name} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({
        characters: { ...state.characters, [newChar.id]: newChar },
        activeCharacterId: newChar.id,
      }));
      persist(get);
      return newChar.id;
    },

    setActive: (id) => {
      set({ activeCharacterId: id });
      persist(get);
    },

    activeCharacter: () => {
      const state = get();
      if (!state.activeCharacterId) return null;
      return state.characters[state.activeCharacterId] ?? null;
    },

    getCharacter: (id) => get().characters[id] ?? null,

    getCharacterList: () =>
      Object.values(get().characters).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ),
  };
});

function persist(get: () => CharacterState) {
  const state = get();
  saveToStorage(STORAGE_KEY, {
    characters: state.characters,
    activeCharacterId: state.activeCharacterId,
  });
}

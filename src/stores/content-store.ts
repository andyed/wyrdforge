import { create } from 'zustand';
import type { Species, Background, ClassDef, Feat, Spell, Weapon, Armor } from '../types/content.ts';
import type { ContentSource } from '../types/rules.ts';
import type { HomebrewPack } from '../types/homebrew.ts';
import { srdSpecies } from '../data/srd-species.ts';
import { srdBackgrounds } from '../data/srd-backgrounds.ts';
import { srdClasses } from '../data/srd-classes.ts';
import { srdFeats } from '../data/srd-feats.ts';
import { srdSpells } from '../data/srd-spells.ts';
import { srdWeapons, srdArmor } from '../data/srd-equipment.ts';
import { saveToStorage, loadFromStorage } from '../utils/persistence.ts';

const STORAGE_KEY = 'dnd2024-content';

interface ContentState {
  species: Record<string, Species>;
  backgrounds: Record<string, Background>;
  classes: Record<string, ClassDef>;
  feats: Record<string, Feat>;
  spells: Record<string, Spell>;
  weapons: Record<string, Weapon>;
  armor: Record<string, Armor>;

  // Actions
  addSpecies: (s: Species) => void;
  updateSpecies: (id: string, s: Species) => void;
  removeSpecies: (id: string) => void;
  addBackground: (b: Background) => void;
  updateBackground: (id: string, b: Background) => void;
  removeBackground: (id: string) => void;
  addFeat: (f: Feat) => void;

  // Queries
  getSpeciesList: (source?: ContentSource) => Species[];
  getBackgroundsList: (source?: ContentSource) => Background[];
  getClassesList: () => ClassDef[];
  getOriginFeats: () => Feat[];
  getFeatById: (id: string) => Feat | undefined;
  getSpellsByList: (list: string, maxLevel: number) => Spell[];
  getWeaponsList: () => Weapon[];
  getArmorList: () => Armor[];

  // Import/Export
  importPack: (pack: HomebrewPack) => { added: number; skipped: string[] };
  exportHomebrew: () => HomebrewPack;

  // Persistence
  _persist: () => void;
}

function toRecord<T extends { id: string }>(items: T[]): Record<string, T> {
  const record: Record<string, T> = {};
  for (const item of items) {
    record[item.id] = item;
  }
  return record;
}

function loadInitialContent() {
  const saved = loadFromStorage<{
    species: Record<string, Species>;
    backgrounds: Record<string, Background>;
    feats: Record<string, Feat>;
  }>(STORAGE_KEY);

  const species = { ...toRecord(srdSpecies) };
  const backgrounds = { ...toRecord(srdBackgrounds) };
  const feats = { ...toRecord(srdFeats) };

  // Merge saved homebrew content on top of SRD
  if (saved) {
    for (const [id, s] of Object.entries(saved.species)) {
      if (s.source === 'homebrew') species[id] = s;
    }
    for (const [id, b] of Object.entries(saved.backgrounds)) {
      if (b.source === 'homebrew') backgrounds[id] = b;
    }
    for (const [id, f] of Object.entries(saved.feats)) {
      if (f.source === 'homebrew') feats[id] = f;
    }
  }

  return { species, backgrounds, feats };
}

export const useContentStore = create<ContentState>((set, get) => {
  const initial = loadInitialContent();

  return {
    species: initial.species,
    backgrounds: initial.backgrounds,
    classes: toRecord(srdClasses),
    feats: initial.feats,
    spells: toRecord(srdSpells),
    weapons: toRecord(srdWeapons),
    armor: toRecord(srdArmor),

    addSpecies: (s) => {
      set((state) => ({ species: { ...state.species, [s.id]: s } }));
      get()._persist();
    },
    updateSpecies: (id, s) => {
      set((state) => ({ species: { ...state.species, [id]: s } }));
      get()._persist();
    },
    removeSpecies: (id) => {
      set((state) => {
        const { [id]: _, ...rest } = state.species;
        return { species: rest };
      });
      get()._persist();
    },

    addBackground: (b) => {
      set((state) => ({ backgrounds: { ...state.backgrounds, [b.id]: b } }));
      get()._persist();
    },
    updateBackground: (id, b) => {
      set((state) => ({ backgrounds: { ...state.backgrounds, [id]: b } }));
      get()._persist();
    },
    removeBackground: (id) => {
      set((state) => {
        const { [id]: _, ...rest } = state.backgrounds;
        return { backgrounds: rest };
      });
      get()._persist();
    },

    addFeat: (f) => {
      set((state) => ({ feats: { ...state.feats, [f.id]: f } }));
      get()._persist();
    },

    getSpeciesList: (source?) => {
      const all = Object.values(get().species);
      return source ? all.filter((s) => s.source === source) : all;
    },
    getBackgroundsList: (source?) => {
      const all = Object.values(get().backgrounds);
      return source ? all.filter((b) => b.source === source) : all;
    },
    getClassesList: () => Object.values(get().classes),
    getOriginFeats: () => Object.values(get().feats).filter((f) => f.category === 'origin'),
    getFeatById: (id) => get().feats[id],
    getSpellsByList: (list, maxLevel) =>
      Object.values(get().spells).filter((s) => s.lists.includes(list as 'arcane' | 'divine' | 'primal') && s.level <= maxLevel),
    getWeaponsList: () => Object.values(get().weapons),
    getArmorList: () => Object.values(get().armor),

    importPack: (pack) => {
      let added = 0;
      const skipped: string[] = [];
      const state = get();

      const newSpecies = { ...state.species };
      const newBackgrounds = { ...state.backgrounds };
      const newFeats = { ...state.feats };

      for (const s of pack.species) {
        if (newSpecies[s.id] && newSpecies[s.id].source === 'srd') {
          skipped.push(`Species: ${s.name} (conflicts with SRD)`);
        } else {
          newSpecies[s.id] = { ...s, source: 'homebrew' };
          added++;
        }
      }
      for (const b of pack.backgrounds) {
        if (newBackgrounds[b.id] && newBackgrounds[b.id].source === 'srd') {
          skipped.push(`Background: ${b.name} (conflicts with SRD)`);
        } else {
          newBackgrounds[b.id] = { ...b, source: 'homebrew' };
          added++;
        }
      }
      for (const f of pack.feats) {
        if (newFeats[f.id] && newFeats[f.id].source === 'srd') {
          skipped.push(`Feat: ${f.name} (conflicts with SRD)`);
        } else {
          newFeats[f.id] = { ...f, source: 'homebrew' };
          added++;
        }
      }

      set({ species: newSpecies, backgrounds: newBackgrounds, feats: newFeats });
      get()._persist();
      return { added, skipped };
    },

    exportHomebrew: () => {
      const state = get();
      return {
        version: 1,
        name: 'My Homebrew',
        exportedAt: new Date().toISOString(),
        species: Object.values(state.species).filter((s) => s.source === 'homebrew'),
        backgrounds: Object.values(state.backgrounds).filter((b) => b.source === 'homebrew'),
        feats: Object.values(state.feats).filter((f) => f.source === 'homebrew'),
      };
    },

    _persist: () => {
      const state = get();
      saveToStorage(STORAGE_KEY, {
        species: state.species,
        backgrounds: state.backgrounds,
        feats: state.feats,
      });
    },
  };
});

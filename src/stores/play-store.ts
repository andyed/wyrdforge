import { create } from 'zustand';
import type { DiceGroup, DieRollResult, RollConfig, RollType, AdvantageMode } from '../types/play.ts';
import { rollDie, rollDice } from '../utils/dice.ts';
import { generateId } from '../utils/ids.ts';
import { saveToStorage, loadFromStorage } from '../utils/persistence.ts';
import { trackDiceRoll, trackFavoriteRollSaved } from '../utils/analytics.ts';

const FAVORITES_KEY = 'wyrdforge-favorites';
const SETTINGS_KEY = 'wyrdforge-play-settings';
const MAX_HISTORY = 50;

interface PlayState {
  currentRoll: DieRollResult | null;
  isRolling: boolean;
  rollHistory: DieRollResult[];

  advantageMode: AdvantageMode;

  tempBonusDice: DiceGroup[];
  tempBonusFlat: number;

  favoriteRolls: Record<string, RollConfig[]>;
  soundEnabled: boolean;

  // Actions
  executeRoll: (config: {
    label: string;
    characterId: string;
    rollType: RollType;
    dice: DiceGroup[];
    flatModifier: number;
  }) => void;
  quickRoll: (label: string, characterId: string, rollType: RollType, modifier: number) => void;
  setAdvantageMode: (mode: AdvantageMode) => void;
  setTempBonusDice: (dice: DiceGroup[]) => void;
  setTempBonusFlat: (flat: number) => void;
  clearTempBonuses: () => void;
  addFavoriteRoll: (config: RollConfig) => void;
  removeFavoriteRoll: (characterId: string, rollId: string) => void;
  clearHistory: () => void;
  toggleSound: () => void;
  finishRolling: () => void;
}

function buildRollResult(
  config: { label: string; characterId: string; rollType: RollType; dice: DiceGroup[]; flatModifier: number },
  advantageMode: AdvantageMode,
  tempBonusDice: DiceGroup[],
  tempBonusFlat: number,
): DieRollResult {
  const hasD20 = config.dice.some((d) => d.sides === 20);
  let diceResults = rollDice(config.dice);
  let d20Results: [number, number] | undefined;
  let usedD20: number | undefined;

  // Handle advantage/disadvantage for d20 rolls
  if (hasD20 && advantageMode !== 'normal') {
    const d20_1 = rollDie(20);
    const d20_2 = rollDie(20);
    d20Results = [d20_1, d20_2];
    usedD20 = advantageMode === 'advantage' ? Math.max(d20_1, d20_2) : Math.min(d20_1, d20_2);

    // Replace the first d20 result with the chosen one
    const d20Index = diceResults.findIndex((d) => d.sides === 20);
    if (d20Index >= 0) {
      diceResults[d20Index] = { sides: 20, value: usedD20 };
    }
  }

  // Roll temp bonus dice
  const tempDiceResults = tempBonusDice.length > 0 ? rollDice(tempBonusDice) : [];

  const allDice = [...diceResults, ...tempDiceResults];
  const diceTotal = allDice.reduce((sum, d) => sum + d.value, 0);
  const total = diceTotal + config.flatModifier + tempBonusFlat;

  // Check for crits (based on the d20 that was actually used)
  const effectiveD20 = usedD20 ?? diceResults.find((d) => d.sides === 20)?.value;
  const isCriticalHit = effectiveD20 === 20;
  const isCriticalFail = effectiveD20 === 1;

  return {
    id: generateId(),
    characterId: config.characterId,
    label: config.label,
    rollType: config.rollType,
    dice: allDice,
    flatModifier: config.flatModifier,
    total,
    advantage: advantageMode !== 'normal' ? advantageMode : undefined,
    d20Results,
    usedD20,
    isCriticalHit,
    isCriticalFail,
    timestamp: new Date().toISOString(),
    temporaryBonusDice: tempBonusDice.length > 0 ? tempBonusDice : undefined,
    temporaryBonusFlat: tempBonusFlat !== 0 ? tempBonusFlat : undefined,
  };
}

export const usePlayStore = create<PlayState>((set, get) => {
  const savedFavorites = loadFromStorage<Record<string, RollConfig[]>>(FAVORITES_KEY);
  const savedSettings = loadFromStorage<{ soundEnabled: boolean }>(SETTINGS_KEY);

  return {
    currentRoll: null,
    isRolling: false,
    rollHistory: [],

    advantageMode: 'normal',

    tempBonusDice: [],
    tempBonusFlat: 0,

    favoriteRolls: savedFavorites ?? {},
    soundEnabled: savedSettings?.soundEnabled ?? true,

    executeRoll: (config) => {
      const state = get();
      const result = buildRollResult(config, state.advantageMode, state.tempBonusDice, state.tempBonusFlat);

      set({
        currentRoll: result,
        isRolling: true,
        rollHistory: [result, ...state.rollHistory].slice(0, MAX_HISTORY),
      });

      trackDiceRoll(config.rollType, config.label, result.total, result.isCriticalHit, result.isCriticalFail, result.advantage);
    },

    quickRoll: (label, characterId, rollType, modifier) => {
      get().executeRoll({
        label,
        characterId,
        rollType,
        dice: [{ count: 1, sides: 20 }],
        flatModifier: modifier,
      });
    },

    finishRolling: () => set({ isRolling: false }),

    setAdvantageMode: (mode) => set({ advantageMode: mode }),

    setTempBonusDice: (dice) => set({ tempBonusDice: dice }),
    setTempBonusFlat: (flat) => set({ tempBonusFlat: isFinite(flat) ? flat : 0 }),
    clearTempBonuses: () => set({ tempBonusDice: [], tempBonusFlat: 0 }),

    addFavoriteRoll: (config) => {
      trackFavoriteRollSaved(config.label);
      set((state) => {
        const charFavs = state.favoriteRolls[config.characterId] ?? [];
        const updated = {
          ...state.favoriteRolls,
          [config.characterId]: [...charFavs, config],
        };
        saveToStorage(FAVORITES_KEY, updated);
        return { favoriteRolls: updated };
      });
    },

    removeFavoriteRoll: (characterId, rollId) => {
      set((state) => {
        const charFavs = (state.favoriteRolls[characterId] ?? []).filter((r) => r.id !== rollId);
        const updated = { ...state.favoriteRolls, [characterId]: charFavs };
        saveToStorage(FAVORITES_KEY, updated);
        return { favoriteRolls: updated };
      });
    },

    clearHistory: () => set({ rollHistory: [], currentRoll: null }),

    toggleSound: () => {
      set((state) => {
        const soundEnabled = !state.soundEnabled;
        saveToStorage(SETTINGS_KEY, { soundEnabled });
        return { soundEnabled };
      });
    },
  };
});

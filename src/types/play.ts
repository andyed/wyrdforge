import type { Character } from './character.ts';

export interface DiceGroup {
  count: number;
  sides: number;
}

export interface DieResult {
  sides: number;
  value: number;
}

export type RollType = 'attack' | 'save' | 'skill' | 'damage' | 'ability' | 'initiative' | 'custom';

export interface RollConfig {
  id: string;
  characterId: string;
  label: string;
  dice: DiceGroup[];
  flatModifier: number;
  rollType: RollType;
  linkedDamageConfig?: {
    label: string;
    dice: DiceGroup[];
    flatModifier: number;
  };
}

export interface DieRollResult {
  id: string;
  characterId: string;
  label: string;
  rollType: RollType;
  dice: DieResult[];
  flatModifier: number;
  total: number;
  advantage?: 'advantage' | 'disadvantage';
  d20Results?: [number, number];
  usedD20?: number;
  isCriticalHit: boolean;
  isCriticalFail: boolean;
  timestamp: string;
  temporaryBonusDice?: DiceGroup[];
  temporaryBonusFlat?: number;
}

export type AdvantageMode = 'normal' | 'advantage' | 'disadvantage';

export interface Party {
  id: string;
  name: string;
  characterIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LevelSnapshot {
  level: number;
  snapshotAt: string;
  character: Character;
}

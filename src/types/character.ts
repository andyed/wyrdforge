import type { Ability, Skill, WeaponMastery } from './rules.ts';
import type { AsiChoice } from './content.ts';
import type { DiceGroup, RollType } from './play.ts';

/** User-defined rollable action (attack, spell, feature, etc.) */
export interface CustomAction {
  id: string;
  name: string;
  rollType: RollType;
  dice: DiceGroup[];
  flatModifier: number;
  description?: string;
  linkedDamage?: {
    dice: DiceGroup[];
    flatModifier: number;
    damageType?: string;
  };
}

/** A feature gained at a specific level */
export interface LevelFeature {
  level: number;
  name: string;
  description: string;
}

export interface AbilityScores {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  equipped: boolean;
  notes?: string;
}

export interface CharacterNotes {
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  backstory: string;
  freeform: string;
}

export interface Character {
  id: string;
  status: 'draft' | 'active';
  name: string;
  level: number;

  speciesId: string;
  backgroundId: string;
  classId: string;
  subclass: string;

  baseAbilityScores: AbilityScores;
  backgroundAsi: AsiChoice;
  speciesAsi?: AsiChoice;

  hitPoints: {
    max: number;
    current: number;
    temp: number;
  };
  deathSaves: {
    successes: number;
    failures: number;
  };

  skillProficiencies: Skill[];
  skillExpertise: Skill[];
  toolProficiencies: string[];
  languages: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];

  savingThrowProficiencies: Ability[];

  featIds: string[];
  weaponMasteries: WeaponMastery[];

  spellsKnown: string[];
  spellsPrepared: string[];
  spellSlotsUsed: number[];

  equipment: EquipmentItem[];
  currency: { cp: number; sp: number; ep: number; gp: number; pp: number };

  customActions: CustomAction[];
  customFeatures: LevelFeature[];

  notes: CharacterNotes;

  createdAt: string;
  updatedAt: string;
}

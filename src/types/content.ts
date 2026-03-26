import type { Ability, ContentSource, Size, Skill, SpellList, WeaponMastery } from './rules.ts';

export type AsiChoice =
  | { mode: 'two'; plus2: Ability; plus1: Ability }
  | { mode: 'three'; abilities: [Ability, Ability, Ability] };

export interface Trait {
  id: string;
  name: string;
  description: string;
}

export interface Species {
  id: string;
  source: ContentSource;
  name: string;
  size: Size | [Size, Size]; // some species can be small or medium
  speed: number;
  traits: Trait[];
  languages: string[];
  abilityScoreBonuses?: AsiChoice;
  creatureType?: string;
}

export interface Background {
  id: string;
  source: ContentSource;
  name: string;
  skillProficiencies: [Skill, Skill];
  toolProficiency: string;
  originFeatId: string;
  abilityScoreBonuses: AsiChoice;
  description: string;
  equipment: string[];
}

export interface Feat {
  id: string;
  source: ContentSource;
  name: string;
  description: string;
  prerequisite?: string;
  category: 'origin' | 'general' | 'fighting_style' | 'epic_boon';
}

export interface ClassFeature {
  name: string;
  level: number;
  description: string;
}

export interface ClassDef {
  id: string;
  source: ContentSource;
  name: string;
  hitDie: number;
  primaryAbility: Ability[];
  savingThrows: [Ability, Ability];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  skillChoices: { from: Skill[]; count: number };
  startingEquipment: string[];
  features: ClassFeature[];
  spellcasting?: {
    ability: Ability;
    spellList: SpellList;
  };
  weaponMasteryCount?: number;
  subclassLevel: number;
}

export interface Weapon {
  id: string;
  name: string;
  category: 'simple' | 'martial';
  damage: string;
  damageType: string;
  weight: number;
  properties: string[];
  mastery?: WeaponMastery;
  range?: string;
}

export interface Armor {
  id: string;
  name: string;
  category: 'light' | 'medium' | 'heavy' | 'shield';
  ac: number;
  dexBonus?: boolean | number; // true = full dex, number = max dex bonus
  strengthReq?: number;
  stealthDisadvantage?: boolean;
  weight: number;
}

export interface Spell {
  id: string;
  source: ContentSource;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  lists: SpellList[];
  ritual?: boolean;
}

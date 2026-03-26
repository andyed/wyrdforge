import type { Weapon, Armor } from '../types/content.ts';

export const srdWeapons: Weapon[] = [
  // Simple Melee
  { id: 'wpn-club', name: 'Club', category: 'simple', damage: '1d4', damageType: 'bludgeoning', weight: 2, properties: ['Light'], mastery: 'slow' },
  { id: 'wpn-dagger', name: 'Dagger', category: 'simple', damage: '1d4', damageType: 'piercing', weight: 1, properties: ['Finesse', 'Light', 'Thrown'], mastery: 'nick', range: '20/60' },
  { id: 'wpn-greatclub', name: 'Greatclub', category: 'simple', damage: '1d8', damageType: 'bludgeoning', weight: 10, properties: ['Two-Handed'], mastery: 'push' },
  { id: 'wpn-handaxe', name: 'Handaxe', category: 'simple', damage: '1d6', damageType: 'slashing', weight: 2, properties: ['Light', 'Thrown'], mastery: 'vex', range: '20/60' },
  { id: 'wpn-javelin', name: 'Javelin', category: 'simple', damage: '1d6', damageType: 'piercing', weight: 2, properties: ['Thrown'], mastery: 'slow', range: '30/120' },
  { id: 'wpn-light-hammer', name: 'Light Hammer', category: 'simple', damage: '1d4', damageType: 'bludgeoning', weight: 2, properties: ['Light', 'Thrown'], mastery: 'nick', range: '20/60' },
  { id: 'wpn-mace', name: 'Mace', category: 'simple', damage: '1d6', damageType: 'bludgeoning', weight: 4, properties: [], mastery: 'sap' },
  { id: 'wpn-quarterstaff', name: 'Quarterstaff', category: 'simple', damage: '1d6', damageType: 'bludgeoning', weight: 4, properties: ['Versatile (1d8)'], mastery: 'topple' },
  { id: 'wpn-sickle', name: 'Sickle', category: 'simple', damage: '1d4', damageType: 'slashing', weight: 2, properties: ['Light'], mastery: 'nick' },
  { id: 'wpn-spear', name: 'Spear', category: 'simple', damage: '1d6', damageType: 'piercing', weight: 3, properties: ['Thrown', 'Versatile (1d8)'], mastery: 'sap', range: '20/60' },
  // Simple Ranged
  { id: 'wpn-light-crossbow', name: 'Light Crossbow', category: 'simple', damage: '1d8', damageType: 'piercing', weight: 5, properties: ['Ammunition', 'Loading', 'Two-Handed'], mastery: 'slow', range: '80/320' },
  { id: 'wpn-shortbow', name: 'Shortbow', category: 'simple', damage: '1d6', damageType: 'piercing', weight: 2, properties: ['Ammunition', 'Two-Handed'], mastery: 'vex', range: '80/320' },
  // Martial Melee
  { id: 'wpn-battleaxe', name: 'Battleaxe', category: 'martial', damage: '1d8', damageType: 'slashing', weight: 4, properties: ['Versatile (1d10)'], mastery: 'topple' },
  { id: 'wpn-flail', name: 'Flail', category: 'martial', damage: '1d8', damageType: 'bludgeoning', weight: 2, properties: [], mastery: 'sap' },
  { id: 'wpn-glaive', name: 'Glaive', category: 'martial', damage: '1d10', damageType: 'slashing', weight: 6, properties: ['Heavy', 'Reach', 'Two-Handed'], mastery: 'graze' },
  { id: 'wpn-greataxe', name: 'Greataxe', category: 'martial', damage: '1d12', damageType: 'slashing', weight: 7, properties: ['Heavy', 'Two-Handed'], mastery: 'cleave' },
  { id: 'wpn-greatsword', name: 'Greatsword', category: 'martial', damage: '2d6', damageType: 'slashing', weight: 6, properties: ['Heavy', 'Two-Handed'], mastery: 'graze' },
  { id: 'wpn-halberd', name: 'Halberd', category: 'martial', damage: '1d10', damageType: 'slashing', weight: 6, properties: ['Heavy', 'Reach', 'Two-Handed'], mastery: 'cleave' },
  { id: 'wpn-lance', name: 'Lance', category: 'martial', damage: '1d10', damageType: 'piercing', weight: 6, properties: ['Heavy', 'Reach', 'Two-Handed (unless mounted)'], mastery: 'topple' },
  { id: 'wpn-longsword', name: 'Longsword', category: 'martial', damage: '1d8', damageType: 'slashing', weight: 3, properties: ['Versatile (1d10)'], mastery: 'sap' },
  { id: 'wpn-maul', name: 'Maul', category: 'martial', damage: '2d6', damageType: 'bludgeoning', weight: 10, properties: ['Heavy', 'Two-Handed'], mastery: 'topple' },
  { id: 'wpn-morningstar', name: 'Morningstar', category: 'martial', damage: '1d8', damageType: 'piercing', weight: 4, properties: [], mastery: 'sap' },
  { id: 'wpn-pike', name: 'Pike', category: 'martial', damage: '1d10', damageType: 'piercing', weight: 18, properties: ['Heavy', 'Reach', 'Two-Handed'], mastery: 'push' },
  { id: 'wpn-rapier', name: 'Rapier', category: 'martial', damage: '1d8', damageType: 'piercing', weight: 2, properties: ['Finesse'], mastery: 'vex' },
  { id: 'wpn-scimitar', name: 'Scimitar', category: 'martial', damage: '1d6', damageType: 'slashing', weight: 3, properties: ['Finesse', 'Light'], mastery: 'nick' },
  { id: 'wpn-shortsword', name: 'Shortsword', category: 'martial', damage: '1d6', damageType: 'piercing', weight: 2, properties: ['Finesse', 'Light'], mastery: 'vex' },
  { id: 'wpn-trident', name: 'Trident', category: 'martial', damage: '1d8', damageType: 'piercing', weight: 4, properties: ['Thrown', 'Versatile (1d10)'], mastery: 'topple', range: '20/60' },
  { id: 'wpn-war-pick', name: 'War Pick', category: 'martial', damage: '1d8', damageType: 'piercing', weight: 2, properties: [], mastery: 'sap' },
  { id: 'wpn-warhammer', name: 'Warhammer', category: 'martial', damage: '1d8', damageType: 'bludgeoning', weight: 2, properties: ['Versatile (1d10)'], mastery: 'push' },
  { id: 'wpn-whip', name: 'Whip', category: 'martial', damage: '1d4', damageType: 'slashing', weight: 3, properties: ['Finesse', 'Reach'], mastery: 'slow' },
  // Martial Ranged
  { id: 'wpn-hand-crossbow', name: 'Hand Crossbow', category: 'martial', damage: '1d6', damageType: 'piercing', weight: 3, properties: ['Ammunition', 'Light', 'Loading'], mastery: 'vex', range: '30/120' },
  { id: 'wpn-heavy-crossbow', name: 'Heavy Crossbow', category: 'martial', damage: '1d10', damageType: 'piercing', weight: 18, properties: ['Ammunition', 'Heavy', 'Loading', 'Two-Handed'], mastery: 'push', range: '100/400' },
  { id: 'wpn-longbow', name: 'Longbow', category: 'martial', damage: '1d8', damageType: 'piercing', weight: 2, properties: ['Ammunition', 'Heavy', 'Two-Handed'], mastery: 'slow', range: '150/600' },
];

export const srdArmor: Armor[] = [
  // Light
  { id: 'armor-padded', name: 'Padded', category: 'light', ac: 11, dexBonus: true, stealthDisadvantage: true, weight: 8 },
  { id: 'armor-leather', name: 'Leather', category: 'light', ac: 11, dexBonus: true, weight: 10 },
  { id: 'armor-studded-leather', name: 'Studded Leather', category: 'light', ac: 12, dexBonus: true, weight: 13 },
  // Medium
  { id: 'armor-hide', name: 'Hide', category: 'medium', ac: 12, dexBonus: 2, weight: 12 },
  { id: 'armor-chain-shirt', name: 'Chain Shirt', category: 'medium', ac: 13, dexBonus: 2, weight: 20 },
  { id: 'armor-scale-mail', name: 'Scale Mail', category: 'medium', ac: 14, dexBonus: 2, stealthDisadvantage: true, weight: 45 },
  { id: 'armor-breastplate', name: 'Breastplate', category: 'medium', ac: 14, dexBonus: 2, weight: 20 },
  { id: 'armor-half-plate', name: 'Half Plate', category: 'medium', ac: 15, dexBonus: 2, stealthDisadvantage: true, weight: 40 },
  // Heavy
  { id: 'armor-ring-mail', name: 'Ring Mail', category: 'heavy', ac: 14, dexBonus: false, stealthDisadvantage: true, weight: 40 },
  { id: 'armor-chain-mail', name: 'Chain Mail', category: 'heavy', ac: 16, dexBonus: false, strengthReq: 13, stealthDisadvantage: true, weight: 55 },
  { id: 'armor-splint', name: 'Splint', category: 'heavy', ac: 17, dexBonus: false, strengthReq: 15, stealthDisadvantage: true, weight: 60 },
  { id: 'armor-plate', name: 'Plate', category: 'heavy', ac: 18, dexBonus: false, strengthReq: 15, stealthDisadvantage: true, weight: 65 },
  // Shield
  { id: 'armor-shield', name: 'Shield', category: 'shield', ac: 2, weight: 6 },
];

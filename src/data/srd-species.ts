import type { Species } from '../types/content.ts';

export const srdSpecies: Species[] = [
  {
    id: 'species-human',
    source: 'srd',
    name: 'Human',
    size: ['small', 'medium'],
    speed: 30,
    creatureType: 'Humanoid',
    languages: ['Common', 'one additional language'],
    traits: [
      { id: 'human-resourceful', name: 'Resourceful', description: 'You gain Heroic Inspiration whenever you finish a Long Rest.' },
      { id: 'human-skillful', name: 'Skillful', description: 'You gain proficiency in one skill of your choice.' },
      { id: 'human-versatile', name: 'Versatile', description: 'You gain an Origin feat of your choice.' },
    ],
  },
  {
    id: 'species-dwarf',
    source: 'srd',
    name: 'Dwarf',
    size: 'medium',
    speed: 30,
    creatureType: 'Humanoid',
    languages: ['Common', 'Dwarvish'],
    traits: [
      { id: 'dwarf-darkvision', name: 'Darkvision', description: 'You have Darkvision with a range of 120 feet.' },
      { id: 'dwarf-dwarven-resilience', name: 'Dwarven Resilience', description: 'You have Resistance to Poison damage. You also have Advantage on saving throws you make to avoid or end the Poisoned condition.' },
      { id: 'dwarf-dwarven-toughness', name: 'Dwarven Toughness', description: 'Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.' },
      { id: 'dwarf-stonecunning', name: 'Stonecunning', description: 'As a Bonus Action, you gain Tremorsense with a range of 60 feet for 10 minutes. You can use this Bonus Action a number of times equal to your Proficiency Bonus, and you regain all expended uses when you finish a Long Rest.' },
    ],
  },
  {
    id: 'species-elf',
    source: 'srd',
    name: 'Elf',
    size: 'medium',
    speed: 30,
    creatureType: 'Humanoid',
    languages: ['Common', 'Elvish'],
    traits: [
      { id: 'elf-darkvision', name: 'Darkvision', description: 'You have Darkvision with a range of 60 feet.' },
      { id: 'elf-elven-lineage', name: 'Elven Lineage', description: 'You are part of a lineage that grants you supernatural abilities. Choose one of the following options: Drow (Darkness), High Elf (Detect Magic + one Wizard cantrip), or Wood Elf (Longstrider + 35 ft speed).' },
      { id: 'elf-fey-ancestry', name: 'Fey Ancestry', description: 'You have Advantage on saving throws you make to avoid or end the Charmed condition.' },
      { id: 'elf-keen-senses', name: 'Keen Senses', description: 'You have proficiency in the Perception skill.' },
      { id: 'elf-trance', name: 'Trance', description: 'You don\'t need to sleep, and magic can\'t put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trancelike meditation, during which you retain consciousness.' },
    ],
  },
  {
    id: 'species-halfling',
    source: 'srd',
    name: 'Halfling',
    size: 'small',
    speed: 30,
    creatureType: 'Humanoid',
    languages: ['Common', 'Halfling'],
    traits: [
      { id: 'halfling-brave', name: 'Brave', description: 'You have Advantage on saving throws you make to avoid or end the Frightened condition.' },
      { id: 'halfling-halfling-nimbleness', name: 'Halfling Nimbleness', description: 'You can move through the space of any creature that is of a size larger than yours, but you can\'t stop there.' },
      { id: 'halfling-luck', name: 'Luck', description: 'When you roll a 1 on the d20 for a D20 Test, you can reroll the die, and you must use the new roll.' },
      { id: 'halfling-naturally-stealthy', name: 'Naturally Stealthy', description: 'You can take the Hide action even when you are obscured only by a creature that is at least one size larger than you.' },
    ],
  },
];

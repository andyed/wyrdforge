import type { Species, Background, Feat } from './content.ts';

export interface HomebrewPack {
  version: 1;
  name: string;
  author?: string;
  exportedAt: string;
  species: Species[];
  backgrounds: Background[];
  feats: Feat[];
}

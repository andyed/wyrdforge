# WyrdForge

D&D 2024 character sheet builder and immersive play mode die roller.

**[Try it live](https://andyed.github.io/wyrdforge/)**

**Created by Benjamin Edmonds**

## Features

- **Character Builder** — Step-by-step wizard: Species, Background, Class, Abilities, Equipment, Spells
- **Play Mode** — Immersive full-screen die roller with animated dice, advantage/disadvantage, temp bonuses, roll history, and favorites
- **Level Up Builder** — Level your character with HP rolls, ability score adjustments, custom actions, and feature tracking
- **Homebrew System** — Create custom backgrounds and species with full customization (skill proficiencies, racial bonuses, origin feats)
- **Parties** — Group characters into named parties
- **Character Import/Export** — Share characters as JSON files
- **D&D 2024 Rules** — Built for the 2024 Player's Handbook (species without subraces, backgrounds granting ASIs and origin feats, weapon mastery, Arcane/Divine/Primal spell lists)

## How to Use

### Create a Character

1. Click **+ New Character** in the top nav
2. Walk through each step — pick your species, background, class, and set ability scores
3. Double-click any choice card to select it and advance to the next step
4. On the Review step, name your character and click **Finish & View Sheet**

### Play Mode

1. Open a character sheet and click the **Play** button
2. Click any skill, save, or attack in the left panel to roll
3. Use the **Adv/Normal/Disadv** toggle for advantage/disadvantage rolls
4. Add temp bonuses (Bless d4, Bardic Inspiration) in the bonus panel
5. Build custom rolls with the dice builder at the bottom
6. Save frequently-used rolls as favorites with the **Save Last Roll** button

### Keyboard Shortcuts (Play Mode)

| Key | Action |
|-----|--------|
| Arrow Up/Down | Navigate between roll buttons |
| Enter | Roll the focused button, or re-roll last roll |
| A | Toggle Advantage |
| D | Toggle Disadvantage |
| Esc | Exit play mode |

### Level Up

1. Open your character sheet and click **Level Up**
2. Click **Level Up to X** to bump your level (auto-snapshots your current build)
3. Use the tabs to adjust ability scores, toggle skill proficiencies, add custom rollable actions, and record features
4. Previous levels are saved — use the level dropdown in the sheet header to view or restore old builds

### Homebrew

1. Go to the **Homebrew** tab in the nav
2. Create custom backgrounds (pick 2 skills, tool, origin feat, ability score bonuses)
3. Create custom species (size, speed, traits, optional racial bonuses)
4. Export all homebrew as a JSON pack to share with your table
5. Import homebrew packs from other players

### Import/Export Characters

- Click **Export** on any character to download a `.wyrdforge.json` file
- Click **Import Character** to load characters from JSON files
- Share character files with your party

## Dice Animation Plugins

WyrdForge supports custom dice animation plugins. See [docs/DICE_PLUGIN_GUIDE.md](docs/DICE_PLUGIN_GUIDE.md) for the developer guide.

## Tech Stack

React 19 + TypeScript + Zustand + Tailwind CSS + Vite

## Development

```bash
pnpm install
pnpm dev        # start dev server
pnpm test       # run tests
pnpm run deploy # build and deploy to GitHub Pages
```

## License

MIT

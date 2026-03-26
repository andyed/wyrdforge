import { useUIStore } from '../../stores/ui-store.ts';
import { useCharacterStore } from '../../stores/character-store.ts';
import type { View } from '../../stores/ui-store.ts';

export function NavBar() {
  const { currentView, setView, setWizardStep } = useUIStore();
  const createCharacter = useCharacterStore((s) => s.createCharacter);
  const hasActiveChar = useCharacterStore((s) => s.activeCharacterId != null);

  function handleNewCharacter() {
    createCharacter();
    setWizardStep('species');
    setView('create');
  }

  function navButton(label: string, view: View) {
    const active = currentView === view;
    return (
      <button
        key={view}
        onClick={() => setView(view)}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          active ? 'bg-red-800 text-white' : 'text-stone-300 hover:bg-stone-700'
        }`}
      >
        {label}
      </button>
    );
  }

  return (
    <nav className="forge-header text-white px-4 py-3 flex items-center gap-4">
      <h1 className="text-lg font-bold tracking-tight mr-4">
        <span className="wyrd-text">Wyrd</span><span className="text-stone-300">Forge</span>
        <span className="text-xs font-normal text-stone-500 ml-1.5">2024</span>
      </h1>
      {navButton('Characters', 'characters')}
      {navButton('Homebrew', 'homebrew')}
      {hasActiveChar && navButton('Play', 'play')}
      <div className="flex-1" />
      <button
        onClick={handleNewCharacter}
        className="bg-red-700 hover:bg-red-600 px-4 py-1.5 rounded text-sm font-medium transition-colors"
      >
        + New Character
      </button>
    </nav>
  );
}

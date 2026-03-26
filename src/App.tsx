import { useUIStore } from './stores/ui-store.ts';
import { useCharacterStore } from './stores/character-store.ts';
import { LandingPage } from './components/layout/LandingPage.tsx';
import { CreationWizard } from './components/wizard/CreationWizard.tsx';
import { CharacterSheet } from './components/sheet/CharacterSheet.tsx';
import { HomebrewDashboard } from './components/homebrew/HomebrewDashboard.tsx';
import { PlayMode } from './components/play/PlayMode.tsx';
import { NavBar } from './components/layout/NavBar.tsx';
import { useGlobalKeys } from './hooks/useGlobalKeys.ts';

function App() {
  useGlobalKeys();
  const currentView = useUIStore((s) => s.currentView);
  const activeChar = useCharacterStore((s) =>
    s.activeCharacterId ? s.characters[s.activeCharacterId] ?? null : null
  );

  const isPlay = currentView === 'play';

  // Play mode is fully immersive — no nav bar, full viewport overlay
  if (isPlay && activeChar) {
    return <PlayMode character={activeChar} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {currentView === 'characters' && <LandingPage />}
        {currentView === 'create' && <CreationWizard />}
        {currentView === 'sheet' && activeChar && <CharacterSheet character={activeChar} />}
        {currentView === 'homebrew' && <HomebrewDashboard />}
      </main>
    </div>
  );
}

export default App;

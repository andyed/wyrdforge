import type { Character } from '../../types/character.ts';
import { useContentStore } from '../../stores/content-store.ts';
import { usePlayStore } from '../../stores/play-store.ts';
import { useUIStore } from '../../stores/ui-store.ts';
import { QuickRollPanel } from './QuickRollPanel.tsx';
import { RollResultDisplay } from './RollResultDisplay.tsx';
import { RollControls } from './RollControls.tsx';
import { RollHistory } from './RollHistory.tsx';
import { CustomRollBuilder } from './CustomRollBuilder.tsx';
import { FavoriteRolls } from './FavoriteRolls.tsx';

export function PlayMode({ character }: { character: Character }) {
  const currentRoll = usePlayStore((s) => s.currentRoll);
  const isRolling = usePlayStore((s) => s.isRolling);
  const setView = useUIStore((s) => s.setView);
  const species = useContentStore((s) => s.species[character.speciesId]);
  const classDef = useContentStore((s) => s.classes[character.classId]);

  return (
    <div className="fixed inset-0 z-50 forge-gradient flex flex-col">
      {/* Compact header */}
      <div className="forge-header px-4 py-2 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-white font-bold text-lg">{character.name || 'Unnamed'}</span>
          <span className="text-stone-500 text-sm">
            {species?.name} {classDef?.name} · Lvl {character.level}
          </span>
        </div>
        <span className="text-stone-600 text-xs hidden sm:block">
          <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">Esc</kbd> exit
        </span>
        <button
          onClick={() => setView('sheet')}
          className="text-xs text-stone-500 hover:text-white px-3 py-1.5 rounded hover:bg-stone-800 transition-colors"
        >
          Exit Play Mode
        </button>
      </div>

      {/* 3-panel layout — full remaining height */}
      <div className="flex-1 grid grid-cols-12 gap-0 min-h-0 overflow-hidden">
        {/* Left — Quick Rolls */}
        <div className="col-span-3 bg-stone-900 text-white p-3 overflow-y-auto border-r border-stone-800">
          <QuickRollPanel character={character} />
        </div>

        {/* Center — Dice Stage */}
        <div className="col-span-6 forge-gradient p-6 flex flex-col items-center justify-center overflow-y-auto">
          {currentRoll ? (
            <RollResultDisplay roll={currentRoll} isRolling={isRolling} />
          ) : (
            <div className="text-center text-stone-600">
              <div className="text-8xl mb-6 opacity-10 select-none">🎲</div>
              <p className="text-xl text-stone-500">Ready to roll</p>
              <p className="text-sm text-stone-600 mt-2">
                Use the panel on the left, or press <kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-stone-400">Enter</kbd> to re-roll
              </p>
            </div>
          )}

          <div className="w-full max-w-md mt-8 space-y-4">
            <RollControls />
            <CustomRollBuilder characterId={character.id} />
          </div>
        </div>

        {/* Right — Favorites + Roll History */}
        <div className="col-span-3 bg-stone-900 text-white p-3 overflow-y-auto border-l border-stone-800 space-y-4">
          <FavoriteRolls characterId={character.id} />
          <div className="border-t border-stone-800 pt-3">
            <RollHistory />
          </div>
        </div>
      </div>
    </div>
  );
}

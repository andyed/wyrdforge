import { useEffect } from 'react';
import { useUIStore } from '../stores/ui-store.ts';
import { usePlayStore } from '../stores/play-store.ts';
import { useCharacterStore } from '../stores/character-store.ts';

/**
 * Global keyboard shortcuts.
 * - Escape: go back (play → sheet → characters)
 * - Enter: re-roll last roll (in play mode)
 * - 1-6: quick ability checks in play mode (STR through CHA)
 */
export function useGlobalKeys() {
  const currentView = useUIStore((s) => s.currentView);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't intercept when typing in inputs
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Escape — navigate back
      if (e.key === 'Escape') {
        e.preventDefault();
        const view = useUIStore.getState().currentView;
        if (view === 'play') useUIStore.getState().setView('sheet');
        else if (view === 'sheet') useUIStore.getState().setView('characters');
        else if (view === 'create') useUIStore.getState().setView('characters');
        else if (view === 'homebrew') useUIStore.getState().setView('characters');
        return;
      }

      // Play mode shortcuts
      if (currentView === 'play') {
        // Enter — re-roll last roll
        if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
          const playState = usePlayStore.getState();
          if (playState.isRolling) return;
          const lastRoll = playState.rollHistory[0];
          if (lastRoll) {
            e.preventDefault();
            const dice = lastRoll.dice.reduce<{ count: number; sides: number }[]>((acc, d) => {
              const existing = acc.find((g) => g.sides === d.sides);
              if (existing) existing.count++;
              else acc.push({ count: 1, sides: d.sides });
              return acc;
            }, []);
            playState.executeRoll({
              label: lastRoll.label,
              characterId: lastRoll.characterId,
              rollType: lastRoll.rollType,
              dice,
              flatModifier: lastRoll.flatModifier,
            });
          }
        }

        // A/D for advantage toggle
        if (e.key === 'a' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          const mode = usePlayStore.getState().advantageMode;
          usePlayStore.getState().setAdvantageMode(mode === 'advantage' ? 'normal' : 'advantage');
        }
        if (e.key === 'd' && !e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          const mode = usePlayStore.getState().advantageMode;
          usePlayStore.getState().setAdvantageMode(mode === 'disadvantage' ? 'normal' : 'disadvantage');
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);
}

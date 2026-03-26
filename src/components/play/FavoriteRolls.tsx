import { usePlayStore } from '../../stores/play-store.ts';
import { formatModifier } from '../../utils/dice.ts';
import { generateId } from '../../utils/ids.ts';
import type { RollConfig } from '../../types/play.ts';

export function FavoriteRolls({ characterId }: { characterId: string }) {
  const favoritesMap = usePlayStore((s) => s.favoriteRolls);
  const addFavoriteRoll = usePlayStore((s) => s.addFavoriteRoll);
  const removeFavoriteRoll = usePlayStore((s) => s.removeFavoriteRoll);
  const executeRoll = usePlayStore((s) => s.executeRoll);
  const currentRoll = usePlayStore((s) => s.currentRoll);

  const favorites = favoritesMap[characterId] ?? [];

  function saveCurrentAsFavorite() {
    if (!currentRoll) return;
    // Reconstruct dice groups from individual results
    const dice = currentRoll.dice.reduce<{ count: number; sides: number }[]>((acc, d) => {
      const existing = acc.find((g) => g.sides === d.sides);
      if (existing) existing.count++;
      else acc.push({ count: 1, sides: d.sides });
      return acc;
    }, []);

    const config: RollConfig = {
      id: generateId(),
      characterId,
      label: currentRoll.label,
      rollType: currentRoll.rollType,
      dice,
      flatModifier: currentRoll.flatModifier,
    };
    addFavoriteRoll(config);
  }

  function rollFavorite(fav: RollConfig) {
    executeRoll({
      label: fav.label,
      characterId: fav.characterId,
      rollType: fav.rollType,
      dice: fav.dice,
      flatModifier: fav.flatModifier,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Favorites</span>
        {currentRoll && (
          <button
            onClick={saveCurrentAsFavorite}
            className="text-xs px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white"
          >
            ★ Save Last Roll
          </button>
        )}
      </div>

      {favorites.length === 0 && (
        <p className="text-xs text-stone-600">Roll something, then save it as a favorite.</p>
      )}

      {favorites.map((fav) => (
        <div key={fav.id} className="flex items-center gap-1">
          <button
            onClick={() => rollFavorite(fav)}
            data-roving-item
            tabIndex={-1}
            className="flex-1 text-left px-2 py-1.5 text-sm rounded hover:bg-stone-700 focus:bg-stone-700
              focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors group"
          >
            <span className="text-stone-300 group-hover:text-white">{fav.label}</span>
            <span className="text-xs text-stone-500 ml-2">
              {fav.dice.map((d) => `${d.count}d${d.sides}`).join('+')}
              {fav.flatModifier !== 0 && formatModifier(fav.flatModifier)}
            </span>
          </button>
          <button
            onClick={() => removeFavoriteRoll(characterId, fav.id)}
            className="text-stone-600 hover:text-red-400 text-xs px-1"
            title="Remove favorite"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

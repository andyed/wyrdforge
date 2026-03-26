import { usePlayStore } from '../../stores/play-store.ts';
import { formatModifier } from '../../utils/dice.ts';

export function RollHistory() {
  const rollHistory = usePlayStore((s) => s.rollHistory);
  const clearHistory = usePlayStore((s) => s.clearHistory);
  const executeRoll = usePlayStore((s) => s.executeRoll);

  if (rollHistory.length === 0) {
    return (
      <div className="text-center text-stone-500 text-sm py-8">
        No rolls yet. Click a skill or save to roll!
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">History</span>
        <button onClick={clearHistory} className="text-xs text-stone-500 hover:text-red-500">Clear</button>
      </div>
      <div className="space-y-1">
        {rollHistory.map((roll) => {
          const time = new Date(roll.timestamp);
          const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <button
              key={roll.id}
              onClick={() => {
                // Re-roll with same config
                const dice = roll.dice.reduce<{ count: number; sides: number }[]>((acc, d) => {
                  const existing = acc.find((g) => g.sides === d.sides);
                  if (existing) existing.count++;
                  else acc.push({ count: 1, sides: d.sides });
                  return acc;
                }, []);
                executeRoll({
                  label: roll.label,
                  characterId: roll.characterId,
                  rollType: roll.rollType,
                  dice,
                  flatModifier: roll.flatModifier,
                });
              }}
              className="w-full text-left px-2 py-1.5 rounded hover:bg-stone-700 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-300 group-hover:text-white truncate">
                  {roll.label}
                </span>
                <span className={`font-mono text-sm font-bold ${
                  roll.isCriticalHit ? 'text-yellow-400' : roll.isCriticalFail ? 'text-red-400' : 'text-stone-300'
                }`}>
                  {roll.total}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>
                  {roll.dice.map((d) => d.value).join('+')}
                  {roll.flatModifier !== 0 && ` ${formatModifier(roll.flatModifier)}`}
                  {roll.advantage && (roll.advantage === 'advantage' ? ' (adv)' : ' (dis)')}
                </span>
                <span>{timeStr}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

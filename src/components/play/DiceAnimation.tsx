import { useState } from 'react';
import type { DieResult } from '../../types/play.ts';
import { usePlayStore } from '../../stores/play-store.ts';
import { getPlugin, getDefaultPlugin, getPlugins } from './dice-plugins/registry.ts';
import { saveToStorage, loadFromStorage } from '../../utils/persistence.ts';

const PLUGIN_KEY = 'wyrdforge-dice-plugin';

interface Props {
  dice: DieResult[];
  isRolling: boolean;
  isCriticalHit: boolean;
  isCriticalFail: boolean;
}

export function DiceAnimation({ dice, isRolling, isCriticalHit, isCriticalFail }: Props) {
  const finishRolling = usePlayStore((s) => s.finishRolling);
  const soundEnabled = usePlayStore((s) => s.soundEnabled);

  const [pluginId, setPluginId] = useState<string>(() => {
    const saved = loadFromStorage<string>(PLUGIN_KEY);
    return saved ?? getDefaultPlugin().id;
  });

  const plugin = getPlugin(pluginId) ?? getDefaultPlugin();
  const plugins = getPlugins();
  const Component = plugin.component;

  function handlePluginChange(id: string) {
    setPluginId(id);
    saveToStorage(PLUGIN_KEY, id);
  }

  return (
    <div className="w-full">
      <Component
        dice={dice}
        isRolling={isRolling}
        isCriticalHit={isCriticalHit}
        isCriticalFail={isCriticalFail}
        onAnimationComplete={finishRolling}
        soundEnabled={soundEnabled}
      />

      {/* Plugin picker — only show if multiple plugins available */}
      {plugins.length > 1 && (
        <div className="flex justify-center gap-1 mt-2">
          {plugins.map((p) => (
            <button
              key={p.id}
              onClick={() => handlePluginChange(p.id)}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                p.id === pluginId
                  ? 'bg-indigo-700 text-white'
                  : 'bg-stone-800 text-stone-500 hover:text-stone-300'
              }`}
              title={p.description}
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

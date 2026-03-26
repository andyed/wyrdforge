import type { DiceAnimationPlugin } from './types.ts';
import { BounceDicePlugin } from './bounce-dice.tsx';

/**
 * Dice animation plugin registry.
 * Add new plugins here — they'll appear in the plugin picker automatically.
 */
const plugins: DiceAnimationPlugin[] = [
  BounceDicePlugin,
];

export function getPlugins(): DiceAnimationPlugin[] {
  return plugins;
}

export function getPlugin(id: string): DiceAnimationPlugin | undefined {
  return plugins.find((p) => p.id === id);
}

export function getDefaultPlugin(): DiceAnimationPlugin {
  return plugins[0];
}

export function registerPlugin(plugin: DiceAnimationPlugin): void {
  if (!plugins.some((p) => p.id === plugin.id)) {
    plugins.push(plugin);
  }
}

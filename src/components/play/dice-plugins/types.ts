import type { DieResult } from '../../../types/play.ts';

/**
 * A DiceAnimationPlugin renders the dice rolling experience.
 * Plugins receive the dice results and rolling state, and are responsible
 * for all visual presentation — from simple CSS animations to WebGL shaders.
 */
export interface DiceAnimationPlugin {
  /** Unique plugin identifier */
  id: string;

  /** Display name shown in the plugin picker */
  name: string;

  /** Short description */
  description: string;

  /** Whether this plugin works well on mobile / small screens */
  responsive: boolean;

  /** The React component that renders the dice animation */
  component: React.ComponentType<DiceAnimationProps>;
}

/** Props passed to every dice animation plugin component */
export interface DiceAnimationProps {
  /** The individual die results to display */
  dice: DieResult[];

  /** True while the dice are still "rolling" (animation phase) */
  isRolling: boolean;

  /** True if the d20 result is a natural 20 */
  isCriticalHit: boolean;

  /** True if the d20 result is a natural 1 */
  isCriticalFail: boolean;

  /** Called by the plugin when the animation finishes — unlocks the next roll */
  onAnimationComplete: () => void;

  /** Whether sound is enabled (plugin can use this to trigger audio) */
  soundEnabled: boolean;
}

# WyrdForge Dice Animation Plugin Guide

Build custom dice rolling animations for WyrdForge. Plugins control the full visual experience — from CSS animations to WebGL shaders to 3D physics.

## Quick Start

1. Create a file in `src/components/play/dice-plugins/`
2. Implement the `DiceAnimationPlugin` interface
3. Register it in `registry.ts`

## Plugin Interface

```typescript
// src/components/play/dice-plugins/types.ts

interface DiceAnimationPlugin {
  id: string;           // unique identifier (e.g., 'particle-burst')
  name: string;         // shown in the plugin picker UI
  description: string;  // tooltip text
  responsive: boolean;  // works well on mobile / small screens?
  component: React.ComponentType<DiceAnimationProps>;
}

interface DiceAnimationProps {
  dice: DieResult[];              // the actual rolled results
  isRolling: boolean;             // true during animation phase
  isCriticalHit: boolean;         // nat 20 on the d20
  isCriticalFail: boolean;        // nat 1 on the d20
  onAnimationComplete: () => void; // MUST call when animation finishes
  soundEnabled: boolean;          // respect the user's sound preference
}

interface DieResult {
  sides: number;   // 4, 6, 8, 10, 12, 20, or 100
  value: number;   // the rolled result (1..sides)
}
```

## Example: Minimal Plugin

```tsx
// src/components/play/dice-plugins/fade-dice.tsx
import { useEffect, useState } from 'react';
import type { DiceAnimationPlugin, DiceAnimationProps } from './types.ts';

function FadeDice({ dice, isRolling, isCriticalHit, onAnimationComplete }: DiceAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isRolling) { setVisible(true); return; }
    setVisible(false);
    const t = setTimeout(() => { setVisible(true); onAnimationComplete(); }, 600);
    return () => clearTimeout(t);
  }, [isRolling, onAnimationComplete]);

  return (
    <div className={`text-center transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      {dice.map((d, i) => (
        <span key={i} className={`text-8xl font-black ${isCriticalHit ? 'wyrd-text' : 'text-white'}`}>
          {d.value}
        </span>
      ))}
    </div>
  );
}

export const FadeDicePlugin: DiceAnimationPlugin = {
  id: 'fade',
  name: 'Fade',
  description: 'Simple fade-in reveal',
  responsive: true,
  component: FadeDice,
};
```

Then register it:

```typescript
// src/components/play/dice-plugins/registry.ts
import { FadeDicePlugin } from './fade-dice.tsx';

const plugins: DiceAnimationPlugin[] = [
  BounceDicePlugin,
  FadeDicePlugin,  // add here
];
```

## Critical Contract

Your plugin **must** call `onAnimationComplete()` when the animation finishes. This unlocks the next roll. If you never call it, the app will stay in "rolling" state forever.

Typical pattern:
```tsx
useEffect(() => {
  if (!isRolling) return;
  const timeout = setTimeout(() => {
    onAnimationComplete();
  }, YOUR_ANIMATION_DURATION_MS);
  return () => clearTimeout(timeout);
}, [isRolling, onAnimationComplete]);
```

## Design Guidelines

### Fill the Stage

The dice stage is the center panel of a 3-column layout (`col-span-6`). Your plugin should **fill this space** — dice should be visible across a room for tabletop play.

- Single d20 roll: make the die massive (w-40 h-40 / 160px)
- 2-3 dice: large (w-28 h-28 / 112px)
- 4-6 dice: medium (w-20 h-20 / 80px)
- 7+ dice (e.g., 8d6 Fireball): compact grid (w-12 h-12 / 48px)

Scale based on `dice.length` to keep things readable at any count.

### Responsive Breakpoints

The play mode is full-viewport. On mobile, the 3-column layout may collapse. Your plugin should work in a container as narrow as 300px.

```tsx
// Use CSS container queries or check dice count to adjust
const singleDieSize = dice.length === 1 ? 'w-[min(40vw,160px)] h-[min(40vw,160px)]' : '...';
```

### Crit/Fail Effects

When `isCriticalHit` is true, go big. WyrdForge uses rainbow spectrum for "wyrd" moments:

- Use the `wyrd-text` CSS class for rainbow gradient text
- Use the `crit-glow` CSS class for pulsing golden box-shadow
- For custom effects: the rainbow colors are `#ff6b6b, #ffa36b, #ffd93d, #6bff6b, #6bc5ff, #a36bff, #ff6bff`

When `isCriticalFail` is true:
- Use the `fail-glow` CSS class for red pulsing shadow
- Use the `shake` CSS keyframe for a shake effect

### Sound

If `soundEnabled` is true, you can play audio. WyrdForge provides Web Audio utilities:

```typescript
import { playRollSound, playCritSound, playFailSound } from '../../../utils/sound.ts';

// In your animation effect:
if (soundEnabled) playRollSound();
// On animation complete:
if (soundEnabled && isCriticalHit) playCritSound();
```

Or bring your own audio — just respect `soundEnabled`.

### Available CSS Classes

These are defined in `src/index.css` and available globally:

| Class | Effect |
|-------|--------|
| `wyrd-text` | Rainbow gradient text with animation |
| `wyrd-glow` | Rainbow gradient background with animation |
| `forge-gradient` | Dark metallic background gradient |
| `forge-metal` | Metallic card background with border |
| `crit-glow` | Pulsing golden box-shadow |
| `fail-glow` | Pulsing red box-shadow |
| `animate-[shake_0.3s_ease-in-out]` | Shake animation |

## Advanced: WebGL/Canvas Plugins

For 3D dice, particle effects, or shader-based visuals:

```tsx
function WebGLDice({ dice, isRolling, onAnimationComplete }: DiceAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2');
    if (!gl) return;

    // Your WebGL rendering here
    // Call onAnimationComplete() when done

    return () => { /* cleanup */ };
  }, [isRolling, dice, onAnimationComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full max-h-[50vh]"
      style={{ aspectRatio: '16/9' }}
    />
  );
}
```

Keep in mind:
- The canvas needs to be responsive (`w-full h-full` with max constraints)
- Cleanup WebGL resources in the effect return
- Test on mobile — some effects won't work on low-power GPUs
- Set `responsive: false` in the plugin metadata if it requires a desktop GPU

## Plugin Ideas

- **3D Dice** — Three.js dice with physics (cannon-es), texture-mapped faces
- **Particle Burst** — Dice value revealed through a particle explosion
- **Slot Machine** — Numbers spin vertically like a slot machine, lock in one by one
- **Forge Anvil** — Die value forged on an anvil with sparks (canvas 2D)
- **Constellation** — Numbers appear as star patterns, connect-the-dots style
- **Ink Splatter** — Value revealed through an ink-splatter animation
- **Matrix Rain** — Numbers cascade down Matrix-style, the result highlighted

## File Structure

```
src/components/play/dice-plugins/
  types.ts              ← plugin interface (don't modify)
  registry.ts           ← register your plugin here
  bounce-dice.tsx        ← built-in: bouncing dice with number cycling
  your-plugin.tsx        ← your plugin here
```

import { useRef, useCallback, type KeyboardEvent } from 'react';

/**
 * Roving tabindex for keyboard-navigable button groups.
 * Arrow keys move focus between items. Home/End jump to first/last.
 * Supports both vertical (up/down) and horizontal (left/right) navigation.
 */
export function useRovingFocus(direction: 'vertical' | 'horizontal' | 'both' = 'vertical') {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const focusable = Array.from(
      container.querySelectorAll<HTMLElement>('[data-roving-item]:not([disabled])')
    );
    if (focusable.length === 0) return;

    const currentIndex = focusable.indexOf(document.activeElement as HTMLElement);
    let nextIndex = -1;

    const isVertical = direction === 'vertical' || direction === 'both';
    const isHorizontal = direction === 'horizontal' || direction === 'both';

    switch (e.key) {
      case 'ArrowDown':
        if (!isVertical) return;
        e.preventDefault();
        nextIndex = currentIndex < focusable.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowUp':
        if (!isVertical) return;
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : focusable.length - 1;
        break;
      case 'ArrowRight':
        if (!isHorizontal) return;
        e.preventDefault();
        nextIndex = currentIndex < focusable.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'ArrowLeft':
        if (!isHorizontal) return;
        e.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : focusable.length - 1;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = focusable.length - 1;
        break;
    }

    if (nextIndex >= 0) {
      focusable[nextIndex].focus();
    }
  }, [direction]);

  return { containerRef, handleKeyDown };
}

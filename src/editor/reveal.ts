import type { RevealStyle, RevealStateResult } from './types';

/**
 * Returns whether the user's system preferences prefer reduced motion.
 */
export function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
}

/**
 * Calculates the exact state of the mask and transformation at time `t` (in seconds).
 * Drives both interactive preview and video export identically.
 *
 * @param style - Animation style ('cut' | 'fade' | 'wipe' | 'zoom')
 * @param t - Current time in seconds
 * @param hold - Duration of initial masked hold state in seconds (default 3)
 * @param dur - Duration of reveal transition in seconds (default 0.6)
 */
export function revealState(
  style: RevealStyle,
  t: number,
  hold = 3,
  dur = 0.6
): RevealStateResult {
  if (shouldReduceMotion()) {
    return { maskAlpha: t < hold ? 1 : 0 };
  }

  const p = Math.min(1, Math.max(0, (t - hold) / dur));
  // Smoothstep easing: 3p^2 - 2p^3
  const ease = p * p * (3 - 2 * p);

  switch (style) {
    case 'cut':
      return { maskAlpha: t < hold ? 1 : 0 };
    case 'fade':
      return { maskAlpha: 1 - ease };
    case 'wipe':
      // wipe: 0 is completely covered, 1 is completely wiped away from left to right
      return { maskAlpha: 1, wipe: ease };
    case 'zoom':
      // Slight smooth punch-out / zoom with fade
      return { maskAlpha: 1 - ease, scale: 1 + 0.08 * ease };
    default:
      return { maskAlpha: t < hold ? 1 : 0 };
  }
}

import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

/**
 * Detects rough foldable posture based on screen geometry.
 *
 * - `compact`  : phone-like (width < 600dp) — single-pane UI
 * - `medium`   : small tablet / unfolded inner (600-840dp) — dual-pane candidate
 * - `expanded` : large tablet / unfolded inner (≥840dp) — dual-pane
 *
 * For real hinge detection on VIVO X Fold 5 and Samsung Flip 7 we would
 * use `react-native-foldables` + Jetpack WindowManager. The geometry-based
 * fallback works on standard Android without extra native deps.
 */
export type Posture = 'compact' | 'medium' | 'expanded';
export type Orientation = 'portrait' | 'landscape';

export interface PostureInfo {
  posture: Posture;
  orientation: Orientation;
  width: number;
  height: number;
}

export function usePosture(): PostureInfo {
  const [info, setInfo] = useState<PostureInfo>(() => computeInfo());

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', () => {
      setInfo(computeInfo());
    });
    return () => sub.remove();
  }, []);

  return info;
}

function computeInfo(): PostureInfo {
  const { width, height } = Dimensions.get('window');
  const min = Math.min(width, height);
  const orientation: Orientation = width >= height ? 'landscape' : 'portrait';
  let posture: Posture;
  if (min < 600) posture = 'compact';
  else if (min < 840) posture = 'medium';
  else posture = 'expanded';
  return { posture, orientation, width, height };
}

/**
 * Whether to render dual-pane (e.g. rules editor on left, preview on right).
 * Default: only when expanded and landscape.
 */
export function shouldUseDualPane(info: PostureInfo): boolean {
  return info.posture === 'expanded';
}

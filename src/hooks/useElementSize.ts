import { useEffect, useRef, useState } from 'react';
import { FALLBACK_BOUNDS } from '../core/constants';
import type { Bounds } from '../core/types';

/**
 * Measures an element with a ResizeObserver.
 *
 * The desktop is measured rather than assumed to be the viewport, so a
 * `<Desktop>` embedded in a page section still places, clamps and maximizes
 * windows against its own box.
 *
 * Returns the ref to attach, the live size, and a ref holding the same size —
 * event handlers read `boundsRef` so they never close over a stale value.
 */
export function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState<Bounds>(FALLBACK_BOUNDS);
  const sizeRef = useRef<Bounds>(size);
  sizeRef.current = size;

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      const next = {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      };
      setSize((prev) =>
        prev.width === next.width && prev.height === next.height ? prev : next,
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, size, sizeRef };
}

import { useEffect, useState } from "preact/hooks";
import type { ComponentType } from "preact";

/** Renders a component from a lazily imported module; nothing until it arrives (precached by the SW, so instant offline too). */
export function useLazy<P>(load: () => Promise<ComponentType<P>>): ComponentType<P> | null {
  const [C, setC] = useState<ComponentType<P> | null>(null);
  useEffect(() => { let alive = true; load().then((c) => { if (alive) setC(() => c); }); return () => { alive = false; }; }, []);
  return C;
}

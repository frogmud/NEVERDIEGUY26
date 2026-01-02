import { lazy, ComponentType } from 'react';

/**
 * Utility for lazy loading screen components with named exports.
 * Reduces boilerplate from:
 *   lazy(() => import('./screens/wiki/WikiIndex').then(m => ({ default: m.WikiIndex })))
 * To:
 *   lazyScreen(() => import('./screens/wiki/WikiIndex'), 'WikiIndex')
 *
 * @param importFn - Dynamic import function returning module
 * @param exportName - Name of the exported component
 * @returns Lazy-loaded React component
 */
export function lazyScreen<T extends ComponentType<unknown>>(
  importFn: () => Promise<Record<string, T>>,
  exportName: string
) {
  return lazy(() => importFn().then(m => ({ default: m[exportName] })));
}

/**
 * Feature switches.
 *
 * Each module in src/modules/<name> is loaded only when it is switched on here.
 * Later phases add their modules to this list (switched off until ready).
 */
export const features = {
  /** Bot health and information commands (Phase 1). */
  system: true,
} as const satisfies Record<string, boolean>;

export type FeatureName = keyof typeof features;

export function isFeatureEnabled(name: string): boolean {
  return (features as Record<string, boolean | undefined>)[name] === true;
}

/**
 * Per-person command cooldowns (rate limiting), kept in memory.
 */
export class CooldownManager {
  private readonly lastUsed = new Map<string, number>();

  constructor(private readonly now: () => number = Date.now) {}

  /**
   * Record a use. Returns 0 if allowed, or the whole seconds left to wait.
   */
  hit(userId: string, commandName: string, cooldownSeconds: number): number {
    if (cooldownSeconds <= 0) return 0;
    const key = `${commandName}:${userId}`;
    const now = this.now();
    const previous = this.lastUsed.get(key);
    const waitMs = cooldownSeconds * 1000;

    if (previous !== undefined && now - previous < waitMs) {
      return Math.ceil((waitMs - (now - previous)) / 1000);
    }
    this.lastUsed.set(key, now);
    this.prune(now, waitMs);
    return 0;
  }

  /** Remove old entries so memory does not grow forever. */
  private prune(now: number, maxAgeMs: number): void {
    if (this.lastUsed.size < 1000) return;
    for (const [key, time] of this.lastUsed) {
      if (now - time > Math.max(maxAgeMs, 60_000)) this.lastUsed.delete(key);
    }
  }
}

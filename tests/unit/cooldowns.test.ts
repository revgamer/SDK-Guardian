import { describe, expect, it } from 'vitest';
import { CooldownManager } from '../../src/core/utils/cooldowns.js';

describe('CooldownManager', () => {
  it('allows the first use and blocks repeats inside the cooldown', () => {
    let now = 0;
    const cooldowns = new CooldownManager(() => now);
    expect(cooldowns.hit('u1', 'ping', 5)).toBe(0);
    now = 2_000;
    expect(cooldowns.hit('u1', 'ping', 5)).toBe(3);
    now = 5_000;
    expect(cooldowns.hit('u1', 'ping', 5)).toBe(0);
  });

  it('tracks people and commands separately', () => {
    const cooldowns = new CooldownManager(() => 0);
    expect(cooldowns.hit('u1', 'ping', 5)).toBe(0);
    expect(cooldowns.hit('u2', 'ping', 5)).toBe(0);
    expect(cooldowns.hit('u1', 'about', 5)).toBe(0);
  });

  it('never blocks when cooldown is 0', () => {
    const cooldowns = new CooldownManager(() => 0);
    expect(cooldowns.hit('u1', 'x', 0)).toBe(0);
    expect(cooldowns.hit('u1', 'x', 0)).toBe(0);
  });
});

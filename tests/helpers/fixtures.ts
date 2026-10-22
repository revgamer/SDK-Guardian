import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { GuildConfig } from '../../src/config/guild.js';
import { parseGuildConfig } from '../../src/config/guild.js';

/** Generates a fake but valid Discord ID. */
export const fakeId = (n: number): string => `1000000000000000${String(n).padStart(3, '0')}`;

/** A valid guild config built from guild.example.json with fake IDs filled in. */
export function makeGuildConfig(): GuildConfig {
  const example = JSON.parse(
    readFileSync(path.resolve('config/guild.example.json'), 'utf8'),
  ) as Record<string, unknown>;

  let counter = 1;
  const fill = (value: unknown): unknown => {
    if (typeof value === 'string') return value === '' ? fakeId(counter++) : value;
    if (Array.isArray(value)) return value.map(fill);
    if (typeof value === 'object' && value !== null) {
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, fill(v)]));
    }
    return value;
  };

  const filled = fill({ ...example, notifications: undefined }) as Record<string, unknown>;
  filled.notifications = example.notifications;
  filled.emojis = {};
  return parseGuildConfig(filled);
}

export const VALID_ENV = {
  DISCORD_TOKEN: 'x'.repeat(72),
  DISCORD_CLIENT_ID: '1562880881377415309',
  MONGODB_URI: 'mongodb://127.0.0.1:27017/sdk-guardian',
};

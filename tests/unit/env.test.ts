import { describe, expect, it } from 'vitest';
import { EnvValidationError, parseEnv } from '../../src/config/env.js';
import { VALID_ENV } from '../helpers/fixtures.js';

describe('parseEnv', () => {
  it('accepts valid settings and applies defaults', () => {
    const env = parseEnv(VALID_ENV);
    expect(env.NODE_ENV).toBe('development');
    expect(env.LOG_LEVEL).toBe('info');
    expect(env.GUILD_CONFIG_PATH).toBe('config/guild.json');
  });

  it('accepts mongodb+srv (Atlas) connection strings', () => {
    expect(() =>
      parseEnv({ ...VALID_ENV, MONGODB_URI: 'mongodb+srv://user:pw@cluster.example.net/sdk' }),
    ).not.toThrow();
  });

  it('rejects missing token', () => {
    const rest: Partial<typeof VALID_ENV> = { ...VALID_ENV };
    delete rest.DISCORD_TOKEN;
    expect(() => parseEnv(rest)).toThrow(EnvValidationError);
  });

  it('rejects an invalid client ID', () => {
    expect(() => parseEnv({ ...VALID_ENV, DISCORD_CLIENT_ID: 'abc' })).toThrow(/DISCORD_CLIENT_ID/);
  });

  it('rejects a non-MongoDB URI', () => {
    expect(() => parseEnv({ ...VALID_ENV, MONGODB_URI: 'postgres://x' })).toThrow(/MONGODB_URI/);
  });

  it('never includes secret values in the error message', () => {
    const secretUri = 'http://secret-password@host';
    try {
      parseEnv({ ...VALID_ENV, MONGODB_URI: secretUri });
      expect.unreachable();
    } catch (error) {
      expect(String(error)).not.toContain('secret-password');
    }
  });
});

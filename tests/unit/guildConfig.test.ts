import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  GuildConfigError,
  listConfiguredIds,
  parseGuildConfig,
  resolveChannelPath,
} from '../../src/config/guild.js';
import { makeGuildConfig } from '../helpers/fixtures.js';

describe('guild config', () => {
  it('accepts a complete config', () => {
    const config = makeGuildConfig();
    expect(config.guildId).toMatch(/^\d{17,20}$/);
  });

  it('rejects a badly formatted ID and names the exact key', () => {
    const config = makeGuildConfig() as unknown as { roles: Record<string, unknown> };
    config.roles.volunteer = '12345';
    expect(() => parseGuildConfig(config)).toThrow(/roles\.volunteer/);
  });

  it('rejects a missing required club role', () => {
    const config = makeGuildConfig() as unknown as { roles: Record<string, unknown> };
    delete config.roles.guest;
    expect(() => parseGuildConfig(config)).toThrow(GuildConfigError);
  });

  it('allows empty channel IDs (not set up yet)', () => {
    const raw = JSON.parse(JSON.stringify(makeGuildConfig())) as {
      channels: { sdkInformation: { faq: string } };
    };
    raw.channels.sdkInformation.faq = '';
    expect(parseGuildConfig(raw).channels.sdkInformation.faq).toBe('');
  });

  it('rejects a notification that points at an unknown channel', () => {
    const raw = JSON.parse(JSON.stringify(makeGuildConfig())) as {
      notifications: Record<string, string>;
    };
    raw.notifications.clubNews = 'sdkInformation.doesNotExist';
    expect(() => parseGuildConfig(raw)).toThrow(/notifications\.clubNews/);
  });

  it('resolves channel paths', () => {
    const config = makeGuildConfig();
    expect(resolveChannelPath(config.channels, 'sdkInformation.sdkAnnouncement')).toBe(
      config.channels.sdkInformation.sdkAnnouncement,
    );
    expect(resolveChannelPath(config.channels, 'nope.nothing')).toBeUndefined();
  });

  it('lists every channel and role', () => {
    const { channels, roles } = listConfiguredIds(makeGuildConfig());
    expect(channels.length).toBeGreaterThanOrEqual(50);
    expect(roles.some((role) => role.name === 'selfAssign.clubNews')).toBe(true);
  });

  // Checks your real config file, when it exists (it is not on GitHub).
  it.runIf(existsSync('config/guild.json'))('the real config/guild.json is valid', () => {
    const raw: unknown = JSON.parse(readFileSync('config/guild.json', 'utf8'));
    expect(() => parseGuildConfig(raw)).not.toThrow();
  });
});

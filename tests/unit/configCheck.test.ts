import { describe, expect, it } from 'vitest';
import { listConfiguredIds } from '../../src/config/guild.js';
import { checkConfigAgainstServer } from '../../src/modules/system/configCheck.js';
import { makeGuildConfig } from '../helpers/fixtures.js';

describe('checkConfigAgainstServer', () => {
  it('reports found, missing and empty IDs', () => {
    const config = makeGuildConfig();
    config.channels.sdkInformation.faq = '';
    const { channels, roles } = listConfiguredIds(config);

    const channelIds = new Set(channels.map((c) => c.id).filter((id) => id !== ''));
    channelIds.delete(config.channels.welcomeAndStartHere.welcome);
    const roleIds = new Set(roles.map((r) => r.id));

    const result = checkConfigAgainstServer(config, { channelIds, roleIds });
    expect(result.channels.missing).toEqual(['welcomeAndStartHere.welcome']);
    expect(result.channels.empty).toEqual(['sdkInformation.faq']);
    expect(result.roles.missing).toEqual([]);
  });
});

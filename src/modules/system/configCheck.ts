/**
 * Compares the IDs in config/guild.json against the real Discord server.
 * Pure logic (no Discord calls) so it can be tested.
 */
import { listConfiguredIds, type GuildConfig } from '../../config/guild.js';

export interface ConfigCheckResult {
  ok: string[];
  empty: string[];
  missing: string[];
}

export function checkConfigAgainstServer(
  config: GuildConfig,
  server: { channelIds: ReadonlySet<string>; roleIds: ReadonlySet<string> },
): { channels: ConfigCheckResult; roles: ConfigCheckResult } {
  const { channels, roles } = listConfiguredIds(config);

  const check = (items: { name: string; id: string }[], existing: ReadonlySet<string>) => {
    const result: ConfigCheckResult = { ok: [], empty: [], missing: [] };
    for (const item of items) {
      if (item.id === '') result.empty.push(item.name);
      else if (existing.has(item.id)) result.ok.push(item.name);
      else result.missing.push(item.name);
    }
    return result;
  };

  return { channels: check(channels, server.channelIds), roles: check(roles, server.roleIds) };
}

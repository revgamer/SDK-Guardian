/**
 * Creates the Discord client.
 *
 * Phase 1 only needs the Guilds intent (least privilege).
 * Phase 3 will add GuildMembers for welcome messages — that is a "privileged
 * intent" that must also be switched on in the Developer Portal.
 */
import { Client, GatewayIntentBits, Options } from 'discord.js';

export function createClient(): Client {
  return new Client({
    intents: [GatewayIntentBits.Guilds],
    allowedMentions: { parse: [], repliedUser: false },
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      MessageManager: 50,
    }),
  });
}

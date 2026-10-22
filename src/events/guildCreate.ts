import { Events } from 'discord.js';
import { defineEvent } from '../core/types/Event.js';

/** Runs when the bot is added to a server. Leaves any server that is not SDK's. */
export default defineEvent({
  name: Events.GuildCreate,
  async execute(ctx, guild) {
    if (guild.id === ctx.guild.guildId) {
      ctx.logger.info({ guildId: guild.id }, 'Joined the SDK server');
      return;
    }
    ctx.logger.warn({ guildId: guild.id, guildName: guild.name }, 'Leaving unauthorised server');
    await guild.leave();
  },
});

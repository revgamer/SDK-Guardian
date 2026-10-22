import { Events } from 'discord.js';
import { defineEvent } from '../core/types/Event.js';

export default defineEvent({
  name: Events.ClientReady,
  once: true,
  async execute(ctx, client) {
    ctx.logger.info(
      { tag: client.user.tag, commands: ctx.commands.size },
      'SDK Guardian is online',
    );

    // SDK Guardian is for SDK's server only. Leave any other server.
    for (const guild of client.guilds.cache.values()) {
      if (guild.id !== ctx.guild.guildId) {
        ctx.logger.warn(
          { guildId: guild.id, guildName: guild.name },
          'Leaving unauthorised server',
        );
        await guild.leave();
      }
    }

    if (!client.guilds.cache.has(ctx.guild.guildId)) {
      ctx.logger.warn(
        { guildId: ctx.guild.guildId },
        'The bot is not in the configured SDK server. Check guildId and the invite.',
      );
    }
  },
});

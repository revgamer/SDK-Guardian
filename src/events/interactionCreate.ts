import { Events } from 'discord.js';
import { routeChatCommand } from '../core/interactions/commandRouter.js';
import { defineEvent } from '../core/types/Event.js';
import { CooldownManager } from '../core/utils/cooldowns.js';

const cooldowns = new CooldownManager();

/** Receives every interaction (slash commands now; buttons and forms in later phases). */
export default defineEvent({
  name: Events.InteractionCreate,
  async execute(ctx, interaction) {
    if (interaction.isChatInputCommand()) {
      await routeChatCommand(interaction, ctx, cooldowns);
    }
  },
});

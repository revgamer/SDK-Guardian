/**
 * Runs a slash command safely: permission check → cooldown → execute → log.
 */
import { MessageFlags, type ChatInputCommandInteraction } from 'discord.js';
import { DEFAULT_COOLDOWN_SECONDS } from '../../config/constants.js';
import { createEmbed } from '../embeds/embedFactory.js';
import { CooldownError } from '../errors/AppError.js';
import { handleInteractionError } from '../errors/errorHandler.js';
import { assertPermission, toMemberIdentity } from '../permissions/guard.js';
import type { BotContext } from '../types/BotContext.js';
import type { CooldownManager } from '../utils/cooldowns.js';

export async function routeChatCommand(
  interaction: ChatInputCommandInteraction,
  ctx: BotContext,
  cooldowns: CooldownManager,
): Promise<void> {
  // Only SDK's own server. Direct messages and other servers are refused.
  if (!interaction.inCachedGuild() || interaction.guildId !== ctx.guild.guildId) {
    await interaction.reply({
      embeds: [
        createEmbed('error', {
          title: 'Not available here',
          description: 'SDK Guardian commands only work inside the Scotland Deaf Karting server.',
        }),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const command = ctx.commands.get(interaction.commandName);
  if (command === undefined) {
    ctx.logger.warn({ command: interaction.commandName }, 'Unknown command received');
    await interaction.reply({
      embeds: [
        createEmbed('error', {
          title: 'Unknown command',
          description: 'This command is not available right now.',
        }),
      ],
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const started = performance.now();
  const logFields = {
    command: interaction.commandName,
    userId: interaction.user.id,
    channelId: interaction.channelId,
  };

  try {
    assertPermission(toMemberIdentity(interaction.member), command.permission, ctx.guild.roles);

    const wait = cooldowns.hit(
      interaction.user.id,
      command.data.name,
      command.cooldownSeconds ?? DEFAULT_COOLDOWN_SECONDS,
    );
    if (wait > 0) throw new CooldownError(wait);

    await command.execute(interaction, ctx);
    ctx.logger.info(
      { ...logFields, ms: Math.round(performance.now() - started) },
      'Command completed',
    );
  } catch (error) {
    await handleInteractionError(interaction, error, ctx.logger.child(logFields));
  }
}

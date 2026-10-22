/**
 * One place that handles every interaction error.
 */
import { randomBytes } from 'node:crypto';
import { MessageFlags, type RepliableInteraction } from 'discord.js';
import type { Logger } from '../logging/logger.js';
import { createEmbed } from '../embeds/embedFactory.js';
import { AppError } from './AppError.js';

/** Short code the user can quote to staff, matching an entry in the log. */
export function createReferenceCode(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

export async function handleInteractionError(
  interaction: RepliableInteraction,
  error: unknown,
  logger: Logger,
): Promise<void> {
  let embed;

  if (error instanceof AppError) {
    logger.info(
      { userId: interaction.user.id, error: error.name, reason: error.message },
      'Interaction refused',
    );
    embed = createEmbed('error', { title: error.title, description: error.message });
  } else {
    const reference = createReferenceCode();
    logger.error({ err: error, reference, userId: interaction.user.id }, 'Unexpected error');
    embed = createEmbed('error', {
      title: 'Something went wrong',
      description:
        'The bot could not complete this request. Please try again in a moment.\n' +
        `If it keeps happening, tell a Volunteer and quote reference **${reference}**.`,
    });
  }

  try {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], flags: MessageFlags.Ephemeral });
    } else {
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    }
  } catch (replyError) {
    // The interaction may have expired (Discord allows 3 seconds to reply).
    logger.warn({ err: replyError }, 'Could not send error message to user');
  }
}

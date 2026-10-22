import { MessageFlags, SlashCommandBuilder, time, TimestampStyles } from 'discord.js';
import { BOT_NAME, CLUB_NAME, HOME_CIRCUIT, SLOGAN } from '../../../config/constants.js';
import { brandingAttachments, createEmbed } from '../../../core/embeds/embedFactory.js';
import { PermissionLevel } from '../../../core/permissions/levels.js';
import { defineCommand } from '../../../core/types/Command.js';

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName('about')
    .setDescription('Information about SDK Guardian and Scotland Deaf Karting.'),
  permission: PermissionLevel.Everyone,
  cooldownSeconds: 10,
  async execute(interaction, ctx) {
    const branding = brandingAttachments();
    const embed = createEmbed('info', {
      title: BOT_NAME,
      description:
        `The official Discord bot for **${CLUB_NAME}** — a Deaf-led karting club based at ${HOME_CIRCUIT}.\n\n` +
        `**${SLOGAN}**`,
      fields: [
        { name: 'Version', value: ctx.version, inline: true },
        {
          name: 'Online since',
          value: time(ctx.startedAt, TimestampStyles.RelativeTime),
          inline: true,
        },
      ],
    })
      .setThumbnail(branding.thumbnailUrl)
      .setImage(branding.bannerUrl);

    await interaction.reply({
      embeds: [embed],
      files: branding.files,
      flags: MessageFlags.Ephemeral,
    });
  },
});

import { MessageFlags, SlashCommandBuilder } from 'discord.js';
import { getDatabaseStatus } from '../../../core/database/connection.js';
import { createEmbed } from '../../../core/embeds/embedFactory.js';
import { PermissionLevel } from '../../../core/permissions/levels.js';
import { defineCommand } from '../../../core/types/Command.js';

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check that SDK Guardian and its database are working.'),
  permission: PermissionLevel.Everyone,
  cooldownSeconds: 5,
  async execute(interaction, ctx) {
    const sent = Date.now();
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const roundTrip = Date.now() - sent;
    const database = getDatabaseStatus();
    const healthy = database === 'connected';

    await interaction.editReply({
      embeds: [
        createEmbed(healthy ? 'success' : 'warning', {
          title: healthy ? 'All systems working' : 'Database problem',
          fields: [
            { name: 'Discord connection', value: `${ctx.client.ws.ping} ms`, inline: true },
            { name: 'Response time', value: `${roundTrip} ms`, inline: true },
            {
              name: 'Database',
              value: healthy ? 'Connected' : `Not connected (${database})`,
              inline: true,
            },
          ],
        }),
      ],
    });
  },
});

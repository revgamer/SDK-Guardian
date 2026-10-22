import { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';
import { createEmbed } from '../../../core/embeds/embedFactory.js';
import { PermissionLevel } from '../../../core/permissions/levels.js';
import { defineCommand } from '../../../core/types/Command.js';
import { checkConfigAgainstServer } from '../configCheck.js';

/** Keep embed fields under Discord's 1024-character limit. */
function listOrNone(names: string[]): string {
  if (names.length === 0) return 'None';
  const text = names.map((name) => `• \`${name}\``).join('\n');
  return text.length > 1000 ? `${text.slice(0, 990)}\n…and more` : text;
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName('config')
    .setDescription('Bot configuration tools (Admins only).')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
      sub.setName('check').setDescription('Check every channel and role ID in guild.json.'),
    ),
  permission: PermissionLevel.Admin,
  cooldownSeconds: 10,
  async execute(interaction, ctx) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const guild = interaction.guild;
    const [channels, roles] = await Promise.all([guild.channels.fetch(), guild.roles.fetch()]);
    const result = checkConfigAgainstServer(ctx.guild, {
      channelIds: new Set(channels.keys()),
      roleIds: new Set(roles.keys()),
    });

    const problems = result.channels.missing.length + result.roles.missing.length;
    await interaction.editReply({
      embeds: [
        createEmbed(problems === 0 ? 'success' : 'warning', {
          title: problems === 0 ? 'Configuration OK' : `${problems} ID problem(s) found`,
          description:
            `Channels: **${result.channels.ok.length}** found, ` +
            `**${result.channels.missing.length}** missing, ${result.channels.empty.length} not set yet.\n` +
            `Roles: **${result.roles.ok.length}** found, ` +
            `**${result.roles.missing.length}** missing, ${result.roles.empty.length} not set yet.`,
          fields: [
            { name: '❌ Channels not found in server', value: listOrNone(result.channels.missing) },
            { name: '❌ Roles not found in server', value: listOrNone(result.roles.missing) },
            {
              name: '⚪ Not set yet (empty in guild.json)',
              value: listOrNone([...result.channels.empty, ...result.roles.empty]),
            },
          ],
        }),
      ],
    });
  },
});

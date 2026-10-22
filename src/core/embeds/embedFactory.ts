/**
 * SDK-branded embeds.
 *
 * Use these everywhere so every message from the bot looks consistent.
 * Each type has a clear text label as well as a colour, so the meaning
 * never depends on colour alone.
 */
import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import path from 'node:path';
import { BOT_NAME, BRANDING, COLOURS, SLOGAN } from '../../config/constants.js';
import { ASSETS_DIR } from '../../config/paths.js';

export type EmbedType = 'info' | 'success' | 'warning' | 'error';

const STYLE: Record<EmbedType, { colour: number; prefix: string }> = {
  info: { colour: COLOURS.brand, prefix: 'ℹ️' },
  success: { colour: COLOURS.success, prefix: '✅' },
  warning: { colour: COLOURS.warning, prefix: '⚠️' },
  error: { colour: COLOURS.error, prefix: '❌' },
};

export interface EmbedContent {
  title: string;
  description?: string;
  fields?: { name: string; value: string; inline?: boolean }[];
}

export function createEmbed(type: EmbedType, content: EmbedContent): EmbedBuilder {
  const style = STYLE[type];
  const embed = new EmbedBuilder()
    .setColor(style.colour)
    .setTitle(`${style.prefix} ${content.title}`)
    .setFooter({ text: `${BOT_NAME} • ${SLOGAN}` })
    .setTimestamp();

  if (content.description !== undefined) embed.setDescription(content.description);
  if (content.fields !== undefined && content.fields.length > 0) embed.addFields(content.fields);
  return embed;
}

/** Logo files to attach to a message, and how to reference them in an embed. */
export function brandingAttachments(): {
  files: AttachmentBuilder[];
  thumbnailUrl: string;
  bannerUrl: string;
} {
  const thumbName = path.basename(BRANDING.thumbnail);
  const bannerName = path.basename(BRANDING.banner);
  return {
    files: [
      new AttachmentBuilder(path.join(ASSETS_DIR, BRANDING.thumbnail), { name: thumbName }),
      new AttachmentBuilder(path.join(ASSETS_DIR, BRANDING.banner), { name: bannerName }),
    ],
    thumbnailUrl: `attachment://${thumbName}`,
    bannerUrl: `attachment://${bannerName}`,
  };
}

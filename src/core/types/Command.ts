import type {
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import type { PermissionLevel } from '../permissions/levels.js';
import type { BotContext } from './BotContext.js';

/** The shape every slash command file must export as its default export. */
export interface Command {
  /** Slash command definition (usually a SlashCommandBuilder). */
  data: { name: string; toJSON(): RESTPostAPIChatInputApplicationCommandsJSONBody };
  /** Minimum permission level needed to use the command. */
  permission: PermissionLevel;
  /** Seconds a person must wait between uses. Defaults to DEFAULT_COOLDOWN_SECONDS. */
  cooldownSeconds?: number;
  execute(interaction: ChatInputCommandInteraction<'cached'>, ctx: BotContext): Promise<void>;
}

/** Helper that gives full type checking when writing a command file. */
export function defineCommand(command: Command): Command {
  return command;
}

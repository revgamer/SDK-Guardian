import type { Client } from 'discord.js';
import type { Env } from '../../config/env.js';
import type { GuildConfig } from '../../config/guild.js';
import type { Logger } from '../logging/logger.js';
import type { CommandRegistry } from '../loaders/commandLoader.js';

/** Shared objects every command and event can use. */
export interface BotContext {
  client: Client<true>;
  env: Env;
  guild: GuildConfig;
  logger: Logger;
  commands: CommandRegistry;
  startedAt: Date;
  version: string;
}

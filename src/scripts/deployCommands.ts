/**
 * Registers SDK Guardian's slash commands with Discord — for SDK's server only.
 *
 *   npm run deploy:commands            register / update all commands
 *   npm run deploy:commands -- --clear remove all of the bot's server commands
 *
 * Run this after adding, removing or changing a command's name, description
 * or options. It is NOT needed after changing only what a command does.
 */
import { REST, Routes } from 'discord.js';
import { loadEnv } from '../config/env.js';
import { loadGuildConfig } from '../config/guild.js';
import { MODULES_DIR } from '../config/paths.js';
import { loadCommands } from '../core/loaders/commandLoader.js';

async function deploy(): Promise<void> {
  const env = loadEnv();
  const guild = loadGuildConfig(env.GUILD_CONFIG_PATH);
  const clear = process.argv.includes('--clear');

  const commands = await loadCommands(MODULES_DIR);
  const body = clear ? [] : [...commands.values()].map((command) => command.data.toJSON());

  const rest = new REST().setToken(env.DISCORD_TOKEN);
  await rest.put(Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, guild.guildId), { body });

  const names = body.map((command) => `/${command.name}`).join(', ');
  process.stdout.write(
    clear
      ? `Removed all SDK Guardian commands from server ${guild.guildId}.\n`
      : `Registered ${body.length} command(s) in server ${guild.guildId}: ${names}\n`,
  );
}

deploy().catch((error: unknown) => {
  process.stderr.write(
    `Command deployment failed:\n${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});

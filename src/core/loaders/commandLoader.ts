/**
 * Finds and loads slash commands.
 *
 * Looks in src/modules/<module>/commands/ for every module that is switched on
 * in config/features.ts. Each file must default-export a Command.
 */
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { isFeatureEnabled } from '../../config/features.js';
import type { Command } from '../types/Command.js';
import { listLoadableFiles } from './fileScan.js';

export type CommandRegistry = ReadonlyMap<string, Command>;

export class CommandLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommandLoadError';
  }
}

function isCommand(value: unknown): value is Command {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<Command>;
  return (
    typeof candidate.execute === 'function' &&
    typeof candidate.permission === 'number' &&
    typeof candidate.data === 'object' &&
    typeof candidate.data.name === 'string' &&
    typeof candidate.data.toJSON === 'function'
  );
}

export async function loadCommands(
  modulesDir: string,
  enabled: (moduleName: string) => boolean = isFeatureEnabled,
): Promise<CommandRegistry> {
  const registry = new Map<string, Command>();
  if (!existsSync(modulesDir)) return registry;

  const modules = readdirSync(modulesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && enabled(entry.name))
    .map((entry) => entry.name)
    .sort();

  for (const moduleName of modules) {
    for (const file of listLoadableFiles(path.join(modulesDir, moduleName, 'commands'))) {
      const imported = (await import(pathToFileURL(file).href)) as { default?: unknown };
      const command = imported.default;
      if (!isCommand(command)) {
        throw new CommandLoadError(`${file} does not default-export a valid command.`);
      }
      if (registry.has(command.data.name)) {
        throw new CommandLoadError(`Two commands are named "/${command.data.name}" (${file}).`);
      }
      registry.set(command.data.name, command);
    }
  }
  return registry;
}

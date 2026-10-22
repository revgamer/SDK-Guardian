/**
 * Environment configuration.
 *
 * Reads settings from `.env` (if present) and the real environment, then
 * validates them. If anything is missing or wrong the bot stops at start-up
 * with a clear message, instead of failing later in a confusing way.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { PROJECT_ROOT } from './paths.js';

const snowflake = z.string().regex(/^\d{17,20}$/, 'must be a Discord ID (17–20 digits)');

export const envSchema = z.object({
  DISCORD_TOKEN: z.string().min(50, 'looks too short to be a Discord bot token'),
  DISCORD_CLIENT_ID: snowflake,
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(\+srv)?:\/\//, 'must start with mongodb:// or mongodb+srv://'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  GUILD_CONFIG_PATH: z.string().min(1).default('config/guild.json'),
});

export type Env = z.infer<typeof envSchema>;

/** Thrown when environment settings are invalid. Never contains secret values. */
export class EnvValidationError extends Error {
  constructor(public readonly problems: string[]) {
    super(`Invalid environment settings:\n  - ${problems.join('\n  - ')}`);
    this.name = 'EnvValidationError';
  }
}

/**
 * Validate a set of raw environment values.
 * Pure function (no file access) so it is easy to test.
 */
export function parseEnv(raw: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    // Only the variable NAME and the reason are reported, never the value.
    const problems = result.error.issues.map((issue) => {
      const name = issue.path.join('.') || '(root)';
      const missing = issue.code === 'invalid_type' && issue.message.endsWith('undefined');
      return missing
        ? `${name} is missing — add it to your .env file`
        : `${name}: ${issue.message}`;
    });
    throw new EnvValidationError(problems);
  }
  return result.data;
}

/**
 * Load `.env` from the project root (if it exists) and validate.
 * Values already set in the real environment take priority over `.env`.
 */
export function loadEnv(): Env {
  const envFile = path.join(PROJECT_ROOT, '.env');
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }
  return parseEnv(process.env);
}

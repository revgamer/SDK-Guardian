import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PROJECT_ROOT } from '../../config/paths.js';

/** Read the bot version from package.json. */
export function readVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(PROJECT_ROOT, 'package.json'), 'utf8')) as {
      version?: unknown;
    };
    return typeof pkg.version === 'string' ? pkg.version : 'unknown';
  } catch {
    return 'unknown';
  }
}

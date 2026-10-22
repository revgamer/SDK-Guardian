/**
 * Project paths.
 *
 * Works for both `src/` (development with tsx) and `dist/` (compiled build),
 * because both folders sit directly inside the project root.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** The folder that contains `src/` or `dist/` (i.e. `src/config` → `src`). */
export const SOURCE_ROOT = path.resolve(here, '..');

/** The project root folder (where package.json lives). */
export const PROJECT_ROOT = path.resolve(SOURCE_ROOT, '..');

export const MODULES_DIR = path.join(SOURCE_ROOT, 'modules');
export const EVENTS_DIR = path.join(SOURCE_ROOT, 'events');
export const ASSETS_DIR = path.join(PROJECT_ROOT, 'assets');

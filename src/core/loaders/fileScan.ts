import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** True for source files the loaders should import (.ts in dev, .js when built). */
export function isLoadableFile(fileName: string): boolean {
  if (fileName.endsWith('.d.ts') || fileName.includes('.test.')) return false;
  return fileName.endsWith('.ts') || fileName.endsWith('.js');
}

/** List loadable files directly inside a folder (not sub-folders). Sorted for stable order. */
export function listLoadableFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isLoadableFile(entry.name))
    .map((entry) => path.join(dir, entry.name))
    .sort();
}

import { describe, expect, it } from 'vitest';
import { MODULES_DIR } from '../../src/config/paths.js';
import { loadCommands } from '../../src/core/loaders/commandLoader.js';
import { isLoadableFile } from '../../src/core/loaders/fileScan.js';

describe('command loader', () => {
  it('loads the Phase 1 system commands', async () => {
    const commands = await loadCommands(MODULES_DIR);
    expect([...commands.keys()].sort()).toEqual(['about', 'config', 'ping']);
  });

  it('produces valid Discord command JSON', async () => {
    const commands = await loadCommands(MODULES_DIR);
    for (const command of commands.values()) {
      const json = command.data.toJSON();
      expect(json.name).toMatch(/^[a-z0-9-]{1,32}$/);
      expect(json.description.length).toBeGreaterThan(0);
      expect(json.description.length).toBeLessThanOrEqual(100);
    }
  });

  it('skips modules that are switched off', async () => {
    const commands = await loadCommands(MODULES_DIR, () => false);
    expect(commands.size).toBe(0);
  });

  it('only loads source files, not tests or type definitions', () => {
    expect(isLoadableFile('ping.ts')).toBe(true);
    expect(isLoadableFile('ping.js')).toBe(true);
    expect(isLoadableFile('ping.d.ts')).toBe(false);
    expect(isLoadableFile('ping.test.ts')).toBe(false);
    expect(isLoadableFile('notes.md')).toBe(false);
  });
});

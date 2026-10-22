import { pino } from 'pino';
import { describe, expect, it, vi } from 'vitest';
import type { RepliableInteraction } from 'discord.js';
import { PermissionError } from '../../src/core/errors/AppError.js';
import { createReferenceCode, handleInteractionError } from '../../src/core/errors/errorHandler.js';

const silentLogger = pino({ level: 'silent' });

function fakeInteraction(state: { replied?: boolean; deferred?: boolean } = {}) {
  const reply = vi.fn().mockResolvedValue(undefined);
  const followUp = vi.fn().mockResolvedValue(undefined);
  const interaction = {
    user: { id: '1' },
    replied: state.replied ?? false,
    deferred: state.deferred ?? false,
    reply,
    followUp,
  } as unknown as RepliableInteraction;
  return { interaction, reply, followUp };
}

const descriptionOf = (mock: ReturnType<typeof vi.fn>): string => {
  const options = mock.mock.calls[0]?.[0] as { embeds: { data: { description?: string } }[] };
  return options.embeds[0]?.data.description ?? '';
};

describe('handleInteractionError', () => {
  it('shows the message of an expected error', async () => {
    const { interaction, reply } = fakeInteraction();
    await handleInteractionError(interaction, new PermissionError('Admins only.'), silentLogger);
    expect(descriptionOf(reply)).toBe('Admins only.');
  });

  it('hides details of unexpected errors and gives a reference code', async () => {
    const { interaction, reply } = fakeInteraction();
    await handleInteractionError(interaction, new Error('db password=hunter2'), silentLogger);
    const text = descriptionOf(reply);
    expect(text).not.toContain('hunter2');
    expect(text).toMatch(/reference \*\*[0-9A-F]{6}\*\*/);
  });

  it('uses followUp when the interaction was already deferred', async () => {
    const { interaction, reply, followUp } = fakeInteraction({ deferred: true });
    await handleInteractionError(interaction, new Error('x'), silentLogger);
    expect(followUp).toHaveBeenCalledOnce();
    expect(reply).not.toHaveBeenCalled();
  });

  it('does not throw if the reply itself fails', async () => {
    const { interaction, reply } = fakeInteraction();
    reply.mockRejectedValue(new Error('Unknown interaction'));
    await expect(
      handleInteractionError(interaction, new Error('x'), silentLogger),
    ).resolves.toBeUndefined();
  });

  it('creates 6-character reference codes', () => {
    expect(createReferenceCode()).toMatch(/^[0-9A-F]{6}$/);
  });
});

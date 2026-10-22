/**
 * Fixed values used across the bot.
 */

export const BOT_NAME = 'SDK Guardian';
export const CLUB_NAME = 'Scotland Deaf Karting';
export const CLUB_SHORT_NAME = 'SDK';
export const SLOGAN = 'Drive • Communicate • Belong.';
export const HOME_CIRCUIT = 'Larkhall Circuit';

/** Embed colours. Brand blue is sampled from the official SDK logo. */
export const COLOURS = {
  brand: 0x0000ff,
  brandAccent: 0x0145f6,
  success: 0x1d8a4e,
  warning: 0xe0a100,
  error: 0xd93636,
  neutral: 0x2b2d31,
} as const;

/** Branding image files inside the assets/ folder. */
export const BRANDING = {
  thumbnail: 'branding/sdk-logo-thumb.png',
  banner: 'branding/sdk-logo-banner.jpg',
} as const;

/** Default cooldown between uses of the same command, per person. */
export const DEFAULT_COOLDOWN_SECONDS = 3;

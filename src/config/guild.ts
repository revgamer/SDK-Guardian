/**
 * Server (guild) configuration.
 *
 * All Discord channel, role and emoji IDs live in `config/guild.json`.
 * Code never contains raw IDs — it always uses names such as
 * `guild.channels.welcomeAndStartHere.sdkRules`.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { PROJECT_ROOT } from './paths.js';

/** A required Discord ID. */
const id = z.string().regex(/^\d{17,20}$/, 'must be a Discord ID (17–20 digits)');

/** An ID that may be left empty until the feature that needs it is built. */
const optionalId = z.union([id, z.literal('')]);

/** Custom emoji in Discord format, e.g. <:sdk_logo:123…> or <a:flag:123…>. */
const customEmoji = z.union([
  z.string().regex(/^<a?:\w{2,32}:\d{17,20}>$/, 'must look like <:name:id>'),
  z.literal(''),
]);

const channelsSchema = z.object({
  welcomeAndStartHere: z.object({
    welcome: optionalId,
    sdkRules: optionalId,
    chooseYourRoles: optionalId,
  }),
  sdkInformation: z.object({
    sdkAnnouncement: optionalId,
    aboutSdk: optionalId,
    membershipInformation: optionalId,
    howToJoin: optionalId,
    eventCalendar: optionalId,
    faq: optionalId,
    partnersAndSponsors: optionalId,
  }),
  publicCommunity: z.object({
    socialChat: optionalId,
    photosAndVideos: optionalId,
    kartingDiscussion: optionalId,
    questionAndAdvice: optionalId,
    suggestions: optionalId,
    offTopic: optionalId,
  }),
  sdkMembership: z.object({
    memberAnnouncements: optionalId,
    membersLounge: optionalId,
    raceRegistration: optionalId,
    practiceSessions: optionalId,
    raceResults: optionalId,
    lapTimeLeaderboard: optionalId,
    championshipStandings: optionalId,
    travelAndEvents: optionalId,
  }),
  raceDayControl: z.object({
    raceDayBriefing: optionalId,
    driverCheckIn: optionalId,
    heatAssignments: optionalId,
    liveRaceUpdates: optionalId,
    raceDayFeedback: optionalId,
  }),
  boardOfTrustees: z.object({
    boardAnnouncements: optionalId,
    trusteeDiscussion: optionalId,
    meetingAgendas: optionalId,
    meetingMinutes: optionalId,
    financeAndBudgets: optionalId,
    membershipAdministrator: optionalId,
    trusteeDecisions: optionalId,
    botAuditLogs: optionalId,
  }),
  videoAndSigningRooms: z.object({
    bslCommunityLounge: optionalId,
    membersVideoLounge: optionalId,
    practiceDiscussion: optionalId,
    privateMeeting: optionalId,
  }),
  stageAndLiveEvents: z.object({
    sdkAnnouncementsStage: optionalId,
    agmAndGeneralMeeting: optionalId,
  }),
  supportAndModeration: z.object({
    helpAndSupport: optionalId,
    reportAnIssue: optionalId,
    moderatorLogs: optionalId,
    botCommands: optionalId,
    discordCommunityUpdatesLog: optionalId,
    sdkRulesLog: optionalId,
  }),
  sdkAdmins: z.object({
    adminChat: optionalId,
    constitutions: optionalId,
    adminBslLounge: optionalId,
  }),
});

const rolesSchema = z.object({
  // Club roles are required: permission checks depend on them.
  sdkFounder: id,
  admins: id,
  chairperson: id,
  secretary: id,
  treasurer: id,
  trustees: id,
  volunteer: id,
  sdkMember: id,
  sdkJuniorMember: id,
  guest: id,
  // Opt-in notification roles (#choose-your-roles).
  selfAssign: z.object({
    clubNews: optionalId,
    socialEvents: optionalId,
    practiceAlerts: optionalId,
    eventAlerts: optionalId,
  }),
});

type Channels = z.infer<typeof channelsSchema>;

/** A channel reference such as "sdkInformation.sdkAnnouncement". */
export type ChannelPath = {
  [C in keyof Channels]: `${C & string}.${keyof Channels[C] & string}`;
}[keyof Channels];

const channelPath = z.custom<ChannelPath>(
  (value) => typeof value === 'string' && /^\w+\.\w+$/.test(value),
  'must look like "category.channel"',
);

export const guildConfigSchema = z
  .object({
    guildId: id,
    channels: channelsSchema,
    roles: rolesSchema,
    emojis: z.record(z.string(), customEmoji).default({}),
    notifications: z
      .object({
        clubNews: channelPath,
        socialEvents: channelPath,
        practiceAlerts: channelPath,
        eventAlerts: channelPath,
      })
      .partial()
      .default({}),
  })
  .superRefine((config, ctx) => {
    // Every notification must point at a channel that exists in "channels".
    for (const [key, target] of Object.entries(config.notifications)) {
      if (target === undefined) continue;
      if (resolveChannelPath(config.channels, target) === undefined) {
        ctx.addIssue({
          code: 'custom',
          path: ['notifications', key],
          message: `"${target}" is not a channel in "channels"`,
        });
      }
    }
  });

export type GuildConfig = z.infer<typeof guildConfigSchema>;

/** Thrown when guild.json is missing or invalid. */
export class GuildConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuildConfigError';
  }
}

/**
 * Look up a channel ID from a "category.channel" path.
 * Returns undefined if the path does not exist (empty string if not filled in yet).
 */
export function resolveChannelPath(channels: Channels, target: string): string | undefined {
  const [category, channel] = target.split('.');
  if (category === undefined || channel === undefined) return undefined;
  const group = (channels as Record<string, Record<string, string> | undefined>)[category];
  return group?.[channel];
}

/** Validate already-parsed JSON. Pure function so it is easy to test. */
export function parseGuildConfig(raw: unknown): GuildConfig {
  const result = guildConfigSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues.map(
      (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
    );
    throw new GuildConfigError(`Invalid guild config:\n  - ${problems.join('\n  - ')}`);
  }
  return result.data;
}

/** Read and validate the guild config file (path relative to the project root). */
export function loadGuildConfig(relativePath: string): GuildConfig {
  const fullPath = path.resolve(PROJECT_ROOT, relativePath);
  let text: string;
  try {
    text = readFileSync(fullPath, 'utf8');
  } catch {
    throw new GuildConfigError(
      `Could not read ${relativePath}. Copy config/guild.example.json to ${relativePath} and fill in the IDs.`,
    );
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new GuildConfigError(`${relativePath} is not valid JSON: ${reason}`);
  }
  return parseGuildConfig(json);
}

/** Every configured channel and role ID with a readable name, for /config check. */
export function listConfiguredIds(config: GuildConfig): {
  channels: { name: string; id: string }[];
  roles: { name: string; id: string }[];
} {
  const channels = Object.entries(config.channels).flatMap(([category, group]) =>
    Object.entries(group).map(([name, value]) => ({ name: `${category}.${name}`, id: value })),
  );

  const { selfAssign, ...clubRoles } = config.roles;
  const roles = [
    ...Object.entries(clubRoles).map(([name, value]) => ({ name, id: value })),
    ...Object.entries(selfAssign).map(([name, value]) => ({
      name: `selfAssign.${name}`,
      id: value,
    })),
  ];
  return { channels, roles };
}

/**
 * Permission levels.
 *
 * Each command declares the minimum level it needs. A person's level comes
 * from their Discord roles (IDs in config/guild.json). Higher levels include
 * everything below them.
 *
 * Junior membership is NOT a lower level: Junior Members are Members, with
 * extra safeguards checked separately using `isJuniorMember()`.
 */
import type { GuildConfig } from '../../config/guild.js';

export enum PermissionLevel {
  /** Anyone in the server, including people who have not agreed to the rules. */
  Everyone = 0,
  /** Agreed to the rules (Guest role). */
  Guest = 1,
  /** SDK Member or SDK Junior Member. */
  Member = 2,
  /** Volunteer — SDK's moderators. */
  Volunteer = 3,
  /** Trustees, Chairperson, Secretary, Treasurer. */
  Trustee = 4,
  /** Admins and SDK Founder (and the server owner). */
  Admin = 5,
}

export const PERMISSION_LEVEL_NAMES: Record<PermissionLevel, string> = {
  [PermissionLevel.Everyone]: 'Everyone',
  [PermissionLevel.Guest]: 'Guest',
  [PermissionLevel.Member]: 'SDK Member',
  [PermissionLevel.Volunteer]: 'Volunteer',
  [PermissionLevel.Trustee]: 'Trustee',
  [PermissionLevel.Admin]: 'Admin',
};

export interface MemberIdentity {
  /** IDs of every role the person has. */
  roleIds: ReadonlySet<string>;
  /** True if the person owns the Discord server. */
  isServerOwner: boolean;
}

/** Work out a person's permission level. Pure function, easy to test. */
export function getPermissionLevel(
  member: MemberIdentity,
  roles: GuildConfig['roles'],
): PermissionLevel {
  const has = (roleId: string): boolean => member.roleIds.has(roleId);

  if (member.isServerOwner || has(roles.admins) || has(roles.sdkFounder)) {
    return PermissionLevel.Admin;
  }
  if (
    has(roles.trustees) ||
    has(roles.chairperson) ||
    has(roles.secretary) ||
    has(roles.treasurer)
  ) {
    return PermissionLevel.Trustee;
  }
  if (has(roles.volunteer)) return PermissionLevel.Volunteer;
  if (has(roles.sdkMember) || has(roles.sdkJuniorMember)) return PermissionLevel.Member;
  if (has(roles.guest)) return PermissionLevel.Guest;
  return PermissionLevel.Everyone;
}

export function isJuniorMember(member: MemberIdentity, roles: GuildConfig['roles']): boolean {
  return member.roleIds.has(roles.sdkJuniorMember);
}

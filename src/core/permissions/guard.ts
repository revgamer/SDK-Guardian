/**
 * Permission guard: checks a person's level before a command runs.
 *
 * Discord's own "default member permissions" setting only hides commands and
 * can be changed by server admins, so the bot always checks here as well.
 */
import type { GuildMember } from 'discord.js';
import type { GuildConfig } from '../../config/guild.js';
import { PermissionError } from '../errors/AppError.js';
import {
  getPermissionLevel,
  PERMISSION_LEVEL_NAMES,
  type MemberIdentity,
  type PermissionLevel,
} from './levels.js';

export function toMemberIdentity(member: GuildMember): MemberIdentity {
  return {
    roleIds: new Set(member.roles.cache.keys()),
    isServerOwner: member.guild.ownerId === member.id,
  };
}

/** Throws PermissionError if the member's level is below `required`. */
export function assertPermission(
  member: MemberIdentity,
  required: PermissionLevel,
  roles: GuildConfig['roles'],
): void {
  const level = getPermissionLevel(member, roles);
  if (level < required) {
    throw new PermissionError(
      `This command is for **${PERMISSION_LEVEL_NAMES[required]}** and above.`,
    );
  }
}

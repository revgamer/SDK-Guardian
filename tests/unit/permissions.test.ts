import { describe, expect, it } from 'vitest';
import { PermissionError } from '../../src/core/errors/AppError.js';
import { assertPermission } from '../../src/core/permissions/guard.js';
import {
  getPermissionLevel,
  isJuniorMember,
  PermissionLevel,
} from '../../src/core/permissions/levels.js';
import { makeGuildConfig } from '../helpers/fixtures.js';

const { roles } = makeGuildConfig();
const member = (roleIds: string[], isServerOwner = false) => ({
  roleIds: new Set(roleIds),
  isServerOwner,
});

describe('getPermissionLevel', () => {
  it.each([
    [[], PermissionLevel.Everyone],
    [[roles.guest], PermissionLevel.Guest],
    [[roles.sdkMember], PermissionLevel.Member],
    [[roles.sdkJuniorMember], PermissionLevel.Member],
    [[roles.volunteer], PermissionLevel.Volunteer],
    [[roles.trustees], PermissionLevel.Trustee],
    [[roles.treasurer], PermissionLevel.Trustee],
    [[roles.admins], PermissionLevel.Admin],
    [[roles.sdkFounder], PermissionLevel.Admin],
  ])('roles %j → level %i', (roleIds, expected) => {
    expect(getPermissionLevel(member(roleIds), roles)).toBe(expected);
  });

  it('uses the highest role a person has', () => {
    expect(getPermissionLevel(member([roles.sdkMember, roles.volunteer]), roles)).toBe(
      PermissionLevel.Volunteer,
    );
  });

  it('treats the server owner as Admin', () => {
    expect(getPermissionLevel(member([], true), roles)).toBe(PermissionLevel.Admin);
  });

  it('ignores self-assign notification roles', () => {
    expect(getPermissionLevel(member([roles.selfAssign.clubNews]), roles)).toBe(
      PermissionLevel.Everyone,
    );
  });

  it('identifies junior members', () => {
    expect(isJuniorMember(member([roles.sdkJuniorMember]), roles)).toBe(true);
    expect(isJuniorMember(member([roles.sdkMember]), roles)).toBe(false);
  });
});

describe('assertPermission', () => {
  it('allows equal or higher levels', () => {
    expect(() => {
      assertPermission(member([roles.trustees]), PermissionLevel.Volunteer, roles);
    }).not.toThrow();
  });

  it('refuses lower levels with a PermissionError', () => {
    expect(() => {
      assertPermission(member([roles.guest]), PermissionLevel.Admin, roles);
    }).toThrow(PermissionError);
  });
});

/**
 * Permissions utility for the PromptPro application
 * This file serves as the central reference for role-based capabilities
 */

import { getMemberRole } from '../lib/teamUtils';

/**
 * Role definitions with their capabilities
 */
export const ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
};

/**
 * Role capabilities matrix
 * Defines what each role can do within the application
 */
export const ROLE_CAPABILITIES = {
  [ROLES.OWNER]: {
    canManageTeamSettings: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canEditAnyPrompt: true,
    canDeleteAnyPrompt: true,
    canControlTeamVisibility: true,
    canViewTeamPrompts: true,
    canCreatePrompts: true,
    canEditOwnPrompts: true,
    canCommentOnPrompts: true,
  },
  [ROLES.ADMIN]: {
    canManageTeamSettings: true,
    canInviteMembers: true,
    canRemoveMembers: true,
    canEditAnyPrompt: true,
    canDeleteAnyPrompt: true,
    canControlTeamVisibility: true,
    canViewTeamPrompts: true,
    canCreatePrompts: true,
    canEditOwnPrompts: true,
    canCommentOnPrompts: true,
  },
  [ROLES.MEMBER]: {
    canManageTeamSettings: false,
    canInviteMembers: false,
    canRemoveMembers: false,
    canEditAnyPrompt: false,
    canDeleteAnyPrompt: false,
    canControlTeamVisibility: false,
    canViewTeamPrompts: true,
    canCreatePrompts: true,
    canEditOwnPrompts: true,
    canCommentOnPrompts: true,
  },
};

/**
 * Check if a user has a specific capability within a team
 * @param {Object} team - The team object
 * @param {string} userId - The user ID
 * @param {string} capability - The capability to check (e.g., 'canEditAnyPrompt')
 * @returns {boolean} - Whether the user has the capability
 */
export function hasCapability(team, userId, capability) {
  if (!team || !userId || !capability) return false;
  
  const role = getMemberRole(team, userId);
  if (!role) return false;
  
  return ROLE_CAPABILITIES[role][capability] || false;
}

/**
 * Check if a user can manage a particular prompt
 * @param {Object} team - The team object
 * @param {string} userId - The user ID
 * @param {Object} prompt - The prompt object
 * @param {string} action - The action: 'view', 'edit', 'delete'
 * @returns {boolean} - Whether the user can perform the action on the prompt
 */
export function canManagePrompt(team, userId, prompt, action) {
  if (!team || !userId || !prompt) return false;
  
  // Get user's role in the team
  const role = getMemberRole(team, userId);
  if (!role) return false;
  
  const isCreator = String(prompt.userId) === String(userId);
  
  switch (action) {
    case 'view':
      // All team members can view team prompts
      return hasCapability(team, userId, 'canViewTeamPrompts');
      
    case 'edit':
      // Admin/Owner can edit any prompt, Members can only edit their own
      return hasCapability(team, userId, 'canEditAnyPrompt') || 
             (isCreator && hasCapability(team, userId, 'canEditOwnPrompts'));
      
    case 'delete':
      // Only Admin/Owner can delete prompts
      return hasCapability(team, userId, 'canDeleteAnyPrompt') ||
             // Optionally allow creators to delete their own prompts
             (isCreator && hasCapability(team, userId, 'canDeleteOwnPrompts'));
      
    default:
      return false;
  }
}

/**
 * Check if a user can manage team settings
 * @param {Object} team - The team object
 * @param {string} userId - The user ID
 * @returns {boolean} - Whether the user can manage team settings
 */
export function canManageTeam(team, userId) {
  return hasCapability(team, userId, 'canManageTeamSettings');
}

/**
 * Check if a user can invite members to a team
 * @param {Object} team - The team object
 * @param {string} userId - The user ID
 * @returns {boolean} - Whether the user can invite members
 */
export function canInviteMembers(team, userId) {
  return hasCapability(team, userId, 'canInviteMembers');
}

/**
 * Check if a user can remove members from a team
 * @param {Object} team - The team object
 * @param {string} userId - The user ID
 * @returns {boolean} - Whether the user can remove members
 */
export function canRemoveMembers(team, userId) {
  return hasCapability(team, userId, 'canRemoveMembers');
}

// --- NEW: Simple Global Role Check Helpers ---

/**
 * Checks if the user object (from session/token) has a specific role or one of several roles.
 * Assumes user object has a 'role' property.
 * @param {Object} user - The user object (e.g., from req.user or useSession)
 * @param {string|string[]} requiredRoleOrRoles - The role name (string) or an array of allowed role names.
 * @returns {boolean} - True if the user has the required role, false otherwise.
 */
export function isRole(user, requiredRoleOrRoles) {
    if (!user || !user.role) {
        return false;
    }

    if (Array.isArray(requiredRoleOrRoles)) {
        return requiredRoleOrRoles.includes(user.role);
    } else {
        return user.role === requiredRoleOrRoles;
    }
}

/**
 * Checks if the user is an Admin or an Editor.
 * @param {Object} user - The user object (e.g., from req.user or useSession)
 * @returns {boolean} - True if the user is an admin or editor.
 */
export function isAdminOrEditor(user) {
    // Assuming your roles are defined in the User model schema enum
    return isRole(user, ['admin', 'editor']);
}

/**
 * Checks if the user is an Admin.
 * @param {Object} user - The user object (e.g., from req.user or useSession)
 * @returns {boolean} - True if the user is an admin.
 */
export function isAdmin(user) {
    return isRole(user, 'admin');
} 
/**
 * Permissions utility for the PromptPro application
 * This file serves as the central reference for role-based capabilities
 */

import { getMemberRole, isTeamAdmin, isTeamMember } from '../models/team';

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
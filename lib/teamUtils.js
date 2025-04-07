/**
 * Team utility functions for validation, sanitization, and role checks.
 * These functions are safe to use on both server and client side
 * as they do not depend on the Mongoose model itself.
 */

/**
 * Validate team data
 * @param {Object} data - Team data to validate
 * @returns {Object} Validation result with errors if any
 */
export const validateTeam = (data, isUpdate = false) => {
  const errors = {};

  // Name is required unless this is an update
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim() === '') {
      errors.name = 'Team name is required';
    } else if (data.name.length > 100) {
      errors.name = 'Team name must be less than 100 characters';
    }
  }

  // Description length check if provided
  if (data.description && data.description.length > 500) {
    errors.description = 'Team description must be less than 500 characters';
  }

  // Creator required for new teams
  if (!isUpdate && !data.userId) {
    errors.userId = 'Creator ID is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize team data for safe display
 * @param {Object} team - Team data to sanitize
 * @returns {Object} Sanitized team data
 */
export const sanitizeTeam = (team) => {
  return {
    ...team,
    // Remove any sensitive information if needed
  };
};

/**
 * Get member role in team
 * This function expects the team object to potentially have a `members` array
 * where each member has a `user` (with an `equals` method, like a Mongoose ObjectId) and a `role`.
 * @param {Object} team - Team object
 * @param {string} userId - User ID to check
 * @returns {string|null} Member role or null if not a member
 */
export const getMemberRole = (team, userId) => {
  if (!team) {
      return null; 
  }
  
  // The check for m.user?.equals(userId) assumes the `user` field might be populated
  // or it might be just the ID. The `.equals` method is typical for Mongoose ObjectIds.
  // If userId is not an ObjectId on the server, direct comparison might be needed.
  // Using optional chaining `?.` for safety.
  const member = team.members?.find(m => 
    // Check if m.user exists and has an 'equals' method (likely ObjectId)
    m.user && typeof m.user.equals === 'function' 
      ? m.user.equals(userId) 
      // Otherwise, try comparing directly (assuming m.user might be a string ID)
      : m.user === userId
  );
  
  return member ? member.role : null;
};

/**
 * Check if user has admin privileges in team
 * @param {Object} team - Team object
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user is owner or admin
 */
export const isTeamAdmin = (team, userId) => {
  if (!team) return false; 
  const role = getMemberRole(team, userId);
  return role === 'owner' || role === 'admin';
};

/**
 * Check if user is a member of the team
 * @param {Object} team - Team object
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user is a team member
 */
export const isTeamMember = (team, userId) => {
   if (!team) return false;
  return getMemberRole(team, userId) !== null;
}; 
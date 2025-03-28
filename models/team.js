/**
 * Team data model and validation functions
 */

/**
 * Team model schema
 * @typedef {Object} TeamModel
 * @property {string} id - Unique identifier
 * @property {string} name - Team name
 * @property {string} description - Team description
 * @property {string} userId - ID of the team creator/owner
 * @property {Array<TeamMember>} members - Array of team members
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * Team member schema
 * @typedef {Object} TeamMember
 * @property {string} userId - User ID
 * @property {string} role - Member role (owner, admin, member)
 * @property {string} joinedAt - Timestamp when member joined
 */

/**
 * Team model definition
 */
export const teamModel = {
  id: '',
  name: '',
  description: '',
  userId: '', // Creator/owner
  members: [], // Array of member objects
  createdAt: '',
  updatedAt: '',
};

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
 * @param {Object} team - Team object
 * @param {string} userId - User ID to check
 * @returns {string|null} Member role or null if not a member
 */
export const getMemberRole = (team, userId) => {
  // Check if user is the owner first (backwards compatibility)
  if (team.userId === userId) {
    return 'owner';
  }
  
  // Check in members array
  const member = team.members.find(m => m.userId === userId);
  return member ? member.role : null;
};

/**
 * Check if user has admin privileges in team
 * @param {Object} team - Team object
 * @param {string} userId - User ID to check
 * @returns {boolean} True if user is owner or admin
 */
export const isTeamAdmin = (team, userId) => {
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
  return getMemberRole(team, userId) !== null;
};
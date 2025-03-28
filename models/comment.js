/**
 * Comment data model and validation functions
 */

/**
 * Comment model schema
 * @typedef {Object} CommentModel
 * @property {string} id - Unique identifier
 * @property {string} promptId - ID of the prompt the comment is on
 * @property {string} userId - ID of the comment creator
 * @property {string} content - Comment text content
 * @property {string} createdBy - Name of the user who created the comment
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * Comment model definition
 */
export const commentModel = {
  id: '',
  promptId: '',
  userId: '',
  content: '',
  createdBy: '',
  createdAt: '',
  updatedAt: '',
};

/**
 * Validate comment data
 * @param {Object} data - Comment data to validate
 * @returns {Object} Validation result with errors if any
 */
export const validateComment = (data) => {
  const errors = {};

  if (!data.content || data.content.trim() === '') {
    errors.content = 'Comment content is required';
  } else if (data.content.length > 1000) {
    errors.content = 'Comment must be less than 1000 characters';
  }

  if (!data.promptId) {
    errors.promptId = 'Prompt ID is required';
  }

  if (!data.userId) {
    errors.userId = 'User ID is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Sanitize comment data for safe display
 * @param {Object} comment - Comment data to sanitize
 * @returns {Object} Sanitized comment data
 */
export const sanitizeComment = (comment) => {
  return {
    ...comment,
    // Remove any sensitive information if needed
  };
};
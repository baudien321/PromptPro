// Prompt model structure
export const promptModel = {
  id: Number,
  title: String,
  content: String,
  description: String, // Brief description of what the prompt does
  tags: Array, // of strings
  aiPlatform: String, // e.g., 'ChatGPT', 'Claude', 'MidJourney', 'DALL-E', etc.
  rating: Number, // 1-5 rating
  usageCount: Number, // How many times the prompt has been used
  successRate: Number, // Percentage of successful uses (0-100)
  visibility: String, // 'public', 'private', 'team'
  userId: Number, // ID of the user who created the prompt
  createdBy: String, // Name of the user who created the prompt
  teamId: Number, // ID of the team if shared with a team (optional)
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
};

// Validate prompt data
export const validatePrompt = (data) => {
  const errors = {};
  
  // Required fields
  if (!data.title) {
    errors.title = 'Title is required';
  } else if (data.title.length < 3) {
    errors.title = 'Title must be at least 3 characters';
  } else if (data.title.length > 100) {
    errors.title = 'Title must be less than 100 characters';
  }
  
  if (!data.content) {
    errors.content = 'Content is required';
  } else if (data.content.length < 10) {
    errors.content = 'Content must be at least 10 characters';
  }
  
  // Optional description
  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  
  // Tags validation
  if (data.tags) {
    if (!Array.isArray(data.tags)) {
      errors.tags = 'Tags must be an array';
    } else {
      for (let i = 0; i < data.tags.length; i++) {
        const tag = data.tags[i];
        if (typeof tag !== 'string') {
          errors.tags = 'All tags must be strings';
          break;
        }
        if (tag.length < 1) {
          errors.tags = 'Tags cannot be empty';
          break;
        }
        if (tag.length > 20) {
          errors.tags = 'Tags must be less than 20 characters';
          break;
        }
      }
    }
  }
  
  // AI Platform validation
  if (data.aiPlatform && typeof data.aiPlatform !== 'string') {
    errors.aiPlatform = 'AI Platform must be a string';
  }
  
  // Rating validation (1-5)
  if (data.rating !== undefined) {
    if (typeof data.rating !== 'number') {
      errors.rating = 'Rating must be a number';
    } else if (data.rating < 1 || data.rating > 5) {
      errors.rating = 'Rating must be between 1 and 5';
    }
  }
  
  // Usage count validation
  if (data.usageCount !== undefined && (typeof data.usageCount !== 'number' || data.usageCount < 0)) {
    errors.usageCount = 'Usage count must be a non-negative number';
  }
  
  // Success rate validation (0-100)
  if (data.successRate !== undefined) {
    if (typeof data.successRate !== 'number') {
      errors.successRate = 'Success rate must be a number';
    } else if (data.successRate < 0 || data.successRate > 100) {
      errors.successRate = 'Success rate must be between 0 and 100';
    }
  }
  
  // Visibility validation
  if (data.visibility) {
    const validVisibilities = ['public', 'private', 'team'];
    if (!validVisibilities.includes(data.visibility)) {
      errors.visibility = 'Visibility must be one of: public, private, team';
    }
    
    // If visibility is 'team', teamId must be provided
    if (data.visibility === 'team' && !data.teamId) {
      errors.teamId = 'Team ID is required when visibility is set to team';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

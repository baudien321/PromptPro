// Prompt model structure
export const promptModel = {
  id: Number,
  title: String,
  content: String,
  tags: Array, // of strings
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
};

// Validate prompt data
export const validatePrompt = (data) => {
  const errors = {};
  
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
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Collection model structure
export const collectionModel = {
  id: Number,
  name: String,
  description: String,
  prompts: Array, // of prompt IDs
  createdAt: String, // ISO date string
  updatedAt: String, // ISO date string
};

// Validate collection data
export const validateCollection = (data) => {
  const errors = {};
  
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (data.name.length < 3) {
    errors.name = 'Name must be at least 3 characters';
  } else if (data.name.length > 50) {
    errors.name = 'Name must be less than 50 characters';
  }
  
  if (data.description && data.description.length > 200) {
    errors.description = 'Description must be less than 200 characters';
  }
  
  if (data.prompts) {
    if (!Array.isArray(data.prompts)) {
      errors.prompts = 'Prompts must be an array';
    } else {
      for (let i = 0; i < data.prompts.length; i++) {
        const promptId = data.prompts[i];
        if (typeof promptId !== 'number' && !Number.isInteger(parseInt(promptId))) {
          errors.prompts = 'All prompt IDs must be integers';
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

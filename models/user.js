// User model for authentication and user profile
export const userModel = {
  // Basic user information
  id: String,
  name: String,
  email: String,
  password: String, // Hashed password for email/password auth
  image: String,    // Profile image URL
  
  // Account metadata
  createdAt: Date,
  updatedAt: Date,
  
  // Optional fields
  bio: String,
  preferences: Object,
};

// Validation for user data
export const validateUser = (data) => {
  const errors = {};
  
  // Name validation
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }
  
  // Password validation (only if provided - not required for OAuth)
  if (data.password !== undefined) {
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Method to sanitize user data for client-side (remove sensitive info)
export const sanitizeUser = (user) => {
  if (!user) return null;
  
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};
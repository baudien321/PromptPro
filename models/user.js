import mongoose, { Schema, models } from 'mongoose';

// Define the User Schema using Mongoose
const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: [true, 'Username already exists.'],
    match: [/^(?=.{4,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/, "Username invalid, it should contain 4-20 alphanumeric letters and be unique!"] // Example regex validation
  },
  name: {
    type: String,
    required: [true, 'Name is required.'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address.']
  },
  password: {
    type: String,
    required: [true, 'Password is required.'], // Will store the hash
    select: false // Prevents password hash from being sent by default
  },
  image: {
    type: String, // URL to profile image
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bio: {
      type: String,
      maxlength: 160 // Example constraint
  },
  preferences: {
      type: Object // Or define a more specific sub-schema if needed
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },
  // --- Payment/Plan Fields ---
  plan: {
      type: String,
      enum: ['Free', 'Pro'], // Use 'Free' and 'Pro' for plan names
      default: 'Free' // Default to the 'Free' plan
  },
  promptCount: {
      type: Number,
      default: 0,
      min: 0 // Ensure count doesn't go below zero
  },
  stripeCustomerId: { // Optional: Store Stripe Customer ID if using Stripe
      type: String,
      index: true // Index if you often look up users by Stripe ID
  },
  // Mongoose automatically adds createdAt and updatedAt
}, { timestamps: true }); // Enable automatic timestamps

// Create the User model if it doesn't already exist
const User = models.User || mongoose.model('User', UserSchema);

export default User;

// Validation for user data (consider adapting to Mongoose validation or using alongside)
export const validateUser = (data) => {
  const errors = {};

  // Username validation
  if (!data.username) {
      errors.username = 'Username is required';
  } else if (data.username.length < 4 || data.username.length > 20) {
      errors.username = 'Username must be between 4 and 20 characters';
  }
  if (!/^[a-zA-Z0-9._]+$/.test(data.username) || data.username.includes('..') || data.username.startsWith('.') || data.username.endsWith('.') || data.username.startsWith('_') || data.username.endsWith('_')) {
      // Check if username exists first before applying regex if making optional
      if(data.username) errors.username = 'Username contains invalid characters.';
  }

  // Name validation (removed - no longer required on signup)
  /*
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  */

  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Email is invalid';
  }

  // Password validation (for input, not the hash)
  // Note: Mongoose handles required check. This is for length etc. on signup.
  if (data.password !== undefined) {
    if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Method to sanitize user data for client-side (remove sensitive info)
// Adapt this if you fetch user data using Mongoose and need to hide fields
// Mongoose 'select: false' on password helps, but this can be used for other fields
export const sanitizeUser = (user) => {
  if (!user) return null;

  // If user is a Mongoose document, convert to object first
  const userObject = typeof user.toObject === 'function' ? user.toObject() : user;

  const { password, __v, ...sanitizedUser } = userObject; // Remove password and __v
  return sanitizedUser;
};
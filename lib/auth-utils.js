import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password to check
 * @param {string} hash - Hashed password to compare against
 * @returns {Promise<boolean>} - True if password matches hash
 */
export const verifyPassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a random token (e.g., for email confirmation, password reset)
 * @param {number} length - Length of the token
 * @returns {string} - Random token
 */
export const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};
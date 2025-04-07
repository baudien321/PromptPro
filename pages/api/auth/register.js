import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../../models/user'; // Adjust path if needed
import { validateUser } from '../../../models/user'; // Import the validator
import connectDB from '../../../lib/mongoose'; // Import the shared connection function

// Simple Mongoose connection helper (you might move this to a separate lib file)
// Caches the connection promise
/*
let connectionPromise = null;
const connectDB = async () => {
  if (connectionPromise) {
    return connectionPromise;
  }

  if (!process.env.MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB || 'PromptPro', // Use specific DB name or default
      // These options are generally recommended but check Mongoose docs for latest
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // useCreateIndex: true, // Not needed in Mongoose 6+
      // useFindAndModify: false // Not needed in Mongoose 6+
  }).then((mongooseInstance) => {
      console.log("Mongoose connected successfully.");
      return mongooseInstance;
  }).catch(err => {
      console.error("Mongoose connection error:", err);
      connectionPromise = null; // Reset promise on error
      throw err; // Re-throw error to be caught by handler
  });

  return connectionPromise;
};
*/

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    await connectDB();

    const { username, email, password } = req.body;

    // --- Input Validation --- 
    // 1. Basic presence check
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields: username, email, password' });
    }

    // 2. Use the validateUser function for length/format checks (optional, Mongoose also validates)
    const { isValid, errors } = validateUser({ username, email, password });
    if (!isValid) {
        // Return the first error found for simplicity, or could return all
        const firstErrorKey = Object.keys(errors)[0];
        return res.status(400).json({ message: errors[firstErrorKey] });
    }

    // --- Check if user already exists (redundant with unique index, but good practice) ---
    // Note: Mongoose unique index error handling is done in the catch block
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] }).lean(); // lean() for faster read
    if (existingUser) {
        if (existingUser.email === email.toLowerCase()) {
            return res.status(409).json({ message: 'Email already in use.' });
        }
        if (existingUser.username === username) {
            return res.status(409).json({ message: 'Username already taken.' });
        }
    }

    // --- Hash Password --- 
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // --- Create User --- 
    const newUser = new User({
      username,
      email: email.toLowerCase(), // Store email consistently
      password: hashedPassword,
      // role will use the default ('viewer') defined in the schema
    });

    await newUser.save();

    // --- Respond --- 
    // Avoid sending back the password hash or full user object on register
    return res.status(201).json({ message: 'User registered successfully.'});

  } catch (error) {
    console.error('Registration Error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
        // Extract a user-friendly message from the Mongoose error
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ message: messages.join(', ') || 'Validation failed.' });
    }

    // Handle duplicate key errors (e.g., unique username/email constraint)
    if (error.code === 11000) {
        let message = 'Duplicate key error.';
        if (error.keyPattern?.email) {
            message = 'Email already in use.';
        } else if (error.keyPattern?.username) {
            message = 'Username already taken.';
        }
        return res.status(409).json({ message });
    }

    // Generic server error
    return res.status(500).json({ message: 'Internal Server Error' });
  }
} 
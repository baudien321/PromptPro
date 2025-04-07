import mongoose from 'mongoose';

// Cache the connection promise to avoid reconnecting on every call
let connectionPromise = null;

const connectDB = async () => {
  // If a connection promise exists, return it to reuse the connection
  if (connectionPromise) {
    // console.log("Using cached Mongoose connection");
    return connectionPromise;
  }

  // Check for MongoDB URI environment variable
  if (!process.env.MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // Create a new connection promise
  console.log("Creating new Mongoose connection...");
  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB || 'PromptPro', // Use specific DB name or default
    // Recommended options (check Mongoose docs for latest)
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }).then((mongooseInstance) => {
    console.log("Mongoose connected successfully.");
    return mongooseInstance; // The resolved value of the promise
  }).catch(err => {
    console.error("Mongoose connection error:", err);
    connectionPromise = null; // Reset promise on error so retry is possible
    throw err; // Re-throw error to be caught by the calling function
  });

  return connectionPromise;
};

export default connectDB; 
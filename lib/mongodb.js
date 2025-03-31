import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

if (!dbName) {
  throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
}

let cachedClient = null;
let cachedDb = null;

/**
 * Connects to the MongoDB database and returns the client and db instances.
 * Caches the connection to avoid reconnecting on every request in development.
 */
export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    const client = new MongoClient(uri, {
      // useNewUrlParser: true, // Deprecated in newer versions
      // useUnifiedTopology: true, // Deprecated in newer versions
    });

    await client.connect();
    const db = client.db(dbName);

    console.log("Successfully connected to MongoDB.");

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw new Error("Could not connect to database.");
  }
}

// Optional: Helper to close the connection (useful for scripts or tests)
export async function closeDatabaseConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log("MongoDB connection closed.");
  }
}

// Helper function to get collection references
export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
} 
import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'collections';

/**
 * Get all collections with optional filtering
 * @param {Object} filter - Optional filter criteria
 * @returns {Promise<Array>} Array of collections
 */
export async function getAllCollections(filter = {}) {
  const collection = await getCollection(COLLECTION_NAME);
  const collections = await collection.find(filter).toArray();
  return collections.map(mapMongoCollection);
}

/**
 * Get a single collection by ID
 * @param {string} id - Collection ID
 * @returns {Promise<Object|null>} Collection object or null
 */
export async function getCollectionById(id) {
  const collection = await getCollection(COLLECTION_NAME);
  const result = await collection.findOne({ _id: new ObjectId(id) });
  return result ? mapMongoCollection(result) : null;
}

/**
 * Create a new collection
 * @param {Object} collectionData - Collection data
 * @returns {Promise<Object>} Created collection
 */
export async function createCollection(collectionData) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const newCollection = {
    ...collectionData,
    prompts: collectionData.prompts || [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await collection.insertOne(newCollection);
  
  return {
    id: result.insertedId.toString(),
    ...newCollection
  };
}

/**
 * Update an existing collection
 * @param {string} id - Collection ID
 * @param {Object} collectionData - Updated collection data
 * @returns {Promise<Object|null>} Updated collection or null
 */
export async function updateCollection(id, collectionData) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const updatedCollection = {
    ...collectionData,
    updatedAt: new Date()
  };
  
  // Don't override these fields if not explicitly provided
  delete updatedCollection._id;
  delete updatedCollection.id;
  delete updatedCollection.createdAt;
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatedCollection },
    { returnDocument: 'after' }
  );
  
  return result.value ? mapMongoCollection(result.value) : null;
}

/**
 * Delete a collection
 * @param {string} id - Collection ID
 * @returns {Promise<boolean>} Success flag
 */
export async function deleteCollection(id) {
  const collection = await getCollection(COLLECTION_NAME);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

/**
 * Add a prompt to a collection
 * @param {string} collectionId - Collection ID
 * @param {string} promptId - Prompt ID
 * @returns {Promise<Object|null>} Updated collection or null
 */
export async function addPromptToCollection(collectionId, promptId) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(collectionId) },
    { 
      $addToSet: { prompts: promptId },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  );
  
  return result.value ? mapMongoCollection(result.value) : null;
}

/**
 * Remove a prompt from a collection
 * @param {string} collectionId - Collection ID
 * @param {string} promptId - Prompt ID
 * @returns {Promise<Object|null>} Updated collection or null
 */
export async function removePromptFromCollection(collectionId, promptId) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(collectionId) },
    { 
      $pull: { prompts: promptId },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  );
  
  return result.value ? mapMongoCollection(result.value) : null;
}

/**
 * Map MongoDB document to app model (handling _id conversion)
 * @param {Object} doc - MongoDB document
 * @returns {Object} Mapped collection object
 */
function mapMongoCollection(doc) {
  return {
    id: doc._id.toString(),
    ...doc,
    _id: undefined
  };
} 
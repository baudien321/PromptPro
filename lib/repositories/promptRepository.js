import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'prompts';

/**
 * Get all prompts with optional filtering
 * @param {Object} filter - Optional filter criteria
 * @returns {Promise<Array>} Array of prompts
 */
export async function getAllPrompts(filter = {}) {
  const collection = await getCollection(COLLECTION_NAME);
  const prompts = await collection.find(filter).toArray();
  return prompts.map(mapMongoPrompt);
}

/**
 * Get a single prompt by ID
 * @param {string} id - Prompt ID
 * @returns {Promise<Object|null>} Prompt object or null
 */
export async function getPromptById(id) {
  const collection = await getCollection(COLLECTION_NAME);
  const prompt = await collection.findOne({ _id: new ObjectId(id) });
  return prompt ? mapMongoPrompt(prompt) : null;
}

/**
 * Create a new prompt
 * @param {Object} promptData - Prompt data
 * @returns {Promise<Object>} Created prompt
 */
export async function createPrompt(promptData) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const newPrompt = {
    ...promptData,
    createdAt: new Date(),
    updatedAt: new Date(),
    usageCount: 0,
    rating: promptData.rating || 0
  };
  
  const result = await collection.insertOne(newPrompt);
  
  return {
    id: result.insertedId.toString(),
    ...newPrompt
  };
}

/**
 * Update an existing prompt
 * @param {string} id - Prompt ID
 * @param {Object} promptData - Updated prompt data
 * @returns {Promise<Object|null>} Updated prompt or null
 */
export async function updatePrompt(id, promptData) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const updatedPrompt = {
    ...promptData,
    updatedAt: new Date()
  };
  
  // Don't override these fields if not explicitly provided
  delete updatedPrompt._id;
  delete updatedPrompt.id;
  delete updatedPrompt.createdAt;
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatedPrompt },
    { returnDocument: 'after' }
  );
  
  return result.value ? mapMongoPrompt(result.value) : null;
}

/**
 * Delete a prompt
 * @param {string} id - Prompt ID
 * @returns {Promise<boolean>} Success flag
 */
export async function deletePrompt(id) {
  const collection = await getCollection(COLLECTION_NAME);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

/**
 * Increment prompt usage count
 * @param {string} id - Prompt ID
 * @returns {Promise<Object|null>} Updated prompt or null
 */
export async function incrementUsageCount(id) {
  const collection = await getCollection(COLLECTION_NAME);
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $inc: { usageCount: 1 } },
    { returnDocument: 'after' }
  );
  
  return result.value ? mapMongoPrompt(result.value) : null;
}

/**
 * Search prompts with advanced filtering
 * @param {string} query - Search text
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of matching prompts
 */
export async function searchPrompts(query, options = {}) {
  const collection = await getCollection(COLLECTION_NAME);
  
  // Build MongoDB query
  const filter = {};
  
  // Text search if query provided
  if (query && query.trim() !== '') {
    filter.$or = [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
      { tags: { $in: [query] } }
    ];
  }
  
  // Apply filters
  if (options.userId) {
    filter.userId = options.userId;
  }
  
  if (options.teamId) {
    filter.$or = filter.$or || [];
    filter.$or.push(
      { teamId: options.teamId },
      { visibility: 'team', teamId: options.teamId }
    );
  }
  
  if (options.visibility) {
    filter.visibility = options.visibility;
  }
  
  if (options.aiPlatform) {
    filter.aiPlatform = options.aiPlatform;
  }
  
  if (options.minRating) {
    filter.rating = { $gte: parseFloat(options.minRating) };
  }
  
  if (options.minUsageCount) {
    filter.usageCount = { $gte: parseInt(options.minUsageCount, 10) };
  }
  
  if (options.tags && options.tags.length > 0) {
    const tags = Array.isArray(options.tags) ? options.tags : [options.tags];
    
    if (options.tagMatchType === 'any') {
      filter.tags = { $in: tags };
    } else {
      filter.tags = { $all: tags };
    }
  }
  
  // Sort options
  const sort = {};
  if (options.sortBy) {
    sort[options.sortBy] = options.sortDirection === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1; // Default sort by newest
  }
  
  const prompts = await collection
    .find(filter)
    .sort(sort)
    .limit(options.limit || 100)
    .toArray();
  
  return prompts.map(mapMongoPrompt);
}

/**
 * Map MongoDB document to app model (handling _id conversion)
 * @param {Object} doc - MongoDB document
 * @returns {Object} Mapped prompt object
 */
function mapMongoPrompt(doc) {
  return {
    id: doc._id.toString(),
    ...doc,
    _id: undefined
  };
} 
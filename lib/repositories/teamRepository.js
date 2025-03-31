import { getCollection } from '../mongodb';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'teams';

/**
 * Get all teams with optional filtering
 * @param {Object} filter - Optional filter criteria
 * @returns {Promise<Array>} Array of teams
 */
export async function getAllTeams(filter = {}) {
  const collection = await getCollection(COLLECTION_NAME);
  const teams = await collection.find(filter).toArray();
  return teams.map(mapMongoTeam);
}

/**
 * Get a single team by ID
 * @param {string} id - Team ID
 * @returns {Promise<Object|null>} Team object or null
 */
export async function getTeamById(id) {
  const collection = await getCollection(COLLECTION_NAME);
  const team = await collection.findOne({ _id: new ObjectId(id) });
  return team ? mapMongoTeam(team) : null;
}

/**
 * Create a new team
 * @param {Object} teamData - Team data
 * @returns {Promise<Object>} Created team
 */
export async function createTeam(teamData) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const newTeam = {
    ...teamData,
    members: teamData.members || [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // Ensure creator is added as an owner if not already in members
  if (newTeam.userId && !newTeam.members.some(m => m.userId === newTeam.userId)) {
    newTeam.members.push({
      userId: newTeam.userId,
      role: 'owner',
      joinedAt: new Date()
    });
  }
  
  const result = await collection.insertOne(newTeam);
  
  return {
    id: result.insertedId.toString(),
    ...newTeam
  };
}

/**
 * Update an existing team
 * @param {string} id - Team ID
 * @param {Object} teamData - Updated team data
 * @returns {Promise<Object|null>} Updated team or null
 */
export async function updateTeam(id, teamData) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const updatedTeam = {
    ...teamData,
    updatedAt: new Date()
  };
  
  // Don't override these fields if not explicitly provided
  delete updatedTeam._id;
  delete updatedTeam.id;
  delete updatedTeam.createdAt;
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updatedTeam },
    { returnDocument: 'after' }
  );
  
  return result.value ? mapMongoTeam(result.value) : null;
}

/**
 * Delete a team
 * @param {string} id - Team ID
 * @returns {Promise<boolean>} Success flag
 */
export async function deleteTeam(id) {
  const collection = await getCollection(COLLECTION_NAME);
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

/**
 * Add a member to a team
 * @param {string} teamId - Team ID
 * @param {Object} memberData - Member data (userId, role)
 * @returns {Promise<Object|null>} Updated team or null
 */
export async function addTeamMember(teamId, memberData) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const member = {
    ...memberData,
    joinedAt: new Date()
  };
  
  const result = await collection.findOneAndUpdate(
    { 
      _id: new ObjectId(teamId),
      'members.userId': { $ne: memberData.userId } // Prevent duplicates
    },
    { 
      $addToSet: { members: member },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  );
  
  return result.value ? mapMongoTeam(result.value) : null;
}

/**
 * Update a team member's role
 * @param {string} teamId - Team ID
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<Object|null>} Updated team or null
 */
export async function updateTeamMemberRole(teamId, userId, role) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const result = await collection.findOneAndUpdate(
    { 
      _id: new ObjectId(teamId),
      'members.userId': userId
    },
    { 
      $set: { 
        'members.$.role': role,
        updatedAt: new Date()
      }
    },
    { returnDocument: 'after' }
  );
  
  return result.value ? mapMongoTeam(result.value) : null;
}

/**
 * Remove a member from a team
 * @param {string} teamId - Team ID
 * @param {string} userId - User ID to remove
 * @returns {Promise<Object|null>} Updated team or null
 */
export async function removeTeamMember(teamId, userId) {
  const collection = await getCollection(COLLECTION_NAME);
  
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(teamId) },
    { 
      $pull: { members: { userId: userId } },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: 'after' }
  );
  
  return result.value ? mapMongoTeam(result.value) : null;
}

/**
 * Get teams for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of teams
 */
export async function getTeamsByUserId(userId) {
  const collection = await getCollection(COLLECTION_NAME);
  const teams = await collection.find({ 
    $or: [
      { userId: userId },
      { 'members.userId': userId }
    ] 
  }).toArray();
  
  return teams.map(mapMongoTeam);
}

/**
 * Map MongoDB document to app model (handling _id conversion)
 * @param {Object} doc - MongoDB document
 * @returns {Object} Mapped team object
 */
function mapMongoTeam(doc) {
  return {
    id: doc._id.toString(),
    ...doc,
    _id: undefined
  };
} 
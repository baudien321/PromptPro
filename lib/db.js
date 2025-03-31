import { connectToDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import { hashPassword } from './auth-utils'; // Assuming auth-utils handles password hashing

/**
 * Helper function to get the database and collections.
 */
async function getCollections() {
  const { db } = await connectToDatabase();
  return {
    users: db.collection('users'),
    prompts: db.collection('prompts'),
    collections: db.collection('collections'),
    teams: db.collection('teams'),
    comments: db.collection('comments'),
  };
}

/**
 * Helper function to convert string ID to ObjectId.
 * Returns null if the ID is invalid.
 */
function toObjectId(id) {
  if (!id || !ObjectId.isValid(id)) {
    return null;
  }
  try {
    return new ObjectId(id);
  } catch (error) {
    // Handle potential errors during ObjectId creation if needed
    console.error("Error creating ObjectId:", error);
    return null;
  }
}

// --- Prompt Functions ---

export const getAllPrompts = async (filter = {}, options = {}) => {
  try {
    const { prompts } = await getCollections();
    const cursor = prompts.find(filter);
    
    // Add sorting if specified in options
    if (options.sort) {
      cursor.sort(options.sort);
    } else {
        cursor.sort({ createdAt: -1 }); // Default sort: newest first
    }

    // Add limit if specified
    if (options.limit) {
      cursor.limit(options.limit);
    }

    // Add skip for pagination if specified
    if (options.skip) {
        cursor.skip(options.skip);
    }

    const allPrompts = await cursor.toArray();
    return allPrompts;
  } catch (error) {
    console.error("Error fetching all prompts:", error);
    throw new Error("Database error while fetching prompts.");
  }
};

export const getPromptById = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  try {
    const { prompts } = await getCollections();
    const prompt = await prompts.findOne({ _id: objectId });
    return prompt;
  } catch (error) {
    console.error("Error fetching prompt by ID:", error);
    throw new Error("Database error while fetching prompt.");
  }
};

export const createPrompt = async (promptData) => {
  try {
    const { prompts } = await getCollections();
    const now = new Date();
    const newPrompt = {
      title: promptData.title,
      content: promptData.content,
      description: promptData.description || '',
      tags: promptData.tags || [],
      aiPlatform: promptData.aiPlatform || 'ChatGPT',
      rating: promptData.rating || 0,
      usageCount: promptData.usageCount || 0,
      successRate: promptData.successRate || 0,
      visibility: promptData.visibility || 'private',
      userId: promptData.userId, // Should come from authenticated session
      createdBy: promptData.createdBy, // Optional: Store creator's name/info
      teamId: promptData.teamId ? toObjectId(promptData.teamId) : null, // Convert teamId if present
      createdAt: now,
      updatedAt: now,
    };
    const result = await prompts.insertOne(newPrompt);
    return { ...newPrompt, _id: result.insertedId };
  } catch (error) {
    console.error("Error creating prompt:", error);
    throw new Error("Database error while creating prompt.");
  }
};

export const updatePrompt = async (id, promptData) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;

  try {
    const { prompts } = await getCollections();
    const updateDoc = { $set: {} };

    // Add fields to update only if they are provided
    for (const key of ['title', 'content', 'description', 'tags', 'aiPlatform', 'rating', 'usageCount', 'successRate', 'visibility', 'createdBy']) {
      if (promptData[key] !== undefined) {
        updateDoc.$set[key] = promptData[key];
      }
    }
    // Handle teamId separately - allow setting to null or a valid ObjectId
    if (promptData.teamId !== undefined) {
        updateDoc.$set.teamId = promptData.teamId ? toObjectId(promptData.teamId) : null;
    }

    // Don't update userId or createdAt
    updateDoc.$set.updatedAt = new Date();

    if (Object.keys(updateDoc.$set).length === 1) { // Only updatedAt
        // Maybe skip update if only timestamp changes?
        return prompts.findOne({ _id: objectId }); // Return current doc
    }

    const result = await prompts.updateOne({ _id: objectId }, updateDoc);

    if (result.matchedCount === 0) {
      return null; // Prompt not found
    }

    const updatedPrompt = await prompts.findOne({ _id: objectId });
    return updatedPrompt;
  } catch (error) {
    console.error("Error updating prompt:", error);
    throw new Error("Database error while updating prompt.");
  }
};

export const deletePrompt = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) return false;

  try {
    const { prompts } = await getCollections();
    // TODO: Consider deleting associated comments or handling dependencies
    const result = await prompts.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting prompt:", error);
    throw new Error("Database error while deleting prompt.");
  }
};

// TODO: Implement searchPrompts using MongoDB's text search or complex filtering
// export const searchPrompts = async (query, options = {}) => { ... };

// --- Collection Functions ---

export const getAllCollections = async (filter = {}, options = {}) => {
  try {
    const { collections } = await getCollections();
    const cursor = collections.find(filter);
    if (options.sort) cursor.sort(options.sort);
    if (options.limit) cursor.limit(options.limit);
    if (options.skip) cursor.skip(options.skip);
    const allCollections = await cursor.toArray();
    return allCollections;
  } catch (error) {
    console.error("Error fetching all collections:", error);
    throw new Error("Database error while fetching collections.");
  }
};

export const getCollectionById = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  try {
    const { collections } = await getCollections();
    // Optionally use aggregation to populate prompts if needed immediately
    const collection = await collections.findOne({ _id: objectId });
    return collection;
  } catch (error) {
    console.error("Error fetching collection by ID:", error);
    throw new Error("Database error while fetching collection.");
  }
};

export const createCollection = async (collectionData) => {
  try {
    const { collections } = await getCollections();
    const now = new Date();
    const newCollection = {
      name: collectionData.name,
      description: collectionData.description || '',
      userId: collectionData.userId, // From session
      prompts: [], // Store prompt ObjectIds here
      createdAt: now,
      updatedAt: now,
    };
    const result = await collections.insertOne(newCollection);
    return { ...newCollection, _id: result.insertedId };
  } catch (error) {
    console.error("Error creating collection:", error);
    throw new Error("Database error while creating collection.");
  }
};

export const updateCollection = async (id, collectionData) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;

  try {
    const { collections } = await getCollections();
    const updateDoc = { $set: {} };
    if (collectionData.name !== undefined) updateDoc.$set.name = collectionData.name;
    if (collectionData.description !== undefined) updateDoc.$set.description = collectionData.description;
    // Note: Managing the 'prompts' array (add/remove) typically done via separate functions
    updateDoc.$set.updatedAt = new Date();

    if (Object.keys(updateDoc.$set).length > 1) {
      const result = await collections.updateOne({ _id: objectId }, updateDoc);
      if (result.matchedCount === 0) return null;
    }

    const updatedCollection = await collections.findOne({ _id: objectId });
    return updatedCollection;
  } catch (error) {
    console.error("Error updating collection:", error);
    throw new Error("Database error while updating collection.");
  }
};

export const deleteCollection = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  try {
    const { collections } = await getCollections();
    const result = await collections.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting collection:", error);
    throw new Error("Database error while deleting collection.");
  }
};

export const addPromptToCollection = async (collectionId, promptId) => {
  const collObjectId = toObjectId(collectionId);
  const promptObjectId = toObjectId(promptId);
  if (!collObjectId || !promptObjectId) return null;

  try {
    const { collections } = await getCollections();
    // Use $addToSet to add the prompt's ObjectId to the array if not already present
    const result = await collections.updateOne(
      { _id: collObjectId },
      { 
        $addToSet: { prompts: promptObjectId },
        $set: { updatedAt: new Date() }
      }
    );
    if (result.matchedCount === 0) return null; // Collection not found
    
    const updatedCollection = await collections.findOne({ _id: collObjectId });
    return updatedCollection;
  } catch (error) {
    console.error("Error adding prompt to collection:", error);
    throw new Error("Database error while adding prompt to collection.");
  }
};

export const removePromptFromCollection = async (collectionId, promptId) => {
  const collObjectId = toObjectId(collectionId);
  const promptObjectId = toObjectId(promptId);
  if (!collObjectId || !promptObjectId) return null;

  try {
    const { collections } = await getCollections();
    // Use $pull to remove the prompt's ObjectId from the array
    const result = await collections.updateOne(
      { _id: collObjectId },
      { 
        $pull: { prompts: promptObjectId },
        $set: { updatedAt: new Date() } 
      }
    );
    if (result.matchedCount === 0) return null; // Collection not found

    const updatedCollection = await collections.findOne({ _id: collObjectId });
    return updatedCollection;
  } catch (error) {
    console.error("Error removing prompt from collection:", error);
    throw new Error("Database error while removing prompt from collection.");
  }
};

// --- User Functions ---
// Note: These are basic implementations. Authentication libraries often handle user management.

export const getAllUsers = async (filter = {}, options = {}) => {
  try {
    const { users } = await getCollections();
    // Exclude password field by default
    const cursor = users.find(filter, { projection: { password: 0 } }); 
    if (options.sort) cursor.sort(options.sort);
    if (options.limit) cursor.limit(options.limit);
    if (options.skip) cursor.skip(options.skip);
    const allUsers = await cursor.toArray();
    return allUsers;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw new Error("Database error while fetching users.");
  }
};

export const getUserById = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  try {
    const { users } = await getCollections();
    const user = await users.findOne({ _id: objectId }, { projection: { password: 0 } });
    return user;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Database error while fetching user.");
  }
};

export const getUserByEmail = async (email) => {
  if (!email) return null;
  try {
    const { users } = await getCollections();
    // Find user by email, but DO include password for authentication checks
    const user = await users.findOne({ email: email.toLowerCase() });
    return user; 
  } catch (error) {
    console.error("Error fetching user by email:", error);
    throw new Error("Database error while fetching user.");
  }
};

export const createUser = async (userData) => {
  if (!userData.email || !userData.password) {
    throw new Error("Email and password are required to create a user.");
  }
  
  try {
    const { users } = await getCollections();
    const now = new Date();
    
    // Check if user already exists
    const existingUser = await users.findOne({ email: userData.email.toLowerCase() });
    if (existingUser) {
      throw new Error("User with this email already exists.");
    }
    
    // Hash password before storing
    const hashedPassword = await hashPassword(userData.password);
    
    const newUser = {
      name: userData.name || '',
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      image: userData.image || null,
      // Add roles or other fields as needed
      createdAt: now,
      updatedAt: now,
    };
    const result = await users.insertOne(newUser);
    // Return user data without the password hash
    const { password, ...userWithoutPassword } = newUser;
    return { ...userWithoutPassword, _id: result.insertedId };

  } catch (error) {
    console.error("Error creating user:", error);
    // Rethrow specific errors or a generic one
    if (error.message === "User with this email already exists.") {
        throw error;
    }
    throw new Error("Database error while creating user.");
  }
};

export const updateUser = async (id, userData) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;

  try {
    const { users } = await getCollections();
    const updateDoc = { $set: {} };

    if (userData.name !== undefined) updateDoc.$set.name = userData.name;
    if (userData.image !== undefined) updateDoc.$set.image = userData.image;
    // Add other updatable fields (e.g., roles)
    
    // Handle email change carefully
    if (userData.email && typeof userData.email === 'string') {
      const newEmail = userData.email.toLowerCase();
      const existingUser = await users.findOne({ email: newEmail });
      // Allow update only if email doesn't exist OR belongs to the current user
      if (existingUser && !existingUser._id.equals(objectId)) {
         throw new Error("Email address is already in use.");
      }
      updateDoc.$set.email = newEmail;
    }
    
    // Do not allow password update through this general function
    // Create a specific changePassword function if needed

    updateDoc.$set.updatedAt = new Date();

    if (Object.keys(updateDoc.$set).length > 1) {
      const result = await users.updateOne({ _id: objectId }, updateDoc);
      if (result.matchedCount === 0) return null;
    }

    const updatedUser = await users.findOne({ _id: objectId }, { projection: { password: 0 } });
    return updatedUser;

  } catch (error) {
    console.error("Error updating user:", error);
     if (error.message === "Email address is already in use.") {
        throw error;
    }
    throw new Error("Database error while updating user.");
  }
};

export const deleteUser = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  try {
    const { users } = await getCollections();
    // TODO: Handle related data cleanup (e.g., reassign prompts?)
    const result = await users.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Database error while deleting user.");
  }
};


// --- Team Functions (already refactored) ---

export const getTeamById = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) return null; // Invalid ID format
  
  try {
    const { teams } = await getCollections();
    // Fetch team and potentially populate member details if needed later
    const team = await teams.findOne({ _id: objectId });
    
    // Optionally convert member userIds back to string if needed for frontend
    // if (team && team.members) {
    //   team.members = team.members.map(member => ({ ...member, userId: member.userId.toString() }));
    // }
    // Convert main _id to string
    // if (team) team._id = team._id.toString();

    return team; // Returns the team document or null if not found
  } catch (error) {
    console.error("Error fetching team by ID:", error);
    throw new Error("Database error while fetching team.");
  }
};

export const getTeamsByUserId = async (userId) => {
  // Ensure userId is treated as a string for matching unless it's clearly an ObjectId
  const userIdString = userId.toString(); 
  const userObjectId = toObjectId(userId); // Attempt conversion

  try {
    const { teams } = await getCollections();
    // Find teams where the user is the owner (userId field)
    // OR the user is in the members array (assuming member.userId is stored as string)
    const query = {
      'members.userId': userIdString
    };

    // If the original userId was *also* the ownerId field, add that check
    // This depends on how owner `userId` is stored (string vs ObjectId)
    // Let's assume owner `userId` might match the string ID from session
    const ownerQuery = { userId: userIdString };

    // Combine queries
    const finalQuery = {
      $or: [
         query,
         ownerQuery
       ]
    };
    
    // If the userId *was* a valid ObjectId, also check for ObjectId matches 
    // (in case some IDs are stored as ObjectIds)
    if (userObjectId) {
       finalQuery.$or.push({ 'members.userId': userObjectId });
       finalQuery.$or.push({ userId: userObjectId });
    }

    const userTeams = await teams.find(finalQuery).toArray();
    return userTeams;
  } catch (error) {
    console.error("Error fetching teams by user ID:", error);
    throw new Error("Database error while fetching user's teams.");
  }
};

export const createTeam = async (teamData) => {
  try {
    const { teams, users } = await getCollections();
    const now = new Date();
    const ownerUserId = teamData.userId; // Assume this is the string ID from session

    // Fetch owner's name
    let ownerName = 'Owner'; // Default
    const ownerUser = await users.findOne({ _id: toObjectId(ownerUserId) } , { projection: { name: 1 } });
    if (ownerUser && ownerUser.name) {
        ownerName = ownerUser.name;
    }

    const newTeam = {
      name: teamData.name,
      description: teamData.description || '',
      userId: ownerUserId, // Store the owner's ID (string or ObjectId consistently)
      members: [], // Initialize members
      createdAt: now,
      updatedAt: now,
    };

    // Add creator as the owner
    newTeam.members.push({
        userId: ownerUserId, // Store consistently (e.g., string ID from session)
        role: 'owner',
        joinedAt: now,
        name: ownerName // Add owner's name
    });
    
    const result = await teams.insertOne(newTeam);
    return { ...newTeam, _id: result.insertedId };
  } catch (error) {
    console.error("Error creating team:", error);
    throw new Error("Database error while creating team.");
  }
};

export const updateTeam = async (id, teamData) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;

  try {
    const { teams } = await getCollections();
    const updateDoc = { $set: {} };
    if (teamData.name !== undefined) updateDoc.$set.name = teamData.name;
    if (teamData.description !== undefined) updateDoc.$set.description = teamData.description;
    updateDoc.$set.updatedAt = new Date();

    if (Object.keys(updateDoc.$set).length > 1) {
        const result = await teams.updateOne({ _id: objectId }, updateDoc);
        if (result.matchedCount === 0) return null;
    }

    const updatedTeam = await teams.findOne({ _id: objectId });
    return updatedTeam;
  } catch (error) {
    console.error("Error updating team:", error);
    throw new Error("Database error while updating team.");
  }
};

export const deleteTeam = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  try {
    const { teams } = await getCollections();
    // TODO: Handle related data cleanup (e.g., prompts belonging to team?)
    const result = await teams.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting team:", error);
    throw new Error("Database error while deleting team.");
  }
};

export const addTeamMember = async (teamId, memberData) => {
  const teamObjectId = toObjectId(teamId);
  if (!teamObjectId) return null;
  if (!memberData || !memberData.userId) throw new Error("Member user ID is required.");

  const memberUserId = memberData.userId; // Assume string ID from request

  try {
    const { teams, users } = await getCollections();
    const now = new Date();

    // Fetch member's name
    let memberName = 'Member'; // Default
    const memberUser = await users.findOne({ _id: toObjectId(memberUserId) }, { projection: { name: 1 } });
     if (memberUser && memberUser.name) {
        memberName = memberUser.name;
    }

    const memberRecord = {
      userId: memberUserId, // Store consistently as string
      role: memberData.role || 'member',
      joinedAt: now,
      name: memberName // Add member's name
    };

    // Check if user is already a member (using the string ID)
    const team = await teams.findOne({ _id: teamObjectId, 'members.userId': memberUserId });
    if (team) {
        console.log("User is already a member of this team.");
        return team; // Already a member
    }

    // Use $addToSet (or $push if duplicates are impossible/undesired)
    const result = await teams.updateOne(
      { _id: teamObjectId },
      { 
        $push: { members: memberRecord }, // Use $push since we checked existence
        $set: { updatedAt: now } 
      }
    );

    if (result.matchedCount === 0) return null;
    
    const updatedTeam = await teams.findOne({ _id: teamObjectId });
    return updatedTeam;
    
  } catch (error) {
    console.error("Error adding team member:", error);
    throw new Error("Database error while adding team member.");
  }
};

export const removeTeamMember = async (teamId, userIdToRemove) => {
  const teamObjectId = toObjectId(teamId);
  if (!teamObjectId) return null;
  if (!userIdToRemove) throw new Error("User ID to remove is required.");

  const memberUserIdString = userIdToRemove.toString();

  try {
    const { teams } = await getCollections();
    const now = new Date();

    // Find the team first to check if the user being removed is the owner
    const team = await teams.findOne({ _id: teamObjectId });
    if (!team) return null; // Team not found

    const memberToRemove = team.members.find(m => m.userId === memberUserIdString);
    if (!memberToRemove) {
        // console.log("Member not found in team.");
        return team; // Member not found, return current team state
    }

    // Prevent removing the owner
    if (memberToRemove.role === 'owner') {
        throw new Error("Cannot remove the team owner.");
    }

    // Use $pull to remove the member by userId (string match)
    const result = await teams.updateOne(
      { _id: teamObjectId },
      { 
        $pull: { members: { userId: memberUserIdString } }, 
        $set: { updatedAt: now }
      }
    );

    if (result.modifiedCount === 0) {
      // Should not happen if member was found, but handle gracefully
      console.log("Pull operation did not modify the document.");
    }

    const updatedTeam = await teams.findOne({ _id: teamObjectId });
    return updatedTeam;

  } catch (error) {
    console.error("Error removing team member:", error);
    if (error.message === "Cannot remove the team owner.") {
        throw error;
    }
    throw new Error("Database error while removing team member.");
  }
};

// TODO: Implement updateTeamMember role if needed

// --- Comment Functions ---

export const getCommentsByPromptId = async (promptId) => {
  const promptObjectId = toObjectId(promptId);
  if (!promptObjectId) return [];
  try {
    const { comments } = await getCollections();
    // Fetch comments and sort by creation date (newest first)
    const promptComments = await comments.find({ promptId: promptObjectId }).sort({ createdAt: -1 }).toArray();
    return promptComments;
  } catch (error) {
    console.error("Error fetching comments by prompt ID:", error);
    throw new Error("Database error while fetching comments.");
  }
};

export const createComment = async (commentData) => {
  if (!commentData.promptId || !commentData.userId || !commentData.content) {
    throw new Error("Prompt ID, User ID, and content are required for comments.");
  }
  const promptObjectId = toObjectId(commentData.promptId);
  // Assuming userId is passed as string from session
  const userIdString = commentData.userId.toString(); 

  if (!promptObjectId) {
    throw new Error("Invalid Prompt ID format for comment.");
  }

  try {
    const { comments, users } = await getCollections();
    const now = new Date();

    // Fetch commenter's name
    let createdByName = 'User'; // Default
    const commenterUser = await users.findOne({ _id: toObjectId(userIdString) }, { projection: { name: 1 } });
    if (commenterUser && commenterUser.name) {
        createdByName = commenterUser.name;
    }

    const newComment = {
      promptId: promptObjectId,
      userId: userIdString, // Store userId consistently (e.g., string)
      content: commentData.content,
      createdBy: createdByName, // Store commenter's name
      createdAt: now,
      updatedAt: now,
    };
    const result = await comments.insertOne(newComment);
    return { ...newComment, _id: result.insertedId };
  } catch (error) {
    console.error("Error creating comment:", error);
    throw new Error("Database error while creating comment.");
  }
};

export const updateComment = async (id, commentData) => {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  if (!commentData.content) {
    throw new Error("Comment content is required for update.");
  }

  try {
    const { comments } = await getCollections();
    const updateDoc = {
      $set: {
        content: commentData.content,
        updatedAt: new Date(),
      },
    };
    const result = await comments.updateOne({ _id: objectId }, updateDoc);
    if (result.matchedCount === 0) return null;

    const updatedComment = await comments.findOne({ _id: objectId });
    return updatedComment;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw new Error("Database error while updating comment.");
  }
};

export const deleteComment = async (id) => {
  const objectId = toObjectId(id);
  if (!objectId) return false;
  try {
    const { comments } = await getCollections();
    const result = await comments.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Database error while deleting comment.");
  }
};

// Remove the old in-memory data and initialization logic
/*
let prompts = [];
let collections = [];
let users = [];
let teams = [];
let comments = [];
let promptIdCounter = 1;
let collectionIdCounter = 1;
let userIdCounter = 1;
let teamIdCounter = 1;
let commentIdCounter = 1;

// All old functions like:
export const getAllPrompts = () => { ... };
// ... etc.

// Initialize with some sample data - in real app, this would be loaded from database
export const initializeDb = async () => { ... };

// Call initialize when imported
(async () => { ... })();
*/

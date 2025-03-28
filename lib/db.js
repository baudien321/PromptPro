// In-memory database for development
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

// Prompts
export const getAllPrompts = () => {
  return [...prompts];
};

export const getPromptById = (id) => {
  return prompts.find(prompt => prompt.id === parseInt(id)) || null;
};

export const createPrompt = (promptData) => {
  const newPrompt = {
    id: promptIdCounter++,
    description: '',
    aiPlatform: 'ChatGPT', // Default platform
    rating: 0, // No rating yet
    usageCount: 0,
    successRate: 0,
    visibility: 'private', // Default to private
    teamId: null,
    ...promptData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  prompts.push(newPrompt);
  return newPrompt;
};

export const updatePrompt = (id, promptData) => {
  const index = prompts.findIndex(prompt => prompt.id === parseInt(id));
  
  if (index === -1) return null;
  
  const updatedPrompt = {
    ...prompts[index],
    ...promptData,
    updatedAt: new Date().toISOString(),
  };
  
  prompts[index] = updatedPrompt;
  return updatedPrompt;
};

export const deletePrompt = (id) => {
  const index = prompts.findIndex(prompt => prompt.id === parseInt(id));
  
  if (index === -1) return false;
  
  prompts.splice(index, 1);
  return true;
};

export const searchPrompts = (query, options = {}) => {
  const searchLower = query.toLowerCase();
  
  // Filter by user ID if specified
  let filteredPrompts = options.userId 
    ? prompts.filter(prompt => prompt.userId === options.userId)
    : prompts;
    
  // Filter by team ID if specified
  if (options.teamId) {
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.teamId === options.teamId || 
      (prompt.visibility === 'team' && prompt.teamId === options.teamId)
    );
  }
  
  // Filter by visibility
  if (options.visibility) {
    filteredPrompts = filteredPrompts.filter(prompt => prompt.visibility === options.visibility);
  }
  
  // Filter by AI platform
  if (options.aiPlatform) {
    filteredPrompts = filteredPrompts.filter(prompt => prompt.aiPlatform === options.aiPlatform);
  }
  
  // Filter by minimum rating
  if (options.minRating) {
    const minRatingValue = parseFloat(options.minRating);
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.rating && prompt.rating >= minRatingValue
    );
  }
  
  // Filter by tags if specified
  if (options.tags && options.tags.length > 0) {
    const tags = Array.isArray(options.tags) ? options.tags : [options.tags];
    
    if (options.tagMatchType === 'any') {
      // Match any of the specified tags
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.tags && prompt.tags.some(tag => 
          tags.includes(tag)
        )
      );
    } else {
      // Match all of the specified tags (default)
      filteredPrompts = filteredPrompts.filter(prompt => 
        prompt.tags && tags.every(tag => 
          prompt.tags.includes(tag)
        )
      );
    }
  }
  
  // Filter by minimum usage count
  if (options.minUsageCount) {
    const minUsage = parseInt(options.minUsageCount, 10);
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.usageCount && prompt.usageCount >= minUsage
    );
  }
  
  // Filter by minimum success rate
  if (options.minSuccessRate) {
    const minSuccess = parseFloat(options.minSuccessRate);
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.successRate && prompt.successRate >= minSuccess
    );
  }
  
  // Apply text search if a query is provided
  if (query && query.trim() !== '') {
    filteredPrompts = filteredPrompts.filter(prompt => 
      prompt.title.toLowerCase().includes(searchLower) || 
      prompt.content.toLowerCase().includes(searchLower) ||
      (prompt.description && prompt.description.toLowerCase().includes(searchLower)) ||
      (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  }
  
  // Sort results if specified
  if (options.sortBy) {
    const direction = options.sortDirection === 'desc' ? -1 : 1;
    
    filteredPrompts.sort((a, b) => {
      switch (options.sortBy) {
        case 'rating':
          return ((b.rating || 0) - (a.rating || 0)) * direction;
        case 'usageCount':
          return ((b.usageCount || 0) - (a.usageCount || 0)) * direction;
        case 'successRate':
          return ((b.successRate || 0) - (a.successRate || 0)) * direction;
        case 'createdAt':
          return (new Date(b.createdAt) - new Date(a.createdAt)) * direction;
        case 'updatedAt':
          return (new Date(b.updatedAt) - new Date(a.updatedAt)) * direction;
        default:
          return 0;
      }
    });
  } else {
    // Default sort by creation date (newest first)
    filteredPrompts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  
  return filteredPrompts;
};

// Collections
export const getAllCollections = () => {
  return [...collections];
};

export const getCollectionById = (id) => {
  return collections.find(collection => collection.id === parseInt(id)) || null;
};

export const createCollection = (collectionData) => {
  const newCollection = {
    id: collectionIdCounter++,
    ...collectionData,
    prompts: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  collections.push(newCollection);
  return newCollection;
};

export const updateCollection = (id, collectionData) => {
  const index = collections.findIndex(collection => collection.id === parseInt(id));
  
  if (index === -1) return null;
  
  const updatedCollection = {
    ...collections[index],
    ...collectionData,
    updatedAt: new Date().toISOString(),
  };
  
  collections[index] = updatedCollection;
  return updatedCollection;
};

export const deleteCollection = (id) => {
  const index = collections.findIndex(collection => collection.id === parseInt(id));
  
  if (index === -1) return false;
  
  collections.splice(index, 1);
  return true;
};

export const addPromptToCollection = (collectionId, promptId) => {
  const collection = getCollectionById(collectionId);
  
  if (!collection) return null;
  
  // Check if prompt exists
  const prompt = getPromptById(promptId);
  if (!prompt) return null;
  
  // Check if prompt is already in collection
  if (collection.prompts.includes(parseInt(promptId))) {
    return collection;
  }
  
  collection.prompts.push(parseInt(promptId));
  collection.updatedAt = new Date().toISOString();
  
  return collection;
};

export const removePromptFromCollection = (collectionId, promptId) => {
  const collection = getCollectionById(collectionId);
  
  if (!collection) return null;
  
  const promptIndex = collection.prompts.indexOf(parseInt(promptId));
  
  if (promptIndex === -1) return collection;
  
  collection.prompts.splice(promptIndex, 1);
  collection.updatedAt = new Date().toISOString();
  
  return collection;
};

// User management functions
export const getAllUsers = () => {
  return [...users];
};

export const getUserById = (id) => {
  return users.find(user => user.id === parseInt(id)) || null;
};

export const getUserByEmail = (email) => {
  return users.find(user => user.email === email) || null;
};

export const createUser = (userData) => {
  // Check if user with this email already exists
  const existingUser = getUserByEmail(userData.email);
  if (existingUser) {
    return null;
  }
  
  const newUser = {
    id: userIdCounter++,
    ...userData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  return newUser;
};

export const updateUser = (id, userData) => {
  const index = users.findIndex(user => user.id === parseInt(id));
  
  if (index === -1) return null;
  
  // If trying to update email, check it's not already taken
  if (userData.email && userData.email !== users[index].email) {
    const existingUser = getUserByEmail(userData.email);
    if (existingUser) {
      return null;
    }
  }
  
  const updatedUser = {
    ...users[index],
    ...userData,
    updatedAt: new Date().toISOString(),
  };
  
  users[index] = updatedUser;
  return updatedUser;
};

export const deleteUser = (id) => {
  const index = users.findIndex(user => user.id === parseInt(id));
  
  if (index === -1) return false;
  
  users.splice(index, 1);
  return true;
};

// Team management functions
export const getAllTeams = () => {
  return [...teams];
};

export const getTeamById = (id) => {
  return teams.find(team => team.id === parseInt(id)) || null;
};

export const getTeamsByUserId = (userId) => {
  return teams.filter(team => 
    team.userId === parseInt(userId) || 
    team.members.some(member => member.userId === parseInt(userId))
  );
};

export const createTeam = (teamData) => {
  const newTeam = {
    id: teamIdCounter++,
    members: [], // Initialize with empty members array
    ...teamData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  // Add creator as owner
  if (teamData.userId && !newTeam.members.some(m => m.userId === teamData.userId)) {
    newTeam.members.push({
      userId: teamData.userId,
      role: 'owner',
      joinedAt: new Date().toISOString()
    });
  }
  
  teams.push(newTeam);
  return newTeam;
};

export const updateTeam = (id, teamData) => {
  const index = teams.findIndex(team => team.id === parseInt(id));
  
  if (index === -1) return null;
  
  const updatedTeam = {
    ...teams[index],
    ...teamData,
    updatedAt: new Date().toISOString(),
  };
  
  teams[index] = updatedTeam;
  return updatedTeam;
};

export const deleteTeam = (id) => {
  const index = teams.findIndex(team => team.id === parseInt(id));
  
  if (index === -1) return false;
  
  teams.splice(index, 1);
  return true;
};

export const addTeamMember = (teamId, userData) => {
  const team = getTeamById(teamId);
  
  if (!team) return null;
  
  // Check if user exists
  const user = getUserById(userData.userId);
  if (!user) return null;
  
  // Check if already a member
  if (team.members.some(member => member.userId === parseInt(userData.userId))) {
    return team;
  }
  
  // Add member with data or default role
  team.members.push({
    userId: parseInt(userData.userId),
    role: userData.role || 'member',
    joinedAt: new Date().toISOString()
  });
  
  team.updatedAt = new Date().toISOString();
  return team;
};

export const updateTeamMember = (teamId, userId, userData) => {
  const team = getTeamById(teamId);
  
  if (!team) return null;
  
  const memberIndex = team.members.findIndex(m => m.userId === parseInt(userId));
  
  if (memberIndex === -1) return team;
  
  // Update member data
  team.members[memberIndex] = {
    ...team.members[memberIndex],
    ...userData
  };
  
  team.updatedAt = new Date().toISOString();
  return team;
};

export const removeTeamMember = (teamId, userId) => {
  const team = getTeamById(teamId);
  
  if (!team) return null;
  
  const memberIndex = team.members.findIndex(m => m.userId === parseInt(userId));
  
  if (memberIndex === -1) return team;
  
  // Don't allow removing the owner
  if (team.members[memberIndex].role === 'owner') {
    return team;
  }
  
  team.members.splice(memberIndex, 1);
  team.updatedAt = new Date().toISOString();
  
  return team;
};

// Comment functions
export const getCommentsByPromptId = (promptId) => {
  return comments.filter(comment => comment.promptId === parseInt(promptId));
};

export const createComment = (commentData) => {
  const newComment = {
    id: commentIdCounter++,
    ...commentData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  comments.push(newComment);
  return newComment;
};

export const updateComment = (id, commentData) => {
  const index = comments.findIndex(comment => comment.id === parseInt(id));
  
  if (index === -1) return null;
  
  const updatedComment = {
    ...comments[index],
    ...commentData,
    updatedAt: new Date().toISOString(),
  };
  
  comments[index] = updatedComment;
  return updatedComment;
};

export const deleteComment = (id) => {
  const index = comments.findIndex(comment => comment.id === parseInt(id));
  
  if (index === -1) return false;
  
  comments.splice(index, 1);
  return true;
};

// Initialize with some sample data - in real app, this would be loaded from database
export const initializeDb = async () => {
  // Import hashPassword here to avoid circular dependency
  const { hashPassword } = await import('./auth-utils');
  
  // Initialize sample user if none exist
  if (users.length === 0) {
    // Create a demo user with hashed password
    createUser({
      name: "Demo User",
      email: "demo@promptpro.com",
      password: await hashPassword("password123"),
      image: null,
    });
  }
  
  if (prompts.length === 0) {
    // Use the demo user's ID as the creator
    const demoUserId = 1;
    
    createPrompt({
      title: "Creative Story Prompt",
      content: "Write a short story about a world where gravity works in reverse, with trees growing downward and clouds forming on the ground.",
      description: "Generates creative and imaginative short stories with unconventional physics or natural laws.",
      tags: ["creative", "writing", "fiction"],
      aiPlatform: "ChatGPT",
      rating: 4.5,
      usageCount: 127,
      successRate: 92,
      visibility: "public",
      userId: demoUserId,
      createdBy: "Demo User"
    });
    
    createPrompt({
      title: "Code Review Prompt",
      content: "Review the following code for best practices, potential bugs, and performance issues: [CODE]",
      description: "Provides detailed code reviews with suggestions for improvements and identification of potential issues.",
      tags: ["programming", "code review", "technical"],
      aiPlatform: "Claude",
      rating: 4.8,
      usageCount: 85,
      successRate: 95,
      visibility: "public",
      userId: demoUserId,
      createdBy: "Demo User"
    });
    
    createPrompt({
      title: "Essay Structure",
      content: "Write a 5-paragraph essay on [TOPIC] with an introduction, three body paragraphs, and a conclusion.",
      description: "Helps create well-structured academic essays with proper formatting and logical flow.",
      tags: ["academic", "writing", "education"],
      aiPlatform: "ChatGPT",
      rating: 4.2,
      usageCount: 210,
      successRate: 89,
      visibility: "public",
      userId: demoUserId,
      createdBy: "Demo User"
    });
    
    createPrompt({
      title: "Image Generation Concept",
      content: "Create a detailed image of [SUBJECT] in the style of [ARTIST/STYLE], with [ADDITIONAL DETAILS].",
      description: "Generates detailed prompts for AI image generation with specific artistic styles.",
      tags: ["image", "art", "design", "creative"],
      aiPlatform: "DALL-E",
      rating: 4.7,
      usageCount: 156,
      successRate: 93,
      visibility: "private",
      userId: demoUserId,
      createdBy: "Demo User"
    });
    
    createPrompt({
      title: "Product Description Generator",
      content: "Write a compelling product description for [PRODUCT] that highlights its [KEY FEATURES] and appeals to [TARGET AUDIENCE].",
      description: "Creates professional marketing copy for product listings and e-commerce sites.",
      tags: ["marketing", "business", "copywriting"],
      aiPlatform: "ChatGPT",
      rating: 4.3,
      usageCount: 189,
      successRate: 90,
      visibility: "public",
      userId: demoUserId,
      createdBy: "Demo User"
    });
  }
  
  if (collections.length === 0) {
    // Use the demo user's ID as the creator
    const demoUserId = 1;
    
    createCollection({
      name: "Writing Prompts",
      description: "Prompts for creative and academic writing",
      userId: demoUserId
    });
    
    createCollection({
      name: "Technical Prompts",
      description: "Prompts for coding, technical documentation, and problem-solving",
      userId: demoUserId
    });
    
    createCollection({
      name: "Marketing Copy",
      description: "Prompts for creating effective marketing and advertising content",
      userId: demoUserId
    });
    
    createCollection({
      name: "Visual Design",
      description: "Prompts for generating images and visual design concepts",
      userId: demoUserId
    });
    
    // Add prompts to collections
    addPromptToCollection(1, 1); // Creative Story to Writing Prompts
    addPromptToCollection(1, 3); // Essay Structure to Writing Prompts
    addPromptToCollection(2, 2); // Code Review to Technical Prompts
    addPromptToCollection(3, 5); // Product Description to Marketing Copy
    addPromptToCollection(4, 4); // Image Generation to Visual Design
  }
  
  // Create a couple of sample teams
  if (teams.length === 0) {
    const demoUserId = 1;
    
    // Create a second user for team members
    if (users.length === 1) {
      createUser({
        name: "Jane Smith",
        email: "jane@promptpro.com",
        password: await hashPassword("password123"),
        image: null,
      });
    }
    
    // Create a sample team
    const aiResearchTeam = createTeam({
      name: "AI Research Team",
      description: "Team focused on researching and creating advanced AI prompts",
      userId: demoUserId
    });
    
    // Create a prompt that belongs to the team
    createPrompt({
      title: "Team Research Prompt",
      content: "Analyze the following research paper and provide a summary of the key innovations and potential applications: [PAPER]",
      description: "Used for collaborative research paper analysis within the team",
      tags: ["research", "analysis", "collaboration"],
      aiPlatform: "ChatGPT",
      rating: 4.6,
      usageCount: 45,
      successRate: 91,
      visibility: "team",
      userId: demoUserId,
      createdBy: "Demo User",
      teamId: aiResearchTeam.id
    });
    
    // Add another user as team member
    addTeamMember(aiResearchTeam.id, { 
      userId: 2, 
      role: 'member' 
    });
    
    // Create team comments
    createComment({
      promptId: 6, // The team prompt we just created
      userId: demoUserId,
      content: "This prompt works really well for technical papers, but we should create variations for different research domains.",
      createdBy: "Demo User"
    });
    
    createComment({
      promptId: 6,
      userId: 2, // Jane
      content: "I've been using this for medical research papers with good results. The structured output is very helpful.",
      createdBy: "Jane Smith"
    });
  }
};

// Call initialize when imported
(async () => {
  try {
    await initializeDb();
    console.log('Database initialized with sample data');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
})();

// In-memory database for development
let prompts = [];
let collections = [];
let promptIdCounter = 1;
let collectionIdCounter = 1;

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

export const searchPrompts = (query) => {
  const searchLower = query.toLowerCase();
  
  return prompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchLower) || 
    prompt.content.toLowerCase().includes(searchLower) ||
    (prompt.tags && prompt.tags.some(tag => tag.toLowerCase().includes(searchLower)))
  );
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

// Initialize with some sample data - in real app, this would be loaded from database
export const initializeDb = () => {
  if (prompts.length === 0) {
    createPrompt({
      title: "Creative Story Prompt",
      content: "Write a short story about a world where gravity works in reverse, with trees growing downward and clouds forming on the ground.",
      tags: ["creative", "writing", "fiction"]
    });
    
    createPrompt({
      title: "Code Review Prompt",
      content: "Review the following code for best practices, potential bugs, and performance issues: [CODE]",
      tags: ["programming", "code review", "technical"]
    });
    
    createPrompt({
      title: "Essay Structure",
      content: "Write a 5-paragraph essay on [TOPIC] with an introduction, three body paragraphs, and a conclusion.",
      tags: ["academic", "writing", "education"]
    });
  }
  
  if (collections.length === 0) {
    createCollection({
      name: "Writing Prompts",
      description: "Prompts for creative and academic writing"
    });
    
    createCollection({
      name: "Technical Prompts",
      description: "Prompts for coding, technical documentation, and problem-solving"
    });
    
    // Add prompts to collections
    addPromptToCollection(1, 1);
    addPromptToCollection(1, 3);
    addPromptToCollection(2, 2);
  }
};

// Call initialize when imported
initializeDb();

import { getCollectionById, addPromptToCollection, removePromptFromCollection } from '../../../../../lib/db';
import { withAuthForMethods } from '../../../../../lib/auth';

async function handler(req, res) {
  const { id, promptId } = req.query;
  
  switch (req.method) {
    case 'POST':
      return addPromptToCollectionHandler(req, res, id, promptId);
    case 'DELETE':
      return removePromptFromCollectionHandler(req, res, id, promptId);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Apply authentication to POST and DELETE methods
export default withAuthForMethods(handler, ['POST', 'DELETE']);

function addPromptToCollectionHandler(req, res, collectionId, promptId) {
  try {
    // Check if collection exists
    const existingCollection = getCollectionById(collectionId);
    
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Check if the user is the owner of the collection
    const userId = req.session?.user?.id || req.session?.sub;
    if (existingCollection.userId && existingCollection.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to modify this collection' });
    }
    
    // Add prompt to collection
    const updatedCollection = addPromptToCollection(collectionId, promptId);
    
    if (!updatedCollection) {
      return res.status(400).json({ message: 'Failed to add prompt to collection' });
    }
    
    return res.status(200).json(updatedCollection);
  } catch (error) {
    console.error('Error adding prompt to collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function removePromptFromCollectionHandler(req, res, collectionId, promptId) {
  try {
    // Check if collection exists
    const existingCollection = getCollectionById(collectionId);
    
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Check if the user is the owner of the collection
    const userId = req.session?.user?.id || req.session?.sub;
    if (existingCollection.userId && existingCollection.userId !== userId) {
      return res.status(403).json({ message: 'You are not authorized to modify this collection' });
    }
    
    // Remove prompt from collection
    const updatedCollection = removePromptFromCollection(collectionId, promptId);
    
    if (!updatedCollection) {
      return res.status(400).json({ message: 'Failed to remove prompt from collection' });
    }
    
    return res.status(200).json(updatedCollection);
  } catch (error) {
    console.error('Error removing prompt from collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

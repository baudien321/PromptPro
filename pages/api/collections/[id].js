import { getCollectionById, updateCollection, deleteCollection, addPromptToCollection, removePromptFromCollection } from '../../../lib/db';
import { validateCollection } from '../../../models/collection';

export default function handler(req, res) {
  const { id } = req.query;
  
  switch (req.method) {
    case 'GET':
      return getCollection(req, res, id);
    case 'PUT':
      return updateCollectionHandler(req, res, id);
    case 'DELETE':
      return deleteCollectionHandler(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

function getCollection(req, res, id) {
  try {
    const collection = getCollectionById(id);
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    return res.status(200).json(collection);
  } catch (error) {
    console.error('Error getting collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function updateCollectionHandler(req, res, id) {
  try {
    const { name, description } = req.body;
    
    // Validate the collection data
    const validation = validateCollection({ name, description });
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Check if collection exists
    const existingCollection = getCollectionById(id);
    
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Update the collection
    const updatedCollection = updateCollection(id, { name, description });
    
    return res.status(200).json(updatedCollection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function deleteCollectionHandler(req, res, id) {
  try {
    // Check if collection exists
    const existingCollection = getCollectionById(id);
    
    if (!existingCollection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    // Delete the collection
    const success = deleteCollection(id);
    
    if (success) {
      return res.status(200).json({ message: 'Collection deleted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to delete collection' });
    }
  } catch (error) {
    console.error('Error deleting collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};

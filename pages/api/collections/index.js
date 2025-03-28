import { getAllCollections, createCollection } from '../../../lib/db';
import { validateCollection } from '../../../models/collection';
import { withAuthForMethods } from '../../../lib/auth';

async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getCollections(req, res);
    case 'POST':
      return addCollection(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Protect POST, PUT, DELETE methods
export default withAuthForMethods(handler);

function getCollections(req, res) {
  try {
    const collections = getAllCollections();
    return res.status(200).json(collections);
  } catch (error) {
    console.error('Error getting collections:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function addCollection(req, res) {
  try {
    const { name, description } = req.body;
    
    // Validate the collection data
    const validation = validateCollection({ name, description });
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Add user information from the session
    const userId = req.session?.sub;
    const userName = req.session?.name || 'Anonymous';
    
    // Create the collection with user information
    const newCollection = createCollection({ 
      name, 
      description,
      userId,
      createdBy: userName
    });
    
    return res.status(201).json(newCollection);
  } catch (error) {
    console.error('Error adding collection:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

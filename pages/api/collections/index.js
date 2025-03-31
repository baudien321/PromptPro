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

async function getCollections(req, res) {
  try {
    // Add await since getAllCollections is now async
    const collections = await getAllCollections();
    
    // Check if collections is undefined or null and provide a fallback
    if (!collections) {
      return res.status(200).json([]);
    }
    
    // Map MongoDB _id to id for frontend compatibility
    const mappedCollections = collections.map(collection => ({
      id: collection._id.toString(),
      ...collection,
      _id: undefined // Remove _id to avoid duplication
    }));
    
    return res.status(200).json(mappedCollections);
  } catch (error) {
    console.error('Error getting collections:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function addCollection(req, res) {
  try {
    const { name, description } = req.body;
    
    // Validate the collection data
    const validation = validateCollection({ name, description });
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Add user information from the session (NextAuth)
    const userId = req.session?.user?.id;
    const userName = req.session?.user?.name || 'Anonymous';
    
    // Add await since createCollection is now async
    const newCollection = await createCollection({ 
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

import { withAuth } from '../../../lib/auth';
import * as promptRepository from '../../../lib/repositories/promptRepository';

/**
 * API handler for retrieving the current user's prompts
 * 
 * GET: Get all prompts created by the current user
 */
async function handler(req, res) {
  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Get the user ID from the authenticated request
    const userId = req.user?.id || req.session?.user?.id || req.session?.sub;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    console.log('Fetching prompts for authenticated user:', userId);
    
    // Get all prompts for this user
    const prompts = await promptRepository.getAllPrompts({ userId });
    
    console.log(`Found ${prompts.length} prompts for user ${userId}`);
    
    // Return the prompts
    return res.status(200).json(prompts);
  } catch (error) {
    console.error('Error getting user prompts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Protect this endpoint with authentication
export default withAuth(handler); 
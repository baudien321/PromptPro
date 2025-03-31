import { validatePrompt } from '../../../models/prompt';
import { withAuthForMethods } from '../../../lib/auth';
import * as promptRepository from '../../../lib/repositories/promptRepository';

async function handler(req, res) {
  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  switch (req.method) {
    case 'GET':
      return getPrompts(req, res);
    case 'POST':
      return addPrompt(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Apply authentication to POST method
export default withAuthForMethods(handler, ['POST']);

async function getPrompts(req, res) {
  try {
    // Get query parameters for filtering
    const { userId, visibility, aiPlatform, tags } = req.query;
    
    // Create filter object
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (visibility) filter.visibility = visibility;
    if (aiPlatform) filter.aiPlatform = aiPlatform;
    
    // Parse tags if provided
    if (tags) {
      filter.tags = Array.isArray(tags) ? tags : [tags];
    }
    
    // Get prompts from repository
    const prompts = await promptRepository.getAllPrompts(filter);
    return res.status(200).json(prompts);
  } catch (error) {
    console.error('Error getting prompts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function addPrompt(req, res) {
  try {
    const promptData = req.body;
    
    // Add user info from session - checking all possible locations
    const userId = req.session?.user?.id || req.user?.id || req.session?.sub;
    const userName = req.session?.user?.name || req.user?.name || 'Unknown User';
    
    console.log('Creating prompt with user ID:', userId);
    console.log('Session data:', req.session);
    console.log('User data:', req.user);
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Validate prompt data
    const { isValid, errors } = validatePrompt(promptData);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Create new prompt with userId explicitly set
    const newPrompt = await promptRepository.createPrompt({
      ...promptData,
      userId,
      createdBy: userName
    });
    
    console.log('Successfully created prompt:', newPrompt);
    
    return res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error creating prompt:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

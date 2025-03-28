import { getPromptById, updatePrompt } from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

/**
 * API handler to increment the usage count of a prompt
 * This endpoint can be called when a prompt is copied or used
 */
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const promptId = req.query.id;
  
  try {
    // Get current prompt data
    const prompt = await getPromptById(promptId);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Increment the usage count
    const currentCount = prompt.usageCount || 0;
    const updatedPrompt = await updatePrompt(promptId, {
      ...prompt,
      usageCount: currentCount + 1,
    });
    
    return res.status(200).json(updatedPrompt);
    
  } catch (error) {
    console.error('Error incrementing usage count:', error);
    return res.status(500).json({ message: 'Failed to increment usage count' });
  }
}

// Make this endpoint available to public prompts
// This way, non-logged-in users can also trigger usage count increments
export default handler;
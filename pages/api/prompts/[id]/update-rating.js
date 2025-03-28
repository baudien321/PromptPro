import { getPromptById, updatePrompt } from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

/**
 * API handler to update the rating of a prompt
 * This endpoint can be called when a user rates a prompt
 */
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const promptId = req.query.id;
  const { rating } = req.body;
  
  // Validate rating input
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid rating value. Must be a number between 1 and 5' });
  }
  
  try {
    // Get current prompt data
    const prompt = await getPromptById(promptId);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Update the rating
    const updatedPrompt = await updatePrompt(promptId, {
      ...prompt,
      rating: rating,
    });
    
    return res.status(200).json(updatedPrompt);
    
  } catch (error) {
    console.error('Error updating prompt rating:', error);
    return res.status(500).json({ message: 'Failed to update rating' });
  }
}

// Use the withAuth middleware to ensure only authenticated users can rate prompts
export default withAuth(handler);
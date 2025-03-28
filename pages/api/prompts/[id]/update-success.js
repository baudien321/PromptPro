import { getPromptById, updatePrompt } from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';

/**
 * API handler to update the success status of a prompt
 * This endpoint can be called when a user marks a prompt as successful or unsuccessful
 */
async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const promptId = req.query.id;
  const { isSuccess } = req.body;
  
  // Validate input
  if (typeof isSuccess !== 'boolean') {
    return res.status(400).json({ message: 'Invalid success value. Must be a boolean' });
  }
  
  try {
    // Get current prompt data
    const prompt = await getPromptById(promptId);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Update success status and calculate success rate if applicable
    let successRate = prompt.successRate;
    if (prompt.totalVotes !== undefined) {
      const totalVotes = (prompt.totalVotes || 0) + 1;
      const successfulVotes = isSuccess 
        ? (prompt.successfulVotes || 0) + 1 
        : (prompt.successfulVotes || 0);
      
      successRate = Math.round((successfulVotes / totalVotes) * 100);
      
      // Update the prompt with new success info
      const updatedPrompt = await updatePrompt(promptId, {
        ...prompt,
        isSuccess,
        totalVotes,
        successfulVotes,
        successRate
      });
      
      return res.status(200).json(updatedPrompt);
    } else {
      // If no voting history exists, just update the success status
      const updatedPrompt = await updatePrompt(promptId, {
        ...prompt,
        isSuccess,
      });
      
      return res.status(200).json(updatedPrompt);
    }
    
  } catch (error) {
    console.error('Error updating prompt success status:', error);
    return res.status(500).json({ message: 'Failed to update success status' });
  }
}

// Use the withAuth middleware to ensure only authenticated users can update success status
export default withAuth(handler);
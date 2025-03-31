import * as promptRepository from '../../../../lib/repositories/promptRepository';

/**
 * API handler to increment the usage count of a prompt
 * This endpoint can be called when a prompt is copied or used
 */
export default async function handler(req, res) {
  // Only allow POST method for incrementing usage
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Prompt ID is required' });
  }
  
  try {
    // Verify the prompt exists
    const existingPrompt = await promptRepository.getPromptById(id);
    
    if (!existingPrompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Increment the usage count
    const updatedPrompt = await promptRepository.incrementUsageCount(id);
    
    if (!updatedPrompt) {
      return res.status(500).json({ message: 'Failed to increment usage count' });
    }
    
    return res.status(200).json({ 
      message: 'Usage count incremented',
      usageCount: updatedPrompt.usageCount 
    });
  } catch (error) {
    console.error('Error incrementing usage count:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
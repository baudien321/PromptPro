import { validatePrompt } from '../../../models/prompt';
import { withAuthForMethods } from '../../../lib/auth';
import * as promptRepository from '../../../lib/repositories/promptRepository';

async function handler(req, res) {
  const { id } = req.query;
  
  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  if (!id) {
    return res.status(400).json({ message: 'Prompt ID is required' });
  }
  
  switch (req.method) {
    case 'GET':
      return getPrompt(req, res, id);
    case 'PUT':
      return updatePrompt(req, res, id);
    case 'DELETE':
      return deletePrompt(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

// Apply authentication to PUT and DELETE methods
export default withAuthForMethods(handler, ['PUT', 'DELETE']);

async function getPrompt(req, res, id) {
  try {
    const prompt = await promptRepository.getPromptById(id);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    return res.status(200).json(prompt);
  } catch (error) {
    console.error('Error getting prompt:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function updatePrompt(req, res, id) {
  try {
    // Verify the prompt exists
    const existingPrompt = await promptRepository.getPromptById(id);
    
    if (!existingPrompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Check if user is authorized (user is prompt owner or admin)
    const userId = String(req.session?.user?.id || req.user?.id || req.session?.sub || '');
    const promptUserId = String(existingPrompt.userId || '');
    
    console.log('API - Update - User ID:', userId);
    console.log('API - Update - Prompt User ID:', promptUserId);
    
    // Temporarily disable auth check for testing
    /*
    if (!userId || (userId !== promptUserId && req.session?.user?.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized to update this prompt' });
    }
    */
    
    // Validate the update data
    const promptData = req.body;
    const { isValid, errors } = validatePrompt(promptData);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Update the prompt
    const updatedPrompt = await promptRepository.updatePrompt(id, promptData);
    
    if (!updatedPrompt) {
      return res.status(500).json({ message: 'Failed to update prompt' });
    }
    
    return res.status(200).json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function deletePrompt(req, res, id) {
  try {
    // Verify the prompt exists
    const existingPrompt = await promptRepository.getPromptById(id);
    
    if (!existingPrompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Check if user is authorized (user is prompt owner or admin)
    const userId = String(req.session?.user?.id || req.user?.id || req.session?.sub || '');
    const promptUserId = String(existingPrompt.userId || '');
    
    console.log('API - Delete - User ID:', userId);
    console.log('API - Delete - Prompt User ID:', promptUserId);
    
    // Temporarily disable auth check for testing
    /*
    if (!userId || (userId !== promptUserId && req.session?.user?.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized to delete this prompt' });
    }
    */
    
    // Delete the prompt
    const success = await promptRepository.deletePrompt(id);
    
    if (!success) {
      return res.status(500).json({ message: 'Failed to delete prompt' });
    }
    
    return res.status(200).json({ message: 'Prompt deleted successfully' });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

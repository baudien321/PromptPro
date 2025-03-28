import { getPromptById, updatePrompt, deletePrompt } from '../../../lib/db';
import { validatePrompt } from '../../../models/prompt';

export default function handler(req, res) {
  const { id } = req.query;
  
  switch (req.method) {
    case 'GET':
      return getPrompt(req, res, id);
    case 'PUT':
      return updatePromptHandler(req, res, id);
    case 'DELETE':
      return deletePromptHandler(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

function getPrompt(req, res, id) {
  try {
    const prompt = getPromptById(id);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    return res.status(200).json(prompt);
  } catch (error) {
    console.error('Error getting prompt:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function updatePromptHandler(req, res, id) {
  try {
    const { title, content, tags } = req.body;
    
    // Validate the prompt data
    const validation = validatePrompt({ title, content, tags });
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Check if prompt exists
    const existingPrompt = getPromptById(id);
    
    if (!existingPrompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Update the prompt
    const updatedPrompt = updatePrompt(id, { title, content, tags });
    
    return res.status(200).json(updatedPrompt);
  } catch (error) {
    console.error('Error updating prompt:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function deletePromptHandler(req, res, id) {
  try {
    // Check if prompt exists
    const existingPrompt = getPromptById(id);
    
    if (!existingPrompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Delete the prompt
    const success = deletePrompt(id);
    
    if (success) {
      return res.status(200).json({ message: 'Prompt deleted successfully' });
    } else {
      return res.status(500).json({ message: 'Failed to delete prompt' });
    }
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

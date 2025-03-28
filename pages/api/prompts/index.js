import { getAllPrompts, createPrompt } from '../../../lib/db';
import { validatePrompt } from '../../../models/prompt';

export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return getPrompts(req, res);
    case 'POST':
      return addPrompt(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

function getPrompts(req, res) {
  try {
    const prompts = getAllPrompts();
    return res.status(200).json(prompts);
  } catch (error) {
    console.error('Error getting prompts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

function addPrompt(req, res) {
  try {
    const { title, content, tags } = req.body;
    
    // Validate the prompt data
    const validation = validatePrompt({ title, content, tags });
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Create the prompt
    const newPrompt = createPrompt({ title, content, tags });
    
    return res.status(201).json(newPrompt);
  } catch (error) {
    console.error('Error adding prompt:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

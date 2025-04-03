import { validatePrompt } from '../../../models/prompt';
import { withAuthForMethods } from '../../../lib/auth';
import * as promptRepository from '../../../lib/repositories/promptRepository';
import { canManagePrompt } from '../../../lib/permissions';
import { getTeamById } from '../../../lib/db';

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
// GET is public or based on prompt visibility (handled in getPrompt if needed)
export default withAuthForMethods(handler, ['PUT', 'DELETE']);

async function getPrompt(req, res, id) {
  try {
    const prompt = await promptRepository.getPromptById(id);
    
    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found' });
    }
    
    // Check visibility and permissions for non-public prompts
    if (prompt.visibility !== 'public') {
      const sessionUserId = String(req.session?.sub || '');
      
      // For private prompts, only the creator can view
      if (prompt.visibility === 'private') {
        if (String(prompt.userId) !== sessionUserId) {
          return res.status(403).json({ message: 'Not authorized to view this prompt' });
        }
      } 
      // For team prompts, check team membership
      else if (prompt.visibility === 'team' && prompt.teamId) {
        // Skip check if no user is logged in (will be handled by client-side)
        if (sessionUserId) {
          const team = await getTeamById(prompt.teamId);
          
          if (!team) {
            return res.status(404).json({ message: 'Team not found' });
          }
          
          // Check if user can view the team prompt
          if (!canManagePrompt(team, sessionUserId, prompt, 'view')) {
            return res.status(403).json({ message: 'Not authorized to view this prompt' });
          }
        }
      }
    }
    
    // Ensure userId is returned as a string for consistent comparison
    const promptWithStringId = {
        ...prompt,
        userId: String(prompt.userId)
    };
    
    return res.status(200).json(promptWithStringId);
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
    
    // --- Authorization Check ---
    // Get user ID from session (populated by withAuthForMethods)
    const sessionUserId = String(req.session?.sub || '');
    const promptUserId = String(existingPrompt.userId || '');
    
    console.log('API - Update - Session User ID:', sessionUserId);
    console.log('API - Update - Prompt User ID:', promptUserId);
    
    // Check authorization based on visibility
    let authorized = false;
    
    // For personal prompts, only creator can edit
    if (existingPrompt.visibility !== 'team') {
      authorized = sessionUserId === promptUserId;
    } 
    // For team prompts, use role-based permissions
    else if (existingPrompt.teamId) {
      const team = await getTeamById(existingPrompt.teamId);
      
      if (team) {
        // Check if user can edit this prompt based on their role
        authorized = canManagePrompt(team, sessionUserId, existingPrompt, 'edit');
      }
    }
    
    if (!authorized) {
      console.error('API Authorization failed: User does not have permission to update this prompt');
      return res.status(403).json({ message: 'Not authorized to update this prompt' });
    }
    
    console.log('API Authorization successful.');
    // --- End Authorization Check ---
    
    // Validate the update data
    const promptData = req.body;
    const { isValid, errors } = validatePrompt(promptData);
    
    if (!isValid) {
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    // Update the prompt - ensure userId isn't overwritten if present in promptData
    const dataToUpdate = { ...promptData };
    delete dataToUpdate.userId; // Prevent accidental userId changes
    
    const updatedPrompt = await promptRepository.updatePrompt(id, dataToUpdate);
    
    if (!updatedPrompt) {
      // This might happen if the update operation itself failed in the repo
      return res.status(500).json({ message: 'Failed to update prompt in repository' });
    }
    
    // Return the updated prompt, ensuring userId is a string
    const updatedPromptWithStringId = {
        ...updatedPrompt,
        userId: String(updatedPrompt.userId)
    };
    
    return res.status(200).json(updatedPromptWithStringId);
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
    
    // --- Authorization Check ---
    const sessionUserId = String(req.session?.sub || '');
    const promptUserId = String(existingPrompt.userId || '');
    
    console.log('API - Delete - Session User ID:', sessionUserId);
    console.log('API - Delete - Prompt User ID:', promptUserId);
    
    // Check authorization based on visibility
    let authorized = false;
    
    // For personal prompts, only creator can delete
    if (existingPrompt.visibility !== 'team') {
      authorized = sessionUserId === promptUserId;
    } 
    // For team prompts, use role-based permissions
    else if (existingPrompt.teamId) {
      const team = await getTeamById(existingPrompt.teamId);
      
      if (team) {
        // Check if user can delete this prompt based on their role
        authorized = canManagePrompt(team, sessionUserId, existingPrompt, 'delete');
      }
    }
    
    if (!authorized) {
      console.error('API Delete Authorization failed: User does not have permission to delete this prompt');
      return res.status(403).json({ message: 'Not authorized to delete this prompt' });
    }
    
    console.log('API Delete Authorization successful.');
    // --- End Authorization Check ---
    
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

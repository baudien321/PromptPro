import { validatePrompt } from '../../../models/prompt';
import { withAuthForMethods } from '../../../lib/auth';
import * as promptRepository from '../../../lib/repositories/promptRepository';
import { isTeamMember } from '../../../models/team';
import { getUserTeams } from '../../../lib/db';

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
    const { userId, visibility, aiPlatform, tags, teamId } = req.query;
    
    // Create filter object
    const filter = {};
    
    if (userId) filter.userId = userId;
    if (visibility) filter.visibility = visibility;
    if (aiPlatform) filter.aiPlatform = aiPlatform;
    if (teamId) filter.teamId = teamId;
    
    // Parse tags if provided
    if (tags) {
      filter.tags = Array.isArray(tags) ? tags : [tags];
    }
    
    // Get the current user ID if authenticated
    const currentUserId = req.session?.sub || null;
    
    // Get prompts from repository
    let prompts = await promptRepository.getAllPrompts(filter);
    
    // If the user is authenticated, filter prompts based on visibility
    if (currentUserId) {
      // If a specific teamId is requested, verify membership
      if (teamId) {
        const userTeams = await getUserTeams(currentUserId);
        const team = userTeams.find(t => t.id === teamId);
        
        if (!team || !isTeamMember(team, currentUserId)) {
          return res.status(403).json({ message: 'Not authorized to view prompts from this team' });
        }
      }
      
      // If no specific filter is provided, apply visibility-based filtering
      if (!filter.visibility && !filter.teamId) {
        // Get all teams the user is a member of
        const userTeams = await getUserTeams(currentUserId);
        const userTeamIds = userTeams.map(team => team.id);
        
        // Filter prompts based on visibility and team membership
        prompts = prompts.filter(prompt => {
          // Public prompts are visible to everyone
          if (prompt.visibility === 'public') return true;
          
          // Private prompts are only visible to creator
          if (prompt.visibility === 'private') {
            return String(prompt.userId) === String(currentUserId);
          }
          
          // Team prompts are visible to team members
          if (prompt.visibility === 'team' && prompt.teamId) {
            return userTeamIds.includes(prompt.teamId);
          }
          
          return false;
        });
      }
    } else {
      // For non-authenticated users, only return public prompts
      prompts = prompts.filter(prompt => prompt.visibility === 'public');
    }
    
    return res.status(200).json(prompts);
  } catch (error) {
    console.error('Error getting prompts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function addPrompt(req, res) {
  try {
    const promptData = req.body;
    
    // Add user info from session
    const userId = req.session?.sub;
    const userName = req.session?.user?.name || 'Unknown User';
    
    console.log('Creating prompt with user ID:', userId);
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // For team prompts, verify team membership
    if (promptData.visibility === 'team' && promptData.teamId) {
      const userTeams = await getUserTeams(userId);
      const isTeamMember = userTeams.some(team => team.id === promptData.teamId);
      
      if (!isTeamMember) {
        return res.status(403).json({ message: 'You must be a team member to create prompts for this team' });
      }
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

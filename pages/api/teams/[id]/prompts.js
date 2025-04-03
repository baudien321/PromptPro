import { withAuth } from '../../../../lib/auth';
import { getTeamById } from '../../../../lib/db';
import { isTeamMember } from '../../../../models/team';
import * as promptRepository from '../../../../lib/repositories/promptRepository';

/**
 * API handler for team prompts
 * 
 * GET: Get all prompts for a team
 */
async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Team ID is required' });
  }
  
  // Get the team
  const team = await getTeamById(id);
  
  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  // Check if the user is a member of the team
  const userId = req.user.id;
  if (!isTeamMember(team, userId)) {
    return res.status(403).json({ message: 'Not authorized to view prompts for this team' });
  }
  
  switch (req.method) {
    case 'GET':
      return getTeamPromptsHandler(req, res, id);
    default:
      res.setHeader('Allow', ['GET']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Get all prompts for a team
 */
async function getTeamPromptsHandler(req, res, teamId) {
  try {
    // Get all prompts for the team
    const filter = {
      teamId,
      visibility: 'team'
    };
    
    const prompts = await promptRepository.getAllPrompts(filter);
    
    // Return the prompts
    return res.status(200).json(prompts);
  } catch (error) {
    console.error('Error fetching team prompts:', error);
    return res.status(500).json({ message: 'Failed to fetch team prompts' });
  }
}

export default withAuth(handler); 
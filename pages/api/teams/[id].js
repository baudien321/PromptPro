import { withAuth } from '../../../lib/auth';
import { getTeamById, updateTeam, deleteTeam } from '../../../lib/db';
import { validateTeam, isTeamAdmin } from '../../../models/team';

/**
 * API handler for operations on a specific team
 * 
 * GET: Get a team by ID
 * PUT: Update a team
 * DELETE: Delete a team
 */
async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Team ID is required' });
  }
  
  switch (method) {
    case 'GET':
      return getTeamHandler(req, res, id);
    case 'PUT':
      return updateTeamHandler(req, res, id);
    case 'DELETE':
      return deleteTeamHandler(req, res, id);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

/**
 * Get a specific team by ID
 */
function getTeamHandler(req, res, id) {
  try {
    const team = getTeamById(id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    return res.status(200).json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    return res.status(500).json({ message: 'Failed to fetch team' });
  }
}

/**
 * Update a team
 */
function updateTeamHandler(req, res, id) {
  try {
    const team = getTeamById(id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user has permission to update the team
    if (!isTeamAdmin(team, req.user.id)) {
      return res.status(403).json({ message: 'You do not have permission to update this team' });
    }
    
    const validation = validateTeam(req.body, true);
    
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.errors.join(', ') });
    }
    
    // Preserve team members and creator
    const teamData = {
      ...req.body,
      userId: team.userId,
      members: team.members,
    };
    
    const updatedTeam = updateTeam(id, teamData);
    
    return res.status(200).json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    return res.status(500).json({ message: 'Failed to update team' });
  }
}

/**
 * Delete a team
 */
function deleteTeamHandler(req, res, id) {
  try {
    const team = getTeamById(id);
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Only the creator can delete the team
    if (team.userId !== req.user.id) {
      return res.status(403).json({ message: 'Only the team creator can delete the team' });
    }
    
    deleteTeam(id);
    
    return res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
    return res.status(500).json({ message: 'Failed to delete team' });
  }
}

export default withAuth(handler);
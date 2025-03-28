import { withAuth } from '../../../../lib/auth';
import { getTeamById, addTeamMember, updateTeamMember, removeTeamMember } from '../../../../lib/db';
import { isTeamAdmin } from '../../../../models/team';

/**
 * API handler for team member operations
 * 
 * GET: Get team members
 * POST: Add a team member
 * PUT: Update a team member role
 * DELETE: Remove a team member
 */
async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Team ID is required' });
  }
  
  // Get the team to check permissions
  const team = getTeamById(id);
  
  if (!team) {
    return res.status(404).json({ message: 'Team not found' });
  }
  
  switch (method) {
    case 'GET':
      return getTeamMembers(req, res, team);
    case 'POST':
      return addTeamMemberHandler(req, res, team);
    case 'PUT':
      return updateTeamMemberHandler(req, res, team);
    case 'DELETE':
      return removeTeamMemberHandler(req, res, team);
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

/**
 * Get team members
 */
function getTeamMembers(req, res, team) {
  try {
    return res.status(200).json(team.members || []);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return res.status(500).json({ message: 'Failed to fetch team members' });
  }
}

/**
 * Add a new team member
 */
function addTeamMemberHandler(req, res, team) {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user has permission to add team members
    if (!isTeamAdmin(team, req.user.id)) {
      return res.status(403).json({ message: 'You do not have permission to add team members' });
    }
    
    const { email, role } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "admin" or "member"' });
    }
    
    // Add the member to the team
    const userData = {
      email,
      role,
      joinedAt: new Date().toISOString(),
    };
    
    const updatedTeam = addTeamMember(team.id, userData);
    
    return res.status(200).json(updatedTeam.members);
  } catch (error) {
    console.error('Error adding team member:', error);
    return res.status(500).json({ message: 'Failed to add team member' });
  }
}

/**
 * Update a team member's role
 */
function updateTeamMemberHandler(req, res, team) {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Check if user has permission to update team members
    if (!isTeamAdmin(team, req.user.id)) {
      return res.status(403).json({ message: 'You do not have permission to update team members' });
    }
    
    const { userId, role } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    if (!['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either "admin" or "member"' });
    }
    
    // Prevent changing the owner's role
    if (team.userId === userId) {
      return res.status(400).json({ message: 'Cannot change the role of the team owner' });
    }
    
    const updatedTeam = updateTeamMember(team.id, userId, { role });
    
    return res.status(200).json(updatedTeam.members);
  } catch (error) {
    console.error('Error updating team member:', error);
    return res.status(500).json({ message: 'Failed to update team member' });
  }
}

/**
 * Remove a team member
 */
function removeTeamMemberHandler(req, res, team) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Prevent removing the owner
    if (team.userId === userId) {
      return res.status(400).json({ message: 'Cannot remove the team owner' });
    }
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Only an admin can remove members, but members can remove themselves
    if (!isTeamAdmin(team, req.user.id) && req.user.id !== userId) {
      return res.status(403).json({ message: 'You do not have permission to remove this team member' });
    }
    
    const updatedTeam = removeTeamMember(team.id, userId);
    
    return res.status(200).json(updatedTeam.members);
  } catch (error) {
    console.error('Error removing team member:', error);
    return res.status(500).json({ message: 'Failed to remove team member' });
  }
}

export default withAuth(handler);
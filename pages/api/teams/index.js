import { withAuth } from '../../../lib/auth';
import { getAllTeams, getTeamsByUserId, createTeam } from '../../../lib/db';
import { validateTeam } from '../../../models/team';

/**
 * API handler for team operations
 * 
 * GET: Get all teams or teams for the current user
 * POST: Create a new team
 */
async function handler(req, res) {
  const { method } = req;
  
  switch (method) {
    case 'GET':
      return getTeams(req, res);
    case 'POST':
      return createTeamHandler(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}

/**
 * Get teams based on request parameters
 * If userId is provided, return teams for that user
 * Otherwise return all teams (admin only)
 */
function getTeams(req, res) {
  const { userId } = req.query;
  
  try {
    let teams;
    
    // If userId is specified, get teams for that user
    if (userId) {
      teams = getTeamsByUserId(userId);
    } 
    // Otherwise get all teams the current user is a part of
    else if (req.user && req.user.id) {
      teams = getTeamsByUserId(req.user.id);
    } else {
      teams = []; // Return empty array if no user or userId provided
    }
    
    return res.status(200).json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return res.status(500).json({ message: 'Failed to fetch teams' });
  }
}

/**
 * Create a new team
 */
function createTeamHandler(req, res) {
  try {
    const validation = validateTeam(req.body);
    
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(', ');
      return res.status(400).json({ message: errorMessages });
    }
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Add the current user as the creator
    const teamData = {
      ...req.body,
      userId: req.user.id,
      // Initialize with creator as the owner
      members: [{
        userId: req.user.id,
        name: req.user.name || req.user.email,
        role: 'owner',
        joinedAt: new Date().toISOString(),
      }]
    };
    
    const team = createTeam(teamData);
    
    return res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ message: 'Failed to create team' });
  }
}

export default withAuth(handler);
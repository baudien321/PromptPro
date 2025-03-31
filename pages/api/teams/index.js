import { withAuth } from '../../../lib/auth';
import {
  getAllTeams,
  getTeamsByUserId,
  createTeam,
} from '../../../lib/repositories/teamRepository';
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
async function getTeams(req, res) {
  const { userId } = req.query;
  
  try {
    let teams;
    
    // If userId is specified, get teams for that user
    if (userId) {
      teams = await getTeamsByUserId(userId);
    } 
    // Otherwise get all teams the current user is a part of
    else if (req.session?.sub) {
      teams = await getTeamsByUserId(req.session.sub);
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
async function createTeamHandler(req, res) {
  try {
    const validation = validateTeam(req.body);
    
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join(', ');
      return res.status(400).json({ message: errorMessages });
    }
    
    // Check if user is authenticated via req.session populated by withAuth
    const userId = req.session?.sub; // Use req.session.sub (standard for getToken)
    const userName = req.session?.name || req.session?.email || 'Unknown User'; // Get name/email
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Add the current user as the creator
    const teamData = {
      ...req.body,
      userId: userId, // Use the userId from the session
      // Initialize with creator as the owner
      members: [{
        userId: userId,
        name: userName,
        role: 'owner',
        joinedAt: new Date(),
      }]
    };
    
    const team = await createTeam(teamData);
    
    return res.status(201).json(team);
  } catch (error) {
    console.error('Error creating team:', error);
    return res.status(500).json({ message: 'Failed to create team' });
  }
}

export default withAuth(handler);
import { withAuth } from '../../../lib/auth';
// Remove repository imports for now, interact with model directly
// import {
//   getAllTeams,
//   getTeamsByUserId,
//   createTeam,
// } from '../../../lib/repositories/teamRepository';
import Team from '../../../models/team'; // Import the Mongoose model
import User from '../../../models/user'; // Needed to fetch user details for members?
import connectDB from '../../../lib/mongoose'; // Import DB connector
// Remove old validator import
// import { validateTeam } from '../../../models/team';

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
  const { userId: queryUserId } = req.query; // Rename to avoid conflict with sessionUserId
  const sessionUserId = req.session?.sub;

  try {
    await connectDB();
    let teams;
    const targetUserId = queryUserId || sessionUserId;

    if (targetUserId) {
      // Fetch teams where the target user is a member
      teams = await Team.find({ 'members.user': targetUserId }).populate('creator', 'name email').populate('members.user', 'name email');
    } else {
      // If no user context, maybe return public teams or require admin role?
      // For now, return empty if no user context.
      teams = [];
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
  const sessionUserId = req.session?.sub;

  if (!sessionUserId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    await connectDB();

    // Data from request body
    const { name, description } = req.body;

    // Create new team instance (Mongoose will validate based on schema)
    const newTeam = new Team({
      name,
      description,
      creator: sessionUserId,
      // Members array is automatically handled by the pre-save hook in the model
    });

    // Save the team (triggers pre-save hook and validation)
    const savedTeam = await newTeam.save();

    // Populate creator and member details before sending response
    const populatedTeam = await Team.findById(savedTeam._id)
                                      .populate('creator', 'name email')
                                      .populate('members.user', 'name email');

    return res.status(201).json(populatedTeam);
  } catch (error) {
    console.error('Error creating team:', error);
    if (error.name === 'ValidationError') {
      // Extract Mongoose validation errors
      const errors = Object.values(error.errors).map(el => el.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    } 
    return res.status(500).json({ message: 'Failed to create team' });
  }
}

export default withAuth(handler);
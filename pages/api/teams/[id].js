import { withAuth } from '../../../lib/auth';
import Team from '../../../models/team'; // Import Mongoose model
import connectDB from '../../../lib/mongoose'; // Import DB connector
// Remove old db and model helper imports
// import { getTeamById, updateTeam, deleteTeam } from '../../../lib/db';
// import { validateTeam, isTeamAdmin, isTeamMember } from '../../../models/team';

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
async function getTeamHandler(req, res, id) {
  const sessionUserId = req.session?.sub;
  if (!sessionUserId) {
    // Should be caught by withAuth, but double-check
    return res.status(401).json({ message: 'Authentication required' }); 
  }

  try {
    await connectDB();
    const team = await Team.findById(id)
                           .populate('creator', 'name email')
                           .populate('members.user', 'name email'); // Populate details

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Authorization Check: User must be a member
    const isMember = team.members.some(member => member.user._id.equals(sessionUserId));
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view this team' });
    }

    return res.status(200).json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    // Handle potential CastError if ID format is invalid
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Team ID format' });
    }
    return res.status(500).json({ message: 'Failed to fetch team' });
  }
}

/**
 * Update a team
 */
async function updateTeamHandler(req, res, id) {
  const sessionUserId = req.session?.sub;
  if (!sessionUserId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    await connectDB();
    const team = await Team.findById(id); // Fetch without populate first for auth check

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Authorization Check: User must be owner or admin
    const member = team.members.find(m => m.user.equals(sessionUserId));
    const isAdmin = member && (member.role === 'owner' || member.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this team' });
    }

    // Prepare update data - only allow specific fields (name, description)
    const { name, description } = req.body;
    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (description !== undefined) dataToUpdate.description = description;

    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'No update data provided' });
    }

    // Update the team, run validators, and return the updated document
    const updatedTeam = await Team.findByIdAndUpdate(id, dataToUpdate, {
      new: true, // Return the updated document
      runValidators: true, // Ensure schema validation rules are applied
    })
    .populate('creator', 'name email')
    .populate('members.user', 'name email');

    if (!updatedTeam) {
      // Should not happen if findById found the team, but safeguard
      return res.status(404).json({ message: 'Team not found after update attempt' });
    }

    return res.status(200).json(updatedTeam);
  } catch (error) {
    console.error('Error updating team:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(el => el.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    } 
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Team ID format' });
    }
    return res.status(500).json({ message: 'Failed to update team' });
  }
}

/**
 * Delete a team
 */
async function deleteTeamHandler(req, res, id) {
  const sessionUserId = req.session?.sub;
  if (!sessionUserId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    await connectDB();
    const team = await Team.findById(id); // Fetch first for auth check

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Authorization Check: User must be owner or admin
    const member = team.members.find(m => m.user.equals(sessionUserId));
    const isAdmin = member && (member.role === 'owner' || member.role === 'admin');

    if (!isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this team' });
    }

    // TODO: Add logic here to handle prompts associated with this team
    // Option 1: Prevent deletion if team has prompts
    // Option 2: Delete associated prompts (potentially dangerous)
    // Option 3: Unassign prompts (set teamId to null, maybe change visibility?)
    console.warn(`WARNING: Deleting team ${id}. Associated prompts are not handled yet.`);

    const deletedResult = await Team.findByIdAndDelete(id);
    
    if (!deletedResult) {
         return res.status(404).json({ message: 'Team not found during deletion' });
    }

    return res.status(200).json({ message: 'Team deleted successfully' });
  } catch (error) {
    console.error('Error deleting team:', error);
     if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Team ID format' });
    }
    return res.status(500).json({ message: 'Failed to delete team' });
  }
}

export default withAuth(handler);
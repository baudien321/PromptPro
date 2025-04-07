import { withAuth } from '../../../../lib/auth';
import Team from '../../../../models/team'; // Import Mongoose model
import User from '../../../../models/user'; // Import User model for email lookup
import connectDB from '../../../../lib/mongoose'; // Import DB connector

/**
 * API handler for team member operations
 * 
 * GET: Get team members
 * POST: Add a team member
 */
async function handler(req, res) {
  const { method } = req;
  const { id: teamId } = req.query; // Rename id to teamId for clarity
  const sessionUserId = req.session?.sub;

  if (!teamId) {
    return res.status(400).json({ message: 'Team ID is required' });
  }
  if (!sessionUserId) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    await connectDB();

    // Fetch the team for permission checks and operations
    const team = await Team.findById(teamId).populate('members.user', 'name email'); // Populate user details

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Authorization Check: Must be a member to view or admin to add members
    const requestingMember = team.members.find(m => m.user._id.equals(sessionUserId));
    if (!requestingMember) {
        return res.status(403).json({ message: "Not authorized to access this team's members" });
    }

    switch (method) {
      case 'GET':
        // Any member can list members
        return res.status(200).json(team.members || []);
      case 'POST':
        // Only owner/admin can add members
        const isAdmin = requestingMember.role === 'owner' || requestingMember.role === 'admin';
        if (!isAdmin) {
          return res.status(403).json({ message: 'Not authorized to add members to this team' });
        }
        return addTeamMemberHandler(req, res, team);
      // Remove PUT and DELETE from this handler
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(`Error in /api/teams/[id]/members for team ${teamId}:`, error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid Team ID format' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function addTeamMemberHandler(req, res, team) { // team object is passed in
  const { email, role } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'User email is required' });
  }
  const normalizedEmail = email.toLowerCase().trim();

  // Validate role (owner cannot be assigned, only creator gets it initially)
  const validRoles = ['admin', 'member'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
  }

  try {
    // Find the user by email
    const userToAdd = await User.findOne({ email: normalizedEmail }).select('_id name email');
    if (!userToAdd) {
      return res.status(404).json({ message: `User with email ${email} not found` });
    }

    // Check if user is already a member
    const alreadyMember = team.members.some(member => member.user._id.equals(userToAdd._id));
    if (alreadyMember) {
      return res.status(409).json({ message: `User ${userToAdd.email} is already a member of this team` });
    }

    // Add the new member using $push
    const updatedTeam = await Team.findByIdAndUpdate(
      team._id,
      { $push: { members: { user: userToAdd._id, role: role } } },
      { new: true, runValidators: true } // Return updated doc, run validators
    ).populate('members.user', 'name email'); // Populate new member details

    if (!updatedTeam) {
        // Should not happen if team was found initially
        throw new Error('Team not found during member addition update');
    }

    // Return the updated list of members
    return res.status(200).json(updatedTeam.members);

  } catch (error) {
    console.error('Error adding team member:', error);
    // Handle potential validation errors from findByIdAndUpdate
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(el => el.message);
        return res.status(400).json({ message: 'Validation failed', errors });
    } 
    return res.status(500).json({ message: 'Failed to add team member' });
  }
}

export default withAuth(handler);
import { withAuth } from '../../../../../lib/auth'; // Adjust path depth
import Team from '../../../../../models/team'; // Import Mongoose model
import connectDB from '../../../../../lib/mongoose'; // Import DB connector
import User from '../../../../../models/user'; // May need for validation/info
import { logAuditEvent } from '../../../../../models/auditLog'; // Import audit helper

// This file handles PUT (update role) and DELETE (remove member) for a specific user in a team
async function handler(req, res) {
    const { method } = req;
    const { id: teamId, userId: targetUserId } = req.query; // Get teamId and targetUserId from query path
    const sessionUserId = req.session?.sub;

    // Basic validation
    if (!teamId || !targetUserId) {
        return res.status(400).json({ message: 'Team ID and User ID are required in the path' });
    }
    if (!sessionUserId) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        await connectDB();

        // Fetch the team
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Find the requesting user and target user within the team's members
        const requestingMember = team.members.find(m => m.user.equals(sessionUserId));
        const targetMember = team.members.find(m => m.user.equals(targetUserId));

        // Check if requesting user is part of the team
        if (!requestingMember) {
            return res.status(403).json({ message: 'Requesting user is not a member of this team' });
        }
        // Check if target user is part of the team
        if (!targetMember && method !== 'PUT') { // Target must exist for DELETE
             // For PUT, target might not exist if ID is wrong, handle later
            // But for DELETE, target *must* exist.
             if (method === 'DELETE') {
                 return res.status(404).json({ message: 'Target user not found in this team' });
             }
        }


        // Authorization logic
        const isOwnerOrAdmin = requestingMember.role === 'owner' || requestingMember.role === 'admin';
        const isSelf = sessionUserId === targetUserId;
        const targetIsOwner = targetMember?.role === 'owner'; // Check if target is the owner


        switch (method) {
            case 'PUT': // Update Role
                // Prevent changing owner's role
                if (targetIsOwner) {
                    return res.status(400).json({ message: 'Cannot change the role of the team owner' });
                }
                // Only owner/admin can change roles
                if (!isOwnerOrAdmin) {
                    return res.status(403).json({ message: 'Not authorized to change member roles' });
                }
                return updateMemberRole(req, res, teamId, targetUserId);

            case 'DELETE': // Remove Member
                // Prevent removing the owner
                if (targetIsOwner) {
                     return res.status(400).json({ message: 'Cannot remove the team owner' });
                }
                // Owner/Admin can remove anyone (except owner)
                // User can remove themselves (isSelf)
                if (!isOwnerOrAdmin && !isSelf) {
                    return res.status(403).json({ message: 'Not authorized to remove this member' });
                }
                 if (!targetMember) { // Double check target exists before delete attempt
                    return res.status(404).json({ message: 'Target user not found in this team' });
                 }
                return removeMember(req, res, teamId, targetUserId);

            default:
                res.setHeader('Allow', ['PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    } catch (error) {
        console.error(`Error in /api/teams/[id]/members/[userId] for team ${teamId}, user ${targetUserId}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Team ID or User ID format' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function updateMemberRole(req, res, teamId, targetUserId) {
    const { role: newRole } = req.body;
    const sessionUserId = req.session?.sub; // User making the change
    let oldRole = 'unknown';

    // Validate role
    const validRoles = ['admin', 'member']; // Owner role cannot be assigned here
    if (!newRole || !validRoles.includes(newRole)) {
        return res.status(400).json({ message: `Role must be one of: ${validRoles.join(', ')}` });
    }

    try {
        // Fetch old role first for audit log
        const teamBeforeUpdate = await Team.findOne({ _id: teamId, 'members.user': targetUserId }).select('members.$');
        if (teamBeforeUpdate && teamBeforeUpdate.members && teamBeforeUpdate.members.length > 0) {
             oldRole = teamBeforeUpdate.members[0].role;
        }

        // Use findOneAndUpdate to target the specific member in the array
        const updatedTeam = await Team.findOneAndUpdate(
            { _id: teamId, 'members.user': targetUserId },
            { $set: { 'members.$.role': newRole } },
            { new: true, runValidators: true }
        ).populate('members.user', 'name email');

        if (!updatedTeam) {
            return res.status(404).json({ message: 'Team or member not found for update' });
        }

        // --- Audit Log --- 
        await logAuditEvent({
            userId: sessionUserId,
            action: 'update_team_member_role',
            targetType: 'user', // The user whose role is being changed
            targetId: targetUserId.toString(), 
            details: { teamId: teamId.toString(), oldRole: oldRole, newRole: newRole }
        });
        // --- End Audit Log ---

        return res.status(200).json(updatedTeam.members);

    } catch (error) {
        console.error('Error updating member role:', error);
         if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ message: 'Validation failed', errors });
        }
        return res.status(500).json({ message: 'Failed to update member role' });
    }
}

async function removeMember(req, res, teamId, targetUserId) {
    try {
        // Use findOneAndUpdate with $pull to remove the member
        const updatedTeam = await Team.findByIdAndUpdate(
            teamId,
            { $pull: { members: { user: targetUserId } } }, // Remove the member subdocument matching the userId
            { new: true } // Return the updated document
        ).populate('members.user', 'name email'); // Repopulate remaining members

         if (!updatedTeam) {
            // Should not happen if initial check passed, but safeguard
            return res.status(404).json({ message: 'Team not found during member removal' });
        }

        return res.status(200).json(updatedTeam.members); // Return remaining members list

    } catch (error) {
        console.error('Error removing member:', error);
        return res.status(500).json({ message: 'Failed to remove team member' });
    }
}


export default withAuth(handler); 
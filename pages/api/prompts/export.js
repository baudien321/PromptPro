import { getToken } from 'next-auth/jwt';
import connectDB from '../../../lib/mongoose';
import Prompt from '../../../models/prompt';
import Team from '../../../models/team';
import { withAuth } from '../../../lib/auth'; // Ensure user is authenticated

async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const currentUserId = req.session?.sub;
    if (!currentUserId) {
        // Should be caught by withAuth, but double-check
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        await connectDB();

        // --- Fetch accessible prompts (similar logic to GET /api/prompts) --- 
        let userTeamIds = [];
        try {
            const teams = await Team.find({ 'members.user': currentUserId }).select('_id');
            userTeamIds = teams.map(t => t._id);
        } catch (teamError) {
            console.error("Error fetching user's teams for export:", teamError);
            // Proceed without team prompts if this fails
        }

        const query = {
            $or: [
                { visibility: 'public' },
                { creator: currentUserId, visibility: 'private' },
                ...(userTeamIds.length > 0 ? [{ teamId: { $in: userTeamIds }, visibility: 'team' }] : [])
            ]
        };

        // Fetch all accessible prompts - potentially large dataset!
        // Consider adding filters or limits for production environments.
        const prompts = await Prompt.find(query)
                                    .populate('creator', 'name email')
                                    .populate('teamId', 'name')
                                    .select('-__v') // Exclude version key
                                    .lean(); // Use lean for performance

        // --- Prepare JSON response for download --- 
        const filename = `promptpro_export_${new Date().toISOString().split('T')[0]}.json`;
        const jsonContent = JSON.stringify(prompts, null, 2); // Pretty print JSON

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(200).send(jsonContent);

    } catch (error) {
        console.error(`Error exporting prompts for user ${currentUserId}:`, error);
        // Don't send JSON error if headers might have been partially set
        res.status(500).end('Internal server error during export.');
    }
}

// Wrap with authentication
export default withAuth(handler); 
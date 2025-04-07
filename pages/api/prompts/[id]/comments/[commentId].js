import { withAuth } from '../../../../../lib/auth'; // Adjust path
import Comment from '../../../../../models/comment';
import Prompt from '../../../../../models/prompt'; // Needed to check team admin status potentially
import Team from '../../../../../models/team';
import connectDB from '../../../../../lib/mongoose';

// Handles PUT (update) and DELETE for a specific comment
async function handler(req, res) {
    const { method } = req;
    const { promptId, commentId } = req.query;
    const sessionUserId = req.session?.sub;

    // Basic validation
    if (!promptId || !commentId) {
        return res.status(400).json({ message: 'Prompt ID and Comment ID are required' });
    }
    if (!sessionUserId) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        await connectDB();

        // Find the comment and populate author and parent prompt details
        const comment = await Comment.findById(commentId).populate('author', '_id').populate({
             path: 'prompt',
             select: 'creator teamId visibility',
             populate: { path: 'teamId', select: 'members' } // Populate team members for auth checks
        });

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // --- Authorization Check ---
        let canModify = false;
        // 1. Is the user the author?
        if (comment.author._id.equals(sessionUserId)) {
            canModify = true;
        }
        // 2. Is the user an admin/owner of the team the prompt belongs to?
        if (!canModify && comment.prompt?.visibility === 'team' && comment.prompt?.teamId) {
             const team = comment.prompt.teamId; // Already populated
             const member = team.members.find(m => m.user.equals(sessionUserId));
             if (member && (member.role === 'owner' || member.role === 'admin')) {
                 // Team admins can modify comments within their team's prompts
                 // (Decide if this is desired behavior)
                 canModify = true;
             }
        }
        // --- End Authorization Check ---

        if (!canModify) {
            return res.status(403).json({ message: 'Not authorized to modify this comment' });
        }

        // Handle request based on method
        switch (method) {
            case 'PUT': // Update Comment
                // Only author should update? Or admins too? For now, restrict to author.
                if (!comment.author._id.equals(sessionUserId)) {
                     return res.status(403).json({ message: 'Only the author can update their comment.' });
                }
                return updateCommentHandler(req, res, comment); // Pass the fetched comment

            case 'DELETE': // Delete Comment (Author or Team Admin/Owner)
                return deleteCommentHandler(req, res, comment); // Pass the fetched comment

            default:
                res.setHeader('Allow', ['PUT', 'DELETE']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }

    } catch (error) {
        console.error(`Error in /api/prompts/[id]/comments/[cid] for comment ${commentId}:`, error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function updateCommentHandler(req, res, comment) {
    const { content } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    try {
        comment.content = content.trim();
        await comment.save(); // Use save() to trigger validation and potential hooks

        // Repopulate author for response consistency
        const populatedComment = await Comment.findById(comment._id)
                                                .populate('author', 'name email image');

        return res.status(200).json(populatedComment);

    } catch (error) {
        console.error('Error updating comment:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ message: 'Validation failed', errors });
        }
        return res.status(500).json({ message: 'Failed to update comment' });
    }
}

async function deleteCommentHandler(req, res, comment) {
    try {
        await Comment.findByIdAndDelete(comment._id);
        return res.status(200).json({ message: 'Comment deleted successfully' });

    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ message: 'Failed to delete comment' });
    }
}

export default withAuth(handler); 
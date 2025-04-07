import { withAuth } from '../../../../lib/auth';
import Prompt from '../../../../models/prompt';
import Comment from '../../../../models/comment';
import Team from '../../../../models/team';
import connectDB from '../../../../lib/mongoose';

/**
 * API handler for prompt comments
 * 
 * GET: Get comments for a prompt
 * POST: Add a new comment to a prompt
 * PUT: Update a comment
 * DELETE: Delete a comment
 */
async function handler(req, res) {
  const { method } = req;
  const { id: promptId } = req.query; // Rename id to promptId
  const sessionUserId = req.session?.sub; // Get user ID from session

  if (!promptId) {
    return res.status(400).json({ message: 'Prompt ID is required' });
  }
  if (!sessionUserId) {
     return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    await connectDB();

    // --- Authorization Check: Can user view the parent prompt? ---
    const prompt = await Prompt.findById(promptId).select('visibility creator teamId').populate('teamId', 'members');
    if (!prompt) {
      return res.status(404).json({ message: 'Parent prompt not found' });
    }

    let canViewPrompt = false;
    if (prompt.visibility === 'public') {
      canViewPrompt = true;
    } else if (prompt.visibility === 'private' && prompt.creator.equals(sessionUserId)) {
      canViewPrompt = true;
    } else if (prompt.visibility === 'team' && prompt.teamId) {
      const member = prompt.teamId.members.find(m => m.user.equals(sessionUserId));
      if (member) {
        canViewPrompt = true;
      }
    }

    if (!canViewPrompt) {
       return res.status(403).json({ message: 'Not authorized to view or comment on this prompt' });
    }
    // --- End Authorization Check ---

    switch (req.method) {
      case 'GET':
        // User is authorized to view prompt, so they can view comments
        return getCommentsHandler(req, res, promptId);
      case 'POST':
         // User is authorized to view prompt, so they can add comments
        return addCommentHandler(req, res, promptId, sessionUserId);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

  } catch (error) {
    console.error(`Error in /api/prompts/[id]/comments for prompt ${promptId}:`, error);
    if (error.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid Prompt ID format' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Get comments for a prompt
 */
async function getCommentsHandler(req, res, promptId) {
  try {
    // Find comments and populate author details
    const comments = await Comment.find({ prompt: promptId })
                                   .populate('author', 'name email image') // Select fields needed for display
                                   .sort({ createdAt: -1 }); // Sort by newest first
                                   
    return res.status(200).json(comments || []);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
}

/**
 * Add a new comment to a prompt
 */
async function addCommentHandler(req, res, promptId, authorId) {
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
       return res.status(400).json({ message: 'Comment content cannot be empty.' });
  }

  try {
    const newComment = new Comment({
      prompt: promptId,
      author: authorId,
      content: content.trim()
    });

    await newComment.save(); // Triggers schema validation

    // Populate the author details for the created comment before sending back
    const populatedComment = await Comment.findById(newComment._id)
                                           .populate('author', 'name email image');

    return res.status(201).json(populatedComment);

  } catch (error) {
    console.error('Error creating comment:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(el => el.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    } 
    return res.status(500).json({ message: 'Failed to create comment' });
  }
}

export default withAuth(handler);
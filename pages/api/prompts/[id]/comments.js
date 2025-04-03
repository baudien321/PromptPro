import { getPromptById, getCommentsByPromptId, createComment, updateComment, deleteComment, getTeamById } from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';
import { validateComment } from '../../../../models/comment';
import { canManagePrompt } from '../../../../lib/permissions';
import { isTeamMember } from '../../../../models/team';

/**
 * API handler for prompt comments
 * 
 * GET: Get comments for a prompt
 * POST: Add a new comment to a prompt
 * PUT: Update a comment
 * DELETE: Delete a comment
 */
async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Prompt ID is required' });
  }
  
  // Check if prompt exists
  const prompt = getPromptById(id);
  
  if (!prompt) {
    return res.status(404).json({ message: 'Prompt not found' });
  }
  
  // Check permissions based on visibility
  const userId = req.user.id;
  
  // For private prompts, only the owner can access comments
  if (prompt.visibility === 'private' && String(prompt.userId) !== String(userId)) {
    return res.status(403).json({ message: 'Not authorized to access comments for this prompt' });
  }
  
  // For team prompts, check team membership
  if (prompt.visibility === 'team' && prompt.teamId) {
    const team = getTeamById(prompt.teamId);
    
    if (!team || !isTeamMember(team, userId)) {
      return res.status(403).json({ message: 'Not authorized to access comments for this prompt' });
    }
  }
  
  switch (req.method) {
    case 'GET':
      return getCommentsHandler(req, res, id);
    case 'POST':
      return addCommentHandler(req, res, id, prompt);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

/**
 * Get comments for a prompt
 */
function getCommentsHandler(req, res, id) {
  try {
    const comments = getCommentsByPromptId(id);
    return res.status(200).json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
}

/**
 * Add a new comment to a prompt
 */
function addCommentHandler(req, res, id, prompt) {
  const { content } = req.body;
  
  try {
    // Validate request data
    const commentData = {
      promptId: id,
      userId: req.user.id,
      content,
      createdBy: req.user.name || req.user.email,
      teamId: prompt.visibility === 'team' ? prompt.teamId : null
    };
    
    const validation = validateComment(commentData);
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Create the comment
    const newComment = createComment(commentData);
    
    return res.status(201).json(newComment);
    
  } catch (error) {
    console.error('Error creating comment:', error);
    return res.status(500).json({ message: 'Failed to create comment' });
  }
}

// Use withAuth middleware to protect this endpoint
export default withAuth(handler);
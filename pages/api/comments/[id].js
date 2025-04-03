import { withAuth } from '../../../lib/auth';
import { getCommentById, updateComment, deleteComment, getPromptById, getTeamById } from '../../../lib/db';
import { validateComment } from '../../../models/comment';
import { isTeamAdmin } from '../../../models/team';

/**
 * API handler for operations on a specific comment
 * 
 * GET: Get a comment by ID
 * PUT: Update a comment
 * DELETE: Delete a comment
 */
async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Comment ID is required' });
  }
  
  // Get the comment
  const comment = getCommentById(id);
  
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  
  // Get the prompt to check visibility and permissions
  const prompt = getPromptById(comment.promptId);
  
  if (!prompt) {
    return res.status(404).json({ message: 'Associated prompt not found' });
  }
  
  // Get the current user ID
  const userId = req.user.id;
  
  // Check if the user can access the comment
  let canAccess = false;
  let isAdmin = false;
  
  if (prompt.visibility === 'public') {
    // Public prompts - anyone can access comments
    canAccess = true;
  } else if (prompt.visibility === 'private') {
    // Private prompts - only creator can access comments
    canAccess = String(prompt.userId) === String(userId);
  } else if (prompt.visibility === 'team' && prompt.teamId) {
    // Team prompts - check team membership and admin status
    const team = getTeamById(prompt.teamId);
    
    if (team) {
      isAdmin = isTeamAdmin(team, userId);
      canAccess = isAdmin || String(comment.userId) === String(userId);
    }
  }
  
  if (!canAccess) {
    return res.status(403).json({ message: 'Not authorized to access this comment' });
  }
  
  // Handle the request based on the method
  switch (req.method) {
    case 'GET':
      return getCommentHandler(req, res, comment);
    case 'PUT':
      return updateCommentHandler(req, res, comment, isAdmin);
    case 'DELETE':
      return deleteCommentHandler(req, res, comment, isAdmin);
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

/**
 * Get a comment by ID
 */
function getCommentHandler(req, res, comment) {
  try {
    return res.status(200).json(comment);
  } catch (error) {
    console.error('Error fetching comment:', error);
    return res.status(500).json({ message: 'Failed to fetch comment' });
  }
}

/**
 * Update a comment
 */
function updateCommentHandler(req, res, comment, isAdmin) {
  try {
    const userId = req.user.id;
    
    // Only comment creator can update the comment
    if (String(comment.userId) !== String(userId)) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }
    
    // Validate the updated comment
    const commentData = { ...comment, content };
    const validation = validateComment(commentData);
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Update the comment
    const updatedComment = updateComment(comment.id, { content });
    
    return res.status(200).json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ message: 'Failed to update comment' });
  }
}

/**
 * Delete a comment
 */
function deleteCommentHandler(req, res, comment, isAdmin) {
  try {
    const userId = req.user.id;
    
    // Comment can be deleted by its creator or by a team admin
    if (String(comment.userId) !== String(userId) && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Delete the comment
    deleteComment(comment.id);
    
    return res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: 'Failed to delete comment' });
  }
}

export default withAuth(handler);
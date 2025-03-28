import { getCommentById, updateComment, deleteComment } from '../../../lib/db';
import { withAuth } from '../../../lib/auth';
import { validateComment } from '../../../models/comment';

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
  
  // Fetch the comment for permission checking
  const comment = getCommentById(id);
  
  if (!comment) {
    return res.status(404).json({ message: 'Comment not found' });
  }
  
  // Check permissions - only comment author can modify or delete
  if ((req.method === 'PUT' || req.method === 'DELETE') && comment.userId !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden - You can only modify your own comments' });
  }
  
  switch (req.method) {
    case 'GET':
      return getCommentHandler(req, res, id);
    case 'PUT':
      return updateCommentHandler(req, res, id);
    case 'DELETE':
      return deleteCommentHandler(req, res, id);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

/**
 * Get a specific comment by ID
 */
function getCommentHandler(req, res, id) {
  try {
    const comment = getCommentById(id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    return res.status(200).json(comment);
    
  } catch (error) {
    console.error('Error fetching comment:', error);
    return res.status(500).json({ message: 'Failed to fetch comment' });
  }
}

/**
 * Update a comment
 */
function updateCommentHandler(req, res, id) {
  const { content } = req.body;
  
  try {
    // Validate request data
    const commentData = {
      content,
    };
    
    const validation = validateComment({
      ...commentData,
      promptId: 'placeholder', // needed for validation
      userId: 'placeholder'
    });
    
    if (!validation.isValid) {
      return res.status(400).json({ errors: validation.errors });
    }
    
    // Update the comment
    const updatedComment = updateComment(id, commentData);
    
    return res.status(200).json(updatedComment);
    
  } catch (error) {
    console.error('Error updating comment:', error);
    return res.status(500).json({ message: 'Failed to update comment' });
  }
}

/**
 * Delete a comment
 */
function deleteCommentHandler(req, res, id) {
  try {
    // Delete the comment
    deleteComment(id);
    
    return res.status(200).json({ message: 'Comment deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting comment:', error);
    return res.status(500).json({ message: 'Failed to delete comment' });
  }
}

// Use withAuth middleware to protect this endpoint
export default withAuth(handler);
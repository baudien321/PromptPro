import { getPromptById, getCommentsByPromptId, createComment, updateComment, deleteComment } from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth';
import { validateComment } from '../../../../models/comment';

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
  
  switch (req.method) {
    case 'GET':
      return getCommentsHandler(req, res, id);
    case 'POST':
      return addCommentHandler(req, res, id);
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
function addCommentHandler(req, res, id) {
  const { content } = req.body;
  
  try {
    // Validate request data
    const commentData = {
      promptId: id,
      userId: req.user.id,
      content,
      createdBy: req.user.name || req.user.email
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
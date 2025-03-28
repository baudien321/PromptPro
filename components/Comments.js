import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate } from '../lib/utils';

/**
 * Comments component for displaying and managing comments on a prompt
 * @param {Object} props - Component props
 * @param {string} props.promptId - ID of the prompt
 * @param {Array} props.initialComments - Initial comments data
 */
export default function Comments({ promptId, initialComments = [] }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch comments
  useEffect(() => {
    if (promptId) {
      fetchComments();
    }
  }, [promptId]);
  
  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data);
      
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    }
  };
  
  // Submit a new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      const addedComment = await response.json();
      
      // Add the new comment to the list
      setComments([...comments, addedComment]);
      setNewComment('');
      
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a comment
  const handleDelete = async (commentId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }
      
      // Remove the deleted comment from the list
      setComments(comments.filter(comment => comment.id !== commentId));
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };
  
  return (
    <div className="mt-8 bg-white rounded-lg border p-4">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Comment list */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{comment.createdBy}</div>
                  <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                </div>
                
                {/* Delete button (only for own comments) */}
                {session?.user?.id === comment.userId && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-500 hover:text-red-600"
                    title="Delete comment"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <div className="mt-1 text-gray-700">{comment.content}</div>
            </div>
          ))
        )}
      </div>
      
      {/* Comment form */}
      {session ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="comment" className="sr-only">Add a comment</label>
            <textarea
              id="comment"
              className="w-full border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-4 py-2 text-sm text-white rounded ${
                isSubmitting || !newComment.trim() 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center py-3 bg-gray-50 rounded-md">
          <p className="text-gray-600">
            Please <a href="/auth/signin" className="text-blue-600 hover:underline">sign in</a> to leave a comment
          </p>
        </div>
      )}
    </div>
  );
}
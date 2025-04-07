import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate } from '../lib/utils';
import { TrashIcon } from '@heroicons/react/24/solid';

/**
 * Comments component for displaying and managing comments on a prompt
 * @param {Object} props - Component props
 * @param {string} props.promptId - ID of the prompt
 */
export default function Comments({ promptId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const data = await response.json();
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
      setComments([]);
    } finally {
        setIsLoading(false);
    }
  };
  
  // Submit a new comment
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (!response.ok) {
         const errData = await response.json();
        throw new Error(errData.message || 'Failed to add comment');
      }
      const addedComment = await response.json();
      setComments(prevComments => [addedComment, ...prevComments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message || 'Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Delete a comment
  const handleDelete = async (commentId) => {
     if (!confirm('Are you sure you want to delete this comment?')) return;

     const commentToDelete = comments.find(c => c._id === commentId);
     if (!commentToDelete || commentToDelete.author?._id !== session?.user?.id) {
         setError("Cannot delete this comment.");
         return;
     }

     setComments(prevComments => prevComments.filter(comment => comment._id !== commentId));
     setError(null);

     try {
       const response = await fetch(`/api/prompts/${promptId}/comments/${commentId}`, {
         method: 'DELETE',
       });
       
       if (!response.ok) {
         const errData = await response.json();
         throw new Error(errData.message || 'Failed to delete comment on server');
       }
       
     } catch (error) {
       console.error('Error deleting comment:', error);
       setError(error.message || 'Failed to delete comment. Please try again.');
       setComments(prevComments => [...prevComments, commentToDelete].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
     }
  };
  
  return (
    <div className="mt-8 bg-white rounded-lg border p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Comments</h3>
      
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Comment form (only if logged in) */}
      {session ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="mb-2">
            <label htmlFor="comment" className="sr-only">Add a comment</label>
            <textarea
              id="comment"
              className="w-full border rounded-md px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition duration-150 ease-in-out sm:text-sm"
              rows="3"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? (
                   <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Posting...
                   </>
                ): 'Post Comment'}
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
      
      {/* Comment list */}
      <div className="space-y-4">
         {isLoading ? (
             <p className="text-gray-500 text-sm">Loading comments...</p>
         ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="border-t pt-4 first:border-t-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                   {/* Basic Avatar */} 
                  <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold">
                     {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-800">{comment.author?.name || 'Unknown User'}</div>
                    <div className="text-xs text-gray-500">{formatDate(comment.createdAt)}</div>
                  </div>
                </div>
                
                {/* Delete button (only for comment author) */} 
                {session?.user?.id === comment.author?._id && (
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition duration-150 ease-in-out"
                    title="Delete comment"
                  >
                     <span className="sr-only">Delete comment</span>
                     <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
              {/* Use whitespace-pre-wrap to preserve line breaks in comment */} 
              <p className="mt-2 text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
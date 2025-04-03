import { getSession } from 'next-auth/react';
import { connectToDatabase } from '../../../lib/mongodb';

/**
 * @swagger
 * /api/tags/{tagName}:
 *   delete:
 *     summary: Delete a tag
 *     description: Removes a tag from all prompts
 *     parameters:
 *       - in: path
 *         name: tagName
 *         required: true
 *         schema:
 *           type: string
 *         description: The tag name to delete
 *     responses:
 *       200:
 *         description: Tag deleted successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export default async function handler(req, res) {
  // Get the tag name from the URL
  const { tagName } = req.query;
  
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate input
    if (!tagName) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Remove the tag from all prompts
    const result = await db.collection('prompts').updateMany(
      { tags: tagName },
      { 
        $pull: { tags: tagName },
        $set: { updatedAt: new Date().toISOString() }
      }
    );
    
    return res.status(200).json({ 
      success: true, 
      message: `Tag "${tagName}" deleted successfully`,
      promptsUpdated: result.modifiedCount
    });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return res.status(500).json({ error: 'Failed to delete tag' });
  }
}
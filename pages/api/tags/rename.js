import { getSession } from 'next-auth/react';
import { connectToDatabase } from '../../../lib/mongodb';

/**
 * @swagger
 * /api/tags/rename:
 *   put:
 *     summary: Rename a tag
 *     description: Renames a tag across all prompts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldName
 *               - newName
 *             properties:
 *               oldName:
 *                 type: string
 *                 description: The current tag name
 *               newName:
 *                 type: string
 *                 description: The new tag name
 *     responses:
 *       200:
 *         description: Tag renamed successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export default async function handler(req, res) {
  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { oldName, newName } = req.body;

    // Validate input
    if (!oldName || !newName) {
      return res.status(400).json({ error: 'Both oldName and newName are required' });
    }

    if (oldName === newName) {
      return res.status(400).json({ error: 'New tag name must be different from the old one' });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Update all prompts that contain the old tag
    const result = await db.collection('prompts').updateMany(
      { tags: oldName },
      { 
        $set: { 
          "updatedAt": new Date().toISOString() 
        },
        $pull: { tags: oldName } 
      }
    );

    // Add the new tag to those same prompts
    await db.collection('prompts').updateMany(
      { _id: { $in: result.modifiedIds } }, // Use the IDs of modified documents
      { $push: { tags: newName } }
    );
    
    return res.status(200).json({ 
      success: true, 
      message: `Tag "${oldName}" renamed to "${newName}"`,
      promptsUpdated: result.modifiedCount
    });
  } catch (error) {
    console.error('Error renaming tag:', error);
    return res.status(500).json({ error: 'Failed to rename tag' });
  }
}
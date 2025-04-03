import { getSession } from 'next-auth/react';
import { connectToDatabase } from '../../../lib/mongodb';

/**
 * @swagger
 * /api/tags/merge:
 *   put:
 *     summary: Merge multiple tags
 *     description: Merges source tags into a target tag across all prompts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sourceTags
 *               - targetTag
 *             properties:
 *               sourceTags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of tag names to merge from
 *               targetTag:
 *                 type: string
 *                 description: The tag name to merge into
 *     responses:
 *       200:
 *         description: Tags merged successfully
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

    const { sourceTags, targetTag } = req.body;

    // Validate input
    if (!Array.isArray(sourceTags) || sourceTags.length === 0 || !targetTag) {
      return res.status(400).json({ error: 'Valid sourceTags array and targetTag are required' });
    }

    if (sourceTags.includes(targetTag)) {
      return res.status(400).json({ error: 'Target tag cannot be in the source tags' });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Find all prompts that have any of the source tags but don't have the target tag
    const promptsToUpdate = await db.collection('prompts').find({
      tags: { $in: sourceTags },
      $or: [
        { tags: { $ne: targetTag } },
        { tags: { $exists: false } }
      ]
    }).toArray();
    
    // For each prompt, update the tags
    let updatedCount = 0;
    
    for (const prompt of promptsToUpdate) {
      // Remove source tags and add target tag if not already present
      const updatedTags = prompt.tags.filter(tag => !sourceTags.includes(tag));
      
      if (!updatedTags.includes(targetTag)) {
        updatedTags.push(targetTag);
      }
      
      // Update the prompt
      await db.collection('prompts').updateOne(
        { _id: prompt._id },
        { 
          $set: { 
            tags: updatedTags,
            updatedAt: new Date().toISOString()
          }
        }
      );
      
      updatedCount++;
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `Tags merged successfully into "${targetTag}"`,
      promptsUpdated: updatedCount
    });
  } catch (error) {
    console.error('Error merging tags:', error);
    return res.status(500).json({ error: 'Failed to merge tags' });
  }
}
import { getSession } from 'next-auth/react';
import { connectToDatabase } from '../../../lib/mongodb';

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Get all tags with usage counts
 *     description: Retrieves all tags used across prompts with their usage counts
 *     responses:
 *       200:
 *         description: List of tags with counts
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user session
    const session = await getSession({ req });
    
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    
    // Aggregate tags from all prompts
    const tagAggregation = await db.collection('prompts').aggregate([
      // Only include prompts the user has access to
      {
        $match: {
          $or: [
            { userId: session.user.id }, // User's own prompts
            { visibility: 'public' }, // Public prompts
            { 
              visibility: 'team',
              teamId: { $in: session.user.teamIds || [] }
            } // Team prompts where user is a member
          ]
        }
      },
      // Unwind the tags array to create a document for each tag
      { $unwind: '$tags' },
      // Group by tag name and count occurrences
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      // Format the output
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1
        }
      },
      // Sort by count (descending)
      { $sort: { count: -1 } }
    ]).toArray();
    
    return res.status(200).json(tagAggregation);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return res.status(500).json({ error: 'Failed to fetch tags' });
  }
}
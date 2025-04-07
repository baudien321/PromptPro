import { withAuth } from '../../../lib/auth';
import connectDB from '../../../lib/mongoose';
import PromptUsage from '../../../models/promptUsage';
import Prompt from '../../../models/prompt';
import User from '../../../models/user';
import mongoose from 'mongoose';

async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    const userId = req.session?.sub; // Get user ID from session
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    // TODO: Add role check? Should only admins see global stats?
    // For now, let's assume authenticated users can see basic stats.

    try {
        await connectDB();

        // --- Aggregation Pipeline --- 
        // Example: Get total event counts and top 5 executed prompts

        const N_DAYS_AGO = 30; // Look back period
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - N_DAYS_AGO);

        // 1. Total counts by event type
        const totalCountsPipeline = [
            { $match: { timestamp: { $gte: startDate } } }, // Filter by date range
            { $group: { _id: '$eventType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ];

        // 2. Top 5 executed prompts
        const topPromptsPipeline = [
            { $match: { eventType: 'execute', timestamp: { $gte: startDate } } },
            { $group: { _id: '$promptId', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { 
              $lookup: { // Join with prompts collection to get title
                from: 'prompts', 
                localField: '_id', 
                foreignField: '_id', 
                as: 'promptDetails'
              }
            },
            { $unwind: { path: "$promptDetails", preserveNullAndEmptyArrays: true } }, // Deconstruct the array
             { 
                $project: { // Reshape the output
                   _id: 1, 
                   count: 1, 
                   title: "$promptDetails.title" 
                }
             }
        ];
        
        // --- Execute Pipelines --- 
        const [totalCountsResult, topPromptsResult] = await Promise.all([
            PromptUsage.aggregate(totalCountsPipeline),
            PromptUsage.aggregate(topPromptsPipeline)
        ]);

        // Format results
        const totalCounts = totalCountsResult.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        const topPrompts = topPromptsResult.map(item => ({ 
            id: item._id, 
            title: item.title || 'Prompt Deleted or Inaccessible', 
            count: item.count 
        }));

        const summary = {
            totalCounts,
            topPrompts,
            periodDays: N_DAYS_AGO
            // Add more aggregated data here (e.g., top users, daily trends)
        };

        return res.status(200).json(summary);

    } catch (error) {
        console.error('Error fetching analytics summary:', error);
        return res.status(500).json({ message: 'Internal server error fetching analytics.' });
    }
}

export default withAuth(handler); 
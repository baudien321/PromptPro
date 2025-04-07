import { withAuth } from '../../../lib/auth'; // Use withAuth to ensure user is logged in
import connectDB from '../../../lib/mongoose';
import PromptUsage from '../../../models/promptUsage';
import Prompt from '../../../models/prompt'; // To validate promptId existence
import mongoose from 'mongoose';

async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    const userId = req.session?.sub; // Get user ID from session populated by withAuth
    if (!userId) {
        // Should be caught by withAuth, but double-check
        return res.status(401).json({ message: 'Authentication required.' });
    }

    const { promptId, teamId, eventType, metadata } = req.body;

    // --- Basic Validation ---
    if (!promptId || !mongoose.Types.ObjectId.isValid(promptId)) {
        return res.status(400).json({ message: 'Valid Prompt ID is required.' });
    }
    if (teamId && !mongoose.Types.ObjectId.isValid(teamId)) {
        return res.status(400).json({ message: 'Invalid Team ID format provided.' });
    }
    if (!eventType) {
        return res.status(400).json({ message: 'Event type is required.' });
    }
    // Could add validation for allowed eventTypes here if needed

    try {
        await connectDB();

        // --- Deeper Validation (Optional but recommended) ---
        // 1. Check if the prompt actually exists
        const promptExists = await Prompt.exists({ _id: promptId });
        if (!promptExists) {
            return res.status(404).json({ message: `Prompt with ID ${promptId} not found.` });
        }
        // 2. Add check if user has permission to interact with this prompt? (Could be complex)
        //    For now, we trust the frontend is calling this correctly after interaction.

        // --- Create Log Entry ---
        const usageLog = new PromptUsage({
            promptId,
            userId,
            teamId: teamId || undefined, // Ensure null/empty becomes undefined
            eventType,
            metadata: metadata || {},
            // timestamp is set by default
        });

        await usageLog.save();

        console.log(`Analytics log saved: User ${userId}, Event ${eventType}, Prompt ${promptId}`);
        // Respond with 201 Created or 200 OK
        // 204 No Content might also be appropriate if no body is needed
        return res.status(201).json({ message: 'Usage logged successfully.' });

    } catch (error) {
        console.error('Error logging prompt usage:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(el => el.message);
            return res.status(400).json({ message: 'Validation failed', errors });
        } 
        // Handle potential CastErrors if validation missed something
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid ID format in request body.' });
        }
        return res.status(500).json({ message: 'Internal server error logging usage.' });
    }
}

// Wrap the handler with authentication
export default withAuth(handler); 
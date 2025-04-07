import { withAuthForMethods } from '../../../lib/auth';
import Prompt from '../../../models/prompt';
import { validatePrompt } from '../../../models/prompt';
import * as promptRepository from '../../../lib/repositories/promptRepository';
import { isTeamMember } from '../../../models/team';
import { getUserTeams } from '../../../lib/db';
import { getToken } from 'next-auth/jwt';
import connectDB from '../../../lib/mongoose';
import User from '../../../models/user'; // Import User model if needed for validation/population
import Team from '../../../models/team'; // Import Team model
import { logAuditEvent } from '../../../models/auditLog'; // Import audit log helper

// Define limits for different plans
const USER_PLAN_LIMITS = {
  Free: { promptLimit: 10 }, // Personal prompt limit for free users
  Pro: { promptLimit: Infinity } // Pro users have unlimited personal prompts
};

// We might not need this duplicate constant if Team model defines its own limits
// const FREE_PLAN_PROMPT_LIMIT = 10; 

async function handler(req, res) {
  // Ensure DB Connection for all methods? Seems reasonable.
  // Although GET might work without it if data is cached, POST needs it.
  // Let's connect within each handler where needed for clarity.

  // Get session/token - needed for GET auth logic
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  // Attach session-like object to req for consistency within handlers
  // Note: withAuthForMethods might handle this differently, adjust if needed
  req.session = token; 

  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  switch (req.method) {
    case 'GET':
      return getPrompts(req, res);
    case 'POST':
      // Auth for POST is handled by withAuthForMethods wrapper below
      return addPrompt(req, res);
    default:
      return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getPrompts(req, res) {
  try {
    // Get query parameters for filtering
    const { userId, visibility, aiPlatform, tags, teamId, q } = req.query;

    // Get the current user ID if authenticated (from token attached in main handler)
    const currentUserId = req.session?.sub || null;

    await connectDB();

    // Base query object from direct query params
    const baseQuery = {};
    if (aiPlatform) baseQuery.platformCompatibility = aiPlatform; // Match schema field
    if (tags) baseQuery.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (userId) baseQuery.creator = userId; // Match schema field ('creator')

    // Add text search if 'q' parameter exists
    if (q && typeof q === 'string' && q.trim()) {
         baseQuery.$text = { $search: q.trim() };
         // Ensure PromptSchema.index({ title: 'text', text: 'text', description: 'text' }); exists
    }

    // Authorization / Visibility Query Construction
    let finalQuery = { ...baseQuery }; // Start with base filters

    if (currentUserId) {
        // Authenticated user
        let userTeamIds = [];
        try {
            // Find teams where the current user is a member
            const teams = await Team.find({ 'members.user': currentUserId }).select('_id');
            userTeamIds = teams.map(t => t._id);
        } catch (teamError) {
            console.error("Error fetching user's teams:", teamError);
            // Proceed without team prompts if this fails
        }

        // If a specific teamId is requested via query param, override general visibility logic
        if (teamId) {
            // Check if user is actually a member of the requested teamId
            const isMemberOfRequestedTeam = userTeamIds.some(id => id.equals(teamId));
            if (!isMemberOfRequestedTeam) {
                 return res.status(403).json({ message: 'Not authorized to view prompts for this specific team' });
            }
            // If member, add teamId to the query and proceed
             finalQuery.teamId = teamId;
             // Optionally enforce visibility match if desired
             // finalQuery.visibility = 'team'; 
        } else {
             // No specific team requested, apply general visibility rules
            finalQuery.$or = [
                { visibility: 'public' },
                { creator: currentUserId, visibility: 'private' }, // Their private prompts
                 ...(userTeamIds.length > 0 ? [{ teamId: { $in: userTeamIds }, visibility: 'team' }] : []) // Team prompts if member of any teams
            ];
             // If a specific visibility was requested, it should constrain the $or results
             if (visibility) {
                 // Ensure the requested visibility is allowed by the $or conditions
                 const allowedVisibilities = ['public'];
                 if(finalQuery.$or.some(cond => cond.creator === currentUserId)) allowedVisibilities.push('private');
                 if(finalQuery.$or.some(cond => cond.teamId)) allowedVisibilities.push('team');
                 
                 if (allowedVisibilities.includes(visibility)) {
                    finalQuery.visibility = visibility; 
                 } else {
                    // If requested visibility isn't possible based on auth, return empty
                    // Or maybe just ignore the filter? For now, let's return empty.
                    return res.status(200).json([]); 
                 }
             }
        }
         // Implicit $and for creator filter if present in baseQuery

    } else {
        // Unauthenticated user: Only public prompts
         finalQuery.visibility = 'public';
         // Prevent unauth users from querying specific teams
         if (teamId) {
             return res.status(403).json({ message: 'Authentication required to view team prompts' });
         }
         // Implicit $and for creator filter allows viewing specific user's public prompts
    }

    // Determine sort order
    let sortOrder = { createdAt: -1 }; // Default sort
    if (q && typeof q === 'string' && q.trim()) {
        sortOrder = { score: { $meta: "textScore" } }; // Sort by relevance if searching
    }

    // Execute the final query
    const prompts = await Prompt.find(finalQuery)
                                .populate('creator', 'name email')
                                .populate('teamId', 'name')
                                .sort(sortOrder); // Apply sort order

    return res.status(200).json(prompts);

  } catch (error) {
    console.error('Error getting prompts:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid ID format in query parameters' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function addPrompt(req, res) {
   console.log('API Received Body:', req.body); // Log the raw request body

   const userId = req.session?.sub;
   if (!userId) {
     return res.status(401).json({ message: 'Unauthorized: User not authenticated' });
   }

   try {
     await connectDB();
     const promptDataFromRequest = req.body;

     // Use the raw request data directly for validation, as it already contains 'text'
     const promptDataForValidation = { ...promptDataFromRequest };

     // --- Explicit Validation --- 
     // Validate the mapped data
     const { isValid, errors: validationErrors } = validatePrompt(promptDataForValidation, false); 
     if (!isValid) {
        console.warn('Prompt validation failed in API:', validationErrors);
        return res.status(400).json({ message: 'Validation failed', errors: validationErrors });
     }
     // --- End Explicit Validation ---

     // Use the mapped data for limit checks and saving
     const { visibility, teamId } = promptDataForValidation;

     // --- Limit Enforcement --- 
     if (visibility === 'team') {
         if (!teamId) {
             return res.status(400).json({ message: 'Team ID is required for team visibility' });
         }
         // Fetch the team and check membership
         const team = await Team.findOne({ _id: teamId, 'members.user': userId }).select('promptLimit plan members.$');
         if (!team) {
              return res.status(403).json({ message: 'You are not a member of the specified team or team does not exist.' });
         }
         // Count existing prompts for this team
         const teamPromptCount = await Prompt.countDocuments({ teamId: teamId });
         
         // Check team limit
         if (teamPromptCount >= team.promptLimit) {
             console.log(`Team ${teamId} (${team.plan} Plan) reached prompt limit (${teamPromptCount}/${team.promptLimit})`);
             return res.status(403).json({
                 message: `Team prompt limit of ${team.promptLimit} reached. The team owner or an admin may need to upgrade the plan or delete prompts.`,
                 limitReached: true,
                 scope: 'team'
             });
         }
         console.log(`Team ${teamId} check OK (${teamPromptCount}/${team.promptLimit})`);

     } else { // Check personal limit for 'private' or 'public' prompts
         const user = await User.findById(userId).select('plan promptCount');
         if (!user) {
             console.error(`AddPrompt Error: User not found in DB for ID: ${userId}`);
             return res.status(404).json({ message: 'User not found' });
         }
         const userLimit = USER_PLAN_LIMITS[user.plan]?.promptLimit ?? USER_PLAN_LIMITS['Free'].promptLimit; // Fallback to free limit
         
         if (user.promptCount >= userLimit) {
             console.log(`User ${userId} (${user.plan} Plan) reached personal prompt limit (${user.promptCount}/${userLimit})`);
             return res.status(403).json({
                 message: `Your personal prompt limit of ${userLimit} has been reached. Please upgrade to Pro or delete some prompts.`,
                 limitReached: true,
                 scope: 'user'
             });
         }
         console.log(`User ${userId} check OK (${user.promptCount}/${userLimit})`);
     }
     // --- End Limit Enforcement ---

     // Clear teamId if visibility is not team 
      if (visibility !== 'team') {
         promptDataForValidation.teamId = undefined;
     } 

     // Create new prompt instance using the mapped data
     const newPrompt = new Prompt({
         ...promptDataForValidation,
         creator: userId,
     });

     // Save the prompt
     const savedPrompt = await newPrompt.save();

     // --- Audit Log --- 
     await logAuditEvent({ 
         userId: userId,
         action: 'create_prompt',
         targetType: 'prompt',
         targetId: savedPrompt._id.toString(),
         details: { title: savedPrompt.title, visibility: savedPrompt.visibility, teamId: savedPrompt.teamId?.toString() }
     });
     // --- End Audit Log ---

     // --- Increment User Prompt Count (Always increment user's count) ---
     await User.updateOne({ _id: userId }, { $inc: { promptCount: 1 } });
     console.log(`Successfully incremented prompt count for user ${userId}`);
     // --- End Increment ---

     console.log('Successfully created prompt:', savedPrompt._id);

     // Populate and return
     const populatedPrompt = await Prompt.findById(savedPrompt._id)
                                         .populate('creator', 'name email plan promptCount') // Include user plan/count?
                                         .populate('teamId', 'name plan promptLimit'); // Include team plan/limit?

     return res.status(201).json(populatedPrompt);

   } catch (error) {
     console.error('Error creating prompt:', error);
     if (error.name === 'ValidationError') {
         // Log the specific validation errors for debugging
         console.error('Mongoose Validation Errors:', error.errors); 
         const errors = Object.values(error.errors).map(el => el.message);
         return res.status(400).json({ message: 'Validation failed', errors });
     }
      if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid Team ID format provided' });
      }
     return res.status(500).json({ message: 'Internal server error while creating prompt' });
   }
}

// Apply authentication ONLY to POST method (GET is handled internally)
export default withAuthForMethods(handler, ['POST']);

import { getSession } from 'next-auth/react';
import * as promptRepository from '../../lib/repositories/promptRepository';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  // Set cache control headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  try {
    // Get the user session (if authenticated)
    const session = await getSession({ req });
    
    // Get search parameters from query string
    const { 
      q,              // Search query text
      userId,         // Filter by creator
      teamId,         // Filter by team
      visibility,     // Filter by visibility (public, private, team)
      aiPlatform,     // Filter by AI platform
      tags,           // Filter by tags
      tagMatchType,   // 'all' or 'any'
      minRating,      // Minimum rating
      minUsageCount,  // Minimum usage count
      sortBy,         // Field to sort by
      sortDirection,  // 'asc' or 'desc'
      limit           // Maximum results to return
    } = req.query;
    
    // Build search options
    const searchOptions = {
      limit: limit ? parseInt(limit, 10) : 50
    };
    
    // Add filter options if provided
    if (tags) {
      searchOptions.tags = Array.isArray(tags) ? tags : [tags];
      searchOptions.tagMatchType = tagMatchType || 'all';
    }
    
    if (aiPlatform) {
      searchOptions.aiPlatform = aiPlatform;
    }
    
    if (minRating) {
      searchOptions.minRating = parseFloat(minRating);
    }
    
    if (minUsageCount) {
      searchOptions.minUsageCount = parseInt(minUsageCount, 10);
    }
    
    // Sorting options
    if (sortBy) {
      const validSortFields = ['rating', 'usageCount', 'successRate', 'createdAt', 'updatedAt'];
      if (validSortFields.includes(sortBy)) {
        searchOptions.sortBy = sortBy;
        
        if (sortDirection && (sortDirection === 'asc' || sortDirection === 'desc')) {
          searchOptions.sortDirection = sortDirection;
        }
      }
    }
    
    // User ID filtering - only allow if it's the current user or admin
    if (userId) {
      if (session && session.user && (
          session.user.id === userId || session.user.role === 'admin')) {
        searchOptions.userId = userId;
      } else {
        // If not authenticated or not the user, only return public prompts
        searchOptions.visibility = 'public';
      }
    }
    
    // Team filtering - ensure the user is part of the team
    if (teamId) {
      // In production, you would verify team membership here
      // For now, we'll trust the client-side checks
      searchOptions.teamId = teamId;
    }
    
    // If not authenticated, only return public prompts
    if (!session || !session.user) {
      searchOptions.visibility = 'public';
    }
    
    // Perform the search
    const results = await promptRepository.searchPrompts(q || '', searchOptions);
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching prompts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

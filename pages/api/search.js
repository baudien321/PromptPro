import { searchPrompts } from '../../lib/db';
import { getAuthSession } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { 
      q, 
      aiPlatform, 
      visibility, 
      minRating,
      minUsageCount,
      minSuccessRate, 
      tags,
      tagMatchType,
      sortBy,
      sortDirection,
      userId, 
      teamId 
    } = req.query;
    
    if (!q && !aiPlatform && !visibility && !minRating && !minUsageCount && 
        !minSuccessRate && !tags && !userId && !teamId && !sortBy) {
      return res.status(400).json({ message: 'At least one search parameter is required' });
    }
    
    // Get session to check authentication
    const session = await getAuthSession(req);
    const searchOptions = {};
    
    // Add filter options if provided
    if (aiPlatform) searchOptions.aiPlatform = aiPlatform;
    if (visibility) searchOptions.visibility = visibility;
    if (minRating) searchOptions.minRating = parseFloat(minRating);
    if (minUsageCount) searchOptions.minUsageCount = parseInt(minUsageCount, 10);
    if (minSuccessRate) searchOptions.minSuccessRate = parseFloat(minSuccessRate);
    
    // Handle tags - can be a single string or an array
    if (tags) {
      if (Array.isArray(tags)) {
        searchOptions.tags = tags;
      } else if (typeof tags === 'string') {
        // For comma-separated tags in query string
        searchOptions.tags = tags.split(',').map(tag => tag.trim());
      }
      
      if (tagMatchType && (tagMatchType === 'any' || tagMatchType === 'all')) {
        searchOptions.tagMatchType = tagMatchType;
      }
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
      if (session && (session.user.id.toString() === userId || session.user.role === 'admin')) {
        searchOptions.userId = parseInt(userId, 10);
      } else {
        // If not authenticated or not the user, only return public prompts
        searchOptions.visibility = 'public';
      }
    }
    
    // Team filtering - ensure the user is part of the team
    if (teamId && session) {
      // In a real app, you would check if the user is part of the team
      // For now, just pass it through (would be validated in the searchPrompts function)
      searchOptions.teamId = parseInt(teamId, 10);
    }
    
    // If not authenticated, only return public prompts
    if (!session) {
      searchOptions.visibility = 'public';
    }
    
    const results = searchPrompts(q || '', searchOptions);
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching prompts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

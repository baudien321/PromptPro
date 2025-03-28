// Format date in a human-readable format
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Generate a shareable URL for a prompt
export const generateShareableUrl = (promptId) => {
  return `${window.location.origin}/prompts/${promptId}`;
};

// Copy text to clipboard
export const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      return false;
    }
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Failed to copy text: ', err);
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Truncate text to a specified length
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Filter prompts by tag
export const filterPromptsByTag = (prompts, tag) => {
  if (!tag) return prompts;
  return prompts.filter(prompt => 
    prompt.tags && prompt.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
};

// Get unique tags from prompts
export const getUniqueTags = (prompts) => {
  const tags = prompts.reduce((acc, prompt) => {
    if (prompt.tags && Array.isArray(prompt.tags)) {
      return [...acc, ...prompt.tags];
    }
    return acc;
  }, []);
  
  return [...new Set(tags)];
};

// Calculate statistics from prompts data
export const calculateStatistics = (prompts) => {
  if (!prompts || prompts.length === 0) {
    return {
      totalPrompts: 0,
      totalUsage: 0,
      averageRating: 0,
      successRate: 0,
      popularTags: [],
      topPrompts: []
    };
  }

  // Calculate total usage
  const totalUsage = prompts.reduce((sum, prompt) => sum + (prompt.usageCount || 0), 0);
  
  // Calculate average rating
  const promptsWithRatings = prompts.filter(p => p.rating > 0);
  const averageRating = promptsWithRatings.length > 0
    ? promptsWithRatings.reduce((sum, p) => sum + p.rating, 0) / promptsWithRatings.length
    : 0;
  
  // Calculate success rate
  const promptsWithSuccessStatus = prompts.filter(p => p.isSuccess !== undefined);
  const successRate = promptsWithSuccessStatus.length > 0
    ? (promptsWithSuccessStatus.filter(p => p.isSuccess).length / promptsWithSuccessStatus.length) * 100
    : 0;
  
  // Get popular tags
  const tagsCount = {};
  prompts.forEach(prompt => {
    if (prompt.tags && Array.isArray(prompt.tags)) {
      prompt.tags.forEach(tag => {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
      });
    }
  });
  
  const popularTags = Object.entries(tagsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));
  
  // Get top prompts by usage
  const topPrompts = [...prompts]
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, 5);
  
  return {
    totalPrompts: prompts.length,
    totalUsage,
    averageRating: parseFloat(averageRating.toFixed(1)),
    successRate: parseFloat(successRate.toFixed(1)),
    popularTags,
    topPrompts
  };
};

// Get recent activity from all data sources
export const getRecentActivity = (data) => {
  if (!data) return [];
  
  const activity = [];
  
  // Add prompts to activity
  if (data.prompts) {
    data.prompts.forEach(prompt => {
      activity.push({
        type: 'prompt',
        id: prompt.id,
        title: prompt.title,
        timestamp: prompt.updatedAt || prompt.createdAt,
        action: prompt.createdAt === prompt.updatedAt ? 'created' : 'updated'
      });
    });
  }
  
  // Add collections to activity
  if (data.collections) {
    data.collections.forEach(collection => {
      activity.push({
        type: 'collection',
        id: collection.id,
        title: collection.name,
        timestamp: collection.updatedAt || collection.createdAt,
        action: collection.createdAt === collection.updatedAt ? 'created' : 'updated'
      });
    });
  }
  
  // Add comments to activity
  if (data.comments) {
    data.comments.forEach(comment => {
      activity.push({
        type: 'comment',
        id: comment.id,
        title: `Comment on prompt`,
        promptId: comment.promptId,
        timestamp: comment.createdAt,
        action: 'added'
      });
    });
  }
  
  // Sort by timestamp (most recent first)
  return activity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);
};

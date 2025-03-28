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

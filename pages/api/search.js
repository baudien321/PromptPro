import { searchPrompts } from '../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const results = searchPrompts(q);
    
    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching prompts:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Sample data to initialize the application with demo content
 */

import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from './auth-utils';

// Get current timestamp for created/updated dates
const now = new Date().toISOString();

// Demo user
export const demoUser = {
  id: 'demo-user-1',
  username: 'demo_user',
  email: 'demo@example.com',
  name: 'Demo User',
  password: 'hashed_password', // This will be properly hashed during init
  createdAt: now,
  updatedAt: now,
};

// Demo prompts
export const demoPrompts = [
  {
    id: uuidv4(),
    title: 'Summarize Text',
    content: "Summarize the following text in {{number_of_sentences || 'a few sentences'}}, focusing on the main points:\n\n{{text_to_summarize}}",
    description: "Condenses longer text into a brief summary.",
    tags: ['template', 'summarization', 'writing'],
    aiPlatform: 'Other', // Use 'Other' or define 'Any' if available
    visibility: 'public',
    userId: 'demo-user-1', // Assign to demo user
    usageCount: 0, // Start templates with 0 usage
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Draft Professional Email',
    content: "Draft a professional email to {{recipient_description}} about {{subject}}. The key points to include are:\n\n- {{point_1}}\n- {{point_2}}\n- {{point_3}}\n\nThe desired tone is {{tone || 'professional and courteous'}}.",
    description: "Helps draft professional emails for various situations.",
    tags: ['template', 'email', 'communication'],
    aiPlatform: 'Other',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 0,
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Brainstorm Ideas',
    content: "Brainstorm a list of {{number_of_ideas || 10}} creative ideas for {{topic_or_goal}}. Consider different angles and approaches.",
    description: "Generates a list of creative ideas for a given topic or goal.",
    tags: ['template', 'brainstorming', 'creative'],
    aiPlatform: 'Other',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 0,
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Explain Concept Simply',
    content: "Explain the concept of '{{concept}}' in simple terms, as if explaining it to someone completely unfamiliar with the topic. Use an analogy if helpful.",
    description: "Breaks down complex concepts into easy-to-understand explanations.",
    tags: ['template', 'explanation', 'learning'],
    aiPlatform: 'Other',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 0,
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Rewrite Text',
    content: "Rewrite the following text to be more {{desired_quality || 'concise and clear'}}. Maintain the original meaning but improve the phrasing:\n\n{{text_to_rewrite}}",
    description: "Improves existing text by making it more concise, clear, engaging, etc.",
    tags: ['template', 'writing', 'editing'],
    aiPlatform: 'Other',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 0,
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Professional Email Response Generator',
    content: 'As a professional communication expert, draft a concise and courteous email response to the following message: {{message}}. The tone should be {{tone}} and the goal is to {{goal}}.',
    description: 'Generate professional email responses with customizable tone and goals.',
    tags: ['email', 'professional', 'communication'],
    aiPlatform: 'ChatGPT',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 28,
    rating: 4.5,
    isSuccess: true,
    successRate: 92,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Website Landing Page Copy',
    content: 'You are a marketing copywriter specializing in conversion-focused website copy. Write compelling landing page content for a {{industry}} business that offers {{product/service}}. Include a headline, subheadline, 3 key benefits, and a strong call to action.',
    description: 'Create engaging website landing page copy tailored to specific industries.',
    tags: ['marketing', 'copywriting', 'website'],
    aiPlatform: 'GPT-4',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 42,
    rating: 4.8,
    isSuccess: true,
    successRate: 95,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Code Explanation Helper',
    content: 'Explain the following code as if teaching a junior developer who has basic programming knowledge but is unfamiliar with these specific concepts. Break down what each part does and why it matters: ```{{code}}```',
    description: 'Get clear explanations of complex code for teaching or learning purposes.',
    tags: ['coding', 'programming', 'education'],
    aiPlatform: 'ChatGPT',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 37,
    rating: 4.6,
    isSuccess: true,
    successRate: 89,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Data Analysis Insights Generator',
    content: 'As a data analyst, examine the following dataset information: {{dataset_description}}. Generate 5 key insights that would be valuable for business decision-making, potential patterns to explore further, and recommend 3 specific actions based on this initial analysis.',
    description: 'Extract valuable insights from data for business decision-making.',
    tags: ['data', 'analysis', 'business'],
    aiPlatform: 'Claude',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 19,
    rating: 4.2,
    isSuccess: true,
    successRate: 85,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Social Media Post Series',
    content: 'Create a 5-day social media post series about {{topic}} for {{platform}}. Each post should be engaging, include relevant hashtags, and build upon the previous day\'s content to create a cohesive campaign that drives {{goal}}.',
    description: 'Generate coherent social media campaign content across multiple posts.',
    tags: ['social media', 'marketing', 'content'],
    aiPlatform: 'GPT-4',
    visibility: 'private',
    userId: 'demo-user-1',
    usageCount: 15,
    rating: 4.0,
    isSuccess: false,
    successRate: 70,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Blog Post Outline Generator',
    content: "Create a detailed blog post outline for the topic '{{blog_topic}}'. Include sections for an introduction, {{number_of_main_points || 3}} main points with sub-bullets, and a conclusion with a call to action.",
    description: "Generates a structured outline for writing blog posts.",
    tags: ['template', 'writing', 'blogging', 'content creation'],
    aiPlatform: 'Other',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 0,
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Compelling Product Description',
    content: "Write a compelling product description for {{product_name}}, a {{product_category}}. Highlight its key features: {{feature_1}}, {{feature_2}}, {{feature_3}}. Focus on the benefits for the target audience: {{target_audience}}. Aim for a {{tone || 'persuasive and enthusiastic'}} tone.",
    description: "Crafts persuasive descriptions for products targeting specific audiences.",
    tags: ['template', 'marketing', 'ecommerce', 'copywriting'],
    aiPlatform: 'Other',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 0,
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Meeting Agenda Creator',
    content: "Generate a meeting agenda for a {{duration || '60-minute'}} meeting about {{meeting_topic}}. Include sections for: Attendees, Objectives, Agenda Items (with time allocation), Action Items, and Next Steps.",
    description: "Creates structured agendas for effective meetings.",
    tags: ['template', 'productivity', 'meetings', 'organization'],
    aiPlatform: 'Other',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 0,
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Difficult Conversation Script Helper',
    content: "Help me prepare for a difficult conversation with {{person_description}} about {{sensitive_topic}}. Outline key talking points using a non-confrontational approach (e.g., using 'I' statements). Suggest opening lines, points to address, potential responses, and a closing statement focused on resolution.",
    description: "Provides structure and phrasing suggestions for navigating sensitive conversations.",
    tags: ['template', 'communication', 'hr', 'personal development'],
    aiPlatform: 'Other',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 0,
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Personalized Learning Plan',
    content: "Create a personalized 1-week learning plan to understand the basics of {{skill_or_topic}}. Include daily goals, suggested resources (e.g., articles, videos, tutorials), and a small practice exercise for each day. Assume the learner is {{learner_level || 'a beginner'}}.",
    description: "Develops a structured learning schedule for acquiring new skills or knowledge.",
    tags: ['template', 'education', 'learning', 'personal development', 'planning'],
    aiPlatform: 'Other',
    visibility: 'public',
    userId: 'demo-user-1',
    usageCount: 0,
    rating: 0,
    isSuccess: null,
    successRate: null,
    createdAt: now,
    updatedAt: now,
  },
];

// Demo collections
export const demoCollections = [
  {
    id: uuidv4(),
    title: 'Marketing Content',
    description: 'A collection of prompts for generating various marketing materials',
    userId: 'demo-user-1',
    promptIds: [], // Will be populated during initialization
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    title: 'Development Tools',
    description: 'Prompts to help with programming and development tasks',
    userId: 'demo-user-1',
    promptIds: [], // Will be populated during initialization
    createdAt: now,
    updatedAt: now,
  },
];

// Demo teams
export const demoTeams = [
  {
    id: uuidv4(),
    name: 'Marketing Team',
    description: 'Collaboration space for our marketing content and campaign prompts',
    userId: 'demo-user-1',
    members: [
      {
        userId: 'demo-user-1',
        role: 'owner',
        joinedAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  },
];

// Demo comments
export const demoComments = [
  {
    id: uuidv4(),
    promptId: '', // Will be populated during initialization
    userId: 'demo-user-1',
    content: 'This prompt works really well for technical products but needs some tweaking for service-based businesses.',
    createdBy: 'Demo User',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: uuidv4(),
    promptId: '', // Will be populated during initialization
    userId: 'demo-user-1',
    content: 'I improved results by adding more specific context about the target audience in the input.',
    createdBy: 'Demo User',
    createdAt: now,
    updatedAt: now,
  },
];

/**
 * Initialize database with sample data
 * This should be called once when the application starts
 */
export async function initializeSampleData(storage) {
  try {
    // Check if we already have data
    const existingUsers = await storage.getAllUsers();
    if (existingUsers.length > 0) {
      console.log('Database already has data, skipping initialization');
      return;
    }
    
    console.log('Initializing database with sample data...');
    
    // Create demo user with proper password hashing
    const hashedPassword = await hashPassword('demo123');
    const user = await storage.createUser({
      ...demoUser,
      password: hashedPassword,
    });
    
    // Create demo prompts
    const promptsWithIds = [];
    for (const prompt of demoPrompts) {
      const createdPrompt = await storage.createPrompt(prompt);
      promptsWithIds.push(createdPrompt);
    }
    
    // Assign prompts to collections based on tags
    const marketingCollection = { ...demoCollections[0] };
    const developmentCollection = { ...demoCollections[1] };
    
    marketingCollection.promptIds = promptsWithIds
      .filter(p => p.tags.some(tag => ['marketing', 'copywriting', 'social media'].includes(tag)))
      .map(p => p.id);
      
    developmentCollection.promptIds = promptsWithIds
      .filter(p => p.tags.some(tag => ['coding', 'programming', 'data'].includes(tag)))
      .map(p => p.id);
    
    // Create collections
    await storage.createCollection(marketingCollection);
    await storage.createCollection(developmentCollection);
    
    // Create team
    await storage.createTeam(demoTeams[0]);
    
    // Add comments to the first two prompts
    if (promptsWithIds.length >= 2) {
      const comments = [
        { ...demoComments[0], promptId: promptsWithIds[0].id },
        { ...demoComments[1], promptId: promptsWithIds[1].id },
      ];
      
      for (const comment of comments) {
        await storage.createComment(comment);
      }
    }
    
    console.log('Database initialized with sample data');
    
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}
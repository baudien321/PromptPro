# PromptPro - AI Prompt Management Platform

PromptPro is a comprehensive platform for creating, organizing, and sharing AI prompts with an intuitive and interactive interface. Built with Next.js, Tailwind CSS, and MongoDB.

## Environment Variables

To configure and run PromptPro properly, you need to set up the following environment variables in a `.env.local` file at the root of your project:

### Authentication

```
# NextAuth.js configuration
NEXTAUTH_URL=http://localhost:5000 # Your application URL
NEXTAUTH_SECRET=your-nextauth-secret # Generate a secure random string

# Google OAuth (optional but recommended)
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret

# Session configuration
SESSION_SECRET=your-session-secret # Generate a secure random string
```

### Database Configuration

```
# MongoDB connection string
MONGODB_URI=your-mongodb-connection-string
# Example: mongodb+srv://username:password@cluster.mongodb.net/promptpro?retryWrites=true&w=majority
```

### Optional Configuration

```
# Email sending (for password reset, etc.)
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com

# Analytics and tracking (if used)
ANALYTICS_ID=your-analytics-id
```

## How to Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to APIs & Services > Credentials
4. Create an OAuth 2.0 Client ID
5. Add your application URLs to Authorized JavaScript origins:
   - `http://localhost:5000` (for development)
   - `https://your-production-url.com` (for production)
6. Add your callback URLs to Authorized redirect URIs:
   - `http://localhost:5000/api/auth/callback/google` (for development)
   - `https://your-production-url.com/api/auth/callback/google` (for production)
7. Copy the Client ID and Client Secret to your environment variables

## Installation and Setup

1. Clone the repository
2. Create a `.env.local` file with the environment variables described above
3. Install dependencies:
   ```
   npm install
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:5000](http://localhost:5000) in your browser

## Features

- Create and manage AI prompts with detailed metadata
- Organize prompts into collections
- Track prompt performance with ratings, success rates, and usage counters
- Collaborate with team members
- Advanced search and filtering capabilities
- Dashboard with usage statistics and analytics
- Authentication with Google OAuth and email/password
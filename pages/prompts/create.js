import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../../components/Layout';
import PromptEditor from '../../components/PromptEditor';

export default function CreatePrompt() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create prompt');
      }
      
      const data = await response.json();
      router.push(`/prompts/${data.id}`);
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  };
  
  // If authentication is still loading, show a loading message
  if (loading) {
    return (
      <Layout title="Loading... - PromptPro">
        <div className="max-w-3xl mx-auto text-center py-12">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </Layout>
    );
  }
  
  // If user is not authenticated, show a sign-in message
  if (!session) {
    return (
      <Layout title="Sign In Required - PromptPro">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-lg text-gray-600 mb-6">You need to be signed in to create prompts.</p>
          <button
            onClick={() => signIn('google')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Sign in with Google
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="Create New Prompt - PromptPro">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Prompt</h1>
        
        <PromptEditor onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
}

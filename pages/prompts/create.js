import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import PromptEditor from '../../components/PromptEditor';

export default function CreatePrompt() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [createdPrompt, setCreatedPrompt] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleSubmit = async (promptData) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create prompt');
      }
      
      const newPrompt = await response.json();
      console.log("Created prompt:", newPrompt);
      setCreatedPrompt(newPrompt);
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Error creating prompt:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (status === 'loading') {
    return (
      <Layout title="PromptPro - Create Prompt">
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }
  
  if (showSuccess && createdPrompt) {
    return (
      <Layout title="PromptPro - Prompt Created">
        <div className="max-w-4xl mx-auto">
          <div className="bg-green-50 p-6 rounded-lg shadow-lg border border-green-200 mb-8">
            <h1 className="text-2xl font-bold text-green-800 mb-4">Prompt Created Successfully!</h1>
            <p className="text-green-700 mb-4">
              Your prompt "{createdPrompt.title}" has been created and saved to the database.
            </p>
            <div className="flex space-x-4 mt-6">
              <a 
                href="/prompts/my-prompts" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
              >
                Go to My Prompts
              </a>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setCreatedPrompt(null);
                }}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Create Another Prompt
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="PromptPro - Create Prompt">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create a New Prompt</h1>
        
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800">
            {error}
          </div>
        )}
        
        <PromptEditor onSubmit={handleSubmit} isLoading={isSubmitting} />
        
        <div className="mt-8 bg-yellow-50 border border-yellow-200 p-4 rounded-md">
          <h3 className="text-lg font-medium text-yellow-800">Tips for effective prompts:</h3>
          <ul className="mt-2 text-sm text-yellow-700 space-y-2 list-disc list-inside">
            <li>Be specific and clear about what you want the AI to generate</li>
            <li>Include contextual information that helps the AI understand the task</li>
            <li>Break complex requests into smaller parts or steps</li>
            <li>Specify the format, tone, or style for the AI's response</li>
            <li>Test and iterate your prompts to refine the results</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
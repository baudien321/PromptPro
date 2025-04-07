import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/Layout';
import PromptEditor from '../../../components/PromptEditor';
import Button from '../../../components/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function EditPrompt() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  
  const [promptData, setPromptData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  
  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id || !session?.user?.id) {
        // Don't fetch if ID or session user ID is missing
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        setUnauthorized(false); // Reset unauthorized flag
        
        const response = await fetch(`/api/prompts/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache' // Ensure fresh data
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Prompt not found');
          }
          throw new Error('Failed to fetch prompt details');
        }
        
        const data = await response.json();
        console.log('Fetched prompt for editing:', data);
        console.log('Session User ID:', session.user.id, typeof session.user.id);
        console.log('Prompt User ID:', data.userId, typeof data.userId);
        
        // --- Authorization Check ---
        // Ensure both IDs are treated as strings for comparison
        const sessionUserId = String(session.user.id);
        const promptUserId = String(data.userId);
        
        if (sessionUserId !== promptUserId) {
          console.error(`Authorization failed: Session ID (${sessionUserId}) !== Prompt User ID (${promptUserId})`);
          setUnauthorized(true);
          // Don't set the prompt state if unauthorized
        } else {
          console.log('Authorization successful on client-side.');
          setPromptData({
            title: data.title || '',
            text: data.text || '',
            description: data.description || '',
            tags: data.tags || [],
            platformCompatibility: data.platformCompatibility || [],
            visibility: data.visibility || 'private',
            teamId: data.teamId || null,
            isEffective: data.isEffective
          });
        }
        // --- End Authorization Check ---
        
      } catch (error) {
        console.error('Error fetching prompt:', error);
        setError(error.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch when session is loaded and authenticated
    if (status === 'authenticated') {
        fetchPrompt();
    } else if (status === 'loading') {
        // Still loading session, do nothing yet
        setIsLoading(true);
    } else {
        // Unauthenticated, handled by useSession hook redirect
        setIsLoading(false);
    }
    
  }, [id, session, status]); // Add status to dependencies
  
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        // Handle specific authorization error from API
        if (response.status === 403) {
            setError(errorData.message || 'You are not authorized to update this prompt.');
        } else {
            throw new Error(errorData.message || 'Failed to update prompt');
        }
      } else {
        // Success
        const updatedPrompt = await response.json();
        // Redirect to the prompt view page after successful update
        router.push(`/prompts/${updatedPrompt._id}`);
      }
      
    } catch (error) {
      console.error('Error updating prompt:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render loading state
  if (status === 'loading' || isLoading) {
    return (
      <Layout title="PromptPro - Edit Prompt">
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }
  
  // Render unauthorized state
  if (unauthorized) {
    return (
      <Layout title="PromptPro - Unauthorized">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
            <h1 className="text-xl font-semibold text-red-800">Unauthorized</h1>
            <p className="mt-2 text-red-700">
              You don't have permission to edit this prompt. Only the creator can edit it.
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Render error state or if prompt is null after loading
  if (error || !promptData) {
    return (
      <Layout title="PromptPro - Error">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-200">
            <h1 className="text-xl font-semibold text-red-800">Error</h1>
            <p className="mt-2 text-red-700">{error || 'Failed to load prompt data.'}</p>
            <div className="mt-4">
              <Link href="/prompts/my-prompts">
                <Button variant="secondary">
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to My Prompts
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Render the editor if everything is okay
  return (
    <Layout title={`PromptPro - Edit Prompt`}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Prompt</h1>
        
        {error && (
          <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800 border border-red-200">
            {error}
          </div>
        )}
        
        <PromptEditor 
          initialData={promptData} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
          submitError={error}
          isEditing={true}
        />
      </div>
    </Layout>
  );
}
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../../../components/Layout';
import CollectionEditor from '../../../components/CollectionEditor';

export default function EditCollection() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session, status } = useSession();
  
  const [collection, setCollection] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);
  
  useEffect(() => {
    const fetchCollection = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/collections/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Collection not found');
          }
          throw new Error('Failed to fetch collection');
        }
        
        const data = await response.json();
        setCollection(data);
        
        // Check if the current user is the owner of the collection
        if (session && data.userId !== session.user.id) {
          setUnauthorized(true);
        }
      } catch (error) {
        console.error('Error fetching collection:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (status !== 'loading') {
      fetchCollection();
    }
  }, [id, session, status]);
  
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(`/api/collections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update collection');
      }
      
      const data = await response.json();
      router.push(`/collections/${data.id}`);
    } catch (error) {
      console.error('Error updating collection:', error);
      throw error;
    }
  };
  
  if (isLoading) {
    return (
      <Layout title="Loading - PromptPro">
        <div className="flex justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout title="Error - PromptPro">
        <div className="bg-red-50 p-4 rounded-md">
          <h2 className="text-xl font-semibold text-red-800">Error</h2>
          <p className="text-red-700 mt-2">{error}</p>
          <button
            className="btn-primary mt-4"
            onClick={() => router.push('/collections')}
          >
            Return to Collections
          </button>
        </div>
      </Layout>
    );
  }
  
  if (!session) {
    return (
      <Layout title="Sign In Required - PromptPro">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-lg text-gray-600 mb-6">You need to be signed in to edit collections.</p>
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

  if (unauthorized) {
    return (
      <Layout title="Unauthorized - PromptPro">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized Access</h1>
          <p className="text-lg text-gray-600 mb-6">You don't have permission to edit this collection.</p>
          <button
            onClick={() => router.push('/collections')}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Return to Collections
          </button>
        </div>
      </Layout>
    );
  }
  
  if (!collection) {
    return null;
  }
  
  return (
    <Layout title={`Edit ${collection.name} - PromptPro`}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Collection</h1>
        
        <CollectionEditor
          initialData={collection}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      </div>
    </Layout>
  );
}
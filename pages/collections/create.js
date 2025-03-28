import React from 'react';
import { useRouter } from 'next/router';
import { useSession, signIn } from 'next-auth/react';
import Layout from '../../components/Layout';
import CollectionEditor from '../../components/CollectionEditor';

export default function CreateCollection() {
  const router = useRouter();
  const { data: session } = useSession();
  
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create collection');
      }
      
      const data = await response.json();
      router.push(`/collections/${data.id}`);
    } catch (error) {
      console.error('Error creating collection:', error);
      throw error;
    }
  };
  
  if (!session) {
    return (
      <Layout title="Sign In Required - PromptPro">
        <div className="max-w-3xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-lg text-gray-600 mb-6">You need to be signed in to create collections.</p>
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
    <Layout title="Create Collection - PromptPro">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Collection</h1>
        
        <CollectionEditor
          onSubmit={handleSubmit}
          isEditing={false}
        />
      </div>
    </Layout>
  );
}
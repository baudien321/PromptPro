import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import CollectionCard from '../../components/CollectionCard';
import Button from '../../components/Button';
import { PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';

export default function Collections() {
  const { data: session, status } = useSession();
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Collection state
  
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/collections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch collections');
        }
        
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setError('Failed to load collections. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollections();
  }, []);
  
  const handleDelete = async (collectionId) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete collection');
      }
      
      setCollections(collections.filter(c => c.id !== collectionId));
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection. Please try again.');
    }
  };
  
  // Collection methods are now moved to dedicated create/edit pages
  
  return (
    <Layout title="Collections - PromptPro">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          {session ? (
            <Link href="/collections/create">
              <Button variant="primary">
                <PlusIcon className="h-5 w-5 mr-1" />
                Create Collection
              </Button>
            </Link>
          ) : (
            <button
              onClick={() => signIn('google')}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Sign in to Create
            </button>
          )}
        </div>

        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            {collections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-medium text-gray-900 mb-2">No Collections Yet</h2>
                <p className="text-gray-500 mb-6">Create your first collection to organize your prompts.</p>
                {session ? (
                  <Link href="/collections/create">
                    <Button variant="primary">
                      Create Collection
                    </Button>
                  </Link>
                ) : (
                  <button
                    onClick={() => signIn('google')}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Sign in to Create
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

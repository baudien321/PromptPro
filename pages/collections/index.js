import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import CollectionCard from '../../components/CollectionCard';
import Button from '../../components/Button';
import {
  PlusIcon,
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import libraryData from '../../data/prompt_library.json'; // Import the JSON data

// Prompt Card Component for the Library
const LibraryPromptCard = ({ title, prompt }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy prompt.'); // Basic error feedback
      });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col justify-between h-full">
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-2">{title}</h4>
        <p className="text-sm text-gray-600 mb-3 font-mono bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
          {prompt}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className={`mt-auto w-full flex items-center justify-center px-3 py-1.5 border rounded-md text-sm font-medium transition-colors duration-150 ${copied
          ? 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
          }`}
      >
        {copied ? (
          <><CheckIcon className="h-4 w-4 mr-1" /> Copied!</>
        ) : (
          <><ClipboardIcon className="h-4 w-4 mr-1" /> Copy Prompt</>
        )}
      </button>
    </div>
  );
};

export default function Collections() {
  const { data: session, status } = useSession();
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 'Prompt Library': promptLibrary } = libraryData; // Extract library data
  const [openCategoryIndex, setOpenCategoryIndex] = useState(null); // State for accordion

  // Function to toggle accordion panels
  const toggleCategory = (index) => {
    setOpenCategoryIndex(openCategoryIndex === index ? null : index);
  };

  useEffect(() => {
    const fetchCollections = async () => {
        // Only fetch user collections if logged in
        if (status === 'authenticated') {
             try {
               const response = await fetch('/api/collections');
               if (!response.ok) {
                 throw new Error('Failed to fetch collections');
               }
               const data = await response.json();
               setCollections(data);
             } catch (error) {
               console.error('Error fetching collections:', error);
               setError('Failed to load your collections. Please try again later.');
             }
        } else {
            setCollections([]); // Clear collections if not logged in
        }
        setIsLoading(false); // Set loading false after fetch attempt or if not logged in
    };

    // Only start fetch when session status is known and not loading
    if (status !== 'loading') {
        setIsLoading(true); // Set loading true before fetch
        fetchCollections();
    }

  }, [status]); // Rerun effect when session status changes

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

  const showLoadingSpinner = status === 'loading' || isLoading;

  return (
    <Layout title="Collections - PromptPro">
      <div className="space-y-12"> {/* Increased spacing between sections */}
        {/* My Collections Section */}
        <section>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">My Collections</h1>
                {session ? (
                    <Link href="/collections/create">
                    <Button variant="primary">
                        <PlusIcon className="h-5 w-5 mr-1" />
                        Create Collection
                    </Button>
                    </Link>
                ) : (
                    <button
                    onClick={() => signIn('google')} // Or use your preferred sign-in method
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mt-4 md:mt-0"
                    >
                    Sign in to Create Collections
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 p-4 rounded-md mb-6">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {showLoadingSpinner ? (
                 <div className="flex justify-center py-8">
                     <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                 </div>
            ) : status === 'unauthenticated' ? (
                 <div className="text-center py-12 bg-white rounded-lg shadow-md">
                     <h2 className="text-xl font-medium text-gray-900 mb-2">View Your Collections</h2>
                     <p className="text-gray-500 mb-6">Sign in to view and manage your personal prompt collections.</p>
                     <button
                         onClick={() => signIn('google')} // Or use your preferred sign-in method
                         className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                     >
                         Sign In
                     </button>
                 </div>
            ) : collections.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <h2 className="text-xl font-medium text-gray-900 mb-2">No Collections Yet</h2>
                    <p className="text-gray-500 mb-6">Create your first collection to organize your prompts.</p>
                    <Link href="/collections/create">
                        <Button variant="primary">
                            Create Collection
                        </Button>
                    </Link>
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
        </section>

        {/* Prompt Library Accordion Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 border-t pt-10">Prompt Library</h2>
          {promptLibrary.length === 0 ? (
            <p className="text-gray-500">The prompt library is currently empty.</p>
          ) : (
            <div className="space-y-3 rounded-lg border border-gray-200 overflow-hidden">
              {promptLibrary.map((category, categoryIndex) => {
                const isOpen = openCategoryIndex === categoryIndex;
                return (
                  <div key={categoryIndex} className={`${isOpen ? '' : 'border-b last:border-b-0'} border-gray-200`}>
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleCategory(categoryIndex)}
                      className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                    >
                      <div>
                         <h3 className="text-lg font-semibold text-gray-800 text-left">{category.category}</h3>
                         <p className="text-sm text-gray-500 text-left mt-1">{category.use_case}</p>
                      </div>
                      {isOpen ? (
                        <ChevronUpIcon className="h-6 w-6 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-6 w-6 text-gray-500" />
                      )}
                    </button>

                    {/* Accordion Content (Prompt Cards) */}
                    {isOpen && (
                      <div className="p-4 border-t border-gray-200 bg-white">
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {category.prompts.map((prompt, promptIndex) => (
                            <LibraryPromptCard
                              key={promptIndex}
                              title={prompt.title}
                              prompt={prompt.prompt}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

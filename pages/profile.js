import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import PromptCard from '../components/PromptCard';
import Button from '../components/Button';
import { 
  UserIcon, 
  EnvelopeIcon, 
  CalendarIcon, 
  StarIcon, 
  ChartBarIcon, 
  DocumentTextIcon, 
  FolderIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '../lib/utils';

export default function Profile() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  
  const [userPrompts, setUserPrompts] = useState([]);
  const [userCollections, setUserCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPrompts: 0,
    totalCollections: 0,
    avgRating: 0,
    highestRated: null,
    mostUsed: null,
    totalUsage: 0,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (status === 'loading' || !session) return;
      
      try {
        setIsLoading(true);
        
        // Fetch user's prompts
        const promptsResponse = await fetch(`/api/search?userId=${session.user.id}&sortBy=createdAt&sortDirection=desc`);
        
        if (!promptsResponse.ok) {
          throw new Error('Failed to fetch user prompts');
        }
        
        const promptsData = await promptsResponse.json();
        setUserPrompts(promptsData);
        
        // Fetch user's collections
        const collectionsResponse = await fetch('/api/collections');
        
        if (!collectionsResponse.ok) {
          throw new Error('Failed to fetch collections');
        }
        
        const collectionsData = await collectionsResponse.json();
        const userCollections = collectionsData.filter(
          collection => collection.userId === session.user.id
        );
        setUserCollections(userCollections);
        
        // Calculate stats
        const totalPrompts = promptsData.length;
        const totalCollections = userCollections.length;
        
        // Average rating
        const ratings = promptsData
          .filter(prompt => prompt.rating !== undefined)
          .map(prompt => prompt.rating);
        const avgRating = ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;
        
        // Highest rated prompt
        const highestRated = promptsData.length > 0
          ? [...promptsData].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
          : null;
        
        // Most used prompt
        const mostUsed = promptsData.length > 0
          ? [...promptsData].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))[0]
          : null;
        
        // Total usage count
        const totalUsage = promptsData.reduce(
          (sum, prompt) => sum + (prompt.usageCount || 0), 
          0
        );
        
        setStats({
          totalPrompts,
          totalCollections,
          avgRating,
          highestRated,
          mostUsed,
          totalUsage,
        });
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load your data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [session, status]);

  const handleDelete = async (promptId) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      
      // Update the prompts list
      setUserPrompts(userPrompts.filter(p => p.id !== promptId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalPrompts: prev.totalPrompts - 1
      }));
      
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <Layout title="PromptPro - Your Profile">
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="PromptPro - Your Profile">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 h-32 flex items-end">
            <div className="relative ml-8 -mb-12">
              <div className="bg-white p-2 rounded-full border-4 border-white shadow-lg">
                {session.user.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name} 
                    className="h-24 w-24 rounded-full object-cover" 
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary-200 flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-primary-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 pt-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{session.user.name}</h1>
                <div className="flex items-center mt-2 text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  <span>{session.user.email}</span>
                </div>
                <div className="flex items-center mt-1 text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  <span>Member since {session.user.createdAt ? formatDate(session.user.createdAt) : 'Recently'}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                <Link href="/settings">
                  <Button variant="secondary">Edit Profile</Button>
                </Link>
                <Link href="/prompts/create">
                  <Button variant="primary">Create New Prompt</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 mr-4">
                <DocumentTextIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Total Prompts</div>
                <div className="text-3xl font-semibold text-gray-900">{stats.totalPrompts}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 mr-4">
                <FolderIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Collections</div>
                <div className="text-3xl font-semibold text-gray-900">{stats.totalCollections}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 mr-4">
                <StarIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Average Rating</div>
                <div className="text-3xl font-semibold text-gray-900">
                  {stats.avgRating ? stats.avgRating.toFixed(1) : '-'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 mr-4">
                <ChartBarIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Total Uses</div>
                <div className="text-3xl font-semibold text-gray-900">{stats.totalUsage}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Prompts */}
        {stats.highestRated && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Highest Rated Prompt</h2>
              <PromptCard 
                prompt={stats.highestRated} 
                onDelete={handleDelete}
                showActions={false} 
              />
            </div>
            
            {stats.mostUsed && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Used Prompt</h2>
                <PromptCard 
                  prompt={stats.mostUsed} 
                  onDelete={handleDelete}
                  showActions={false} 
                />
              </div>
            )}
          </div>
        )}
        
        {/* Recent Prompts */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Recent Prompts</h2>
            <Link href="/prompts/create" className="text-primary-600 hover:text-primary-700 font-medium">
              Create New
            </Link>
          </div>
          
          {userPrompts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't created any prompts yet.</p>
              <Link href="/prompts/create">
                <Button variant="primary">Create Your First Prompt</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userPrompts.slice(0, 6).map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
          
          {userPrompts.length > 6 && (
            <div className="mt-6 text-center">
              <Link href="/prompts">
                <Button variant="secondary">View All Prompts</Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Collections */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Collections</h2>
            <Link href="/collections/create" className="text-primary-600 hover:text-primary-700 font-medium">
              Create New
            </Link>
          </div>
          
          {userCollections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't created any collections yet.</p>
              <Link href="/collections/create">
                <Button variant="primary">Create Your First Collection</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userCollections.slice(0, 3).map((collection) => (
                <Link key={collection.id} href={`/collections/${collection.id}`}>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{collection.name}</h3>
                    {collection.description && (
                      <p className="text-gray-600 mb-4">{collection.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {collection.prompts.length} {collection.prompts.length === 1 ? 'prompt' : 'prompts'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(collection.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {userCollections.length > 3 && (
            <div className="mt-6 text-center">
              <Link href="/collections">
                <Button variant="secondary">View All Collections</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
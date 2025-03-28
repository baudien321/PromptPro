import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { formatDate, copyToClipboard } from '../../lib/utils';

import {
  ChatBubbleBottomCenterTextIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  BookmarkIcon,
  ClipboardIcon,
  LightBulbIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

export default function PromptDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  
  const [prompt, setPrompt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  useEffect(() => {
    const fetchPrompt = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/prompts/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Prompt not found');
          }
          throw new Error('Failed to fetch prompt details');
        }
        
        const data = await response.json();
        setPrompt(data);
        
      } catch (error) {
        console.error('Error fetching prompt:', error);
        setError(error.message || 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrompt();
  }, [id]);
  
  const handleCopyToClipboard = async () => {
    try {
      await copyToClipboard(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };
  
  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      
      router.push('/prompts/my-prompts');
      
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    }
  };
  
  const renderRatingStars = (rating) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < Math.round(rating) ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </span>
        ))}
        <span className="ml-1 text-gray-500 text-sm">({rating.toFixed(1)})</span>
      </div>
    );
  };
  
  const getPlatformIcon = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'chatgpt':
      case 'gpt4':
        return <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />;
      case 'midjourney':
      case 'dalle':
      case 'stable-diffusion':
        return <LightBulbIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleBottomCenterTextIcon className="h-5 w-5" />;
    }
  };
  
  if (isLoading) {
    return (
      <Layout title="PromptPro - Loading Prompt">
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }
  
  if (error || !prompt) {
    return (
      <Layout title="PromptPro - Error">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 p-6 rounded-lg shadow-sm">
            <h1 className="text-xl font-semibold text-red-800">Error</h1>
            <p className="mt-2 text-red-700">{error || 'Failed to load prompt'}</p>
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
  
  const isOwner = session?.user?.id === prompt.userId;
  
  return (
    <Layout title={`PromptPro - ${prompt.title}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mt-3 sm:mt-0">{prompt.title}</h1>
          <div className="flex space-x-3">
            <Link href="/prompts/my-prompts">
              <Button variant="secondary" className="text-sm px-3 py-1">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Prompt Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <div className="bg-primary-100 p-2 rounded-full">
                  {getPlatformIcon(prompt.aiPlatform)}
                </div>
                <span className="text-sm font-medium text-gray-700">{prompt.aiPlatform || 'General'}</span>
                
                {prompt.visibility && (
                  <>
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500">
                      {prompt.visibility === 'public' && 'Public'}
                      {prompt.visibility === 'private' && 'Private'}
                      {prompt.visibility === 'unlisted' && 'Unlisted'}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {prompt.rating !== undefined && renderRatingStars(prompt.rating || 0)}
                
                {isOwner && (
                  <div className="flex space-x-2">
                    <Link href={`/prompts/edit/${prompt.id}`}>
                      <Button variant="secondary" className="py-1 px-2">
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </Link>
                    <Button 
                      variant={deleteConfirm ? "danger" : "secondary"} 
                      className="py-1 px-2"
                      onClick={handleDelete}
                    >
                      {deleteConfirm ? 'Confirm' : <TrashIcon className="h-4 w-4" />}
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Prompt Content */}
          <div className="px-6 py-5">
            <div className="relative bg-gray-50 border border-gray-200 rounded-md p-4">
              <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                {prompt.content}
              </pre>
              <div className="absolute top-2 right-2">
                <button
                  onClick={handleCopyToClipboard}
                  className={`p-1.5 rounded-md bg-white shadow-sm border border-gray-200 
                    ${copied ? 'text-green-600' : 'text-gray-500 hover:text-primary-600'}`}
                  aria-label="Copy to clipboard"
                >
                  {copied ? (
                    <CheckCircleIcon className="h-5 w-5" />
                  ) : (
                    <ClipboardIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            {prompt.description && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700">Description</h3>
                <div className="mt-2 text-sm text-gray-500">
                  {prompt.description}
                </div>
              </div>
            )}
            
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {prompt.tags.map(tag => (
                    <Link 
                      key={tag} 
                      href={`/search?tag=${tag}`}
                    >
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer">
                        {tag}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Prompt Footer */}
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div className="text-xs text-gray-500">
                {prompt.createdAt && (
                  <span>Created: {formatDate(prompt.createdAt)}</span>
                )}
                {prompt.updatedAt && prompt.updatedAt !== prompt.createdAt && (
                  <span> • Updated: {formatDate(prompt.updatedAt)}</span>
                )}
              </div>
              
              <div className="flex items-center space-x-4">
                {prompt.usageCount !== undefined && (
                  <span className="text-xs text-gray-500 flex items-center">
                    <span className="font-medium">{prompt.usageCount || 0}</span>
                    <span className="ml-1">uses</span>
                  </span>
                )}
                
                <Button 
                  variant="secondary" 
                  className="text-xs px-2.5 py-1 flex items-center"
                >
                  <BookmarkIcon className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Related Prompts Section - Coming soon */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Related Prompts</h2>
          <p className="text-gray-500 text-sm mt-1">
            This feature is coming soon. Check back later for related prompts.
          </p>
        </div>
      </div>
    </Layout>
  );
}
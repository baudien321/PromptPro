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
            <div className="relative bg-gray-50 border border-gray-200 rounded-md p-4 group cursor-pointer" 
                 onClick={handleCopyToClipboard}>
              <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                {prompt.content}
              </pre>
              <div className="absolute top-2 right-2">
                <button
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
              <div className="absolute inset-0 bg-primary-100 bg-opacity-0 group-hover:bg-opacity-10 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 rounded-md">
                <div className="bg-primary-100 text-primary-800 px-3 py-2 rounded-lg shadow-md">
                  Click to copy entire prompt
                </div>
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
          
          {/* Performance Metrics */}
          <div className="px-6 py-4 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Usage Count</div>
                <div className="text-xl font-semibold text-gray-900">{prompt.usageCount || 0}</div>
                <div className="mt-1 text-xs text-gray-500">Number of times this prompt has been used</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                <div className="text-xl font-semibold text-gray-900">{prompt.successRate || 0}%</div>
                <div className="mt-1 text-xs text-gray-500">Percentage of successful outcomes</div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Average Rating</div>
                <div className="flex items-center">
                  <span className="text-xl font-semibold text-gray-900 mr-2">{prompt.rating?.toFixed(1) || 0}</span>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(prompt.rating || 0) ? (
                          <StarIconSolid className="h-4 w-4 text-yellow-400" />
                        ) : i < Math.ceil(prompt.rating || 0) && (prompt.rating || 0) % 1 > 0 ? (
                          <StarIconSolid className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <StarIcon className="h-4 w-4 text-gray-300" />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-1 text-xs text-gray-500">Based on user feedback</div>
              </div>
            </div>
            
            {prompt.usageHistory && prompt.usageHistory.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Usage Trend</h4>
                <div className="h-24 bg-gray-50 rounded-lg p-2">
                  {/* Simple bar chart visualization - would be replaced by a proper chart component */}
                  <div className="flex h-full items-end space-x-1">
                    {prompt.usageHistory.map((count, i) => {
                      const maxCount = Math.max(...prompt.usageHistory);
                      const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-primary-200 rounded-t"
                            style={{ height: `${height}%` }}
                          ></div>
                          <div className="text-xs text-gray-500 mt-1">{i + 1}</div>
                        </div>
                      );
                    })}
                  </div>
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
        
        {/* Version History */}
        <div className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Version History</h2>
            {prompt.versions && prompt.versions.length > 0 && (
              <span className="text-sm text-gray-500">{prompt.versions.length} versions</span>
            )}
          </div>
          
          {!prompt.versions || prompt.versions.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">No previous versions available for this prompt.</p>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {prompt.versions?.map((version, index) => (
                  <li key={index} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">Version {prompt.versions.length - index}</span>
                          {index === 0 && (
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-primary-100 text-primary-800">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(version.updatedAt || version.createdAt)}
                        </p>
                        {version.changeDescription && (
                          <p className="mt-2 text-sm text-gray-700">{version.changeDescription}</p>
                        )}
                      </div>
                      <button 
                        className="text-xs px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                      >
                        View
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* User Feedback Section */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Feedback</h2>
          
          {!prompt.feedback || prompt.feedback.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">No feedback has been provided for this prompt yet.</p>
              <Button variant="primary" className="mt-4">
                Add Feedback
              </Button>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-gray-200">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Average Rating</div>
                  <div className="flex items-center">
                    <span className="text-2xl font-semibold text-gray-900 mr-2">
                      {(prompt.feedback.reduce((acc, item) => acc + item.rating, 0) / prompt.feedback.length).toFixed(1)}
                    </span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => {
                        const avgRating = prompt.feedback.reduce((acc, item) => acc + item.rating, 0) / prompt.feedback.length;
                        return (
                          <span key={i}>
                            {i < Math.floor(avgRating) ? (
                              <StarIconSolid className="h-5 w-5 text-yellow-400" />
                            ) : i < Math.ceil(avgRating) && avgRating % 1 > 0 ? (
                              <StarIconSolid className="h-5 w-5 text-yellow-400" />
                            ) : (
                              <StarIcon className="h-5 w-5 text-gray-300" />
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">From {prompt.feedback.length} ratings</div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Success Reports</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {prompt.feedback.filter(item => item.successful).length} / {prompt.feedback.length}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {Math.round((prompt.feedback.filter(item => item.successful).length / prompt.feedback.length) * 100)}% success rate
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Most Common Use Case</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {prompt.feedback
                      .map(item => item.useCase)
                      .reduce((acc, useCase) => {
                        acc[useCase] = (acc[useCase] || 0) + 1;
                        return acc;
                      }, {})
                      // Get the most common use case
                      .sort((a, b) => Object.values(b)[0] - Object.values(a)[0])[0]
                      ? Object.keys(prompt.feedback
                          .map(item => item.useCase)
                          .reduce((acc, useCase) => {
                            acc[useCase] = (acc[useCase] || 0) + 1;
                            return acc;
                          }, {})
                          .sort((a, b) => b - a)[0])
                      : 'General'
                    }
                  </div>
                  <div className="mt-1 text-xs text-gray-500">Based on user reports</div>
                </div>
              </div>
              
              <ul className="divide-y divide-gray-200">
                {prompt.feedback?.slice(0, 3).map((item, index) => (
                  <li key={index} className="px-6 py-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {item.userName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.userName || 'Anonymous User'}</h4>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <StarIconSolid 
                                  key={i} 
                                  className={`h-4 w-4 ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="ml-2 text-xs text-gray-500">{formatDate(item.date)}</span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.successful 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.successful ? 'Successful' : 'Unsuccessful'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-gray-700">{item.comment}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              
              {prompt.feedback?.length > 3 && (
                <div className="px-6 py-4 border-t border-gray-200 text-center">
                  <button className="text-primary-600 hover:text-primary-700 font-medium">
                    View All {prompt.feedback.length} Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Related Prompts Section */}
        <div className="mt-10 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Prompts</h2>
          
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <p className="text-gray-500">
              This feature is coming soon. Check back later for related prompts based on tags and usage patterns.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { formatDate, copyToClipboard, generateShareableUrl } from '../../lib/utils';
import { 
  ClipboardIcon as ClipboardCopyIcon, 
  ShareIcon, 
  TrashIcon, 
  PencilIcon,
  StarIcon,
  EyeIcon,
  ChartBarIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';

export default function PromptDetail() {
  const router = useRouter();
  const { id } = router.query;
  
  const [prompt, setPrompt] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copyStatus, setCopyStatus] = useState({ content: false, url: false });
  
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
          throw new Error('Failed to fetch prompt');
        }
        
        const data = await response.json();
        setPrompt(data);
      } catch (error) {
        console.error('Error fetching prompt:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrompt();
  }, [id]);
  
  const handleCopyContent = async () => {
    if (!prompt) return;
    
    const success = await copyToClipboard(prompt.content);
    if (success) {
      setCopyStatus({ ...copyStatus, content: true });
      setTimeout(() => setCopyStatus(prev => ({ ...prev, content: false })), 2000);
    }
  };
  
  const handleCopyShareUrl = async () => {
    if (!prompt) return;
    
    const shareUrl = generateShareableUrl(prompt.id);
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopyStatus({ ...copyStatus, url: true });
      setTimeout(() => setCopyStatus(prev => ({ ...prev, url: false })), 2000);
    }
  };
  
  const handleDelete = async () => {
    if (!prompt) return;
    
    if (window.confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/prompts/${prompt.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete prompt');
        }
        
        router.push('/');
      } catch (error) {
        console.error('Error deleting prompt:', error);
        alert('Failed to delete prompt. Please try again.');
      }
    }
  };
  
  if (isLoading) {
    return (
      <Layout title="Loading Prompt - PromptPro">
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
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        </div>
      </Layout>
    );
  }
  
  if (!prompt) {
    return null;
  }
  
  return (
    <Layout title={`${prompt.title} - PromptPro`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button
            variant="secondary"
            onClick={() => router.back()}
          >
            Back
          </Button>
          
          <div className="flex space-x-2">
            <Link href={`/prompts/edit/${prompt.id}`} passHref>
                <Button variant="secondary">
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </Button>
            </Link>
            
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{prompt.title}</h1>
            
            <div className="flex items-center space-x-2">
              {prompt.visibility && (
                <div className="flex items-center text-sm px-2 py-1 rounded">
                  {prompt.visibility === 'public' ? (
                    <span className="flex items-center bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      <GlobeAltIcon className="h-4 w-4 mr-1" />
                      Public
                    </span>
                  ) : prompt.visibility === 'private' ? (
                    <span className="flex items-center bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                      <LockClosedIcon className="h-4 w-4 mr-1" />
                      Private
                    </span>
                  ) : (
                    <span className="flex items-center bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      Team
                    </span>
                  )}
                </div>
              )}
              
              {prompt.aiPlatform && (
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-sm">
                  {prompt.aiPlatform}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <div className="mr-4">
              Created on {formatDate(prompt.createdAt)}
              {prompt.createdAt !== prompt.updatedAt && ` • Updated on ${formatDate(prompt.updatedAt)}`}
            </div>
            
            {prompt.createdBy && (
              <div className="flex items-center">
                <span className="text-gray-700">by {prompt.createdBy}</span>
              </div>
            )}
          </div>
          
          {prompt.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-700 italic">{prompt.description}</p>
            </div>
          )}
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Prompt Content</h2>
            <div className="p-4 bg-gray-50 rounded-md whitespace-pre-line border border-gray-200">
              {prompt.content}
            </div>
            <div className="mt-2 flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyContent}
              >
                <ClipboardCopyIcon className="h-4 w-4 mr-1" />
                {copyStatus.content ? 'Copied!' : 'Copy Content'}
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
            {/* Rating */}
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Rating</h3>
              <div className="flex items-center">
                <div className="flex items-center mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                      {star <= Math.floor(prompt.rating || 0) ? (
                        <StarIconSolid className="h-5 w-5 text-yellow-400" />
                      ) : star <= (prompt.rating || 0) + 0.5 ? (
                        <StarIconSolid className="h-5 w-5 text-yellow-400" />
                      ) : (
                        <StarIcon className="h-5 w-5 text-gray-300" />
                      )}
                    </span>
                  ))}
                </div>
                <span className="text-lg font-medium text-gray-800">
                  {prompt.rating?.toFixed(1) || "0.0"}
                </span>
              </div>
            </div>
            
            {/* Usage Count */}
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Usage Count</h3>
              <div className="flex items-center">
                <EyeIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-lg font-medium text-gray-800">
                  {prompt.usageCount || 0}
                </span>
              </div>
            </div>
            
            {/* Success Rate */}
            <div className="flex flex-col">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Success Rate</h3>
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-lg font-medium text-gray-800">
                  {prompt.successRate || 0}%
                </span>
              </div>
            </div>
          </div>
          
          {prompt.tags && prompt.tags.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Share this Prompt</h2>
            <div className="flex items-center">
              <Button
                variant="primary"
                onClick={handleCopyShareUrl}
              >
                <ShareIcon className="h-4 w-4 mr-1" />
                {copyStatus.url ? 'Copied!' : 'Copy Share Link'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

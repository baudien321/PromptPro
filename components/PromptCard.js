import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ClipboardIcon as ClipboardCopyIcon, 
  PencilIcon, 
  TrashIcon,
  StarIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { formatDate, truncateText, copyToClipboard } from '../lib/utils';
import { useSession } from 'next-auth/react';
import Button from './Button';

const PromptCard = ({ prompt, onDelete, showActions = true }) => {
  const [isCopied, setIsCopied] = useState(false);
  const { data: session } = useSession();
  
  if (!prompt) return null;
  
  const isOwner = session && prompt.userId === session.user.id;
  
  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.content);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      onDelete(prompt.id);
    }
  };
  
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{prompt.title}</h3>
        
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={handleCopy}
              className="text-gray-500 hover:text-primary-600 focus:outline-none"
              title="Copy prompt content"
            >
              <ClipboardCopyIcon className="h-5 w-5" />
              <span className="sr-only">Copy</span>
            </button>
            
            {isOwner && (
              <>
                <Link href={`/prompts/edit/${prompt.id}`} className="text-gray-500 hover:text-primary-600 focus:outline-none" title="Edit prompt">
                    <PencilIcon className="h-5 w-5" />
                    <span className="sr-only">Edit</span>
                </Link>
                
                <button
                  onClick={handleDelete}
                  className="text-gray-500 hover:text-red-600 focus:outline-none"
                  title="Delete prompt"
                >
                  <TrashIcon className="h-5 w-5" />
                  <span className="sr-only">Delete</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between mt-1">
        <p className="text-sm text-gray-500">
          {formatDate(prompt.createdAt)}
        </p>
        
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 text-blue-800">
            {prompt.aiPlatform || 'ChatGPT'}
          </span>
          
          {prompt.visibility && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded ${
              prompt.visibility === 'public' ? 'bg-green-100 text-green-800' : 
              prompt.visibility === 'private' ? 'bg-gray-100 text-gray-800' : 
              'bg-purple-100 text-purple-800'
            }`}>
              {prompt.visibility.charAt(0).toUpperCase() + prompt.visibility.slice(1)}
            </span>
          )}
        </div>
      </div>
      
      {prompt.description && (
        <p className="mt-2 text-sm text-gray-600 italic">
          {truncateText(prompt.description, 100)}
        </p>
      )}
      
      <div 
        onClick={handleCopy}
        className="mt-3 text-gray-700 whitespace-pre-line border-l-4 border-gray-200 pl-3 py-1 cursor-pointer hover:bg-gray-50 relative group"
      >
        {truncateText(prompt.content, 120)}
        <div className="absolute inset-0 bg-primary-50 bg-opacity-0 group-hover:bg-opacity-25 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
          <div className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-md shadow-sm">
            Click to copy
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
        {prompt.rating !== undefined && (
          <div className="flex items-center">
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((rating) => (
                <span key={rating}>
                  {rating <= Math.floor(prompt.rating) ? (
                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  ) : rating <= prompt.rating + 0.5 ? (
                    <StarIconSolid className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <StarIcon className="h-4 w-4 text-gray-300" />
                  )}
                </span>
              ))}
            </div>
            <span className="ml-1">{prompt.rating?.toFixed(1) || 0}</span>
          </div>
        )}
        
        {prompt.usageCount !== undefined && (
          <div className="flex items-center">
            <EyeIcon className="h-4 w-4 mr-1 text-gray-400" />
            <span>{prompt.usageCount || 0} uses</span>
          </div>
        )}
        
        {prompt.successRate !== undefined && (
          <div className="flex items-center">
            <ChartBarIcon className="h-4 w-4 mr-1 text-gray-400" />
            <span>{prompt.successRate || 0}% success</span>
          </div>
        )}
      </div>
      
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {prompt.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      <div className="mt-4 flex justify-between">
        <Link href={`/prompts/${prompt.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View Details
        </Link>
        
        {isCopied && (
          <span className="text-green-600 text-sm">Copied!</span>
        )}
      </div>
    </div>
  );
};

export default PromptCard;

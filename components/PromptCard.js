import React, { useState } from 'react';
import Link from 'next/link';
import { ClipboardIcon as ClipboardCopyIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
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
      
      <p className="text-sm text-gray-500 mt-1">
        {formatDate(prompt.createdAt)}
      </p>
      
      <div className="mt-3 text-gray-700 whitespace-pre-line">
        {truncateText(prompt.content, 150)}
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

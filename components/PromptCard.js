import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ClipboardIcon as ClipboardCopyIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  CubeTransparentIcon
} from '@heroicons/react/24/outline';
import { formatDate, truncateText, copyToClipboard } from '../lib/utils';
import Button from './Button';
import StarRating from './StarRating';
import UsageCounter from './UsageCounter';
import SuccessToggle from './SuccessToggle';
import { canManagePrompt } from '../lib/permissions';

const PromptCard = ({ prompt, team, session, onDelete, showActions = true }) => {
  const [isCopied, setIsCopied] = useState(false);
  
  if (!prompt) return null;
  
  const sessionUserId = String(session?.user?.id || session?.sub || '');
  const promptUserId = String(prompt.userId || '');
  
  let canEdit = false;
  let canDelete = false;

  if (sessionUserId) {
    if (prompt.visibility === 'team' && team) {
      canEdit = canManagePrompt(team, sessionUserId, prompt, 'edit');
      canDelete = canManagePrompt(team, sessionUserId, prompt, 'delete');
    } else {
      const isOwner = sessionUserId === promptUserId;
      canEdit = isOwner;
      canDelete = isOwner;
    }
  }
  
  const handleCopy = async () => {
    const success = await copyToClipboard(prompt.text);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      
      try {
        await fetch(`/api/prompts/${prompt._id}/increment-usage`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error incrementing usage count:', error);
      }
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      onDelete(prompt._id);
    }
  };
  
  return (
    <div className="card bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow duration-200 flex flex-col justify-between h-full">
       <div>
          <div className="flex justify-between items-start mb-2">
             <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 flex-grow mr-2">
               <Link href={`/prompts/${prompt._id}`} className="hover:underline">
                 {prompt.title}
               </Link>
             </h3>
             {showActions && (
                 <div className="flex space-x-1 flex-shrink-0">
                    <button
                      onClick={handleCopy}
                      className="flex items-center text-gray-600 hover:text-primary-600 focus:outline-none px-2 py-1 rounded-md hover:bg-gray-100"
                      title="Copy prompt content"
                    >
                      <ClipboardCopyIcon className="h-5 w-5 mr-1" />
                      <span className="text-sm">Copy</span>
                    </button>
                    
                    {canEdit && (
                      <Link href={`/prompts/edit/${prompt._id}`} 
                        className="flex items-center text-gray-600 hover:text-primary-600 focus:outline-none px-2 py-1 rounded-md hover:bg-gray-100" 
                        title="Edit prompt">
                          <PencilIcon className="h-5 w-5 mr-1" />
                          <span className="text-sm">Edit</span>
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        className="flex items-center text-gray-600 hover:text-red-600 focus:outline-none px-2 py-1 rounded-md hover:bg-gray-100"
                        title="Delete prompt"
                      >
                        <TrashIcon className="h-5 w-5 mr-1" />
                        <span className="text-sm">Delete</span>
                      </button>
                    )}
                 </div>
             )}
           </div>

           <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 mb-3 gap-y-1">
             <span>{formatDate(prompt.createdAt)}</span>
             <div className="flex items-center space-x-1">
                 {prompt.visibility && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                      prompt.visibility === 'public' ? 'bg-green-100 text-green-800' : 
                      prompt.visibility === 'private' ? 'bg-gray-100 text-gray-800' : 
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {prompt.visibility.charAt(0).toUpperCase() + prompt.visibility.slice(1)}
                    </span>
                  )}
                  {prompt.platformCompatibility && prompt.platformCompatibility.length > 0 && (
                     <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800" title={prompt.platformCompatibility.join(', ')}>
                          <CubeTransparentIcon className="h-3 w-3 mr-1" />
                          {prompt.platformCompatibility[0]}
                          {prompt.platformCompatibility.length > 1 && ` +${prompt.platformCompatibility.length - 1}`}
                      </span>
                   )}
             </div>
           </div>

           {prompt.description && (
             <p className="mb-3 text-sm text-gray-600 italic">
               {truncateText(prompt.description, 100)}
             </p>
           )}

           <div 
             onClick={handleCopy}
             className="mb-3 text-sm text-gray-700 whitespace-pre-line border-l-4 border-gray-200 pl-3 py-1 cursor-pointer hover:bg-gray-50 relative group"
             title="Click to copy prompt content"
           >
             {truncateText(prompt.text, 120)}
             <div className="absolute inset-0 bg-primary-50 bg-opacity-0 group-hover:bg-opacity-25 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
               <div className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-md shadow-sm">
                 Click to copy
               </div>
             </div>
           </div>

           {prompt.tags && prompt.tags.length > 0 && (
             <div className="mb-3 flex flex-wrap gap-1">
               {prompt.tags.map((tag, index) => (
                 <span
                   key={`tag-${prompt._id}-${tag}-${index}`}
                   className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                 >
                   {tag}
                 </span>
               ))}
             </div>
           )}
       </div>

       <div className="mt-auto pt-3 border-t border-gray-100">
           <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mb-2">
                {prompt.rating !== undefined && (
                  <StarRating
                    rating={prompt.rating || 0}
                    size="sm"
                    interactive={false}
                  />
                )}
                
                {prompt.usageCount !== undefined && (
                  <UsageCounter
                    count={prompt.usageCount || 0}
                    size="sm"
                  />
                )}
                
                {prompt.isSuccess !== undefined && (
                  <SuccessToggle
                    isSuccess={prompt.isSuccess}
                    size="sm"
                    interactive={false}
                  />
                )}
                
                {prompt.successRate !== undefined && (
                  <div className="flex items-center">
                    <ChartBarIcon className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{prompt.successRate || 0}% success</span>
                  </div>
                )}
            </div>
            
           <div className="flex justify-between items-center">
             <Link href={`/prompts/${prompt._id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
               View Details
             </Link>
             {isCopied && (
               <span className="text-green-600 text-sm">Copied!</span>
             )}
           </div>
       </div>
    </div>
  );
};

export default PromptCard;

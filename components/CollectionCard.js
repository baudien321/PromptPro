import React from 'react';
import Link from 'next/link';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../lib/utils';
import { useSession } from 'next-auth/react';

const CollectionCard = ({ collection, onDelete, showActions = true }) => {
  const { data: session } = useSession();
  if (!collection) return null;
  
  const promptCount = collection.prompts ? collection.prompts.length : 0;
  const isOwner = session && collection.userId === session.user.id;
  
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this collection? This will not delete the prompts inside.')) {
      onDelete(collection.id);
    }
  };
  
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{collection.name}</h3>
        
        {showActions && isOwner && (
          <div className="flex space-x-2">
            <Link href={`/collections/edit/${collection.id}`} 
              className="flex items-center text-gray-600 hover:text-primary-600 focus:outline-none px-2 py-1 rounded-md hover:bg-gray-100" 
              title="Edit collection">
                <PencilIcon className="h-5 w-5 mr-1" />
                <span className="text-sm">Edit</span>
            </Link>
            
            <button
              onClick={handleDelete}
              className="flex items-center text-gray-600 hover:text-red-600 focus:outline-none px-2 py-1 rounded-md hover:bg-gray-100"
              title="Delete collection"
            >
              <TrashIcon className="h-5 w-5 mr-1" />
              <span className="text-sm">Delete</span>
            </button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mt-1">
        {formatDate(collection.createdAt)}
      </p>
      
      {collection.description && (
        <p className="mt-3 text-gray-700">
          {collection.description}
        </p>
      )}
      
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}
        </div>
        
        <Link href={`/collections/${collection.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View Collection
        </Link>
      </div>
    </div>
  );
};

export default CollectionCard;

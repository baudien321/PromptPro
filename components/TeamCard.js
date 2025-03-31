import { useState } from 'react';
import Link from 'next/link';
import { formatDate } from '../lib/utils';

/**
 * Team card component for displaying team information
 * @param {Object} props - Component props
 * @param {Object} props.team - Team data
 * @param {boolean} props.isDetailed - Whether to show detailed information
 * @param {boolean} props.isEditable - Whether to show edit/delete options
 * @param {function} props.onDelete - Callback when delete is clicked
 */
export default function TeamCard({ team, isDetailed = false, isEditable = false, onDelete = null }) {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  if (!team) return null;
  
  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {team.name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              Created {formatDate(team.createdAt)}
            </p>
          </div>
          
          {isEditable && (
            <div className="flex space-x-2">
              <Link href={`/teams/edit/${team.id}`}
                className="flex items-center text-gray-600 hover:text-primary-600 focus:outline-none px-2 py-1 rounded-md hover:bg-gray-100"
                title="Edit team">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                <span className="text-sm">Edit</span>
              </Link>
              
              <button 
                className="flex items-center text-gray-600 hover:text-red-600 focus:outline-none px-2 py-1 rounded-md hover:bg-gray-100" 
                title="Delete team"
                onClick={() => setShowConfirmDelete(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Delete</span>
              </button>
            </div>
          )}
        </div>
        
        <p className="text-gray-700 mt-2">{team.description}</p>
        
        {isDetailed && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Team Members ({team.members?.length || 0})</h4>
            <ul className="space-y-1">
              {team.members?.map((member) => (
                <li key={member.userId} className="flex items-center justify-between text-sm">
                  <span>{member.name || `User ${member.userId}`}</span>
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-4">
          <Link href={`/teams/${team.id}`}>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Details →
            </button>
          </Link>
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-500 mb-5">
              Are you sure you want to delete the team "{team.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 rounded-md text-gray-800 hover:bg-gray-200"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 rounded-md text-white hover:bg-red-700"
                onClick={() => {
                  if (onDelete) {
                    onDelete(team.id);
                  }
                  setShowConfirmDelete(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Team editor component for creating and editing teams
 * @param {Object} props - Component props
 * @param {Object} props.existingTeam - Existing team data for editing (null for create mode)
 * @param {function} props.onSubmit - Callback when form is submitted
 * @param {boolean} props.isLoading - Whether submit action is in progress
 */
export default function TeamEditor({ existingTeam = null, onSubmit, isLoading = false }) {
  // State for team data
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
  });
  
  // Form errors
  const [errors, setErrors] = useState({});
  
  const router = useRouter();
  
  // Set initial data if editing existing team
  useEffect(() => {
    if (existingTeam) {
      setTeamData({
        name: existingTeam.name || '',
        description: existingTeam.description || '',
      });
    }
  }, [existingTeam]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!teamData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (teamData.name.length > 100) {
      newErrors.name = 'Team name must be less than 100 characters';
    }
    
    if (teamData.description && teamData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(teamData);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg border p-6">
      <h2 className="text-2xl font-bold mb-6">
        {existingTeam ? 'Edit Team' : 'Create New Team'}
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="name">
            Team Name<span className="text-red-600">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className={`border rounded w-full py-2 px-3 text-gray-700 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            value={teamData.name}
            onChange={handleChange}
            placeholder="Enter team name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows="4"
            className={`border rounded w-full py-2 px-3 text-gray-700 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            value={teamData.description}
            onChange={handleChange}
            placeholder="Describe the purpose of this team"
          ></textarea>
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            {teamData.description.length}/500 characters
          </p>
        </div>
        
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className={`px-4 py-2 text-sm text-white rounded ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              `${existingTeam ? 'Update' : 'Create'} Team`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
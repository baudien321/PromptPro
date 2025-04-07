import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Button from './Button';
import TagSuggestions from './TagSuggestions';
import templates from '../data/prompt-templates.json';
import {
  TrashIcon,
  PlusCircleIcon,
  BeakerIcon,
  LightBulbIcon,
  ChatBubbleBottomCenterTextIcon,
  TagIcon,
  UsersIcon,
  LockClosedIcon,
  GlobeAltIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { Switch } from '@headlessui/react';

const AI_PLATFORMS = [
  { id: 'ChatGPT', name: 'ChatGPT', icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> },
  { id: 'MidJourney', name: 'Midjourney', icon: <LightBulbIcon className="h-5 w-5" /> },
  { id: 'Claude', name: 'Claude', icon: <BeakerIcon className="h-5 w-5" /> },
  { id: 'Gemini', name: 'Gemini', icon: <BeakerIcon className="h-5 w-5" /> },
  { id: 'DALL-E', name: 'DALL-E', icon: <LightBulbIcon className="h-5 w-5" /> },
  { id: 'Other', name: 'Other', icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> },
];

const VISIBILITY_OPTIONS = [
  { id: 'private', name: 'Private', description: 'Only you can view', icon: LockClosedIcon },
  { id: 'team', name: 'Team', description: 'Visible to selected team members', icon: UsersIcon },
  { id: 'public', name: 'Public', description: 'Anyone can view', icon: GlobeAltIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PromptEditor({ existingPrompt = null, onSubmit, isLoading }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [userTeams, setUserTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    tags: [],
    platformCompatibility: [],
    visibility: 'private',
    teamId: null,
    currentTag: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  useEffect(() => {
    if (session) {
      fetchUserTeams();
    }
  }, [session]);
  
  useEffect(() => {
    if (existingPrompt) {
      setFormData({
        title: existingPrompt.title || '',
        content: existingPrompt.text || '',
        description: existingPrompt.description || '',
        tags: existingPrompt.tags || [],
        platformCompatibility: existingPrompt.platformCompatibility || [],
        visibility: existingPrompt.visibility || 'private',
        teamId: existingPrompt.teamId || null,
        currentTag: ''
      });
    } else {
      setFormData({
        title: '',
        content: '',
        description: '',
        tags: [],
        platformCompatibility: [],
        visibility: 'private',
        teamId: null,
        currentTag: ''
      });
    }
  }, [existingPrompt]);
  
  const fetchUserTeams = async () => {
    setTeamsLoading(true);
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) throw new Error('Failed to fetch teams');
      const data = await response.json();
      setUserTeams(data || []);
    } catch (error) {
      console.error("Error fetching user teams:", error);
      setErrors(prev => ({ ...prev, teams: 'Could not load your teams.' }));
      setUserTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'visibility' && value !== 'team') {
        newState.teamId = null;
      }
      return newState;
    });
    
    if (errors[name]) {
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors[name]; return newErrors; });
    }
    if (name === 'visibility' && value !== 'team' && errors.teamId) {
      setErrors(prev => { const newErrors = { ...prev }; delete newErrors.teamId; return newErrors; });
    }
  };
  
  const handlePlatformChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentPlatforms = prev.platformCompatibility || [];
      let updatedPlatforms;
      if (checked) {
        updatedPlatforms = [...currentPlatforms, value];
      } else {
        updatedPlatforms = currentPlatforms.filter(platform => platform !== value);
      }
      return { ...prev, platformCompatibility: updatedPlatforms };
    });
  };
  
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && formData.currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    if (!formData.currentTag.trim()) return;
    if (formData.tags.includes(formData.currentTag.trim().toLowerCase())) {
      setFormData(prev => ({ ...prev, currentTag: '' }));
      return;
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, prev.currentTag.trim().toLowerCase()],
      currentTag: ''
    }));
  };
  
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Prompt content is required';
    if (formData.visibility === 'team' && !formData.teamId) {
      newErrors.teamId = 'Please select a team';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const promptData = {
      title: formData.title.trim(),
      text: formData.content.trim(),
      description: formData.description.trim() || "",
      tags: formData.tags || [],
      platformCompatibility: formData.platformCompatibility || [],
      visibility: formData.visibility || "private",
      teamId: formData.visibility === 'team' ? formData.teamId : null
    };
    
    try {
      await onSubmit(promptData);
    } catch (error) {
      console.error("Error submitting prompt:", error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || "Failed to save prompt. Please try again."
      }));
    }
  };
  
  const handleCancel = () => {
    router.back();
  };
  
  const handleTemplateSelect = (templateId) => {
    setSelectedTemplateId(templateId);
    const selectedTemplate = templates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        content: selectedTemplate.content
      }));
      if (errors.content) {
        setErrors(prev => { const newErrors = { ...prev }; delete newErrors.content; return newErrors; });
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow sm:rounded-md sm:overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`block w-full rounded-md ${
                  errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                } shadow-sm sm:text-sm`}
                placeholder="Give your prompt a descriptive title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>
          </div>
          
          <div>
            <label htmlFor="template-select" className="block text-sm font-medium text-gray-700">
              Apply a Template (Optional)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <select 
                id="template-select"
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">-- Select a template --</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Selecting a template will replace the current prompt content.
            </p>
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Prompt Content <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <textarea
                id="content"
                name="content"
                rows={5}
                value={formData.content}
                onChange={handleChange}
                className={`block w-full rounded-md ${
                  errors.content ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                } shadow-sm sm:text-sm`}
                placeholder="Enter your prompt text here..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-500">{errors.content}</p>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Write the exact text you would enter into the AI platform.
            </p>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Describe what this prompt does and how to use it effectively..."
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              A clear description helps others understand how to use your prompt.
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags
              </label>
              <Link href="/tags" className="text-xs text-primary-600 hover:text-primary-700 flex items-center">
                <TagIcon className="h-3 w-3 mr-1" />
                Manage Tags
              </Link>
            </div>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="currentTag"
                name="currentTag"
                value={formData.currentTag}
                onChange={handleChange}
                onKeyDown={handleTagKeyDown}
                className="flex-1 block w-full rounded-none rounded-l-md border-gray-300 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Add relevant tags (e.g., marketing, coding)"
              />
              <button
                type="button"
                onClick={addTag}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100"
              >
                <PlusCircleIcon className="h-5 w-5" />
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 flex-shrink-0 text-primary-400 hover:text-primary-600 focus:outline-none"
                    >
                      <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                        <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <p className="mt-2 text-sm text-gray-500">
              Tags help users find your prompt. Examples: "copywriting", "story", "image", etc.
            </p>
          </div>
          
          <div className="border-t border-gray-200 pt-6 mt-6">
            <button 
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm font-medium text-primary-600 hover:text-primary-800 mb-4"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options (Platform, Visibility)
            </button>

            {showAdvanced && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform Compatibility (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {AI_PLATFORMS.map(platform => (
                      <div key={platform.id} className="flex items-center">
                        <input
                          id={`platform-${platform.id}`}
                          name="platformCompatibility"
                          type="checkbox"
                          value={platform.id}
                          checked={formData.platformCompatibility.includes(platform.id)}
                          onChange={handlePlatformChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <label htmlFor={`platform-${platform.id}`} className="ml-2 block text-sm text-gray-900">
                          {platform.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Visibility
                  </label>
                  <fieldset className="mt-2">
                    <legend className="sr-only">Prompt Visibility</legend>
                    <div className="divide-y divide-gray-200 border rounded-md">
                      {VISIBILITY_OPTIONS.map((option, optionIdx) => (
                        <div key={option.id} className="relative flex items-start p-4">
                          <div className="min-w-0 flex-1 text-sm">
                            <label htmlFor={`visibility-${option.id}`} className="font-medium text-gray-700 select-none">
                              {option.name}
                            </label>
                            <p id={`visibility-${option.id}-description`} className="text-gray-500">
                              {option.description}
                            </p>
                          </div>
                          <div className="ml-3 flex items-center h-5">
                            <input
                              id={`visibility-${option.id}`}
                              name="visibility"
                              type="radio"
                              value={option.id}
                              checked={formData.visibility === option.id}
                              onChange={handleChange}
                              className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"
                              aria-describedby={`visibility-${option.id}-description`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </fieldset>
                </div>
                
                {formData.visibility === 'team' && (
                  <div>
                    <label htmlFor="teamId" className="block text-sm font-medium text-gray-700">
                      Select Team <span className="text-red-500">*</span>
                    </label>
                    <div className="mt-1">
                      {teamsLoading ? (
                        <p className="text-sm text-gray-500 italic">Loading teams...</p>
                      ) : errors.teams ? (
                        <p className="text-sm text-red-500">{errors.teams}</p>
                      ) : userTeams.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">You are not a member of any teams. <Link href="/teams/create" className="text-primary-600 hover:underline">Create one?</Link></p>
                      ) : (
                        <select
                          id="teamId"
                          name="teamId"
                          value={formData.teamId || ''}
                          onChange={handleChange}
                          className={`block w-full rounded-md ${
                            errors.teamId ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                          } shadow-sm sm:text-sm`}
                        >
                          <option value="" disabled>-- Select a Team --</option>
                          {userTeams.map(team => (
                            <option key={team.id} value={team.id}>{team.name}</option>
                          ))}
                        </select>
                      )}
                      {errors.teamId && (
                        <p className="mt-1 text-sm text-red-500">{errors.teamId}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
        <Button type="button" variant="secondary" onClick={handleCancel} className="mr-3">
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : (existingPrompt ? 'Update Prompt' : 'Create Prompt')}
        </Button>
      </div>
    </form>
  );
}
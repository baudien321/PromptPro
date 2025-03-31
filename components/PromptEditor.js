import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Button from './Button';
import { 
  TrashIcon, 
  PlusCircleIcon, 
  BeakerIcon, 
  LightBulbIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

const AI_PLATFORMS = [
  { id: 'chatgpt', name: 'ChatGPT', icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> },
  { id: 'midjourney', name: 'Midjourney', icon: <LightBulbIcon className="h-5 w-5" /> },
  { id: 'claude', name: 'Claude', icon: <BeakerIcon className="h-5 w-5" /> },
  { id: 'stable-diffusion', name: 'Stable Diffusion', icon: <LightBulbIcon className="h-5 w-5" /> },
  { id: 'gpt4', name: 'GPT-4', icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> },
  { id: 'dalle', name: 'DALL-E', icon: <LightBulbIcon className="h-5 w-5" /> },
  { id: 'bard', name: 'Bard', icon: <BeakerIcon className="h-5 w-5" /> },
  { id: 'other', name: 'Other', icon: <ChatBubbleBottomCenterTextIcon className="h-5 w-5" /> },
];

const VISIBILITY_OPTIONS = [
  { id: 'public', name: 'Public - Anyone can view' },
  { id: 'private', name: 'Private - Only you can view' },
  { id: 'unlisted', name: 'Unlisted - Anyone with the link can view' },
];

export default function PromptEditor({ existingPrompt = null, onSubmit, isLoading }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    tags: [],
    aiPlatform: 'chatgpt',
    visibility: 'private',
    currentTag: ''
  });
  
  const [errors, setErrors] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  useEffect(() => {
    if (existingPrompt) {
      setFormData({
        title: existingPrompt.title || '',
        content: existingPrompt.content || '',
        description: existingPrompt.description || '',
        tags: existingPrompt.tags || [],
        aiPlatform: existingPrompt.aiPlatform || 'chatgpt',
        visibility: existingPrompt.visibility || 'private',
        currentTag: ''
      });
    }
  }, [existingPrompt]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && formData.currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };
  
  const addTag = () => {
    if (!formData.currentTag.trim()) return;
    
    // Don't add duplicate tags
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Prompt content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Create a cleaned version of the prompt data (removing any unnecessary fields)
    const promptData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      description: formData.description.trim() || "", // Ensure description is never undefined
      tags: formData.tags || [],
      aiPlatform: formData.aiPlatform || "chatgpt",
      visibility: formData.visibility || "private"
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
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
              Tags
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="currentTag"
                name="currentTag"
                value={formData.currentTag}
                onChange={handleChange}
                onKeyDown={handleTagKeyDown}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Add tags and press Enter..."
              />
              <button
                type="button"
                onClick={addTag}
                className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusCircleIcon className="h-4 w-4 mr-1" />
                Add
              </button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 text-primary-500 hover:text-primary-700 focus:outline-none"
                    >
                      <TrashIcon className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <p className="mt-2 text-sm text-gray-500">
              Tags help users find your prompt. Examples: "copywriting", "story", "image", etc.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              AI Platform
            </label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AI_PLATFORMS.map(platform => (
                <div
                  key={platform.id}
                  onClick={() => setFormData(prev => ({ ...prev, aiPlatform: platform.id }))}
                  className={`
                    flex items-center px-3 py-2 border rounded-md cursor-pointer
                    ${formData.aiPlatform === platform.id 
                      ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' 
                      : 'border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <div className={`text-${formData.aiPlatform === platform.id ? 'primary' : 'gray'}-500 mr-2`}>
                    {platform.icon}
                  </div>
                  <span className="text-sm font-medium">{platform.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm font-medium text-primary-600 hover:text-primary-900 focus:outline-none focus:underline"
            >
              {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
            </button>
            
            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Visibility
                    </label>
                    <div className="mt-2 space-y-3">
                      {VISIBILITY_OPTIONS.map(option => (
                        <div key={option.id} className="flex items-center">
                          <input
                            id={`visibility-${option.id}`}
                            name="visibility"
                            type="radio"
                            checked={formData.visibility === option.id}
                            onChange={() => setFormData(prev => ({ ...prev, visibility: option.id }))}
                            className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <label htmlFor={`visibility-${option.id}`} className="ml-3 block text-sm font-medium text-gray-700">
                            {option.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 flex justify-end space-x-3">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary" 
          isLoading={isLoading}
        >
          {existingPrompt ? 'Update Prompt' : 'Create Prompt'}
        </Button>
      </div>
    </form>
  );
}
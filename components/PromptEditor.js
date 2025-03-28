import React, { useState, useEffect } from 'react';
import Button from './Button';

const PromptEditor = ({ initialData = {}, onSubmit, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    tags: '',
    aiPlatform: 'ChatGPT',
    visibility: 'private',
    rating: 0,
    usageCount: 0,
    successRate: 0,
    ...initialData,
    tags: initialData.tags ? initialData.tags.join(', ') : '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle different input types appropriately
    let processedValue = value;
    if (type === 'number') {
      // For number inputs, store as numbers but prevent NaN
      processedValue = value === '' ? '' : type === 'number' && name === 'rating' 
        ? parseFloat(value) 
        : parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }
    
    // Optional fields validation
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    // Numeric fields validation
    if (formData.rating !== '' && (isNaN(parseFloat(formData.rating)) || 
        parseFloat(formData.rating) < 0 || parseFloat(formData.rating) > 5)) {
      newErrors.rating = 'Rating must be between 0 and 5';
    }
    
    if (formData.usageCount !== '' && (isNaN(parseInt(formData.usageCount, 10)) || 
        parseInt(formData.usageCount, 10) < 0)) {
      newErrors.usageCount = 'Usage count must be a non-negative number';
    }
    
    if (formData.successRate !== '' && (isNaN(parseInt(formData.successRate, 10)) || 
        parseInt(formData.successRate, 10) < 0 || parseInt(formData.successRate, 10) > 100)) {
      newErrors.successRate = 'Success rate must be between 0 and 100';
    }
    
    // Team visibility validation
    if (formData.visibility === 'team' && !formData.teamId) {
      newErrors.visibility = 'Team selection is required for team visibility';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process form data
      const processedData = {
        ...formData,
        // Convert tags from comma-separated string to array
        tags: formData.tags 
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) 
          : [],
        // Convert numeric fields to numbers
        rating: parseFloat(formData.rating) || 0,
        usageCount: parseInt(formData.usageCount, 10) || 0,
        successRate: parseInt(formData.successRate, 10) || 0,
      };
      
      await onSubmit(processedData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'An error occurred. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="label">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`input ${errors.title ? 'border-red-500' : ''}`}
          placeholder="Enter a descriptive title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="content" className="label">
          Prompt Content <span className="text-red-500">*</span>
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows={6}
          className={`input ${errors.content ? 'border-red-500' : ''}`}
          placeholder="Write your prompt here..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="description" className="label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="input"
          placeholder="Briefly describe what this prompt does..."
        />
        <p className="mt-1 text-sm text-gray-500">
          A short description of what this prompt helps to accomplish.
        </p>
      </div>
      
      <div>
        <label htmlFor="tags" className="label">
          Tags <span className="text-gray-500">(comma-separated)</span>
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="input"
          placeholder="e.g., writing, creative, fiction"
        />
        <p className="mt-1 text-sm text-gray-500">
          Add tags to help organize and find your prompts easier.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="aiPlatform" className="label">
            AI Platform
          </label>
          <select
            id="aiPlatform"
            name="aiPlatform"
            value={formData.aiPlatform}
            onChange={handleChange}
            className="input"
          >
            <option value="ChatGPT">ChatGPT</option>
            <option value="Claude">Claude</option>
            <option value="DALL-E">DALL-E</option>
            <option value="MidJourney">MidJourney</option>
            <option value="Stable Diffusion">Stable Diffusion</option>
            <option value="GPT-4">GPT-4</option>
            <option value="Gemini">Gemini</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="visibility" className="label">
            Visibility
          </label>
          <select
            id="visibility"
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            className="input"
          >
            <option value="private">Private (Only you)</option>
            <option value="public">Public (Everyone)</option>
            <option value="team">Team (Selected members)</option>
          </select>
        </div>
      </div>
      
      {isEditing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="rating" className="label">
              Rating (1-5)
            </label>
            <input
              type="number"
              id="rating"
              name="rating"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
              className="input"
            />
          </div>
          
          <div>
            <label htmlFor="usageCount" className="label">
              Usage Count
            </label>
            <input
              type="number"
              id="usageCount"
              name="usageCount"
              min="0"
              value={formData.usageCount}
              onChange={handleChange}
              className="input"
            />
          </div>
          
          <div>
            <label htmlFor="successRate" className="label">
              Success Rate (%)
            </label>
            <input
              type="number"
              id="successRate"
              name="successRate"
              min="0"
              max="100"
              value={formData.successRate}
              onChange={handleChange}
              className="input"
            />
          </div>
        </div>
      )}
      
      {errors.submit && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-sm text-red-700">{errors.submit}</p>
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
        >
          {isEditing ? 'Update Prompt' : 'Create Prompt'}
        </Button>
      </div>
    </form>
  );
};

export default PromptEditor;

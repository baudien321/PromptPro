import React, { useState, useEffect } from 'react';
import Button from './Button';

const PromptEditor = ({ initialData = {}, onSubmit, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    ...initialData,
    tags: initialData.tags ? initialData.tags.join(', ') : '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      // Process tags from comma-separated string to array
      const processedData = {
        ...formData,
        tags: formData.tags 
          ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) 
          : []
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

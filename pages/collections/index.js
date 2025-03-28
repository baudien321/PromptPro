import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import CollectionCard from '../../components/CollectionCard';
import Button from '../../components/Button';
import { PlusIcon } from '@heroicons/react/outline';
import Link from 'next/link';

export default function Collections() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});
  
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/collections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch collections');
        }
        
        const data = await response.json();
        setCollections(data);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setError('Failed to load collections. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollections();
  }, []);
  
  const handleDelete = async (collectionId) => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete collection');
      }
      
      setCollections(collections.filter(c => c.id !== collectionId));
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection. Please try again.');
    }
  };
  
  const handleCreateFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }
    
    if (formData.description && formData.description.length > 200) {
      errors.description = 'Description must be less than 200 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleCreateCollection = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create collection');
      }
      
      const newCollection = await response.json();
      
      setCollections([...collections, newCollection]);
      setFormData({ name: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating collection:', error);
      setFormErrors(prev => ({
        ...prev,
        submit: 'Failed to create collection. Please try again.'
      }));
    }
  };
  
  return (
    <Layout title="Collections - PromptPro">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Collections</h1>
          <Button
            variant="primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            {showCreateForm ? 'Cancel' : 'Create Collection'}
          </Button>
        </div>
        
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New Collection</h2>
            
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label htmlFor="name" className="label">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleCreateFormChange}
                  className={`input ${formErrors.name ? 'border-red-500' : ''}`}
                  placeholder="Collection name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
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
                  onChange={handleCreateFormChange}
                  rows={3}
                  className={`input ${formErrors.description ? 'border-red-500' : ''}`}
                  placeholder="A short description of the collection"
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>
              
              {formErrors.submit && (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-sm text-red-700">{formErrors.submit}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                >
                  Create Collection
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            {collections.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-medium text-gray-900 mb-2">No Collections Yet</h2>
                <p className="text-gray-500 mb-6">Create your first collection to organize your prompts.</p>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateForm(true)}
                >
                  Create Collection
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

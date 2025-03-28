import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import PromptEditor from '../../components/PromptEditor';

export default function CreatePrompt() {
  const router = useRouter();
  
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create prompt');
      }
      
      const data = await response.json();
      router.push(`/prompts/${data.id}`);
    } catch (error) {
      console.error('Error creating prompt:', error);
      throw error;
    }
  };
  
  return (
    <Layout title="Create New Prompt - PromptPro">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Prompt</h1>
        
        <PromptEditor onSubmit={handleSubmit} />
      </div>
    </Layout>
  );
}

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import TagManager from '../../components/TagManager';
import Button from '../../components/Button';
import { useToast } from '../../components/ToastContainer';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function TagsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const toast = useToast();
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all tags with their usage counts
  useEffect(() => {
    async function fetchTags() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/tags');
        
        if (!response.ok) {
          throw new Error('Failed to fetch tags');
        }
        
        const data = await response.json();
        setTags(data);
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast?.errorToast('Failed to load tags. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (session) {
      fetchTags();
    }
  }, [session, toast]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/tags');
    }
  }, [status, router]);

  const handleRenameTag = async (oldName, newName) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/tags/rename', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldName, newName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to rename tag');
      }
      
      // Update local state
      setTags(prevTags => 
        prevTags.map(tag => 
          tag.name === oldName 
            ? { ...tag, name: newName } 
            : tag
        )
      );
      
      toast?.successToast(`Tag "${oldName}" renamed to "${newName}"`);
    } catch (error) {
      console.error('Error renaming tag:', error);
      toast?.errorToast('Failed to rename tag. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteTag = async (tagName) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch(`/api/tags/${encodeURIComponent(tagName)}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }
      
      // Update local state
      setTags(prevTags => prevTags.filter(tag => tag.name !== tagName));
      
      toast?.successToast(`Tag "${tagName}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast?.errorToast('Failed to delete tag. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMergeTags = async (sourceTags, targetTag) => {
    try {
      setIsProcessing(true);
      
      const response = await fetch('/api/tags/merge', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sourceTags, targetTag }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to merge tags');
      }
      
      // Update local state
      const targetTagObj = tags.find(tag => tag.name === targetTag);
      const totalCount = sourceTags.reduce((acc, sourceTag) => {
        const sourceTagObj = tags.find(tag => tag.name === sourceTag);
        return acc + (sourceTagObj?.count || 0);
      }, targetTagObj?.count || 0);
      
      setTags(prevTags => {
        const updatedTags = prevTags.filter(tag => !sourceTags.includes(tag.name));
        return updatedTags.map(tag => 
          tag.name === targetTag 
            ? { ...tag, count: totalCount } 
            : tag
        );
      });
      
      toast?.successToast(`Tags merged successfully into "${targetTag}"`);
    } catch (error) {
      console.error('Error merging tags:', error);
      toast?.errorToast('Failed to merge tags. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <Layout title="PromptPro - Tag Management">
        <div className="flex justify-center items-center min-h-[60vh]">
          <ArrowPathIcon className="h-8 w-8 text-primary-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="PromptPro - Tag Management">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
            <p className="mt-1 text-gray-500">
              Organize your prompt library by managing tags
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button
              variant="secondary"
              onClick={() => router.push('/prompts/my-prompts')}
            >
              My Prompts
            </Button>
            <Button
              variant="primary"
              onClick={() => router.push('/prompts/create')}
            >
              Create Prompt
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <ArrowPathIcon className="h-8 w-8 text-primary-500 animate-spin" />
          </div>
        ) : (
          <TagManager
            tags={tags}
            onRenameTag={handleRenameTag}
            onDeleteTag={handleDeleteTag}
            onMergeTags={handleMergeTags}
            isLoading={isProcessing}
          />
        )}
      </div>
    </Layout>
  );
}
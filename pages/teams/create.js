import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import TeamEditor from '../../components/TeamEditor';

export default function CreateTeam() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Redirect to sign in if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }
  
  // Handle form submission
  const handleSubmit = async (teamData) => {
    setIsSubmitting(true);
    setError(null);
    
    // Ensure session and user ID are available
    if (!session || !session.user || !session.user.id) {
      setError('User session not found. Please sign in again.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Include the creator's ID in the data sent to the API
      const payload = {
        ...teamData,
        userId: session.user.id, // Add the user ID here
      };
      
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Send the payload with userId
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create team');
      }
      
      const createdTeam = await response.json();
      
      // Redirect to team details page
      router.push(`/teams/${createdTeam.id}`);
      
    } catch (error) {
      console.error('Error creating team:', error);
      setError(error.message || 'Failed to create team');
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-700 hover:text-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        <TeamEditor onSubmit={handleSubmit} isLoading={isSubmitting} />
      </div>
    </Layout>
  );
}
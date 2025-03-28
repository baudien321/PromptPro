import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import TeamEditor from '../../../components/TeamEditor';
import Link from 'next/link';

export default function EditTeam() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  
  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Fetch team data
  useEffect(() => {
    if (id && status === 'authenticated') {
      fetchTeam();
    }
  }, [id, status]);
  
  const fetchTeam = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/teams/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Team not found');
        }
        throw new Error('Failed to fetch team');
      }
      
      const data = await response.json();
      
      // Check if user has permission to edit
      if (data.userId !== session.user.id) {
        throw new Error('You do not have permission to edit this team');
      }
      
      setTeam(data);
      
    } catch (error) {
      console.error('Error fetching team:', error);
      setError(error.message || 'Failed to load team');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (teamData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update team');
      }
      
      const updatedTeam = await response.json();
      
      // Redirect to team details page
      router.push(`/teams/${updatedTeam.id}`);
      
    } catch (error) {
      console.error('Error updating team:', error);
      setError(error.message || 'Failed to update team');
      setIsSubmitting(false);
    }
  };
  
  // Loading state
  if (isLoading || status === 'loading') {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen-content">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 text-red-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
            <div className="mt-4">
              <Link href="/teams">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                  Back to Teams
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/teams/${id}`}>
            <button className="flex items-center text-gray-700 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Team
            </button>
          </Link>
        </div>
        
        <TeamEditor
          existingTeam={team}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </Layout>
  );
}
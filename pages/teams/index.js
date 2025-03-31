import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import TeamCard from '../../components/TeamCard';

export default function Teams() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Add success message when refreshing
  useEffect(() => {
    // Check if we have a refresh parameter, indicating a team was just modified
    if (router.query.refresh) {
      setSuccessMessage('Team successfully saved!');
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [router.query.refresh]);
  
  // Fetch teams
  useEffect(() => {
    const fetchTeams = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Only fetch teams if user is authenticated
        if (status === 'authenticated') {
          const response = await fetch('/api/teams');
          
          if (!response.ok) {
            throw new Error('Failed to fetch teams');
          }
          
          const data = await response.json();
          setTeams(data);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        setError(error.message || 'Failed to load teams');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeams();
  }, [status, router.query.refresh]);
  
  // Handle delete team
  const handleDeleteTeam = async (teamId) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete team');
      }
      
      // Remove the team from the state
      setTeams(teams.filter(team => team.id !== teamId));
      
      // Show success message
      setSuccessMessage('Team successfully deleted!');
      // Clear the message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error deleting team:', error);
      alert(error.message || 'Failed to delete team');
    }
  };
  
  // Redirect to sign in if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {successMessage && (
          <div className="bg-green-50 p-4 rounded-md mb-6 border border-green-200">
            <p className="text-sm text-green-700">{successMessage}</p>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <Link href="/teams/create">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Team
            </button>
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white rounded-lg border p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams yet</h3>
            <p className="text-gray-500 mb-6">Create your first team to start collaborating with others</p>
            <Link href="/teams/create">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                Create Your First Team
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                isEditable={true}
                onDelete={() => handleDeleteTeam(team.id)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
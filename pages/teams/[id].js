import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { formatDate } from '../../lib/utils';
import PromptCard from '../../components/PromptCard';

export default function TeamDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = router.query;
  
  const [team, setTeam] = useState(null);
  const [teamPrompts, setTeamPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamPromptsError, setTeamPromptsError] = useState(null);
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Fetch team and prompts
  useEffect(() => {
    if (id && status === 'authenticated') {
      fetchTeam();
      fetchTeamPrompts();
    }
  }, [id, status]);
  
  const fetchTeam = async () => {
    try {
      const response = await fetch(`/api/teams/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Team not found');
        }
        throw new Error('Failed to fetch team');
      }
      
      const data = await response.json();
      setTeam(data);
      
    } catch (error) {
      console.error('Error fetching team:', error);
      setError(error.message || 'Failed to load team');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchTeamPrompts = async () => {
    try {
      const response = await fetch(`/api/teams/${id}/prompts`);
      
      if (!response.ok) {
        if (response.status === 403) {
            throw new Error('You do not have permission to view these prompts.');
        }
        throw new Error('Failed to fetch team prompts');
      }
      
      const data = await response.json();
      setTeamPrompts(data);
      setTeamPromptsError(null);
      
    } catch (error) {
      console.error('Error fetching team prompts:', error);
      setTeamPromptsError(error.message || 'Failed to load prompts');
      setTeamPrompts([]);
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
  
  if (!team) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-yellow-50 text-yellow-700 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Team Not Found</h2>
            <p>The requested team could not be found.</p>
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
          <Link href="/teams">
            <button className="flex items-center text-gray-700 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Teams
            </button>
          </Link>
        </div>
        
        {/* Team Header */}
        <div className="bg-white border rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{team.name}</h1>
                <p className="text-sm text-gray-500 mb-4">
                  Created {formatDate(team.createdAt)}
                </p>
              </div>
              
              {/* Edit button - only for team admins */}
              {team.userId === session?.user?.id && (
                <Link href={`/teams/edit/${team.id}`}>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                    Edit Team
                  </button>
                </Link>
              )}
            </div>
            
            <p className="text-gray-700 mb-6">{team.description}</p>
            
            {/* Team Members Section */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                
                {/* Invite button - only for team admins */}
                {team.userId === session?.user?.id && (
                  <Link href={`/teams/${team.id}/invite`}>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      + Invite Member
                    </button>
                  </Link>
                )}
              </div>
              
              <ul className="divide-y">
                {team.members?.map((member) => (
                  <li key={member.userId} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name || `User ${member.userId}`}</div>
                        <div className="text-sm text-gray-500">Joined {formatDate(member.joinedAt)}</div>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Team Prompts Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Team Prompts</h2>
            
            <Link href={`/prompts/create?teamId=${team.id}&visibility=team`}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Prompt
              </button>
            </Link>
          </div>
          
          {teamPromptsError && (
             <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                <p>{teamPromptsError}</p>
            </div>
          )}
          
          {teamPrompts.length === 0 && !teamPromptsError ? (
            <div className="bg-white rounded-lg border p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No prompts yet</h3>
              <p className="text-gray-500 mb-6">Create your first team prompt to start collaborating</p>
              <Link href={`/prompts/create?teamId=${team.id}&visibility=team`}>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">
                  Create Your First Team Prompt
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamPrompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} team={team} session={session} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
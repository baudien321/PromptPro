import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { formatDate } from '../../lib/utils';
import PromptCard from '../../components/PromptCard';
import { useTeams } from '../../context/TeamContext'; // Import context for reloadTeams
import { PlusIcon, TrashIcon, ArrowPathIcon, CreditCardIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react'; // For role dropdown
import { Fragment } from 'react'; // For Transition
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'; // For role dropdown

const ROLES = ['admin', 'member']; // Define roles

export default function TeamDetail() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id: teamId } = router.query;
  const { reloadTeams } = useTeams(); // Get reload function from context
  
  const [team, setTeam] = useState(null);
  const [teamPrompts, setTeamPrompts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teamPromptsError, setTeamPromptsError] = useState(null);

  // State for adding members
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberRole, setAddMemberRole] = useState('member');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState(null);

  // State for managing members
  const [isUpdatingRole, setIsUpdatingRole] = useState(null); // Store userId being updated
  const [isRemovingMember, setIsRemovingMember] = useState(null); // Store userId being removed
  
  // State for billing
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState(null);
  
  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);
  
  // Fetch team and prompts
  useEffect(() => {
    if (teamId && status === 'authenticated') {
      fetchTeam();
      fetchTeamPrompts();
    }
  }, [teamId, status]);
  
  const fetchTeam = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/teams/${teamId}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Team not found');
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to fetch team');
      }
      const data = await response.json();
      setTeam(data);
    } catch (error) {
      console.error('Error fetching team:', error);
      setError(error.message || 'Failed to load team');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };
  
  const fetchTeamPrompts = async () => {
    try {
      const response = await fetch(`/api/teams/${teamId}/prompts`);
      
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
  
  // Determine user's role in the current team
  const currentUserMemberInfo = team?.members?.find(m => m.user?._id === session?.user?.id);
  const isCurrentUserAdmin = currentUserMemberInfo?.role === 'owner' || currentUserMemberInfo?.role === 'admin';

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!addMemberEmail || !addMemberRole) return;
    setIsAddingMember(true);
    setAddMemberError(null);
    try {
        const response = await fetch(`/api/teams/${teamId}/members`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: addMemberEmail, role: addMemberRole }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to add member');
        }
        // Success!
        setShowAddMemberForm(false);
        setAddMemberEmail('');
        setAddMemberRole('member');
        await fetchTeam(false); // Refetch team data without main loading spinner
        reloadTeams(); // Also trigger context reload
    } catch (err) {
        setAddMemberError(err.message);
    } finally {
        setIsAddingMember(false);
    }
  };

  const handleUpdateRole = async (targetUserId, newRole) => {
    if (isUpdatingRole === targetUserId) return; // Prevent multiple clicks
    setIsUpdatingRole(targetUserId);
    try {
        const response = await fetch(`/api/teams/${teamId}/members/${targetUserId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to update role');
        }
        await fetchTeam(false); // Refetch team data
        reloadTeams(); // Trigger context reload
    } catch (err) {
        console.error("Error updating role:", err);
        alert(`Failed to update role: ${err.message}`); // Simple alert for now
    } finally {
        setIsUpdatingRole(null);
    }
  };

  const handleRemoveMember = async (targetUserId) => {
    if (isRemovingMember === targetUserId) return;
    const memberToRemove = team.members.find(m => m.user._id === targetUserId);
    const isSelf = session?.user?.id === targetUserId;
    const confirmMessage = isSelf 
        ? "Are you sure you want to leave this team?"
        : `Are you sure you want to remove ${memberToRemove?.user?.name || 'this member'} from the team?`;

    if (!window.confirm(confirmMessage)) return;

    setIsRemovingMember(targetUserId);
    try {
        const response = await fetch(`/api/teams/${teamId}/members/${targetUserId}`, {
            method: 'DELETE',
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Failed to remove member');
        }
        await fetchTeam(false); // Refetch team data
        reloadTeams(); // Trigger context reload
        if (isSelf) {
          router.push('/teams'); // Redirect self if they leave
        }
    } catch (err) {
        console.error("Error removing member:", err);
        alert(`Failed to remove member: ${err.message}`);
    } finally {
        setIsRemovingMember(null);
    }
  };

  const handleUpgrade = async () => {
    setIsBillingLoading(true);
    setBillingError(null);
    try {
        const response = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: teamId }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to create checkout session');
        }
        if (result.url) {
            window.location.href = result.url; // Redirect to Stripe Checkout
        } else {
             throw new Error('No checkout URL received from server.');
        }
    } catch (err) {
        console.error("Error initiating upgrade:", err);
        setBillingError(err.message);
    } finally {
        // Don't set loading to false if redirecting
        // setIsBillingLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setIsBillingLoading(true);
    setBillingError(null);
    try {
        const response = await fetch('/api/stripe/create-portal-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: teamId }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'Failed to create billing portal session');
        }
        if (result.url) {
            window.location.href = result.url; // Redirect to Stripe Portal
        } else {
             throw new Error('No portal URL received from server.');
        }
    } catch (err) {
        console.error("Error opening billing portal:", err);
        setBillingError(err.message);
    } finally {
        // Don't set loading to false if redirecting
        // setIsBillingLoading(false);
    }
  };

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
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              {/* Left side: Title, Description, Plan */} 
              <div className="flex-grow">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{team.name}</h1>
                <div className="flex items-center space-x-2 mb-2">
                    <p className="text-sm text-gray-500">Created {formatDate(team.createdAt)}</p>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${team.plan === 'Pro' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}> 
                        {team.plan} Plan
                    </span>
                     <p className="text-sm text-gray-500">({team.promptLimit} prompt limit)</p>
                </div>
                <p className="text-gray-700 mb-4 sm:mb-0">{team.description}</p>
              </div>
              
              {/* Right side: Actions (Edit, Upgrade, Manage Billing) */} 
              {isCurrentUserAdmin && (
                <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                  <Link href={`/teams/edit/${team._id}`}>
                    <button className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm">
                      Edit Team
                    </button>
                  </Link>
                  
                  {/* Conditional Billing Buttons */} 
                  {team.plan === 'Free' && (
                    <button 
                      onClick={handleUpgrade}
                      disabled={isBillingLoading}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-md text-sm font-medium disabled:opacity-50 flex items-center justify-center"
                    >
                       {isBillingLoading ? <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" /> : <SparklesIcon className="h-4 w-4 mr-1" />}
                       Upgrade to Pro
                    </button>
                  )}

                  {team.plan === 'Pro' && (team.stripeCustomerId || team.stripeSubscriptionId) && (
                      <button 
                        onClick={handleManageBilling}
                        disabled={isBillingLoading}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50 flex items-center justify-center"
                      >
                        {isBillingLoading ? <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" /> : <CreditCardIcon className="h-4 w-4 mr-1" />}
                        Manage Billing
                      </button>
                  )}
                </div>
              )}
            </div>
            {/* Display Billing Error if any */} 
             {isCurrentUserAdmin && billingError && (
                <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-md text-sm">
                    Billing Error: {billingError}
                </div>
            )}
            
            {/* Team Members Section */}
            <div className="border-t mt-6 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Team Members ({team.members?.length || 0})</h2>
                
                {/* Add Member button - only for team admins */}
                {isCurrentUserAdmin && (
                  <button 
                    onClick={() => setShowAddMemberForm(!showAddMemberForm)} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    {showAddMemberForm ? 'Cancel' : 'Add Member'}
                  </button>
                )}
              </div>
              
              {/* Add Member Form (conditional) */} 
              {showAddMemberForm && isCurrentUserAdmin && (
                <form onSubmit={handleAddMember} className="bg-gray-50 p-4 rounded-md mb-4 border">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                    <div className="flex-grow">
                      <label htmlFor="add-member-email" className="block text-sm font-medium text-gray-700">Member Email</label>
                      <input 
                        type="email" 
                        id="add-member-email" 
                        value={addMemberEmail} 
                        onChange={(e) => setAddMemberEmail(e.target.value)}
                        placeholder="user@example.com"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="add-member-role" className="block text-sm font-medium text-gray-700">Role</label>
                      <select 
                        id="add-member-role" 
                        value={addMemberRole} 
                        onChange={(e) => setAddMemberRole(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isAddingMember}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center sm:w-auto w-full mt-2 sm:mt-0"
                    >
                      {isAddingMember ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg> 
                          Adding...
                        </> 
                      ) : "Add Member" }
                    </button>
                  </div>
                  {addMemberError && <p className="text-red-600 text-sm mt-2">Error: {addMemberError}</p>}
                </form>
              )}

              {/* Members List */} 
              <ul className="divide-y divide-gray-200">
                {team.members?.map((member) => {
                  const memberUserId = member.user?._id;
                  const memberIsOwner = member.role === 'owner';
                  const canManageMember = isCurrentUserAdmin && !memberIsOwner; // Admins can manage non-owners
                  const canLeave = session?.user?.id === memberUserId && !memberIsOwner; // User can leave if not owner
                  const currentRole = member.role;

                  return (
                    <li key={memberUserId} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                      <div className="flex items-center mb-2 sm:mb-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
                          {member.user?.name ? member.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center">
                            {member.user?.name || `User ${memberUserId?.substring(0, 6)}...`}
                            {memberIsOwner && <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-yellow-100 text-yellow-800 font-semibold">Owner</span>}
                          </div>
                          <div className="text-sm text-gray-500">{member.user?.email}</div>
                        </div>
                      </div>
                      
                      {/* Role Badge / Role Editor / Actions */} 
                      <div className="flex items-center space-x-2 pl-12 sm:pl-0 mt-2 sm:mt-0">
                        {/* Role display or editor */} 
                        {!memberIsOwner && canManageMember ? (
                          <Listbox 
                            value={currentRole} 
                            onChange={(newRole) => handleUpdateRole(memberUserId, newRole)}
                            disabled={isUpdatingRole === memberUserId}
                          >
                            <div className="relative w-32">
                              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6">
                                <span className="block truncate">
                                  {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  {isUpdatingRole === memberUserId 
                                    ? <ArrowPathIcon className="h-4 w-4 animate-spin text-gray-400" aria-hidden="true" /> 
                                    : <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                  }
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {ROLES.map((role) => (
                                    <Listbox.Option
                                      key={role}
                                      className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${ 
                                          active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                        }`
                                      }
                                      value={role}
                                    >
                                      {({ selected }) => (
                                        <>
                                          <span
                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'
                                              }`}
                                          >
                                            {role.charAt(0).toUpperCase() + role.slice(1)}
                                          </span>
                                          {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        ) : (
                          // Static role display for owner or non-admins
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${ 
                              memberIsOwner ? 'bg-yellow-100 text-yellow-800' 
                              : currentRole === 'admin' ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}
                          </span>
                        )}

                        {/* Remove Button */} 
                        {(canManageMember || canLeave) && (
                          <button 
                            onClick={() => handleRemoveMember(memberUserId)}
                            disabled={isRemovingMember === memberUserId}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 p-1 rounded hover:bg-red-50"
                            title={canLeave ? "Leave Team" : "Remove Member"}
                          >
                            {isRemovingMember === memberUserId ? 
                              <ArrowPathIcon className="animate-spin h-4 w-4 text-red-600" /> 
                              : <TrashIcon className="h-4 w-4" /> 
                            }
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
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
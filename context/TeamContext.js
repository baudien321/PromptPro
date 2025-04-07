// context/TeamContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useSession } from 'next-auth/react';

const TeamContext = createContext({
    teams: [],
    selectedTeamId: null,
    setSelectedTeamId: () => {},
    isLoading: true,
    error: null,
    reloadTeams: async () => {},
});

export const TeamProvider = ({ children }) => {
    const { data: session, status } = useSession();
    const [teams, setTeams] = useState([]);
    // Store selected team ID in state, potentially persist to localStorage later
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTeams = useCallback(async () => {
        if (status === 'authenticated' && session?.user?.id) {
            console.log("TeamContext: Fetching teams for user:", session.user.id);
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/teams'); // Fetches teams for the logged-in user
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch teams');
                }
                const data = await response.json();
                console.log("TeamContext: Fetched teams:", data);
                setTeams(data || []); // Ensure teams is always an array

                // Set default selected team (e.g., the first one) if none is selected yet
                // or if the previously selected one is no longer valid
                if (data && data.length > 0) {
                    const currentIsValid = data.some(team => team._id === selectedTeamId);
                    if (!selectedTeamId || !currentIsValid) {
                         // Prioritize selecting the team where the user is 'owner' if possible
                         const ownerTeam = data.find(team => team.members.some(m => m.user._id === session.user.id && m.role === 'owner'));
                         setSelectedTeamId(ownerTeam?._id || data[0]._id); // Fallback to first team
                    }
                } else {
                    // No teams, reset selection
                    setSelectedTeamId(null);
                }

            } catch (err) {
                console.error("TeamContext: Error fetching teams:", err);
                setError(err.message);
                setTeams([]);
                setSelectedTeamId(null);
            } finally {
                setIsLoading(false);
            }
        } else if (status !== 'loading') {
            // Not authenticated or loading, clear teams and stop loading
            setTeams([]);
            setSelectedTeamId(null);
            setIsLoading(false);
            setError(null);
        }
    }, [status, session, selectedTeamId]); // Add selectedTeamId dependency to re-validate selection

    useEffect(() => {
        fetchTeams();
    }, [fetchTeams]); // Run fetchTeams when callback changes (due to status/session)

    const handleSetSelectedTeam = (teamId) => {
        console.log("TeamContext: Setting selected team ID:", teamId);
        setSelectedTeamId(teamId);
        // Optionally persist to localStorage here
    };

    const value = {
        teams,
        selectedTeamId,
        setSelectedTeamId: handleSetSelectedTeam,
        isLoading,
        error,
        reloadTeams: fetchTeams, // Expose reload function
    };

    return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

export const useTeams = () => useContext(TeamContext); 
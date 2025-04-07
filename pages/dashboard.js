import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import StatCard from '../components/Dashboard/StatCard';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import TopPrompts from '../components/Dashboard/TopPrompts';
import PopularTags from '../components/Dashboard/PopularTags';
import TemplateSuggestions from '../components/Dashboard/TemplateSuggestions';
import { useToast } from '../components/ToastContainer';
import { calculateStatistics, getRecentActivity } from '../lib/utils';
import { 
  DocumentTextIcon, 
  ArrowTrendingUpIcon,
  StarIcon,
  CheckCircleIcon,
  CommandLineIcon as KeyboardIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

/**
 * Dashboard page showing usage statistics, top-performing prompts, and recent activity
 */
export default function Dashboard() {
  const { data: session, status } = useSession();
  const toast = useToast();
  const errorToast = toast?.errorToast;
  const [statistics, setStatistics] = useState({
    totalPrompts: 0,
    totalUsage: 0,
    averageRating: 0,
    successRate: 0,
    popularTags: [],
    topPrompts: []
  });
  const [activity, setActivity] = useState([]);
  const [templatePrompts, setTemplatePrompts] = useState([]);
  const [isNewUserExperience, setIsNewUserExperience] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const keyboardShortcuts = [
    { key: 'c', description: 'Create new prompt' },
    { key: 'f', description: 'Focus on search' },
    { key: 'd', description: 'Go to dashboard' },
    { key: 'h', description: 'Go to home page' },
    { key: 'p', description: 'Go to my prompts' },
    { key: 'Escape', description: 'Close modals/dialogs' }
  ];

  // Register keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input or textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key.toLowerCase()) {
        case 'c':
          window.location.href = '/prompts/create';
          break;
        case 'f':
          document.querySelector('input[placeholder*="Search"]')?.focus();
          break;
        case 'd':
          window.location.href = '/dashboard';
          break;
        case 'h':
          window.location.href = '/';
          break;
        case 'p':
          window.location.href = '/prompts/my-prompts';
          break;
        case 'escape':
          setShowKeyboardShortcuts(false);
          break;
        case '?':
          setShowKeyboardShortcuts(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch data for dashboard
  useEffect(() => {
    async function fetchDashboardData() {
      if (status === 'loading' || !session?.user?.id) return;

      setIsLoading(true);
      const userId = session.user.id;

      try {
        // Fetch user's prompts AND template prompts in parallel
        const [userPromptsRes, templatePromptsRes, collectionsRes] = await Promise.all([
          fetch(`/api/prompts/user?t=${Date.now()}`),
          fetch(`/api/prompts?tags=template&t=${Date.now()}`),
          fetch('/api/collections')
        ]);

        if (!userPromptsRes.ok) throw new Error('Failed to fetch user prompts');
        if (!templatePromptsRes.ok) throw new Error('Failed to fetch template prompts');
        if (!collectionsRes.ok) throw new Error('Failed to fetch collections');

        const userPrompts = await userPromptsRes.json();
        const templates = await templatePromptsRes.json();
        const collections = await collectionsRes.json();

        // --- New User Check ---
        setIsNewUserExperience(userPrompts.length === 0);
        setTemplatePrompts(templates);
        // ---------------------

        // Calculate statistics based on USER's prompts only
        const stats = calculateStatistics(userPrompts);
        setStatistics(stats);
        
        // Get recent activity (can use user prompts and collections)
        const activityData = getRecentActivity({ 
          prompts: userPrompts, 
          collections 
        });
        setActivity(activityData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        errorToast('Failed to load dashboard data: ' + error.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, [session, status, errorToast]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-1 text-gray-500">
              Monitor your prompts performance and recent activity
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <KeyboardIcon className="h-5 w-5 mr-2 text-gray-500" />
              Keyboard Shortcuts
            </button>
          </div>
        </div>

        {isNewUserExperience && templatePrompts.length > 0 && (
          <div className="mb-8">
            <TemplateSuggestions templates={templatePrompts} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Prompts"
            value={statistics.totalPrompts}
            icon={DocumentTextIcon}
            color="primary"
          />
          <StatCard
            title="Total Usage"
            value={statistics.totalUsage}
            icon={ArrowTrendingUpIcon}
            color="info"
          />
          <StatCard
            title="Average Rating"
            value={statistics.averageRating ? `${statistics.averageRating} / 5` : 'N/A'}
            icon={StarIcon}
            color="warning"
          />
          <StatCard
            title="Success Rate"
            value={statistics.successRate ? `${statistics.successRate}%` : 'N/A'}
            icon={CheckCircleIcon}
            color="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Top Performing Prompts</h2>
                <Link 
                  href="/prompts/my-prompts" 
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
              <TopPrompts prompts={statistics.topPrompts} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <ActivityFeed activities={activity} />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Popular Tags</h2>
              </div>
              <PopularTags tags={statistics.popularTags} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/prompts/create">
                    <div className="p-4 bg-primary-50 rounded-lg text-center hover:bg-primary-100 transition-colors duration-200">
                      <DocumentTextIcon className="h-6 w-6 mx-auto mb-2 text-primary-500" />
                      <span className="text-sm font-medium text-primary-700">New Prompt</span>
                    </div>
                  </Link>
                  <Link href="/collections/create">
                    <div className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mx-auto mb-2 text-yellow-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
                      </svg>
                      <span className="text-sm font-medium text-yellow-700">New Collection</span>
                    </div>
                  </Link>
                  <Link href="/teams">
                    <div className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mx-auto mb-2 text-blue-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                      </svg>
                      <span className="text-sm font-medium text-blue-700">Manage Teams</span>
                    </div>
                  </Link>
                  <Link href="/search">
                    <div className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 mx-auto mb-2 text-green-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                      </svg>
                      <span className="text-sm font-medium text-green-700">Advanced Search</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
            onClick={() => setShowKeyboardShortcuts(false)}
          ></div>
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 sm:mx-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Keyboard Shortcuts</h3>
              <button 
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg 
                  className="h-6 w-6" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-3">
              {keyboardShortcuts.map((shortcut, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-700">{shortcut.description}</span>
                  <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">
                    {shortcut.key}
                  </kbd>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-gray-200 text-center text-sm text-gray-500">
                Press <kbd className="px-2 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">?</kbd> anywhere to show this dialog
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
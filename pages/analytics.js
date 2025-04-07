import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { 
    ChartBarIcon, 
    EyeIcon, 
    ClipboardDocumentIcon, 
    PlayIcon, 
    ShareIcon, 
    PencilIcon, 
    PlusIcon, 
    TrashIcon 
} from '@heroicons/react/24/outline';
import Link from 'next/link';

// Map event types to icons and labels for display
const eventTypeDisplay = {
    view: { icon: EyeIcon, label: 'Views' },
    copy: { icon: ClipboardDocumentIcon, label: 'Copies' },
    execute: { icon: PlayIcon, label: 'Executions' },
    share: { icon: ShareIcon, label: 'Shares' },
    edit: { icon: PencilIcon, label: 'Edits' },
    create: { icon: PlusIcon, label: 'Creations' },
    delete: { icon: TrashIcon, label: 'Deletions' },
};

export default function AnalyticsDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [summaryData, setSummaryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/signin');
        }
        if (status === 'authenticated') {
            fetchSummaryData();
        }
    }, [status, router]);

    const fetchSummaryData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/analytics/summary');
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch analytics summary');
            }
            const data = await response.json();
            setSummaryData(data);
        } catch (err) {
            console.error('Error fetching summary data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || status === 'loading') {
        return (
            <Layout title="Analytics - Loading...">
                <div className="flex justify-center items-center min-h-screen-content">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout title="Analytics - Error">
                <div className="bg-red-50 text-red-700 p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
                    <p>{error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Analytics Dashboard - PromptPro">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                {summaryData && <p className="text-sm text-gray-500">Showing data for the last {summaryData.periodDays} days</p>}
            </div>

            {/* Stats Cards */} 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {summaryData?.totalCounts && Object.entries(eventTypeDisplay).map(([key, { icon: Icon, label }]) => {
                    const count = summaryData.totalCounts[key] || 0;
                    return (
                        <div key={key} className="bg-white border rounded-lg shadow-sm p-6 flex items-center space-x-4">
                            <div className="flex-shrink-0 bg-blue-100 p-3 rounded-full">
                                <Icon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 truncate">{label}</p>
                                <p className="text-2xl font-semibold text-gray-900">{count}</p>
                            </div>
                        </div>
                    );
                })}
                {summaryData?.totalCounts && Object.keys(summaryData.totalCounts).length === 0 && (
                     <div className="col-span-full bg-white border rounded-lg shadow-sm p-6 text-center text-gray-500">
                         No usage data recorded yet in the last {summaryData.periodDays} days.
                     </div>
                )}
            </div>

            {/* Top Prompts List */} 
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4">
                    <h2 className="text-lg font-semibold text-gray-900">Most Executed Prompts</h2>
                    <p className="text-sm text-gray-500">Top 5 prompts by execution count in the last {summaryData?.periodDays} days</p>
                </div>
                {summaryData?.topPrompts && summaryData.topPrompts.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                        {summaryData.topPrompts.map((prompt, index) => (
                            <li key={prompt.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-gray-500 w-4 text-right">{index + 1}.</span>
                                    <Link href={`/prompts/${prompt.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 truncate" title={prompt.title}>
                                        {prompt.title}
                                    </Link>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">{prompt.count} executions</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                     <div className="px-6 py-8 text-center text-gray-500">
                         No prompt execution data available for this period.
                     </div>
                )}
            </div>
            {/* TODO: Add more charts/stats here (Top Users, Daily Trends etc.) */}
        </Layout>
    );
} 
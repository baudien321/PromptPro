import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Layout from '../../components/Layout';
import Button from '../../components/Button';
import { formatDate } from '../../lib/utils';
import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/20/solid';
import Link from 'next/link'; // For linking target IDs

const AuditLogViewer = () => {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [logs, setLogs] = useState([]);
    const [pagination, setPagination] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentPage = parseInt(router.query.page || '1', 10);

    useEffect(() => {
        // Redirect if not authenticated or not admin
        if (status === 'unauthenticated') {
            router.push('/auth/signin?callbackUrl=/admin/audit-logs');
        }
        if (status === 'authenticated' && session.user.role !== 'admin') {
             setError('Access Denied: Admin privileges required.');
             setIsLoading(false);
        }
        if (status === 'authenticated' && session.user.role === 'admin') {
            fetchLogs(currentPage);
        }
    }, [status, session, router, currentPage]);

    const fetchLogs = async (page) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/audit-logs?page=${page}`);
            if (!response.ok) {
                if (response.status === 403) throw new Error('Access Denied: Admin privileges required.');
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch audit logs');
            }
            const data = await response.json();
            setLogs(data.logs || []);
            setPagination(data.pagination || {});
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            router.push(`/admin/audit-logs?page=${newPage}`);
            // fetchLogs(newPage); // Fetching triggered by useEffect on currentPage change
        }
    };

    // Render loading state
    if (status === 'loading' || isLoading) {
        return (
            <Layout title="Audit Logs - Loading...">
                <div className="flex justify-center items-center min-h-screen-content">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                </div>
            </Layout>
        );
    }

    // Render error/access denied state
    if (error) {
        return (
            <Layout title="Audit Logs - Error">
                 <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-50 text-red-700 p-6 rounded-lg">
                        <h2 className="text-xl font-semibold mb-2">Error</h2>
                        <p>{error}</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Render main dashboard content
    return (
        <Layout title="Admin - Audit Logs">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>

                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(log.timestamp, true)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                            {log.userId ? (
                                                <>{log.userId.name || log.userId.username} ({log.userId.email})</>
                                            ) : (
                                                <span className="italic text-gray-500">System</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{log.action}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {log.targetType && log.targetId ? (
                                                <>{log.targetType}: {log.targetId}</> // TODO: Maybe link targetId?
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {/* Render details nicely */} 
                                            {log.details && Object.keys(log.details).length > 0 ? (
                                                <pre className="text-xs font-mono bg-gray-100 p-1 rounded overflow-x-auto max-w-xs">{JSON.stringify(log.details, null, 2)}</pre>
                                            ) : (
                                                <span className="italic">No details</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-6 text-center text-sm text-gray-500">
                                            No audit logs found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */} 
                    {pagination.totalPages > 1 && (
                        <nav
                            className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
                            aria-label="Pagination"
                        >
                            <div className="hidden sm:block">
                                <p className="text-sm text-gray-700">
                                    Showing page <span className="font-medium">{pagination.currentPage}</span> of <span className="font-medium">{pagination.totalPages}</span>
                                    <span className="ml-2">({pagination.totalLogs} total logs)</span>
                                </p>
                            </div>
                            <div className="flex-1 flex justify-between sm:justify-end">
                                <Button
                                    variant="secondary"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                >
                                    <ArrowLeftIcon className="h-5 w-5 mr-1" />
                                    Previous
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage >= pagination.totalPages}
                                    className="ml-3"
                                >
                                    Next
                                    <ArrowRightIcon className="h-5 w-5 ml-1" />
                                </Button>
                            </div>
                        </nav>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AuditLogViewer; 
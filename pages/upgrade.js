import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout'; // Assuming you have a Layout component
import { useRouter } from 'next/router';
import { CheckCircleIcon } from '@heroicons/react/24/solid'; // Use solid icon for confirmation

const UpgradePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpgradeClick = async () => {
    if (isLoading || status !== 'authenticated') return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout session URL received');
      }
    } catch (err) {
      console.error('Upgrade Error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return <Layout>Loading...</Layout>;
  }

  if (status === 'unauthenticated') {
     router.push('/login'); // Redirect to login if not authenticated
     return <Layout>Redirecting...</Layout>;
  }

  // Check if the user is already on the Pro plan
  if (session?.user?.plan === 'Pro') {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto text-center">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">You're Already a Pro!</h1>
                    <p className="text-gray-600 mb-6">You already have access to all PromptPro premium features.</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 ease-in-out"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </Layout>
    );
  }

  // Otherwise, show the upgrade prompt
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Upgrade to PromptPro Pro</h1>
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md mx-auto">
          {/* Improved Benefits List */}
          <h2 className="text-xl font-semibold mb-4">Unlock Your Prompt Potential:</h2>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span><span className="font-semibold">Unlimited Prompts:</span> Never hit a limit, save and organize all your prompts.</span>
            </li>
            <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span><span className="font-semibold">Advanced Features:</span> Access future premium capabilities as they arrive.</span>
            </li>
            <li className="flex items-start">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                <span><span className="font-semibold">Priority Support:</span> Get faster assistance when you need it most.</span>
            </li>
             {/* Consider adding 1-2 more specific benefits if applicable */}
          </ul>

          <div className="text-center">
            <p className="text-3xl font-bold mb-1">$10 <span className="text-base font-normal text-gray-500">/ month</span></p>
            <p className="text-sm text-gray-500 mb-6">Cancel anytime.</p>
            <button
              onClick={handleUpgradeClick}
              className={`w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 ease-in-out text-lg ${isLoading || status !== 'authenticated' ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading || status !== 'authenticated'}
            >
              {isLoading ? 'Processing...' : 'Upgrade to Pro Now'}
            </button>
            {status !== 'authenticated' && <p className="text-red-500 text-sm mt-2">Please log in to upgrade.</p>}
            {error && <p className="text-red-500 text-sm mt-2">Error: {error}</p>}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UpgradePage; 
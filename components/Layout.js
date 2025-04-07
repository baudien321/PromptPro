import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Navbar from './Navbar';
import WelcomeModal from './Onboarding/WelcomeModal';
import { useToast } from './ToastContainer'; // Assuming you might want toasts

const Layout = ({ children, title = 'PromptPro - AI Prompt Management' }) => {
  const { data: session, status } = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const toast = useToast();

  // Extract plan and prompt count for clarity
  const userPlan = session?.user?.plan;
  const userPromptCount = session?.user?.promptCount;

  useEffect(() => {
    // Check onboarding status once session is loaded and authenticated
    if (status === 'authenticated' && session?.user && !session.user.hasCompletedOnboarding) {
      console.log("User has not completed onboarding, showing modal.");
      setShowOnboarding(true);
    } else if (status === 'authenticated' && session?.user?.hasCompletedOnboarding) {
      console.log("User has completed onboarding.");
      setShowOnboarding(false); // Ensure it's hidden if already completed
    }
  }, [status, session]);

  const handleCompleteOnboarding = async () => {
    setShowOnboarding(false); // Hide modal immediately
    try {
      const response = await fetch('/api/user/complete-onboarding', {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark onboarding as complete');
      }
      console.log("Successfully marked onboarding as complete.");
      // Optionally update the session client-side to reflect the change immediately
      // This requires specific NextAuth setup, might not be straightforward
      // Or show a success toast
      // toast?.successToast("Welcome aboard!"); 
    } catch (error) { 
      console.error("Error in handleCompleteOnboarding:", error);
      // Show error toast
      toast?.errorToast(error.message || "Could not save onboarding status.");
      // Optionally show the modal again if the API call failed?
      // setShowOnboarding(true); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title}</title>
        <meta name="description" content="PromptPro - AI Prompt Management Platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <Navbar userPlan={userPlan} userPromptCount={userPromptCount} />
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} PromptPro. All rights reserved.
          </p>
        </div>
      </footer>

      <WelcomeModal 
        isOpen={showOnboarding} 
        onClose={handleCompleteOnboarding} 
      />
    </div>
  );
};

export default Layout;

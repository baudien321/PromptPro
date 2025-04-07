import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { UserIcon, CogIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    notifications: {
      email: true,
      web: true,
    },
    visibility: 'public'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  
  useEffect(() => {
    // Load user data when session is available
    if (session && session.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
        bio: session.user.bio || '',
      }));
    }
  }, [session]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    try {
      // In a real app, this would send updates to the server
      // const response = await fetch('/api/user/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      
      // if (!response.ok) throw new Error('Failed to update settings');
      
      // Simulate successful update
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setSuccessMessage('Your settings have been updated successfully.');
    } catch (error) {
      console.error('Error updating settings:', error);
      setErrorMessage('Failed to update settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = async () => {
      setIsExporting(true);
      setExportError(null);
      try {
          // Use window.location.href for simple GET download trigger
          window.location.href = '/api/prompts/export';
          // No need to handle response directly as the browser handles the download
          // Reset loading state after a short delay
          setTimeout(() => setIsExporting(false), 3000); 
      } catch (err) {
          // This catch block might not be triggered for direct navigation
          console.error("Error initiating export (client-side):", err);
          setExportError('Failed to start export. Please try again.');
          setIsExporting(false);
      }
  };
  
  if (status === 'loading') {
    return (
      <Layout title="PromptPro - Settings">
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout title="PromptPro - Settings">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar or Navigation (Optional) */}
        <div className="md:col-span-1">
           {/* ... existing nav/sidebar ... */}
        </div>

        {/* Main Settings Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Settings Card */}
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Account Settings</h2>
            </div>
            
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-md bg-green-50 text-green-800">
                {successMessage}
              </div>
            )}
            
            {errorMessage && (
              <div className="mb-6 p-4 rounded-md bg-red-50 text-red-800">
                {errorMessage}
              </div>
            )}
            
            {/* Settings Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "Profile"} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-gray-500" />
                  )}
                </div>
                
                <div>
                  <h3 className="text-gray-700 font-medium">Profile Photo</h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Your profile photo is managed by your authentication provider.
                  </p>
                </div>
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Your display name"
                />
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="A short bio about yourself"
                />
              </div>
              
              <div className="px-6 py-4 -mx-6 border-t border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Preferences</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Visibility
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="visibility-public"
                      name="visibility"
                      type="radio"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <label htmlFor="visibility-public" className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">Public</span>
                      <span className="block text-sm text-gray-500">Anyone can see your profile and public prompts</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="visibility-private"
                      name="visibility"
                      type="radio"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                    />
                    <label htmlFor="visibility-private" className="ml-3">
                      <span className="block text-sm font-medium text-gray-700">Private</span>
                      <span className="block text-sm text-gray-500">Only you can see your profile</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Notification Settings
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="notifications-email"
                      name="email"
                      type="checkbox"
                      checked={formData.notifications.email}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="notifications-email" className="ml-3 text-sm text-gray-700">
                      Email notifications
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="notifications-web"
                      name="web"
                      type="checkbox"
                      checked={formData.notifications.web}
                      onChange={handleChange}
                      className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="notifications-web" className="ml-3 text-sm text-gray-700">
                      Web notifications
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
          
          {/* Data Export Card */}
          <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Data Export</h3>
                  <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>Download all your accessible prompts (private, team, and public) as a JSON file.</p>
                  </div>
                  <div className="mt-5">
                      <Button 
                          variant="secondary" 
                          onClick={handleExport}
                          isLoading={isExporting}
                          disabled={isExporting}
                       >
                          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                          {isExporting ? 'Preparing Export...' : 'Export My Prompts (JSON)'}
                      </Button>
                      {exportError && <p className="mt-2 text-sm text-red-600">Error: {exportError}</p>}
                  </div>
              </div>
          </div>

          {/* Danger Zone Card (Example) */}
          {/* ... existing danger zone ... */}

        </div>
      </div>
    </Layout>
  );
}
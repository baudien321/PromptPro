import React from 'react';
import PromptCard from '../PromptCard'; // Re-use PromptCard for consistency
import { LightBulbIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const TemplateSuggestions = ({ templates }) => {
  if (!templates || templates.length === 0) {
    return null;
  }

  // Show a limited number, e.g., the first 3-5
  const suggestionsToShow = templates.slice(0, 5);

  return (
    <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center mb-4">
        <LightBulbIcon className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-lg font-semibold text-primary-800">
          Get Started with Prompt Templates
        </h2>
      </div>
      <p className="text-sm text-primary-700 mb-5">
        Here are a few popular templates to help you get started. Click 'Copy' to use them right away or 'View Details' to learn more. You can find more in the main search.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestionsToShow.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt}
            // Assuming templates are public/owned by demo user,
            // current session might not have direct edit/delete rights
            session={null} // Pass null or carefully check permissions if needed
            onDelete={() => {}} // No delete action for templates here
            showActions={true} // Show copy/view details
          />
        ))}
      </div>
      {/* Optional: Link to a dedicated templates page or search? */}
      {/* <div className="mt-4 text-right">
        <Link href="/search?tags=template">
          <a className="text-sm font-medium text-primary-600 hover:text-primary-500">
            View All Templates &rarr;
          </a>
        </Link>
      </div> */}
    </div>
  );
};

export default TemplateSuggestions;
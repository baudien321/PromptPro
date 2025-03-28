import { formatDate } from '../../lib/utils';
import Link from 'next/link';
import {
  DocumentTextIcon,
  FolderIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';

/**
 * Activity feed component that displays recent activity
 * 
 * @param {Object} props - Component props
 * @param {Array} props.activities - Array of activity items
 */
export default function ActivityFeed({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'prompt':
        return <DocumentTextIcon className="h-6 w-6 text-primary-500" />;
      case 'collection':
        return <FolderIcon className="h-6 w-6 text-yellow-500" />;
      case 'comment':
        return <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <DocumentTextIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getActivityLink = (activity) => {
    switch (activity.type) {
      case 'prompt':
        return `/prompts/${activity.id}`;
      case 'collection':
        return `/collections/${activity.id}`;
      case 'comment':
        return `/prompts/${activity.promptId}`;
      default:
        return '#';
    }
  };

  const getActivityText = (activity) => {
    const action = activity.action;
    const title = activity.title;
    
    switch (activity.type) {
      case 'prompt':
        return `${action} prompt "${title}"`;
      case 'collection':
        return `${action} collection "${title}"`;
      case 'comment':
        return `${action} a comment on a prompt`;
      default:
        return 'unknown activity';
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={activity.id} className="relative pb-8">
            {activityIdx !== activities.length - 1 ? (
              <span
                className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                aria-hidden="true"
              />
            ) : null}
            <div className="relative flex items-start space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center ring-8 ring-white">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div>
                  <div className="text-sm">
                    <Link href={getActivityLink(activity)} className="font-medium text-gray-900 hover:text-primary-600">
                      {getActivityText(activity)}
                    </Link>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {formatDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
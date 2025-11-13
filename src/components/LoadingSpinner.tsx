import React from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface LoadingSpinnerProps {
  message?: string;
  isSyncing?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading your calendar...', 
  isSyncing = false 
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center">
          <ArrowPathIcon className={`h-12 w-12 text-blue-600 ${isSyncing ? 'animate-spin' : 'animate-pulse'}`} />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          {isSyncing ? 'Syncing with Canvas...' : message}
        </h2>
        <p className="mt-2 text-gray-600">
          {isSyncing 
            ? 'Fetching your assignments and deadlines...' 
            : 'Please wait while we prepare your schedule.'}
        </p>
        
        {isSyncing && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Connecting to Canvas API
                  </p>
                  <p className="text-xs text-gray-500">
                    Authenticating and fetching course data
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '@/context/PWAContext';

const PWAUpdateNotification = () => {
  const { updateAvailable, updateApp, dismissUpdate } = usePWA();

  if (!updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-blue-600 text-white rounded-lg shadow-lg p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <RefreshCw className="w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold">
            Update Available
          </h3>
          <p className="text-xs opacity-90 mt-1">
            A new version of ominbiz is available. Update now for the latest features and improvements.
          </p>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={updateApp}
              className="flex-1 bg-white text-blue-600 text-xs font-medium py-2 px-3 rounded-md hover:bg-blue-50 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={dismissUpdate}
              className="flex-shrink-0 text-white/80 hover:text-white p-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAUpdateNotification;

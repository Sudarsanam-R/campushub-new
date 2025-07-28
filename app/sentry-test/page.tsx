'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryTestPage() {
  // Test error tracking
  const triggerError = () => {
    try {
      // This will be caught by the error boundary
      throw new Error('This is a test error from the Sentry test page');
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  // Test performance monitoring with a simple API call
  useEffect(() => {
    // This will be captured by Sentry's automatic performance monitoring
    fetch('/api/hello')
      .then(response => response.json())
      .catch(error => console.error('Test API call failed:', error));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Sentry Integration Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Error Tracking Test</h2>
        <p className="mb-4">Click the button below to trigger a test error that will be captured by Sentry.</p>
        <button
          onClick={triggerError}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          aria-label="Trigger test error"
        >
          Trigger Test Error
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Performance Monitoring</h2>
        <p className="mb-4">Performance data is being collected automatically. Check your Sentry dashboard for performance metrics.</p>
        <p>Page load performance data should appear in your Sentry dashboard shortly.</p>
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
        <p className="font-medium">Note:</p>
        <p>This is a test page to verify Sentry integration. In a production environment, you would:</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Remove or restrict access to this page</li>
          <li>Set appropriate sample rates for errors and performance data</li>
          <li>Configure environment-specific settings</li>
        </ul>
      </div>
    </div>
  );
}

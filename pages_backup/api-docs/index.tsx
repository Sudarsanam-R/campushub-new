import { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const ApiDocs = () => {
  const [spec, setSpec] = useState(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSpec = async () => {
      try {
        const response = await fetch('/api-docs');
        if (!response.ok) {
          throw new Error('Failed to load API documentation');
        }
        const data = await response.json();
        setSpec(data);
      } catch (err) {
        console.error('Error loading API documentation:', err);
        setError('Failed to load API documentation. Please try again later.');
      }
    };

    loadSpec();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Loading API Documentation...</h1>
          <p className="text-gray-600">Please wait while we load the API documentation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <SwaggerUI
            spec={spec}
            docExpansion="list"
            defaultModelsExpandDepth={1}
            defaultModelExpandDepth={1}
            persistAuthorization={true}
          />
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;

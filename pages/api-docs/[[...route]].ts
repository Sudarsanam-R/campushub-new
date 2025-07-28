import { createSwaggerSpec } from 'next-swagger-doc';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const spec = createSwaggerSpec({
      apiFolder: 'pages/api', // Define the folder where API routes are located
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'CampusHub API',
          version: '1.0.0',
          description: 'API documentation for CampusHub - Discover college events and hackathons',
          contact: {
            name: 'API Support',
            email: 'support@campushub.com',
          },
        },
        servers: [
          {
            url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
            description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(spec);
  } catch (error) {
    console.error('Error generating OpenAPI spec:', error);
    res.status(500).json({ error: 'Failed to generate OpenAPI specification' });
  }
}

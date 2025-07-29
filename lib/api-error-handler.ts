import { NextApiRequest, NextApiResponse } from 'next';
import { AppError, formatError } from './errors';

// Type for async API route handlers
type AsyncApiHandler<T = any> = (
  req: NextApiRequest,
  res: NextApiResponse<T>
) => Promise<void>;

// Higher-order function to wrap API route handlers with error handling
export const apiHandler = <T = any>(
  handler: AsyncApiHandler<T>,
  options: {
    requireAuth?: boolean;
    allowedMethods?: string[];
    requireAdmin?: boolean;
  } = {}
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Check HTTP method
      if (options.allowedMethods && !options.allowedMethods.includes(req.method || '')) {
        res.setHeader('Allow', options.allowedMethods);
        return res.status(405).json({
          status: 'error',
          statusCode: 405,
          message: `Method ${req.method} Not Allowed`,
        });
      }

      // Authentication check
      if (options.requireAuth || options.requireAdmin) {
        const session = await getServerSession(req, res, authOptions);
        
        if (!session) {
          return res.status(401).json({
            status: 'error',
            statusCode: 401,
            message: 'You must be logged in to access this resource',
          });
        }

        // Admin role check
        if (options.requireAdmin && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
          return res.status(403).json({
            status: 'error',
            statusCode: 403,
            message: 'Insufficient permissions to access this resource',
          });
        }
      }

      // Execute the handler
      await handler(req, res);
    } catch (error) {
      // Handle known errors
      if (error instanceof AppError) {
        const errorResponse = formatError(error);
        return res.status(error.statusCode).json(errorResponse);
      }

      // Handle validation errors (e.g., from Zod)
      if (error.name === 'ZodError') {
        return res.status(400).json({
          status: 'error',
          statusCode: 400,
          message: 'Validation failed',
          errors: error.errors.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      // Handle Prisma errors
      if (error.name === 'PrismaClientKnownRequestError') {
        // Handle unique constraint violation
        if (error.code === 'P2002') {
          const field = error.meta?.target?.[0] || 'field';
          return res.status(409).json({
            status: 'error',
            statusCode: 409,
            message: `A record with this ${field} already exists`,
            field,
          });
        }

        // Handle record not found
        if (error.code === 'P2025') {
          return res.status(404).json({
            status: 'error',
            statusCode: 404,
            message: 'The requested resource was not found',
          });
        }
      }

      // Handle unknown errors
      console.error('Unhandled API error:', error);
      
      const errorResponse = formatError(error);
      return res.status(errorResponse.statusCode || 500).json({
        ...errorResponse,
        ...(process.env.NODE_ENV !== 'production' && { stack: error.stack }),
      });
    }
  };
};

// Helper function to validate request body against a schema
export const validateRequest = (schema: any, data: any) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error('Validation failed', { cause: result.error });
  }
  return result.data;
};

// Helper function to handle 404 errors
export const notFound = (message = 'Resource not found') => {
  const error = new Error(message);
  (error as any).statusCode = 404;
  throw error;
};

// Helper function to handle unauthorized errors
export const unauthorized = (message = 'Unauthorized') => {
  const error = new Error(message);
  (error as any).statusCode = 401;
  throw error;
};

// Helper function to handle forbidden errors
export const forbidden = (message = 'Forbidden') => {
  const error = new Error(message);
  (error as any).statusCode = 403;
  throw error;
};

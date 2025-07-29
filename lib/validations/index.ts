import { z } from 'zod';
import { UserRole, EventStatus, RegistrationStatus } from '@prisma/client';

// Common validations
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  );

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

// User validations
export const userRoleSchema = z.nativeEnum(UserRole);

export const createUserSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  role: userRoleSchema.optional().default('USER'),
  phone: z.string().optional(),
  department: z.string().optional(),
  position: z.string().optional(),
});

export const updateUserSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  email: emailSchema.optional(),
  phone: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  position: z.string().optional().nullable(),
  role: userRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

// Event validations
export const eventStatusSchema = z.nativeEnum(EventStatus);

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(3, 'Location is required'),
  startDate: z.string().or(z.date()).transform(val => new Date(val)),
  endDate: z.string().or(z.date()).transform(val => new Date(val)),
  registrationDeadline: z.string().or(z.date()).transform(val => val ? new Date(val) : null).optional().nullable(),
  capacity: z.number().int().positive('Capacity must be a positive number').optional().nullable(),
  categoryId: z.string().uuid('Invalid category ID'),
  tags: z.array(z.string().uuid('Invalid tag ID')).optional(),
  isPublic: z.boolean().default(true),
  status: eventStatusSchema.optional().default('DRAFT'),
  imageUrl: z.string().url('Invalid URL').optional().nullable(),
  organizerId: z.string().optional(),
});

export const updateEventSchema = createEventSchema.partial();

// Registration validations
export const registrationStatusSchema = z.nativeEnum(RegistrationStatus);

export const createRegistrationSchema = z.object({
  eventId: z.string().uuid('Invalid event ID'),
  userId: z.string().uuid('Invalid user ID').optional(),
  status: registrationStatusSchema.optional().default('PENDING'),
  notes: z.string().optional(),
});

// Category validations
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color code'),
});

// Tag validations
export const createTagSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color code'),
});

// Search and filter validations
export const searchQuerySchema = z.object({
  query: z.string().optional(),
  categories: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string().uuid()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.nativeEnum(EventStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Authentication validations
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

// Export all schemas
export const validations = {
  user: {
    create: createUserSchema,
    update: updateUserSchema,
  },
  event: {
    create: createEventSchema,
    update: updateEventSchema,
  },
  registration: {
    create: createRegistrationSchema,
  },
  category: {
    create: createCategorySchema,
  },
  tag: {
    create: createTagSchema,
  },
  search: searchQuerySchema,
  auth: {
    login: loginSchema,
    register: registerSchema,
    changePassword: changePasswordSchema,
  },
} as const;

// Helper function to format validation errors
export const formatValidationErrors = (error: z.ZodError) => {
  const formattedErrors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    formattedErrors[path] = err.message;
  });
  
  return formattedErrors;
};

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateRegistrationInput = z.infer<typeof createRegistrationSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

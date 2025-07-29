import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { UserRole } from '@prisma/client';

// Validation schema for updating user data
const updateUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  profile: z.object({
    bio: z.string().optional(),
    profilePicture: z.string().url('Invalid URL').optional(),
    stream: z.string().optional(),
    year: z.number().int().min(1).max(5).optional(),
    contactNumber: z.string().optional(),
  }).optional(),
});

// Helper function to check admin permissions
async function hasAdminPermissions(session: any) {
  if (!session?.user) return false;
  
  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { role: true }
  });
  
  return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
}

// GET /api/users/[userId] - Get a specific user
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if the requester is an admin or the same user
    const isAdmin = await hasAdminPermissions(session);
    const isSameUser = parseInt(session.user.id) === userId;

    if (!isAdmin && !isSameUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get the user with profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        Profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Remove sensitive data
    const { hashedPassword, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      data: {
        ...userWithoutPassword,
        profile: user.Profile || null,
        Profile: undefined, // Remove the Profile field
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[userId] - Update a user
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if the requester is an admin or the same user
    const isAdmin = await hasAdminPermissions(session);
    const isSameUser = parseInt(session.user.id) === userId;

    if (!isAdmin && !isSameUser) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const json = await request.json();
    const validation = updateUserSchema.safeParse(json);
    
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.errors,
        },
        { status: 400 }
      );
    }

    const { profile, ...userData } = validation.data;

    // Non-admin users can only update their own profile, not their role or active status
    if (!isAdmin) {
      delete userData.role;
      delete userData.isActive;
    }

    // Update the user and profile in a transaction
    const updatedUser = await prisma.$transaction(async (prisma) => {
      // Update user data
      const user = await prisma.user.update({
        where: { id: userId },
        data: userData,
      });

      // Update or create profile if profile data is provided
      if (profile) {
        await prisma.profile.upsert({
          where: { userId },
          update: profile,
          create: {
            ...profile,
            userId,
          },
        });
      }

      // Return the updated user with profile
      return await prisma.user.findUnique({
        where: { id: userId },
        include: {
          Profile: true,
        },
      });
    });

    // Remove sensitive data
    const { hashedPassword, ...userWithoutPassword } = updatedUser!;

    return NextResponse.json({
      success: true,
      data: {
        ...userWithoutPassword,
        profile: updatedUser.Profile || null,
        Profile: undefined, // Remove the Profile field
      },
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[userId] - Delete a user (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = await hasAdminPermissions(session);
    
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 }
      );
    }

    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Prevent deleting the current user
    if (parseInt(session.user!.id) === userId) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user (this will cascade to related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Handle foreign key constraint errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot delete user with associated records',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete user',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET() {
  const session = await getServerSession(authOptions);

  // Check if user is admin
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }

  try {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);

    // Get user statistics
    const [
      totalUsers,
      newUsersToday,
      activeUsersLast30Days,
      usersByRole,
      userGrowthData,
      totalEvents,
      activeEvents,
      eventsByStatus,
      eventsByCategory,
      registrationStats,
      recentRegistrations
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // New users today
      prisma.user.count({
        where: {
          createdAt: {
            gte: startOfToday,
            lte: endOfToday
          }
        }
      }),
      
      // Active users (users who logged in) in last 30 days
      prisma.user.count({
        where: {
          lastLogin: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      // Users by role
      prisma.user.groupBy({
        by: ['role'],
        _count: {
          role: true
        },
        orderBy: {
          _count: {
            role: 'desc'
          }
        }
      }),
      
      // User growth data (last 30 days)
      prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as count,
          SUM(COUNT(*)) OVER (ORDER BY DATE(created_at)) as total
        FROM "User"
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      
      // Total events
      prisma.event.count(),
      
      // Active events (upcoming or ongoing)
      prisma.event.count({
        where: {
          status: 'PUBLISHED',
          endDate: {
            gte: today
          }
        }
      }),
      
      // Events by status
      prisma.event.groupBy({
        by: ['status'],
        _count: {
          status: true
        },
        orderBy: {
          _count: {
            status: 'desc'
          }
        }
      }),
      
      // Events by category (top 5)
      prisma.event.groupBy({
        by: ['categoryId'],
        _count: {
          categoryId: true
        },
        orderBy: {
          _count: {
            categoryId: 'desc'
          }
        },
        take: 5
      }),
      
      // Registration statistics
      prisma.$queryRaw`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed,
          COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled,
          COUNT(CASE WHEN status = 'ATTENDED' THEN 1 END) as attended
        FROM "Registration"
      `,
      
      // Recent registrations
      prisma.registration.findMany({
        take: 5,
        orderBy: {
          registrationDate: 'desc'
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          event: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })
    ]);

    // Get category names for events by category
    const categories = await prisma.category.findMany({
      where: {
        id: {
          in: (eventsByCategory as any[]).map(item => item.categoryId)
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    // Map category names to the events by category data
    const eventsByCategoryWithNames = (eventsByCategory as any[]).map(item => {
      const category = categories.find(cat => cat.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Uncategorized',
        count: item._count.categoryId
      };
    });

    // Process user growth data
    const userGrowth = (userGrowthData as any[]).map(item => ({
      date: item.date,
      count: Number(item.count),
      total: Number(item.total)
    }));

    // Process registration stats
    const registrationStatsProcessed = {
      total: Number(registrationStats[0]?.total || 0),
      confirmed: Number(registrationStats[0]?.confirmed || 0),
      pending: Number(registrationStats[0]?.pending || 0),
      cancelled: Number(registrationStats[0]?.cancelled || 0),
      attended: Number(registrationStats[0]?.attended || 0)
    };

    // Calculate registration rate (confirmed / total registrations)
    const registrationRate = registrationStatsProcessed.total > 0 
      ? (registrationStatsProcessed.confirmed / registrationStatsProcessed.total) * 100 
      : 0;

    // Calculate attendance rate (attended / confirmed)
    const attendanceRate = registrationStatsProcessed.confirmed > 0 
      ? (registrationStatsProcessed.attended / registrationStatsProcessed.confirmed) * 100 
      : 0;

    return NextResponse.json({
      // User statistics
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        activeLast30Days: activeUsersLast30Days,
        byRole: usersByRole.map(item => ({
          role: item.role,
          count: item._count.role
        })),
        growth: userGrowth
      },
      
      // Event statistics
      events: {
        total: totalEvents,
        active: activeEvents,
        byStatus: eventsByStatus.map(item => ({
          status: item.status,
          count: item._count.status
        })),
        byCategory: eventsByCategoryWithNames
      },
      
      // Registration statistics
      registrations: {
        ...registrationStatsProcessed,
        registrationRate: Number(registrationRate.toFixed(1)),
        attendanceRate: Number(attendanceRate.toFixed(1)),
        recent: recentRegistrations.map(reg => ({
          id: reg.id,
          status: reg.status,
          registrationDate: reg.registrationDate,
          user: {
            id: reg.user.id,
            name: `${reg.user.firstName} ${reg.user.lastName}`,
            email: reg.user.email
          },
          event: {
            id: reg.event.id,
            title: reg.event.title
          }
        }))
      },
      
      // System metrics
      system: {
        lastUpdated: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}

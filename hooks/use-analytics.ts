import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AnalyticsData {
  users: {
    total: number;
    newToday: number;
    activeLast30Days: number;
    byRole: { role: string; count: number }[];
    growth: { date: string; count: number; total: number }[];
  };
  events: {
    total: number;
    active: number;
    byStatus: { status: string; count: number }[];
    byCategory: { categoryId: string; categoryName: string; count: number }[];
  };
  registrations: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    attended: number;
    registrationRate: number;
    attendanceRate: number;
    recent: Array<{
      id: string;
      status: string;
      registrationDate: string;
      user: {
        id: string;
        name: string;
        email: string;
      };
      event: {
        id: string;
        title: string;
      };
    }>;
  };
  system: {
    lastUpdated: string;
  };
}

export function useAnalytics() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role) {
      fetchData();
    }
  }, [status, session]);

  const refetch = () => {
    fetchData();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}

// Helper function to format numbers with commas
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Helper function to get a percentage value
export function getPercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Helper function to get a color based on status
export function getStatusColor(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PUBLISHED':
    case 'CONFIRMED':
    case 'ACTIVE':
      return 'bg-green-100 text-green-800';
    case 'PENDING':
    case 'DRAFT':
      return 'bg-yellow-100 text-yellow-800';
    case 'CANCELLED':
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'COMPLETED':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminDashboard } from '@/components/dashboard/AdminDashboard';

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect if not admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="container mx-auto py-8">
      <AdminDashboard />
    </div>
  );
}

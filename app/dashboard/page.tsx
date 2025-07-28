import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div className="container mx-auto py-8">
      <UserDashboard />
    </div>
  );
}

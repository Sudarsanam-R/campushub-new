import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp, Users, Calendar, Ticket, CheckCircle, Clock } from 'lucide-react';

const iconMap = {
  users: Users,
  events: Calendar,
  registrations: Ticket,
  confirmed: CheckCircle,
  pending: Clock,
} as const;

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon?: keyof typeof iconMap;
  trend?: {
    value: number;
    label: string;
  };
  loading?: boolean;
  className?: string;
};

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  loading = false,
  className,
}: StatCardProps) {
  const Icon = icon ? iconMap[icon] : null;
  const isPositive = trend?.value && trend.value >= 0;
  const TrendIcon = isPositive ? ArrowUp : ArrowDown;

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-4 w-4 text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div
            className={cn(
              'mt-2 flex items-center text-xs',
              isPositive ? 'text-green-500' : 'text-red-500'
            )}
          >
            <TrendIcon className="mr-1 h-3 w-3" />
            <span>
              {Math.abs(trend.value)}% {trend.label}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type StatCardGridProps = {
  children: React.ReactNode;
  className?: string;
};

export function StatCardGrid({ children, className }: StatCardGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
}

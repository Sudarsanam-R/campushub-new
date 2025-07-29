'use client';

import { useTheme } from 'next-themes';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = [
  '#0088FE', // blue
  '#00C49F', // teal
  '#FFBB28', // yellow
  '#FF8042', // orange
  '#8884D8', // purple
  '#FF6B6B', // red
  '#4ECDC4', // turquoise
  '#45B7D1', // light blue
];

type ChartType = 'area' | 'bar' | 'line' | 'pie' | 'donut';

type ChartData = {
  name: string | number;
  [key: string]: string | number;
}[];

type ChartSeries = {
  dataKey: string;
  name?: string;
  color?: string;
  stroke?: string;
  fill?: string;
}[];

interface ChartProps {
  title: string;
  description?: string;
  data: ChartData;
  series: ChartSeries;
  type?: ChartType;
  height?: number;
  className?: string;
  loading?: boolean;
  xAxisKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisFormatter?: (value: any, index: number) => string;
  yAxisFormatter?: (value: any, index: number) => string;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
  legendFormatter?: (value: string, entry: any, index: number) => React.ReactNode;
  children?: React.ReactNode;
}

export function AnalyticsChart({
  title,
  description,
  data = [],
  series = [],
  type = 'line',
  height = 300,
  className,
  loading = false,
  xAxisKey = 'name',
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
  showTooltip = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  xAxisFormatter,
  yAxisFormatter,
  tooltipFormatter,
  legendFormatter,
  children,
}: ChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const defaultXAxisFormatter = (value: any) => {
    if (typeof value === 'string' && !isNaN(Date.parse(value))) {
      return format(new Date(value), 'MMM d');
    }
    return value;
  };

  const defaultYAxisFormatter = (value: any) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value;
  };

  const defaultTooltipFormatter = (value: any, name: string, props: any) => {
    const seriesItem = series.find(s => s.dataKey === name);
    const displayName = seriesItem?.name || name;
    return [value, displayName];
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      );
    }

    if (!data || data.length === 0) {
      return (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          No data available
        </div>
      );
    }

    const renderCustomizedLabel = ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
      name,
    }: any) => {
      const RADIAN = Math.PI / 180;
      const radius = 25 + innerRadius + (outerRadius - innerRadius);
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill={isDark ? '#fff' : '#333'}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          className="text-xs"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      );
    };

    const commonProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#eee'} />}
              {showXAxis && (
                <XAxis
                  dataKey={xAxisKey}
                  stroke={isDark ? '#888' : '#666'}
                  tickFormatter={xAxisFormatter || defaultXAxisFormatter}
                  label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                />
              )}
              {showYAxis && (
                <YAxis
                  stroke={isDark ? '#888' : '#666'}
                  tickFormatter={yAxisFormatter || defaultYAxisFormatter}
                  label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                />
              )}
              {showTooltip && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e1e1e' : '#fff',
                    borderColor: isDark ? '#444' : '#ddd',
                  }}
                  formatter={tooltipFormatter || defaultTooltipFormatter}
                />
              )}
              {showLegend && (
                <Legend formatter={legendFormatter} />
              )}
              {series.map((s, i) => (
                <Area
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.stroke || s.color || COLORS[i % COLORS.length]}
                  fill={s.fill || `${s.color || COLORS[i % COLORS.length]}33`}
                  fillOpacity={0.8}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#eee'} />}
              {showXAxis && (
                <XAxis
                  dataKey={xAxisKey}
                  stroke={isDark ? '#888' : '#666'}
                  tickFormatter={xAxisFormatter || defaultXAxisFormatter}
                  label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                />
              )}
              {showYAxis && (
                <YAxis
                  stroke={isDark ? '#888' : '#666'}
                  tickFormatter={yAxisFormatter || defaultYAxisFormatter}
                  label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                />
              )}
              {showTooltip && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e1e1e' : '#fff',
                    borderColor: isDark ? '#444' : '#ddd',
                  }}
                  formatter={tooltipFormatter || defaultTooltipFormatter}
                />
              )}
              {showLegend && (
                <Legend formatter={legendFormatter} />
              )}
              {series.map((s, i) => (
                <Bar
                  key={s.dataKey}
                  dataKey={s.dataKey}
                  name={s.name}
                  fill={s.fill || s.color || COLORS[i % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#eee'} />}
              {showXAxis && (
                <XAxis
                  dataKey={xAxisKey}
                  stroke={isDark ? '#888' : '#666'}
                  tickFormatter={xAxisFormatter || defaultXAxisFormatter}
                  label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                />
              )}
              {showYAxis && (
                <YAxis
                  stroke={isDark ? '#888' : '#666'}
                  tickFormatter={yAxisFormatter || defaultYAxisFormatter}
                  label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                />
              )}
              {showTooltip && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e1e1e' : '#fff',
                    borderColor: isDark ? '#444' : '#ddd',
                  }}
                  formatter={tooltipFormatter || defaultTooltipFormatter}
                />
              )}
              {showLegend && (
                <Legend formatter={legendFormatter} />
              )}
              {series.map((s, i) => (
                <Line
                  key={s.dataKey}
                  type="monotone"
                  dataKey={s.dataKey}
                  name={s.name}
                  stroke={s.stroke || s.color || COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
      case 'donut':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={type === 'donut' ? '60%' : 0}
                outerRadius="80%"
                paddingAngle={5}
                dataKey={series[0]?.dataKey || 'value'}
                nameKey={xAxisKey}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              {showTooltip && (
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? '#1e1e1e' : '#fff',
                    borderColor: isDark ? '#444' : '#ddd',
                  }}
                  formatter={tooltipFormatter || defaultTooltipFormatter}
                />
              )}
              {showLegend && (
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  formatter={legendFormatter}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className={cn('h-[300px]', { 'h-[400px]': type === 'pie' || type === 'donut' })}>
        {renderChart()}
      </CardContent>
      {children}
    </Card>
  );
}

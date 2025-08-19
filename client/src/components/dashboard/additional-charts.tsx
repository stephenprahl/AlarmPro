import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { CustomerTypeDistribution, WeeklyJobsData, RevenueByJobType } from "@shared/schema";

export default function AdditionalCharts() {
  const { data: customerTypes = [], isLoading: customerTypesLoading } = useQuery<CustomerTypeDistribution[]>({
    queryKey: ["/api/dashboard/customer-type-distribution"],
  });

  const { data: weeklyJobs = [], isLoading: weeklyJobsLoading } = useQuery<WeeklyJobsData[]>({
    queryKey: ["/api/dashboard/weekly-jobs"],
  });

  const { data: revenueByType = [], isLoading: revenueLoading } = useQuery<RevenueByJobType[]>({
    queryKey: ["/api/dashboard/revenue-by-job-type"],
  });

  const isLoading = customerTypesLoading || weeklyJobsLoading || revenueLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.08) return null; // Don't show label if slice is less than 8%
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-sm font-medium">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customer Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Customer Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {customerTypes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {customerTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No customer data available</p>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-1 gap-2 mt-4">
            {customerTypes.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-700">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Jobs Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Weekly Job Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {weeklyJobs.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyJobs}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="jobs" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3}
                    name="Total Jobs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No weekly data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Job Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Revenue by Job Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {revenueByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByType} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="jobType" type="category" width={80} />
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No revenue data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { JobStatusDistribution, MonthlyTrend } from "@shared/schema";

export default function Charts() {
  const { data: statusDistribution = [], isLoading: statusLoading } = useQuery<JobStatusDistribution[]>({
    queryKey: ["/api/dashboard/job-status-distribution"],
  });

  const { data: monthlyTrends = [], isLoading: trendsLoading } = useQuery<MonthlyTrend[]>({
    queryKey: ["/api/dashboard/monthly-trends"],
  });

  if (statusLoading || trendsLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Job Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label if slice is less than 5%
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Job Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Job Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No job data available</p>
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center">
                <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-700">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Monthly Job Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Monthly Job Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jobs" fill="#3b82f6" name="Jobs" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No trend data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

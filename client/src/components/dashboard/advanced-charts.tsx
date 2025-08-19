import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { MonthlyTrend, WeeklyJobsData } from "@shared/schema";

export default function AdvancedCharts() {
  const { data: monthlyTrends = [], isLoading: trendsLoading } = useQuery<MonthlyTrend[]>({
    queryKey: ["/api/dashboard/monthly-trends"],
  });

  const { data: weeklyJobs = [], isLoading: weeklyLoading } = useQuery<WeeklyJobsData[]>({
    queryKey: ["/api/dashboard/weekly-jobs"],
  });

  const isLoading = trendsLoading || weeklyLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Process data for job type breakdown
  const jobTypeBreakdown = weeklyJobs.map(day => ({
    day: day.day,
    total: day.jobs,
    inspections: day.inspections,
    installations: day.installations,
    maintenance: day.maintenance,
    emergency: day.emergency
  }));

  // Performance indicators data
  const performanceData = monthlyTrends.slice(-6).map(trend => ({
    month: trend.month,
    jobs: trend.jobs,
    revenue: trend.revenue,
    avgRevenue: trend.jobs > 0 ? trend.revenue / trend.jobs : 0
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Combined Jobs & Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Jobs vs Revenue Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'revenue') return [`$${value.toLocaleString()}`, 'Revenue'];
                      if (name === 'avgRevenue') return [`$${value.toFixed(0)}`, 'Avg Revenue per Job'];
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="jobs" fill="#3b82f6" name="Jobs" />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Revenue"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="avgRevenue" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Avg Revenue per Job"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No performance data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Job Type Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">
            Weekly Job Type Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {jobTypeBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={jobTypeBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="inspections" stackId="a" fill="#f59e0b" name="Inspections" />
                  <Bar dataKey="installations" stackId="a" fill="#3b82f6" name="Installations" />
                  <Bar dataKey="maintenance" stackId="a" fill="#10b981" name="Maintenance" />
                  <Bar dataKey="emergency" stackId="a" fill="#ef4444" name="Emergency" />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#1f2937" 
                    strokeWidth={2}
                    name="Total Jobs"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No weekly breakdown data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
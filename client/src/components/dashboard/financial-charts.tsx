import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { MonthlyTrend, Job, Customer } from "@shared/schema";
import { TrendingUp, DollarSign, Calendar, Users } from "lucide-react";

export default function FinancialCharts() {
  const { data: monthlyTrends = [], isLoading: trendsLoading } = useQuery<MonthlyTrend[]>({
    queryKey: ["/api/dashboard/monthly-trends"],
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const isLoading = trendsLoading || jobsLoading || customersLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate revenue growth rate
  const revenueGrowthData = monthlyTrends.slice(-6).map((trend, index, arr) => {
    const prevRevenue = index > 0 ? arr[index - 1].revenue : trend.revenue;
    const growthRate = prevRevenue > 0 ? ((trend.revenue - prevRevenue) / prevRevenue) * 100 : 0;
    return {
      month: trend.month,
      revenue: trend.revenue,
      growthRate: isFinite(growthRate) ? growthRate : 0
    };
  });

  // Calculate completion rates by month
  const completionData = monthlyTrends.slice(-6).map(trend => {
    const monthJobs = jobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      const monthIndex = new Date().getMonth() - monthlyTrends.indexOf(trend);
      return jobDate.getMonth() === monthIndex;
    });
    
    const completedJobs = monthJobs.filter(job => job.status === "Completed").length;
    const completionRate = monthJobs.length > 0 ? (completedJobs / monthJobs.length) * 100 : 0;
    
    return {
      month: trend.month,
      completionRate: completionRate,
      totalJobs: monthJobs.length,
      completedJobs
    };
  });

  // Customer acquisition timeline
  const customerAcquisition = customers
    .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime())
    .reduce((acc, customer, index) => {
      const month = new Date(customer.createdAt!).toLocaleDateString('en-US', { month: 'short' });
      const existing = acc.find(item => item.month === month);
      if (existing) {
        existing.customers += 1;
        existing.cumulative = index + 1;
      } else {
        acc.push({
          month,
          customers: 1,
          cumulative: index + 1
        });
      }
      return acc;
    }, [] as { month: string; customers: number; cumulative: number }[]);

  // Revenue efficiency (revenue per job)
  const revenueEfficiency = monthlyTrends.slice(-6).map(trend => ({
    month: trend.month,
    efficiency: trend.jobs > 0 ? trend.revenue / trend.jobs : 0,
    totalJobs: trend.jobs,
    totalRevenue: trend.revenue
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Revenue Growth Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueGrowthData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Growth Rate']}
                />
                <Area 
                  type="monotone" 
                  dataKey="growthRate" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#revenueGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-2xl font-bold">
            {revenueGrowthData.length > 0 && revenueGrowthData[revenueGrowthData.length - 1].growthRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">vs previous month</p>
        </CardContent>
      </Card>

      {/* Job Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={completionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Completion Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="completionRate" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="text-2xl font-bold">
            {completionData.length > 0 && completionData[completionData.length - 1].completionRate.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">jobs completed on time</p>
        </CardContent>
      </Card>

      {/* Customer Growth */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customer Growth</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={customerAcquisition}>
                <defs>
                  <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#customerGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-2xl font-bold">
            {customerAcquisition.length > 0 && customerAcquisition[customerAcquisition.length - 1].cumulative}
          </div>
          <p className="text-xs text-muted-foreground">total customers</p>
        </CardContent>
      </Card>

      {/* Revenue Efficiency */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue per Job</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueEfficiency}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  formatter={(value: number) => [`$${value.toFixed(0)}`, 'Revenue per Job']}
                />
                <Bar dataKey="efficiency" fill="#f59e0b" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-2xl font-bold">
            ${revenueEfficiency.length > 0 && revenueEfficiency[revenueEfficiency.length - 1].efficiency.toFixed(0)}
          </div>
          <p className="text-xs text-muted-foreground">average per job</p>
        </CardContent>
      </Card>
    </div>
  );
}
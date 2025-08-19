import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  Treemap
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Job, Customer } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsOverview() {
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const isLoading = jobsLoading || customersLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>Loading Analytics...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Price vs Job Type Analysis
  const priceAnalysisData = jobs
    .filter(job => job.price && parseFloat(job.price) > 0)
    .map(job => ({
      x: parseFloat(job.price!),
      y: job.jobType,
      status: job.status,
      customerType: customers.find(c => c.id === job.customerId)?.customerType ?? "Unknown"
    }));

  // Business Health Metrics as Radial Chart
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(job => job.status === "Completed").length;
  const pendingJobs = jobs.filter(job => job.status === "Scheduled").length;
  const overdueJobs = jobs.filter(job => job.status === "Overdue").length;
  
  const healthMetrics = [
    {
      name: "Completed",
      value: totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0,
      fill: "#10b981"
    },
    {
      name: "Pending", 
      value: totalJobs > 0 ? (pendingJobs / totalJobs) * 100 : 0,
      fill: "#f59e0b"
    },
    {
      name: "Overdue",
      value: totalJobs > 0 ? (overdueJobs / totalJobs) * 100 : 0,
      fill: "#ef4444"
    }
  ];

  // Revenue Distribution by Customer Type and Job Type
  const revenueBreakdown = customers.reduce((acc, customer) => {
    const customerJobs = jobs.filter(job => 
      job.customerId === customer.id && 
      job.status === "Completed" && 
      job.price
    );
    
    const totalRevenue = customerJobs.reduce((sum, job) => sum + parseFloat(job.price || "0"), 0);
    
    if (totalRevenue > 0) {
      customerJobs.forEach(job => {
        const key = `${customer.customerType}-${job.jobType}`;
        const revenue = parseFloat(job.price || "0");
        
        if (!acc[key]) {
          acc[key] = {
            name: `${customer.customerType} ${job.jobType}`,
            value: 0,
            customerType: customer.customerType,
            jobType: job.jobType
          };
        }
        acc[key].value += revenue;
      });
    }
    
    return acc;
  }, {} as Record<string, any>);

  const treeMapData = Object.values(revenueBreakdown).filter(item => item.value > 0);

  // Performance Summary Cards
  const avgJobValue = jobs
    .filter(job => job.price && job.status === "Completed")
    .reduce((sum, job, _, arr) => sum + parseFloat(job.price!) / arr.length, 0);

  const completionRate = totalJobs > 0 ? (completedJobs / totalJobs * 100) : 0;
  
  const totalRevenue = jobs
    .filter(job => job.status === "Completed" && job.price)
    .reduce((sum, job) => sum + parseFloat(job.price!), 0);

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">${avgJobValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Avg Job Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Completion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">Active Customers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Health Radial Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Business Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {healthMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="20%" 
                    outerRadius="80%" 
                    data={healthMetrics}
                  >
                    <RadialBar dataKey="value" cornerRadius={10} />
                    <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Percentage']} />
                    <Legend />
                  </RadialBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No health data available</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {completedJobs} Completed
              </Badge>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                {pendingJobs} Pending
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {overdueJobs} Overdue
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Price Analysis Scatter Plot */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Price Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {priceAnalysisData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={priceAnalysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Price"
                      tickFormatter={(value) => `$${value}`}
                    />
                    <YAxis type="category" dataKey="y" name="Job Type" />
                    <Tooltip 
                      formatter={(value: any, name: string) => {
                        if (name === "Price") return [`$${value}`, name];
                        return [value, name];
                      }}
                    />
                    <Scatter 
                      dataKey="x" 
                      fill="#3b82f6"
                      fillOpacity={0.7}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No pricing data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Revenue Breakdown TreeMap */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Revenue Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {treeMapData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={treeMapData}
                    dataKey="value"
                    aspectRatio={4/3}
                    stroke="#fff"
                    fill="#3b82f6"
                  >
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                    />
                  </Treemap>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No revenue breakdown available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
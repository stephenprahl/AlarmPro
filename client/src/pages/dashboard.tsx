import StatsCards from "@/components/dashboard/stats-cards";
import Charts from "@/components/dashboard/charts";
import AdditionalCharts from "@/components/dashboard/additional-charts";
import AdvancedCharts from "@/components/dashboard/advanced-charts";
import FinancialCharts from "@/components/dashboard/financial-charts";
import AnalyticsOverview from "@/components/dashboard/analytics-overview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";

export default function Dashboard() {
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const upcomingJobs = jobs
    .filter(job => job.status === "Scheduled")
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 3);

  const recentActivities = jobs
    .filter(job => job.status === "Completed")
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 4);

  const getJobTypeColor = (type: string) => {
    const colors = {
      "Inspection": "bg-yellow-100 text-yellow-800",
      "Installation": "bg-blue-100 text-blue-800", 
      "Maintenance": "bg-green-100 text-green-800",
      "Emergency": "bg-red-100 text-red-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "Scheduled": "bg-yellow-100 text-yellow-800",
      "In Progress": "bg-blue-100 text-blue-800",
      "Completed": "bg-green-100 text-green-800",
      "Overdue": "bg-red-100 text-red-800",
      "Cancelled": "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  };

  if (isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <StatsCards />
      
      {/* Financial Performance Charts */}
      <FinancialCharts />
      
      {/* Charts Row */}
      <Charts />
      
      {/* Additional Charts Row */}
      <AdditionalCharts />
      
      {/* Advanced Charts Row */}
      <AdvancedCharts />
      
      {/* Analytics Overview */}
      <AnalyticsOverview />
      
      {/* Recent Activities and Upcoming Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((job) => (
                  <div key={job.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium truncate">
                        {job.title} completed
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTimeAgo(new Date(job.createdAt!))}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Upcoming Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Upcoming Jobs
            </CardTitle>
            <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingJobs.length > 0 ? (
                upcomingJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{job.title}</p>
                        <p className="text-sm text-gray-600 truncate">{job.description}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>{formatDate(job.scheduledDate)} - {job.scheduledTime}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className={getJobTypeColor(job.jobType)}>
                        {job.jobType}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No upcoming jobs scheduled</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

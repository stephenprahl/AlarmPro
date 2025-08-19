import { Card, CardContent } from "@/components/ui/card";
import { Users, ClipboardCheck, CheckCircle, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { DashboardStats } from "@shared/schema";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      change: "+12%",
      changeText: "from last month",
    },
    {
      title: "Pending Inspections", 
      value: stats.pendingInspections,
      icon: ClipboardCheck,
      color: "bg-yellow-100 text-yellow-600",
      change: null,
      changeText: "Due this week",
    },
    {
      title: "Completed This Month",
      value: stats.completedThisMonth,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600", 
      change: "+8%",
      changeText: "vs last month",
    },
    {
      title: "Monthly Revenue",
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-100 text-purple-600",
      change: "+15%",
      changeText: "from last month",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {card.change && (
                  <span className="text-green-600 font-medium">{card.change}</span>
                )}
                <span className={`text-gray-500 ${card.change ? 'ml-1' : ''}`}>
                  {card.changeText}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

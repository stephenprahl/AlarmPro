import { Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

const pageTitles = {
  "/": "Dashboard",
  "/customers": "Customer Management", 
  "/calendar": "Job Calendar",
  "/jobs": "Jobs",
  "/upload": "Import Data",
};

export default function Header() {
  const [location] = useLocation();
  const title = pageTitles[location as keyof typeof pageTitles] || "Dashboard";

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search..."
              className="pl-10 w-64"
            />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}

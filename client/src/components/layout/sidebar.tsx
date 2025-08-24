import { Calendar, Flame, LayoutDashboard, Upload, User, Users, Wrench } from "lucide-react";
import { Link, useLocation } from "wouter";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/customers", label: "Customers", icon: Users },
  { path: "/calendar", label: "Calendar", icon: Calendar },
  { path: "/jobs", label: "Jobs", icon: Wrench },
  { path: "/upload", label: "Import Data", icon: Upload },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex-shrink-0">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-6 bg-primary-600">
          <Flame className="text-white text-2xl mr-3" />
          <h1 className="text-white text-xl font-bold">Flame Alarm Manager</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;

            return (
              <Link key={item.path} href={item.path}>
                <div className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer ${isActive
                    ? "text-primary-600 bg-primary-50"
                    : "text-gray-700 hover:bg-gray-100"
                  }`}>
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="text-primary-600 w-5 h-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">John Smith</p>
              <p className="text-xs text-gray-500">Business Owner</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

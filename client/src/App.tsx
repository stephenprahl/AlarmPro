import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Calendar from "@/pages/calendar";
import Customers from "@/pages/customers";
import Dashboard from "@/pages/dashboard";
import Jobs from "@/pages/jobs";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";
import Register from "@/pages/register";
import Upload from "@/pages/upload";
import Welcome from "@/pages/welcome";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";

function ProtectedRouter() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Place all hooks at the top level, before any conditional logic
  useEffect(() => {
    if (!isLoading && isAuthenticated && ["/login", "/register", "/welcome"].includes(location)) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  // Then handle conditional rendering
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route component={Welcome} />
      </Switch>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/customers" component={Customers} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/jobs" component={Jobs} />
            <Route path="/upload" component={Upload} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <ProtectedRouter />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

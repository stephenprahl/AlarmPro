import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Calendar, Clock, FileText, Shield, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Welcome() {
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: <Users className="w-8 h-8 text-blue-600" />,
      title: "Customer Management",
      description: "Keep track of all your customers, their contact information, and service history."
    },
    {
      icon: <Calendar className="w-8 h-8 text-green-600" />,
      title: "Job Scheduling",
      description: "Schedule installations, maintenance, and inspections with an intuitive calendar system."
    },
    {
      icon: <Shield className="w-8 h-8 text-purple-600" />,
      title: "Inspection Tracking",
      description: "Never miss an inspection deadline with automated tracking and reminders."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Business Analytics",
      description: "Get insights into your business performance with detailed reports and statistics."
    },
    {
      icon: <FileText className="w-8 h-8 text-teal-600" />,
      title: "Data Import",
      description: "Import customer data from spreadsheets to get started quickly."
    },
    {
      icon: <Clock className="w-8 h-8 text-red-600" />,
      title: "Time Management",
      description: "Track job durations and optimize your scheduling for maximum efficiency."
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AlarmPro</h1>
          </div>
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={() => setLocation("/login")}
            >
              Sign In
            </Button>
            <Button
              onClick={() => setLocation("/register")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Manage Your Alarm Business
            <span className="text-blue-600 block">Like a Pro</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Streamline your alarm system business with comprehensive customer management,
            job scheduling, and inspection tracking - all in one powerful platform.
          </p>
          <div className="space-x-4">
            <Button
              size="lg"
              onClick={() => setLocation("/register")}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLocation("/login")}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Run Your Business
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From customer management to job scheduling, we've got all the tools
            you need to grow your alarm system business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  {feature.icon}
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Transform Your Business?
          </h3>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of alarm system professionals who trust AlarmPro to manage their business.
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/register")}
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">AlarmPro</span>
          </div>
          <p className="text-gray-400">
            © 2025 AlarmPro. All rights reserved. Built for alarm system professionals - App by <a href="https://stephenprahl.vercel.app" className="text-blue-500">Stephen Prahl</a>.
          </p>
        </div>
      </footer>
    </div>
  );
}

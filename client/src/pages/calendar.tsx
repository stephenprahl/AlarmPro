import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import CalendarGrid from "@/components/calendar/calendar-grid";
import JobForm from "@/components/jobs/job-form";
import JobDetailsDialog from "@/components/calendar/job-details-dialog";
import { useState } from "react";
import { Job } from "@shared/schema";

export default function Calendar() {
  const [showJobForm, setShowJobForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowJobForm(true);
  };

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
  };

  const handleJobFormClose = () => {
    setShowJobForm(false);
    setSelectedDate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Job Calendar</h3>
        <Button onClick={() => setShowJobForm(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Job
        </Button>
      </div>

      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">{monthName}</CardTitle>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={() => navigateMonth("prev")}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigateMonth("next")}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CalendarGrid 
            currentDate={currentDate} 
            onDateClick={handleDateClick}
            onJobClick={handleJobClick}
          />
        </CardContent>
      </Card>

      {/* Job Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Job Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
              <span className="text-sm">Inspection</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm">Installation</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm">Maintenance</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm">Emergency</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Job Form Modal */}
      <JobForm 
        isOpen={showJobForm}
        onClose={handleJobFormClose}
        selectedDate={selectedDate}
      />

      {/* Job Details Dialog */}
      <JobDetailsDialog 
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  );
}

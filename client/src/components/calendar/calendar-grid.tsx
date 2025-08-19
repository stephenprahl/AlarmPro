import { useQuery } from "@tanstack/react-query";
import { Job } from "@shared/schema";

interface CalendarGridProps {
  currentDate: Date;
  onDateClick?: (date: Date) => void;
  onJobClick?: (job: Job) => void;
}

export default function CalendarGrid({ currentDate, onDateClick, onJobClick }: CalendarGridProps) {
  const { data: jobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and how many days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Generate calendar days
  const days = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevMonthDay = new Date(year, month, -startingDayOfWeek + i + 1);
    days.push({
      date: prevMonthDay.getDate(),
      isCurrentMonth: false,
      fullDate: prevMonthDay,
    });
  }
  
  // Add days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = new Date(year, month, day);
    days.push({
      date: day,
      isCurrentMonth: true,
      fullDate,
    });
  }
  
  // Add days for next month to fill grid
  const remainingCells = 42 - days.length; // 6 rows × 7 days
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthDay = new Date(year, month + 1, day);
    days.push({
      date: day,
      isCurrentMonth: false,
      fullDate: nextMonthDay,
    });
  }

  const getJobsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return jobs.filter(job => job.scheduledDate === dateStr);
  };

  const getJobTypeColor = (type: string) => {
    const colors = {
      "Inspection": "bg-yellow-100 text-yellow-800",
      "Installation": "bg-blue-100 text-blue-800",
      "Maintenance": "bg-green-100 text-green-800", 
      "Emergency": "bg-red-100 text-red-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
      {/* Header Row */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
        <div key={day} className="bg-gray-50 p-3 text-center text-xs font-medium text-gray-500">
          {day}
        </div>
      ))}
      
      {/* Calendar Days */}
      {days.map((day, index) => {
        const dayJobs = getJobsForDate(day.fullDate);
        const todayClass = isToday(day.fullDate) ? "bg-primary-50 border-2 border-primary-500" : "bg-white";
        const textClass = day.isCurrentMonth ? "text-gray-900" : "text-gray-400";
        
        return (
          <div
            key={index}
            className={`${todayClass} p-3 h-24 text-sm ${textClass} relative cursor-pointer hover:bg-gray-50`}
            onClick={() => onDateClick?.(day.fullDate)}
          >
            <span className={isToday(day.fullDate) ? "font-semibold" : ""}>{day.date}</span>
            
            {/* Jobs for this day */}
            <div className="absolute bottom-1 left-1 right-1 space-y-1">
              {dayJobs.slice(0, 2).map(job => (
                <div
                  key={job.id}
                  className={`text-xs px-1 rounded truncate cursor-pointer hover:opacity-80 ${getJobTypeColor(job.jobType)}`}
                  title={`${job.title} - ${job.scheduledTime}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onJobClick?.(job);
                  }}
                >
                  {job.title.length > 12 ? `${job.title.slice(0, 12)}...` : job.title}
                </div>
              ))}
              {dayJobs.length > 2 && (
                <div className="text-xs text-gray-500 px-1">
                  +{dayJobs.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

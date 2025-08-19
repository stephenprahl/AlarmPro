import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Job, Customer } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, User, MapPin, DollarSign, FileText } from "lucide-react";

interface JobDetailsDialogProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobDetailsDialog({ job, isOpen, onClose }: JobDetailsDialogProps) {
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  if (!job) return null;

  const customer = customers.find(c => c.id === job.customerId);

  const getStatusColor = (status: string) => {
    const colors = {
      "Scheduled": "bg-blue-100 text-blue-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      "Completed": "bg-green-100 text-green-800",
      "Overdue": "bg-red-100 text-red-800",
      "Cancelled": "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Job Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Job Title and Status */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">{job.title}</h3>
            <div className="flex space-x-2">
              <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
              <Badge className={getJobTypeColor(job.jobType)}>{job.jobType}</Badge>
            </div>
          </div>

          {/* Job Description */}
          {job.description && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Description</span>
              </div>
              <p className="text-sm text-gray-600 pl-6">{job.description}</p>
            </div>
          )}

          {/* Customer Information */}
          {customer && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Customer</span>
              </div>
              <div className="pl-6 space-y-1">
                <p className="text-sm font-medium text-gray-900">{customer.companyName}</p>
                <p className="text-sm text-gray-600">{customer.contactPerson}</p>
                {customer.phone && (
                  <p className="text-sm text-gray-600">{customer.phone}</p>
                )}
                {customer.email && (
                  <p className="text-sm text-gray-600">{customer.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Address */}
          {customer?.address && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Address</span>
              </div>
              <p className="text-sm text-gray-600 pl-6">{customer.address}</p>
            </div>
          )}

          {/* Schedule Information */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Schedule</span>
            </div>
            <div className="pl-6 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Date:</span>
                <span className="text-sm font-medium">
                  {new Date(job.scheduledDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Time:</span>
                <span className="text-sm font-medium">{job.scheduledTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Duration:</span>
                <span className="text-sm font-medium">{job.estimatedDuration} minutes</span>
              </div>
            </div>
          </div>

          {/* Price Information */}
          {job.price && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Price</span>
              </div>
              <p className="text-sm font-medium text-gray-900 pl-6">${parseFloat(job.price).toLocaleString()}</p>
            </div>
          )}

          {/* Notes */}
          {job.notes && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Notes</span>
              </div>
              <p className="text-sm text-gray-600 pl-6">{job.notes}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button className="flex-1">
              Edit Job
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
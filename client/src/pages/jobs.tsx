import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Job, Customer } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import JobForm from "@/components/jobs/job-form";
import { useState } from "react";

export default function Jobs() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/jobs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/job-status-distribution"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-trends"] });
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    },
  });

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesType = typeFilter === "all" || job.jobType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.companyName || "Unknown Customer";
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

  const getJobTypeColor = (type: string) => {
    const colors = {
      "Inspection": "bg-yellow-100 text-yellow-800",
      "Installation": "bg-blue-100 text-blue-800",
      "Maintenance": "bg-green-100 text-green-800",
      "Emergency": "bg-red-100 text-red-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleDeleteJob = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteJobMutation.mutate(id);
    }
  };

  if (jobsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-gray-500">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Jobs</h3>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Job
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <Input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Inspection">Inspection</SelectItem>
              <SelectItem value="Installation">Installation</SelectItem>
              <SelectItem value="Maintenance">Maintenance</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Jobs Grid */}
      <div className="grid gap-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(job => (
            <Card key={job.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className={getJobTypeColor(job.jobType)}>
                        {job.jobType}
                      </Badge>
                      <Badge variant="secondary" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{job.description}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <strong className="text-gray-700 mr-2">Customer:</strong>
                      {getCustomerName(job.customerId)}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(job.scheduledDate)}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.scheduledTime}
                    </div>
                    {job.price && (
                      <div className="flex items-center">
                        <strong className="text-gray-700 mr-1">Price:</strong>
                        ${parseFloat(job.price).toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  {job.notes && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {job.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-900"
                  onClick={() => handleDeleteJob(job.id, job.title)}
                  disabled={deleteJobMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No jobs found matching your filters</p>
          </Card>
        )}
      </div>

      {/* Job Form Modal */}
      <JobForm 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
      />
    </div>
  );
}

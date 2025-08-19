import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2 } from "lucide-react";
import { Customer } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CustomerTableProps {
  searchTerm: string;
  typeFilter: string;
  statusFilter: string;
}

export default function CustomerTable({ searchTerm, typeFilter, statusFilter }: CustomerTableProps) {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: customers = [], isLoading } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    },
  });

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = !searchTerm || 
      customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || customer.customerType === typeFilter;
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);

  const getTypeColor = (type: string) => {
    const colors = {
      "Commercial": "bg-blue-100 text-blue-800",
      "Residential": "bg-green-100 text-green-800", 
      "Industrial": "bg-purple-100 text-purple-800",
    };
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusColor = (status: string) => {
    const colors = {
      "Active": "bg-green-100 text-green-800",
      "Inactive": "bg-gray-100 text-gray-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const handleDeleteCustomer = async (id: string, companyName: string) => {
    if (window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      deleteCustomerMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading customers...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Inspection
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Due
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedCustomers.length > 0 ? (
              paginatedCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.companyName}</div>
                      <div className="text-sm text-gray-500">{customer.address}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{customer.contactPerson}</div>
                    <div className="text-sm text-gray-500">{customer.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className={getTypeColor(customer.customerType)}>
                      {customer.customerType}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(customer.lastInspection)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(customer.nextDue)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="secondary" className={getStatusColor(customer.status)}>
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleDeleteCustomer(customer.id, customer.companyName)}
                        disabled={deleteCustomerMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No customers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(startIndex + itemsPerPage, filteredCustomers.length)}
              </span>{" "}
              of <span className="font-medium">{filteredCustomers.length}</span> results
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

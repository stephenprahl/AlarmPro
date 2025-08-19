import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import CustomerTable from "@/components/customers/customer-table";
import CustomerForm from "@/components/customers/customer-form";
import { useState } from "react";

export default function Customers() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Customer Management</h3>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <Input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Commercial">Commercial</SelectItem>
              <SelectItem value="Residential">Residential</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Customer Table */}
      <CustomerTable 
        searchTerm={searchTerm}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
      />
      
      {/* Add Customer Form Modal */}
      <CustomerForm 
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
      />
    </div>
  );
}

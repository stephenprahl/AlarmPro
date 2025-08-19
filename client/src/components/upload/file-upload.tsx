import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, FileSpreadsheet, Upload } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload/excel', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/job-status-distribution"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-trends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/customer-type-distribution"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/weekly-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/revenue-by-job-type"] });
      
      toast({
        title: "Success",
        description: `File uploaded successfully! Created ${data.customersCreated} customers and ${data.jobsCreated} jobs.`,
      });
      setSelectedFile(null);
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to upload file",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadFileMutation.mutate(selectedFile);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-12">
          <CloudUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload Excel File</h4>
          <p className="text-sm text-gray-500 mb-6">
            Drag and drop your Excel file here, or click to browse
          </p>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
              isDragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFileSelect}
            />
            
            <div className="space-y-2">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-green-600" />
              <p className="text-sm text-gray-600">
                Click to select file or drag and drop
              </p>
              <p className="text-xs text-gray-400">Supports .xlsx and .xls files</p>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-sm text-green-800">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span>({formatFileSize(selectedFile.size)})</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-center mt-6">
            <Button 
              onClick={handleUpload}
              disabled={!selectedFile || uploadFileMutation.isPending}
              className="flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploadFileMutation.isPending ? "Uploading..." : "Process Upload"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

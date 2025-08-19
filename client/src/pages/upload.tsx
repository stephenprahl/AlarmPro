import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CloudUpload, FileSpreadsheet, Download, Upload } from "lucide-react";
import FileUpload from "@/components/upload/file-upload";

export default function UploadPage() {
  const handleDownloadTemplate = (templateType: string) => {
    const link = document.createElement('a');
    link.href = `/api/download/template/${templateType}`;
    link.download = `${templateType}_template.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const recentUploads = [
    {
      id: 1,
      filename: "customers_august_2024.xlsx",
      uploadedAt: "2 hours ago",
      recordsProcessed: 47,
      status: "Success"
    },
    {
      id: 2,
      filename: "jobs_schedule_q3.xlsx", 
      uploadedAt: "1 day ago",
      recordsProcessed: 23,
      status: "Success"
    }
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Import Data from Excel</h3>
      
      {/* Upload Section */}
      <FileUpload />
      
      {/* Upload History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUploads.length > 0 ? (
              recentUploads.map(upload => (
                <div key={upload.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="text-green-600 w-5 h-5" />
                    <div>
                      <p className="font-medium text-gray-900">{upload.filename}</p>
                      <p className="text-sm text-gray-500">
                        Uploaded {upload.uploadedAt} • {upload.recordsProcessed} records processed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {upload.status}
                    </Badge>
                    <Button variant="ghost" size="sm" title="Download">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No recent uploads</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Template Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Excel Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Download these templates to ensure your data is formatted correctly for import.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Customer Template</h5>
                  <p className="text-sm text-gray-500">Format for importing customer data</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadTemplate('customers')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-gray-900">Jobs Template</h5>
                  <p className="text-sm text-gray-500">Format for importing job schedules</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDownloadTemplate('jobs')}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

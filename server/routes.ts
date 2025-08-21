import { insertCustomerSchema, insertJobSchema } from "@shared/schema";
import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import * as XLSX from "xlsx";
import { registerAuthRoutes } from "./auth-routes";
import { storage } from "./storage";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Register authentication routes
  registerAuthRoutes(app, storage);
  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(req.params.id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      res.status(400).json({ message: "Invalid customer data", error });
    }
  });

  app.put("/api/customers/:id", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(req.params.id, customerData);
      res.json(customer);
    } catch (error) {
      res.status(400).json({ message: "Failed to update customer", error });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCustomer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer" });
    }
  });

  // Job routes
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  app.get("/api/customers/:id/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobsByCustomer(req.params.id);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer jobs" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ message: "Invalid job data", error });
    }
  });

  app.put("/api/jobs/:id", async (req, res) => {
    try {
      const jobData = insertJobSchema.partial().parse(req.body);
      const job = await storage.updateJob(req.params.id, jobData);
      res.json(job);
    } catch (error) {
      res.status(400).json({ message: "Failed to update job", error });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteJob(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete job" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/job-status-distribution", async (req, res) => {
    try {
      const distribution = await storage.getJobStatusDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job status distribution" });
    }
  });

  app.get("/api/dashboard/monthly-trends", async (req, res) => {
    try {
      const trends = await storage.getMonthlyTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly trends" });
    }
  });

  app.get("/api/dashboard/customer-type-distribution", async (req, res) => {
    try {
      const distribution = await storage.getCustomerTypeDistribution();
      res.json(distribution);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer type distribution" });
    }
  });

  app.get("/api/dashboard/weekly-jobs", async (req, res) => {
    try {
      const weeklyData = await storage.getWeeklyJobsData();
      res.json(weeklyData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch weekly jobs data" });
    }
  });

  app.get("/api/dashboard/revenue-by-job-type", async (req, res) => {
    try {
      const revenueData = await storage.getRevenueByJobType();
      res.json(revenueData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch revenue by job type" });
    }
  });

  // File upload route
  app.post("/api/upload/excel", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Parse Excel file
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      let customersCreated = 0;
      let jobsCreated = 0;

      // Process customers if Customers sheet exists
      if (workbook.SheetNames.includes('Customers')) {
        const customersSheet = workbook.Sheets['Customers'];
        const customersData = XLSX.utils.sheet_to_json(customersSheet, { header: 1 });

        // Skip header row
        for (let i = 1; i < customersData.length; i++) {
          const row = customersData[i] as any[];
          if (row.length >= 4 && row[0]) { // Ensure we have enough data
            try {
              const customerData = {
                companyName: String(row[0] || ''),
                contactPerson: String(row[1] || ''),
                email: String(row[2] || ''),
                phone: String(row[3] || ''),
                address: String(row[4] || ''),
                customerType: (row[5] && ['Commercial', 'Residential', 'Industrial'].includes(String(row[5])))
                  ? String(row[5]) as 'Commercial' | 'Residential' | 'Industrial'
                  : 'Commercial',
                status: 'Active' as const
              };

              const validatedData = insertCustomerSchema.parse(customerData);
              await storage.createCustomer(validatedData);
              customersCreated++;
            } catch (error) {
              console.log(`Skipped invalid customer row ${i}:`, error);
            }
          }
        }
      }

      // Process jobs if Jobs sheet exists
      if (workbook.SheetNames.includes('Jobs')) {
        const jobsSheet = workbook.Sheets['Jobs'];
        const jobsData = XLSX.utils.sheet_to_json(jobsSheet, { header: 1 });
        const customers = await storage.getCustomers();

        // Skip header row
        for (let i = 1; i < jobsData.length; i++) {
          const row = jobsData[i] as any[];
          if (row.length >= 6 && row[0] && row[1]) { // Ensure we have enough data
            try {
              // Find customer by companyName or create if doesn't exist
              let customer = customers.find(c =>
                c.companyName.toLowerCase() === String(row[0]).toLowerCase()
              );

              if (!customer && row[0]) {
                // Create customer if not found
                const newCustomerData = {
                  companyName: String(row[0]),
                  contactPerson: String(row[0]),
                  email: String(row[7] || ''),
                  phone: String(row[8] || ''),
                  address: String(row[9] || ''),
                  customerType: 'Commercial' as const,
                  status: 'Active' as const
                };
                customer = await storage.createCustomer(newCustomerData);
                customers.push(customer);
              }

              if (customer) {
                const scheduledDate = row[4] ?
                  (row[4] instanceof Date ? row[4] : new Date(row[4])).toISOString().split('T')[0] :
                  new Date().toISOString().split('T')[0];

                const jobData = {
                  customerId: customer.id,
                  title: String(row[1] || 'Untitled Job'),
                  description: String(row[2] || ''),
                  jobType: (row[3] && ['Inspection', 'Installation', 'Maintenance', 'Emergency'].includes(String(row[3])))
                    ? String(row[3]) as 'Inspection' | 'Installation' | 'Maintenance' | 'Emergency'
                    : 'Inspection',
                  scheduledDate,
                  scheduledTime: String(row[5] || '09:00'),
                  estimatedDuration: Number(row[6]) || 60,
                  price: String(row[10] || ''),
                  status: 'Scheduled' as const,
                  notes: String(row[11] || '')
                };

                const validatedData = insertJobSchema.parse(jobData);
                await storage.createJob(validatedData);
                jobsCreated++;
              }
            } catch (error) {
              console.log(`Skipped invalid job row ${i}:`, error);
            }
          }
        }
      }

      res.json({
        success: true,
        filename: req.file.originalname,
        size: req.file.size,
        customersCreated,
        jobsCreated,
        message: `Successfully processed ${customersCreated} customers and ${jobsCreated} jobs from Excel file.`
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to process Excel file", error: String(error) });
    }
  });

  // Download sample Excel templates
  app.get("/api/download/template/:type", async (req, res) => {
    try {
      const { type } = req.params;

      let workbook = XLSX.utils.book_new();

      if (type === 'customers') {
        const customersData = [
          ['Company Name', 'Contact Person', 'Email', 'Phone', 'Address', 'Customer Type'],
          ['ABC Fire Safety', 'John Smith', 'john@abcfire.com', '555-0123', '123 Main St, City, ST 12345', 'Commercial'],
          ['XYZ Restaurant', 'Jane Doe', 'jane@xyzrest.com', '555-0456', '456 Oak Ave, City, ST 12345', 'Commercial'],
          ['Home Owner', 'Bob Johnson', 'bob@email.com', '555-0789', '789 Pine Rd, City, ST 12345', 'Residential']
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(customersData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

      } else if (type === 'jobs') {
        const jobsData = [
          ['Customer Name', 'Job Title', 'Description', 'Job Type', 'Scheduled Date', 'Scheduled Time', 'Duration (min)', 'Customer Email', 'Customer Phone', 'Customer Address', 'Price', 'Notes'],
          ['ABC Fire Safety', 'Annual Inspection', 'Regular fire alarm system inspection', 'Inspection', '2024-08-20', '09:00', '60', 'john@abcfire.com', '555-0123', '123 Main St, City, ST 12345', '150', 'Contact before arrival'],
          ['XYZ Restaurant', 'System Installation', 'Install new fire suppression system', 'Installation', '2024-08-22', '10:00', '180', 'jane@xyzrest.com', '555-0456', '456 Oak Ave, City, ST 12345', '2500', 'Large commercial kitchen'],
          ['Home Owner', 'Detector Maintenance', 'Replace smoke detector batteries', 'Maintenance', '2024-08-25', '14:00', '30', 'bob@email.com', '555-0789', '789 Pine Rd, City, ST 12345', '75', 'Residential service']
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(jobsData);
        XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");

      } else {
        return res.status(400).json({ message: "Invalid template type" });
      }

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Disposition', `attachment; filename="${type}_template.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);

    } catch (error) {
      res.status(500).json({ message: "Failed to generate template", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

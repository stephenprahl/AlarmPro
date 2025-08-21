import { type Customer, type CustomerTypeDistribution, type DashboardStats, type InsertCustomer, type InsertJob, type Job, type JobStatusDistribution, type MonthlyTrend, type RevenueByJobType, type WeeklyJobsData } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Customer operations
  getCustomers(): Promise<Customer[]>;
  getCustomer(id: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer>;
  deleteCustomer(id: string): Promise<boolean>;

  // Job operations
  getJobs(): Promise<Job[]>;
  getJob(id: string): Promise<Job | undefined>;
  getJobsByCustomer(customerId: string): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: string): Promise<boolean>;

  // Dashboard statistics
  getDashboardStats(): Promise<DashboardStats>;
  getJobStatusDistribution(): Promise<JobStatusDistribution[]>;
  getMonthlyTrends(): Promise<MonthlyTrend[]>;
  getCustomerTypeDistribution(): Promise<CustomerTypeDistribution[]>;
  getWeeklyJobsData(): Promise<WeeklyJobsData[]>;
  getRevenueByJobType(): Promise<RevenueByJobType[]>;
}

export class MemStorage implements IStorage {
  private customers: Map<string, Customer>;
  private jobs: Map<string, Job>;

  constructor() {
    this.customers = new Map();
    this.jobs = new Map();

    // Initialize with sample data for demo purposes
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample customers
    const customer1: Customer = {
      id: randomUUID(),
      companyName: "ABC Corporation",
      contactPerson: "John Manager",
      email: "john@abc-corp.com",
      phone: "(555) 123-4567",
      address: "123 Business Ave, City, ST 12345",
      customerType: "Commercial",
      status: "Active",
      lastInspection: "2024-03-15",
      nextDue: "2024-09-15",
      createdAt: new Date("2024-01-15"),
    };

    const customer2: Customer = {
      id: randomUUID(),
      companyName: "XYZ Manufacturing",
      contactPerson: "Sarah Wilson",
      email: "sarah@xyz-mfg.com",
      phone: "(555) 234-5678",
      address: "456 Industrial Rd, City, ST 12345",
      customerType: "Industrial",
      status: "Active",
      lastInspection: "2024-04-02",
      nextDue: "2024-10-02",
      createdAt: new Date("2024-02-01"),
    };

    const customer3: Customer = {
      id: randomUUID(),
      companyName: "Metropolitan Office Building",
      contactPerson: "Mike Johnson",
      email: "mike@metro-office.com",
      phone: "(555) 345-6789",
      address: "789 Downtown St, City, ST 12345",
      customerType: "Commercial",
      status: "Active",
      lastInspection: "2024-02-28",
      nextDue: "2024-08-28",
      createdAt: new Date("2023-12-10"),
    };

    this.customers.set(customer1.id, customer1);
    this.customers.set(customer2.id, customer2);
    this.customers.set(customer3.id, customer3);

    // Sample jobs
    const job1: Job = {
      id: randomUUID(),
      customerId: customer1.id,
      title: "Fire Safety Inspection",
      description: "Annual fire safety inspection and equipment check",
      jobType: "Inspection",
      status: "Scheduled",
      scheduledDate: "2024-08-20",
      scheduledTime: "10:00",
      estimatedDuration: 120,
      price: "250.00",
      notes: "Include sprinkler system check",
      createdAt: new Date(),
    };

    const job2: Job = {
      id: randomUUID(),
      customerId: customer2.id,
      title: "Alarm System Installation",
      description: "New fire alarm system installation in warehouse",
      jobType: "Installation",
      status: "In Progress",
      scheduledDate: "2024-08-18",
      scheduledTime: "09:00",
      estimatedDuration: 480,
      price: "1500.00",
      notes: "Industrial grade system required",
      createdAt: new Date(),
    };

    const job3: Job = {
      id: randomUUID(),
      customerId: customer3.id,
      title: "Monthly Maintenance",
      description: "Routine maintenance of fire safety systems",
      jobType: "Maintenance",
      status: "Completed",
      scheduledDate: "2024-08-15",
      scheduledTime: "14:00",
      estimatedDuration: 90,
      price: "180.00",
      notes: "All systems functioning properly",
      createdAt: new Date(),
    };

    this.jobs.set(job1.id, job1);
    this.jobs.set(job2.id, job2);
    this.jobs.set(job3.id, job3);
  }

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return Array.from(this.customers.values()).sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    return this.customers.get(id);
  }

  async createCustomer(customerData: InsertCustomer): Promise<Customer> {
    const id = randomUUID();
    const customer: Customer = {
      ...customerData,
      id,
      createdAt: new Date(),
    } as Customer;
    this.customers.set(id, customer);
    return customer;
  }

  async updateCustomer(id: string, customerData: Partial<InsertCustomer>): Promise<Customer> {
    const existing = this.customers.get(id);
    if (!existing) {
      throw new Error("Customer not found");
    }
    const updated = { ...existing, ...customerData } as Customer;
    this.customers.set(id, updated);
    return updated;
  } async deleteCustomer(id: string): Promise<boolean> {
    return this.customers.delete(id);
  }

  // Job operations
  async getJobs(): Promise<Job[]> {
    return Array.from(this.jobs.values()).sort((a, b) =>
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
    );
  }

  async getJob(id: string): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async getJobsByCustomer(customerId: string): Promise<Job[]> {
    return Array.from(this.jobs.values())
      .filter(job => job.customerId === customerId)
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const id = randomUUID();
    const job: Job = {
      ...jobData,
      id,
      createdAt: new Date(),
    } as Job;
    this.jobs.set(id, job);
    return job;
  }

  async updateJob(id: string, jobData: Partial<InsertJob>): Promise<Job> {
    const existing = this.jobs.get(id);
    if (!existing) {
      throw new Error("Job not found");
    }
    const updated = { ...existing, ...jobData } as Job;
    this.jobs.set(id, updated);
    return updated;
  } async deleteJob(id: string): Promise<boolean> {
    return this.jobs.delete(id);
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const customers = Array.from(this.customers.values());
    const jobs = Array.from(this.jobs.values());

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const completedThisMonth = jobs.filter(job => {
      const jobDate = new Date(job.scheduledDate);
      return job.status === "Completed" &&
        jobDate.getMonth() === currentMonth &&
        jobDate.getFullYear() === currentYear;
    }).length;

    const monthlyRevenue = jobs
      .filter(job => {
        const jobDate = new Date(job.scheduledDate);
        return job.status === "Completed" &&
          jobDate.getMonth() === currentMonth &&
          jobDate.getFullYear() === currentYear;
      })
      .reduce((sum, job) => sum + parseFloat(job.price || "0"), 0);

    return {
      totalCustomers: customers.length,
      pendingInspections: jobs.filter(job => job.jobType === "Inspection" && job.status === "Scheduled").length,
      completedThisMonth,
      monthlyRevenue,
    };
  }

  async getJobStatusDistribution(): Promise<JobStatusDistribution[]> {
    const jobs = Array.from(this.jobs.values());
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      "Scheduled": "#3b82f6",
      "In Progress": "#f59e0b",
      "Completed": "#10b981",
      "Overdue": "#ef4444",
      "Cancelled": "#6b7280",
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: colors[status as keyof typeof colors] || "#6b7280",
    }));
  }

  async getMonthlyTrends(): Promise<MonthlyTrend[]> {
    const jobs = Array.from(this.jobs.values());
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const monthJobs = jobs.filter(job => {
        const jobDate = new Date(job.scheduledDate);
        return jobDate.getMonth() === index && jobDate.getFullYear() === currentYear;
      });

      const revenue = monthJobs
        .filter(job => job.status === "Completed")
        .reduce((sum, job) => sum + parseFloat(job.price || "0"), 0);

      return {
        month,
        jobs: monthJobs.length,
        revenue,
      };
    });
  }

  async getCustomerTypeDistribution(): Promise<CustomerTypeDistribution[]> {
    const customers = Array.from(this.customers.values());
    const typeCounts = customers.reduce((acc, customer) => {
      acc[customer.customerType] = (acc[customer.customerType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = {
      "Commercial": "#3b82f6",
      "Residential": "#10b981",
      "Industrial": "#8b5cf6",
    };

    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      value: count,
      color: colors[type as keyof typeof colors] || "#6b7280",
    }));
  }

  async getWeeklyJobsData(): Promise<WeeklyJobsData[]> {
    const jobs = Array.from(this.jobs.values());
    const today = new Date();
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return days.map((day, index) => {
      const targetDate = new Date(oneWeekAgo.getTime() + index * 24 * 60 * 60 * 1000);
      const dateStr = targetDate.toISOString().split('T')[0];

      const dayJobs = jobs.filter(job => job.scheduledDate === dateStr);

      return {
        day,
        jobs: dayJobs.length,
        inspections: dayJobs.filter(j => j.jobType === "Inspection").length,
        installations: dayJobs.filter(j => j.jobType === "Installation").length,
        maintenance: dayJobs.filter(j => j.jobType === "Maintenance").length,
        emergency: dayJobs.filter(j => j.jobType === "Emergency").length,
      };
    });
  }

  async getRevenueByJobType(): Promise<RevenueByJobType[]> {
    const jobs = Array.from(this.jobs.values());
    const completedJobs = jobs.filter(job => job.status === "Completed");

    const revenueByType = completedJobs.reduce((acc, job) => {
      const type = job.jobType;
      if (!acc[type]) {
        acc[type] = { revenue: 0, jobs: 0 };
      }
      acc[type].revenue += parseFloat(job.price || "0");
      acc[type].jobs += 1;
      return acc;
    }, {} as Record<string, { revenue: number; jobs: number }>);

    return Object.entries(revenueByType).map(([jobType, data]) => ({
      jobType,
      revenue: data.revenue,
      jobs: data.jobs,
    }));
  }
}

// Export DrizzleStorage for database usage
import { DrizzleStorage } from './drizzle-storage';

// Use MemStorage for now to ensure server starts
console.log("Using MemStorage for development");

export const storage = new MemStorage();// Export both for flexibility
export let dbStorage: DrizzleStorage | undefined;
export const memStorage = new MemStorage();

// DrizzleStorage can be created later when needed
console.log("Storage initialized with MemStorage");

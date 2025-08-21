import {
  customers, jobs, type Customer, type CustomerTypeDistribution, type DashboardStats, type InsertCustomer, type InsertJob, type Job, type JobStatusDistribution,
  type MonthlyTrend, type RevenueByJobType, type WeeklyJobsData
} from '@shared/schema';
import { count, desc, eq, sql, sum } from 'drizzle-orm';
import { db } from './db';
import { IStorage } from './storage';

export class DrizzleStorage implements IStorage {

  // Customer operations
  async getCustomers(): Promise<Customer[]> {
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const result = await db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await db.insert(customers).values(customer as any).returning();
    return result[0];
  }

  async updateCustomer(id: string, customer: Partial<InsertCustomer>): Promise<Customer> {
    const result = await db.update(customers)
      .set(customer as any)
      .where(eq(customers.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Customer with id ${id} not found`);
    }

    return result[0];
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await db.delete(customers).where(eq(customers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Job operations
  async getJobs(): Promise<Job[]> {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async getJob(id: string): Promise<Job | undefined> {
    const result = await db.select().from(jobs).where(eq(jobs.id, id));
    return result[0];
  }

  async getJobsByCustomer(customerId: string): Promise<Job[]> {
    return await db.select().from(jobs)
      .where(eq(jobs.customerId, customerId))
      .orderBy(desc(jobs.createdAt));
  }

  async createJob(job: InsertJob): Promise<Job> {
    const result = await db.insert(jobs).values(job as any).returning();
    return result[0];
  }

  async updateJob(id: string, job: Partial<InsertJob>): Promise<Job> {
    const result = await db.update(jobs)
      .set(job as any)
      .where(eq(jobs.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error(`Job with id ${id} not found`);
    }

    return result[0];
  }

  async deleteJob(id: string): Promise<boolean> {
    const result = await db.delete(jobs).where(eq(jobs.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    const [totalCustomersResult] = await db
      .select({ count: count() })
      .from(customers);

    const [pendingInspectionsResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(eq(jobs.status, 'Scheduled'));

    const [completedThisMonthResult] = await db
      .select({ count: count() })
      .from(jobs)
      .where(sql`${jobs.status} = 'Completed' AND EXTRACT(MONTH FROM ${jobs.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`);

    const [revenueResult] = await db
      .select({ sum: sum(jobs.price) })
      .from(jobs)
      .where(sql`${jobs.status} = 'Completed' AND EXTRACT(MONTH FROM ${jobs.createdAt}) = EXTRACT(MONTH FROM CURRENT_DATE)`);

    return {
      totalCustomers: totalCustomersResult.count || 0,
      pendingInspections: pendingInspectionsResult.count || 0,
      completedThisMonth: completedThisMonthResult.count || 0,
      monthlyRevenue: Number(revenueResult.sum || 0)
    };
  }

  async getJobStatusDistribution(): Promise<JobStatusDistribution[]> {
    const result = await db
      .select({
        status: jobs.status,
        count: count()
      })
      .from(jobs)
      .groupBy(jobs.status);

    const statusColors = {
      'Scheduled': '#3B82F6',
      'In Progress': '#F59E0B',
      'Completed': '#10B981',
      'Cancelled': '#EF4444',
      'Overdue': '#DC2626'
    };

    return result.map(row => ({
      name: row.status,
      value: row.count || 0,
      color: statusColors[row.status as keyof typeof statusColors] || '#6B7280'
    }));
  }

  async getMonthlyTrends(): Promise<MonthlyTrend[]> {
    // This is a simplified version - you might want to use date functions specific to your database
    const result = await db
      .select({
        month: sql<string>`TO_CHAR(${jobs.createdAt}, 'Mon')`,
        jobs: count(),
        revenue: sum(jobs.price)
      })
      .from(jobs)
      .where(sql`${jobs.createdAt} >= NOW() - INTERVAL '12 months'`)
      .groupBy(sql`TO_CHAR(${jobs.createdAt}, 'Mon'), EXTRACT(MONTH FROM ${jobs.createdAt})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${jobs.createdAt})`);

    return result.map(row => ({
      month: row.month,
      jobs: row.jobs || 0,
      revenue: Number(row.revenue || 0)
    }));
  }

  async getCustomerTypeDistribution(): Promise<CustomerTypeDistribution[]> {
    const result = await db
      .select({
        type: customers.customerType,
        count: count()
      })
      .from(customers)
      .groupBy(customers.customerType);

    const typeColors = {
      'Commercial': '#3B82F6',
      'Residential': '#10B981',
      'Industrial': '#F59E0B'
    };

    return result.map(row => ({
      name: row.type,
      value: row.count || 0,
      color: typeColors[row.type as keyof typeof typeColors] || '#6B7280'
    }));
  }

  async getWeeklyJobsData(): Promise<WeeklyJobsData[]> {
    const result = await db
      .select({
        day: sql<string>`TO_CHAR(${jobs.scheduledDate}, 'Dy')`,
        jobType: jobs.jobType,
        count: count()
      })
      .from(jobs)
      .where(sql`${jobs.scheduledDate} >= CURRENT_DATE - INTERVAL '7 days'`)
      .groupBy(sql`TO_CHAR(${jobs.scheduledDate}, 'Dy'), EXTRACT(DOW FROM ${jobs.scheduledDate}), ${jobs.jobType}`)
      .orderBy(sql`EXTRACT(DOW FROM ${jobs.scheduledDate})`);

    // Group by day and sum job types
    const weeklyData = new Map<string, WeeklyJobsData>();

    result.forEach(row => {
      const day = row.day;
      if (!weeklyData.has(day)) {
        weeklyData.set(day, {
          day,
          jobs: 0,
          inspections: 0,
          installations: 0,
          maintenance: 0,
          emergency: 0
        });
      }

      const dayData = weeklyData.get(day)!;
      dayData.jobs += row.count || 0;

      switch (row.jobType) {
        case 'Inspection':
          dayData.inspections += row.count || 0;
          break;
        case 'Installation':
          dayData.installations += row.count || 0;
          break;
        case 'Maintenance':
          dayData.maintenance += row.count || 0;
          break;
        case 'Emergency':
          dayData.emergency += row.count || 0;
          break;
      }
    });

    return Array.from(weeklyData.values());
  }

  async getRevenueByJobType(): Promise<RevenueByJobType[]> {
    const result = await db
      .select({
        type: jobs.jobType,
        revenue: sum(jobs.price),
        jobCount: count()
      })
      .from(jobs)
      .where(eq(jobs.status, 'Completed'))
      .groupBy(jobs.jobType);

    return result.map(row => ({
      jobType: row.type,
      revenue: Number(row.revenue || 0),
      jobs: row.jobCount || 0
    }));
  }
}

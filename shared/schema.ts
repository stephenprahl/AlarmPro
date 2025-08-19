import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  customerType: text("customer_type").notNull().$type<"Commercial" | "Residential" | "Industrial">(),
  status: text("status").notNull().default("Active").$type<"Active" | "Inactive">(),
  lastInspection: date("last_inspection"),
  nextDue: date("next_due"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => customers.id),
  title: text("title").notNull(),
  description: text("description"),
  jobType: text("job_type").notNull().$type<"Inspection" | "Installation" | "Maintenance" | "Emergency">(),
  status: text("status").notNull().default("Scheduled").$type<"Scheduled" | "In Progress" | "Completed" | "Cancelled" | "Overdue">(),
  scheduledDate: date("scheduled_date").notNull(),
  scheduledTime: text("scheduled_time").notNull(),
  estimatedDuration: integer("estimated_duration"), // in minutes
  price: decimal("price", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

// Dashboard statistics types
export type DashboardStats = {
  totalCustomers: number;
  pendingInspections: number;
  completedThisMonth: number;
  monthlyRevenue: number;
};

export type JobStatusDistribution = {
  name: string;
  value: number;
  color: string;
};

export type MonthlyTrend = {
  month: string;
  jobs: number;
  revenue: number;
};

export type CustomerTypeDistribution = {
  name: string;
  value: number;
  color: string;
};

export type WeeklyJobsData = {
  day: string;
  jobs: number;
  inspections: number;
  installations: number;
  maintenance: number;
  emergency: number;
};

export type RevenueByJobType = {
  jobType: string;
  revenue: number;
  jobs: number;
};

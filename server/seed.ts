import { customers, jobs } from '@shared/schema';
import { db } from './db';

export async function seedDatabase() {
  console.log('Seeding database...');

  try {
    // Clear existing data
    await db.delete(jobs);
    await db.delete(customers);

    // Insert sample customers
    const sampleCustomers = await db.insert(customers).values([
      {
        companyName: "ABC Corporation",
        contactPerson: "John Manager",
        email: "john@abc-corp.com",
        phone: "(555) 123-4567",
        address: "123 Business Ave, City, ST 12345",
        customerType: "Commercial",
        status: "Active",
        lastInspection: "2024-03-15",
        nextDue: "2024-09-15",
      },
      {
        companyName: "XYZ Manufacturing",
        contactPerson: "Sarah Wilson",
        email: "sarah@xyz-mfg.com",
        phone: "(555) 234-5678",
        address: "456 Industrial Rd, City, ST 12345",
        customerType: "Industrial",
        status: "Active",
        lastInspection: "2024-04-02",
        nextDue: "2024-10-02",
      },
      {
        companyName: "Metropolitan Office Building",
        contactPerson: "Mike Johnson",
        email: "mike@metro-office.com",
        phone: "(555) 345-6789",
        address: "789 Downtown St, City, ST 12345",
        customerType: "Commercial",
        status: "Active",
        lastInspection: "2024-02-28",
        nextDue: "2024-08-28",
      }
    ] as any).returning();

    console.log(`Inserted ${sampleCustomers.length} customers`);

    // Insert sample jobs
    const sampleJobs = await db.insert(jobs).values([
      {
        customerId: sampleCustomers[0].id,
        title: "Fire Safety Inspection",
        description: "Annual fire safety inspection and equipment check",
        jobType: "Inspection",
        status: "Scheduled",
        scheduledDate: "2024-08-20",
        scheduledTime: "10:00",
        estimatedDuration: 120,
        price: "250.00",
        notes: "Include sprinkler system check",
      },
      {
        customerId: sampleCustomers[1].id,
        title: "Alarm System Installation",
        description: "New fire alarm system installation in warehouse",
        jobType: "Installation",
        status: "In Progress",
        scheduledDate: "2024-08-18",
        scheduledTime: "09:00",
        estimatedDuration: 480,
        price: "1500.00",
        notes: "Industrial grade system required",
      },
      {
        customerId: sampleCustomers[2].id,
        title: "Monthly Maintenance",
        description: "Routine maintenance of fire safety systems",
        jobType: "Maintenance",
        status: "Completed",
        scheduledDate: "2024-08-15",
        scheduledTime: "14:00",
        estimatedDuration: 90,
        price: "180.00",
        notes: "All systems functioning properly",
      }
    ] as any).returning();

    console.log(`Inserted ${sampleJobs.length} jobs`);
    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Database seeding failed:', error);
    throw error;
  }
}

// Auto-run the seeding
seedDatabase()
  .then(() => {
    console.log('Seeding completed, exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });

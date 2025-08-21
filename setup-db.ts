#!/usr/bin/env bun

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';

async function setup() {
  console.log('🚀 Setting up Drizzle ORM with Neon Database...\n');

  // Check if .env has a real database URL
  const envContent = await readFile('.env', 'utf-8');
  const hasRealDbUrl = !envContent.includes('your-username:your-password@your-host.neon.tech');

  if (!hasRealDbUrl) {
    console.log('⚠️  Please update your DATABASE_URL in the .env file with your actual Neon database credentials.');
    console.log('   Format: postgresql://username:password@host.neon.tech/database?sslmode=require\n');
    console.log('   You can get this from your Neon dashboard at: https://console.neon.tech\n');
    return;
  }

  try {
    // Check if migrations folder exists
    if (!existsSync('./migrations')) {
      console.log('📋 Generating migrations...');
      execSync('bun run db:generate', { stdio: 'inherit' });
    } else {
      console.log('✅ Migrations already exist');
    }

    // Push schema to database
    console.log('🔄 Pushing schema to database...');
    execSync('bun run db:push', { stdio: 'inherit' });

    // Seed database
    console.log('🌱 Seeding database with sample data...');
    execSync('bun run db:seed', { stdio: 'inherit' });

    console.log('\n🎉 Setup complete! Your Drizzle ORM is ready to use.');
    console.log('\n📊 You can view your data using Drizzle Studio:');
    console.log('   bun run db:studio');
    console.log('\n🏃‍♂️ Start your development server:');
    console.log('   bun run dev');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();

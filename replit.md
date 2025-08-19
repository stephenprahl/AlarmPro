# Overview

This is a comprehensive fire alarm and safety inspection management system built with React and Express. The application allows businesses to manage customers, schedule and track safety inspections, handle various job types (inspections, installations, maintenance, emergency services), and import data from Excel files. It features a modern dashboard with analytics, calendar scheduling, and customer relationship management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with CRUD operations
- **File Uploads**: Multer middleware for handling Excel file uploads
- **Error Handling**: Centralized error handling with custom error responses

## Data Storage Solutions
- **Database**: PostgreSQL configured via Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Development Storage**: In-memory storage implementation for development/testing

## Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Security**: Basic session-based authentication (no advanced auth implementation visible)

## External Dependencies

### Database & ORM
- **Neon Database**: Serverless PostgreSQL database hosting
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express

### UI & Styling
- **Shadcn/ui**: Pre-built component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Recharts**: Chart library for dashboard analytics
- **Lucide React**: Icon library

### Development & Build Tools
- **Vite**: Fast frontend build tool and dev server
- **TypeScript**: Type checking and development experience
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Integration**: Development environment integration with runtime error overlay

### File Processing
- **Multer**: Middleware for handling multipart/form-data and file uploads
- **Excel Processing**: Prepared for Excel file import functionality (implementation pending)

The architecture follows a clean separation between frontend and backend with shared TypeScript schemas for type safety across the full stack. The application is designed to be deployed on cloud platforms with serverless database connectivity.
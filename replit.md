# Fluffy Trivia - Mobile Game

## Overview

Fluffy Trivia is a mobile-first web application and PWA that serves as a playtest platform for an Italian food and culture trivia game. The application presents quiz cards across four distinct categories (Cibi Furbi, Pianeta Piatto, Cultura del Cibo, Anatomia a Tavola) plus special instruction cards. Players answer multiple-choice questions, receive immediate feedback, and can provide reactions to improve content quality. The system includes a comprehensive CMS for content management and analytics dashboard for performance tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client uses **React with TypeScript** in a single-page application architecture. The UI framework is built on **Tailwind CSS** with **shadcn/ui components** for consistent design patterns. The application follows a **mobile-first responsive design** approach with PWA capabilities for offline functionality and app-like installation experience.

**State Management**: Implemented using **TanStack Query (React Query)** for server state management, providing caching, synchronization, and optimistic updates. Local component state is managed with React hooks.

**Routing**: Uses **Wouter** as a lightweight client-side routing solution, providing simple navigation between game screens, CMS interface, and analytics dashboard.

**Design System**: Implements a custom design system matching the Fluffy Trivia brand guidelines with category-specific color schemes, Fredoka font family, and card-based layouts that mirror the physical game experience.

### Backend Architecture
The server follows a **Node.js Express** architecture with **TypeScript** for type safety. The API is structured as a RESTful service handling card management, feedback collection, and user authentication.

**API Layer**: Organized around resource-based endpoints (`/api/cards`, `/api/feedback`) with proper HTTP methods and status codes. Includes middleware for request logging, error handling, and JSON parsing.

**Business Logic**: Centralized in service modules with clear separation between data access, business rules, and API controllers. The storage layer is abstracted through interfaces for flexibility and testability.

### Data Storage Solutions
**Database**: Uses **PostgreSQL** as the primary database, accessed through **Drizzle ORM** for type-safe database operations. The database is hosted on **Neon** for managed PostgreSQL service.

**Schema Design**: Three main entities - Users (admin authentication), Cards (trivia content), and Feedback (player responses and reactions). The schema supports both quiz-type cards with multiple choice answers and special instruction cards.

**Migrations**: Database schema changes are managed through Drizzle migrations, ensuring consistent deployment across environments.

### Authentication and Authorization
**Admin Authentication**: Simple username/password authentication for CMS access. Sessions are managed server-side with appropriate security measures.

**Player Identification**: Uses localStorage-based device identification for anonymous feedback tracking without requiring user registration, enabling seamless gameplay experience.

### Content Management System
**CRUD Operations**: Full content management capabilities for trivia cards including create, read, update, and delete operations through a web-based interface.

**Bulk Import**: CSV upload functionality for batch content management, allowing efficient content creation and updates from external sources.

**Analytics Integration**: Real-time analytics dashboard showing card performance, player engagement metrics, and feedback analysis for content optimization.

## External Dependencies

### Core Framework Dependencies
- **React & TypeScript**: Frontend framework with type safety
- **Express.js**: Backend web server framework
- **Vite**: Build tool and development server for fast development experience

### Database & ORM
- **PostgreSQL via Neon**: Managed database service for reliable data storage
- **Drizzle ORM**: Type-safe database access layer with migration support
- **@neondatabase/serverless**: Neon-specific database client for serverless deployment

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Radix UI**: Headless component library providing accessible UI primitives
- **shadcn/ui**: Pre-built component library built on Radix UI
- **Fredoka Font**: Google Fonts integration for brand-consistent typography

### Data Management
- **TanStack React Query**: Server state management with caching and synchronization
- **React Hook Form**: Form management with validation support
- **Zod**: Runtime type validation for API endpoints and forms

### Development & Deployment
- **Replit**: Cloud development environment with integrated hosting
- **Wouter**: Lightweight client-side routing solution
- **date-fns**: Date manipulation and formatting utilities

### Analytics & Visualization
- **Recharts**: React-based charting library for analytics dashboard
- **React components**: Custom analytics components for performance tracking

The application is designed for deployment on Replit's cloud infrastructure, leveraging their integrated database and hosting capabilities for seamless development-to-production workflow.
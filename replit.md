# HamaroGhara E-commerce Platform

## Overview

HamaroGhara is a full-stack e-commerce platform specializing in hardware tools and equipment. The application is built with a modern tech stack featuring React frontend, Express backend, and PostgreSQL database using Drizzle ORM. The platform provides a comprehensive shopping experience with user authentication, product browsing, cart management, wishlist functionality, and order tracking.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

- **Frontend**: React with TypeScript, Vite for build tooling, and Tailwind CSS for styling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing

## Key Components

### Frontend Architecture
- **Component Library**: Built on Radix UI primitives with custom styling via Tailwind CSS
- **Responsive Design**: Mobile-first approach with dedicated mobile navigation
- **State Management**: TanStack Query handles all server state with proper caching and invalidation
- **Authentication Flow**: Custom auth hook manages user state and redirects
- **Routing**: File-based routing with protected routes for authenticated users

### Backend Architecture
- **RESTful API**: Express.js with middleware for logging, error handling, and authentication
- **Database Layer**: Drizzle ORM provides type-safe database operations with PostgreSQL
- **Authentication**: Passport.js with OpenID Connect for Replit Auth integration
- **Session Management**: PostgreSQL session store with configurable TTL
- **API Structure**: Organized routes for auth, categories, products, cart, wishlist, and orders

### Database Schema
- **Users**: Profile information integrated with Replit Auth
- **Categories**: Product categorization with slug-based routing
- **Products**: Complete product catalog with pricing, images, and category relationships
- **Cart**: User-specific shopping cart with quantity management
- **Wishlist**: User favorites with product relationships
- **Orders**: Order tracking with line items and status management
- **Sessions**: Secure session storage for authentication

## Data Flow

1. **Authentication Flow**: Users authenticate via Replit Auth, sessions stored in PostgreSQL
2. **Product Browsing**: Categories and products fetched from database, cached by TanStack Query
3. **Cart Management**: Real-time cart updates with optimistic UI updates
4. **Order Processing**: Cart items converted to orders with tracking capabilities
5. **State Synchronization**: Client state synchronized with server through React Query invalidation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **passport**: Authentication middleware
- **express-session**: Session management

### Authentication
- **Replit Auth**: OpenID Connect integration for user authentication
- **connect-pg-simple**: PostgreSQL session store
- **openid-client**: OpenID Connect client library

### Development Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety across the application
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

The application is designed for deployment on Replit with the following configuration:

- **Development**: Vite dev server with HMR and error overlay
- **Production**: Express server serving static files from Vite build
- **Database**: PostgreSQL with connection pooling via Neon
- **Environment**: Environment variables for database URL and session secrets
- **Build Process**: Vite builds frontend, ESBuild bundles backend

The build process creates optimized bundles with proper asset handling and supports both development and production environments with appropriate middleware configuration.

## Changelog

```
Changelog:
- July 03, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```

Technology Stack & Architecture Specification
Project: Real Power Tech WiFi Monetization Platform
Version: 1.0
Date: October 19, 2025
1. Purpose
This document provides a definitive list of all technologies, platforms, and services that will be used to build, deploy, and operate the Real Power Tech WiFi Monetization Platform MVP. For each component, it specifies its role within the architecture and the precise way it will be implemented. This document is the primary technical reference for the development team.

2. Frontend
This layer is responsible for everything the user (both the Customer and the Operator) sees and interacts with in their web browser.
Technology
Role
How We'll Use It
Next.js
Primary Web Framework
The foundation for our entire web application. We will use its file-based routing (App Router) to create all pages, and its built-in features for server-side rendering (SSR) to ensure the Captive Portal loads extremely fast for customers.
React
UI Library
The core library for building user interfaces. We will use it to create a component-based architecture, building reusable pieces for the Admin Dashboard (tables, forms, cards) and the Captive Portal (package selection cards).
Shadcn UI / Tailwind CSS
Design System & Styling
For all visual styling. Tailwind CSS will provide the low-level utility classes for styling. Shadcn UI will be used for pre-built, accessible, and composable components (like buttons, modals, and data tables) that we can easily customize, dramatically speeding up development.


3. Backend
This layer is responsible for the business logic, data processing, and communication with other services. It is the "brain" of the application.
Technology
Role
How We'll Use It
Node.js
JavaScript Runtime
The underlying environment that executes our backend JavaScript code. It's the engine that powers our Next.js API Routes.
Next.js API Routes
Backend Server & API
Our exclusive backend server. Instead of a separate Express application, we will define all our API endpoints within the /pages/api/ directory of our Next.js project. These endpoints will handle all business logic, including: creating/managing partners, processing payment webhooks, and interacting with the database.


4. Database
This layer is responsible for the persistent storage of all application data.
Technology
Role
How We'll Use It
MongoDB
Database Technology
The core NoSQL, document-based database we will use to store our data in flexible, JSON-like documents.
Mongoose
Object Data Mapper (ODM)
The bridge between our Node.js backend and the MongoDB database. We will use it to define strict schemas for our collections (Partners, Transactions, etc.), enforce data validation, and simplify all database queries within our Next.js API Routes.
MongoDB Atlas
Managed Database Hosting
The cloud platform where our production database will live. We will leverage its features for security (IP Access Lists), automated daily backups, and easy scalability. This completely removes the need for us to manage a database server ourselves.


5. Network & Authentication Core
This is the specialized, non-web layer responsible for the core function of granting internet access.
Technology
Role
How We'll Use It
FreeRADIUS
Central Authentication Server
The dedicated RADIUS server. This is a standalone application, not code we write. Its sole purpose is to receive and respond to authentication requests from our MikroTik routers. It is the definitive "gatekeeper" for internet access.
MikroTik RouterOS
On-Site Network Hardware OS
The operating system on the physical routers. We will configure its built-in Hotspot service to perform two critical tasks: 1) Forcefully redirect all new, unauthenticated users to our Next.js Captive Portal. 2) Use our central FreeRADIUS server as its external authentication source to decide who gets internet access.


6. Deployment & Infrastructure
This layer describes where our software will run and how it will be delivered to users.
Technology
Role
How We'll Use It
Vercel
Web Application Hosting
The exclusive platform for deploying our Next.js application. We will connect our Git repository to Vercel for seamless Continuous Integration & Deployment (CI/CD). Vercel will handle the building, global distribution (CDN), and scaling of both our frontend UI and our backend API routes. All environment variables (like database credentials) will be managed securely here.
Fly.io (or DigitalOcean / Linode)
Stateful Service Hosting
The platform where we will host our FreeRADIUS server. We will provision a small, persistent Linux virtual machine on this service. This is necessary because FreeRADIUS is a long-running, stateful application that requires a stable, "always-on" server with a static IP address, a workload for which serverless platforms like Vercel are not suited.
Git / GitHub
Version Control
The tool for managing our source code. All code for the Next.js application will be stored in a GitHub repository, which will be linked to Vercel for automated deployments.


7. Third-Party Services
This layer includes external APIs that provide critical functionality we do not build ourselves.
Technology
Role
How We'll Use It
ClickPesa
Payment Gateway
Our exclusive partner for payment processing. Our frontend will redirect customers to their secure, hosted checkout page. Our backend will have a dedicated API route (/api/webhooks/clickpesa) to receive and, crucially, cryptographically verify their payment success webhooks. A successful webhook is the trigger that grants a customer internet access.



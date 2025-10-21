
Feature Manifest
Purpose: This document is the master checklist of every feature, component, API endpoint, and piece of core logic required for the Real Power Tech WiFi Monetization Platform MVP. It serves as the granular source of truth for development, breaking down the high-level requirements from the PRD into actionable, testable items.

M1: Foundation & Operator Core
Focus: This milestone covers the absolute essentials: setting up the entire technical foundation of the project, establishing the core database structure, and implementing the secure login and dashboard for the Operator. This is the bedrock upon which all other features will be built.
ID
Feature / Component
Type
Details / User Story
FM-AUTH-001
Operator Authentication
Feature
The complete, secure system for the platform Operator to log in and manage their session.
FM-AUTH-001.1
/login Page
UI Page
User Story: As the Operator (David), I want a clean, professional login page with email and password fields so that I can securely access my Admin Dashboard.
FM-AUTH-001.2
POST /api/auth/login
API Endpoint
Validates the Operator's credentials against the hashed password in the database. On success, it creates a secure, HttpOnly session cookie.
FM-AUTH-001.3
Protected Routes Middleware
Core Logic
Backend logic (e.g., in Next.js Middleware) that inspects the session cookie for all /admin/* routes. It must redirect any unauthenticated user back to the login page.
FM-DASH-001
Operator Dashboard
Feature
The central "command center" for the Operator, providing an at-a-glance overview of the business.
FM-DASH-001.1
Admin Dashboard Page
UI Page
User Story: As the Operator, after I log in, I want to be taken to a main dashboard page that serves as the central hub for all my management tasks.
FM-DASH-001.2
At-a-Glance Metric Cards
UI Component
A set of four prominent cards on the dashboard to display the most critical business numbers: Total Revenue, Total Users Connected, Active Locations, and Active Partners.
FM-DASH-001.3
Recent Transactions Feed
UI Component
A live-updating list component on the dashboard that displays the last 5-10 transactions from across the network, including location, package, and amount.
FM-DASH-001.4
GET /api/admin/dashboard-stats
API Endpoint
The secure API endpoint that aggregates and returns the data needed to populate the metric cards and the recent transactions feed on the dashboard.
FM-SETUP-001
Project Setup & Infrastructure
Process
All foundational technical tasks required before feature development can begin.
FM-SETUP-001.1
Code Repository Setup
Technical Task
Initialize the Next.js project in a Git repository with standard configuration for linting (ESLint) and code formatting (Prettier) to ensure code quality.
FM-SETUP-001.2
Infrastructure Provisioning
Technical Task
Set up all required cloud services: Create the Vercel project, the MongoDB Atlas cluster (and configure its IP Access List), and the Fly.io project for the RADIUS server.
FM-SETUP-001.3
Database Schema Implementation
Core Logic
Implement the initial Mongoose schemas in the codebase for all five collections (Operator, Partner, HotspotLocation, ServicePackage, Transaction) as defined in the Architecture Document.







M2: Business Network Management
Focus: This milestone is dedicated to building the essential CRUD (Create, Read, Update, Delete) interfaces that allow the Operator to manage their entire business network. This includes onboarding partners, registering physical devices, and defining the products to be sold.
ID
Feature / Component
Type
Details / User Story
FM-PARTNER-001
Partner Management
Feature
The complete system for the Operator to manage their business partners.
FM-PARTNER-001.1
Partner Management Page
UI Page
User Story: As the Operator, I want a dedicated "Partner Management" page with a searchable list of all my partners so I can easily view and manage them.
FM-PARTNER-001.2
GET /api/admin/partners
API Endpoint
A secure endpoint that retrieves a searchable, paginated list of all partners from the database.
FM-PARTNER-001.3
Add/Edit Partner Modal
UI Component
User Story: As the Operator, I want a simple modal form where I can create a new partner by entering their name and revenue share percentage, or edit the details of an existing partner.
FM-PARTNER-001.4
POST /api/admin/partners
API Endpoint
The secure endpoint that validates and saves a new partner's data to the database.
FM-PARTNER-001.5
PUT /api/admin/partners/{id}
API Endpoint
The secure endpoint that validates and updates an existing partner's data.
FM-PARTNER-001.6
Remove Partner Logic
Core Logic & UI
User Story: As the Operator, when I try to remove a partner, I want the system to prevent me from doing so if they still have locations assigned to them, and show me a clear error message, ensuring I don't create orphaned records.
FM-PARTNER-001.7
DELETE /api/admin/partners/{id}
API Endpoint
The secure endpoint that removes a partner, containing the server-side validation logic to check for assigned locations before deletion.
FM-LOCATION-001
Device & Location Management
Feature
The complete system for the Operator to manage their physical hardware assets.
FM-LOCATION-001.1
Location Management Page
UI Page
User Story: As the Operator, I want a dedicated "Device & Location Management" page with a searchable list of all my hotspot locations so I have a complete inventory of my assets.
FM-LOCATION-001.2
GET /api/admin/locations
API Endpoint
A secure endpoint that retrieves a searchable, paginated list of all hotspot locations, including the name of the assigned partner.
FM-LOCATION-001.3
Add/Edit Location Modal
UI Component
User Story: As the Operator, I want a modal form to register a new device by entering its name and MAC address, and I must be required to select a partner from a dropdown list to link the device to.
FM-LOCATION-001.4
POST /api/admin/locations
API Endpoint
The secure endpoint that validates and saves a new location's data, including the critical partnerId link.
FM-LOCATION-001.5
PUT /api/admin/locations/{id}
API Endpoint
The secure endpoint that updates a location's details, such as its name or partner assignment.
FM-PACKAGE-001
Service Package Management
Feature
The global system for the Operator to control the products being sold to customers.
FM-PACKAGE-001.1
Service Package UI
UI Page
User Story: As the Operator, I want a simple settings page where I can create, view, edit, and deactivate the service packages (e.g., "1 Hour - 1000 Tsh") that will be offered to customers across my entire network.
FM-PACKAGE-001.2
GET /api/admin/packages
API Endpoint
A secure endpoint that retrieves the list of all service packages for the management UI.
FM-PACKAGE-001.3
POST /api/admin/packages
API Endpoint
A secure endpoint that creates a new service package with a name, price, and duration.
FM-PACKAGE-001.4
PUT /api/admin/packages/{id}
API Endpoint
A secure endpoint that updates an existing package's details or toggles its active status.



M3: The Customer Journey & Payment Engine
Focus: This milestone covers the complete, public-facing, and automated customer lifecycle. It includes the Captive Portal UI, the integration with the ClickPesa payment gateway, and the critical webhook logic that confirms transactions. This is the heart of the platform's monetization functionality.
ID
Feature / Component
Type
Details / User Story
FM-PORTAL-001
Captive Portal Experience
Feature
The public-facing interface that new users are automatically redirected to, designed for a fast, frictionless purchasing experience.
FM-PORTAL-001.1
Captive Portal Page
UI Page
User Story: As a Customer (John), when I connect to the Wi-Fi, I want to be redirected to a clean, simple, mobile-first page that immediately shows me the available internet packages.
FM-PORTAL-001.2
Service Package Display Cards
UI Component
A set of large, easily tappable cards on the portal. Each card must clearly display the package name (e.g., "1-Hour Access") and its price, serving as the primary call-to-action.
FM-PORTAL-001.3
GET /api/portal/packages
API Endpoint
A public API endpoint that the Captive Portal calls to fetch the list of all currently active service packages to display to the customer.
FM-PAYMENT-001
Payment Processing Flow
Feature
The complete process of a customer selecting a package and being securely handed off to the payment gateway.
FM-PAYMENT-001.1
Payment Initiation Logic
Core Logic & UI
User Story: As a Customer, when I click on a service package, I want the system to seamlessly and securely prepare my transaction and redirect me to the official ClickPesa payment page to complete my purchase.
FM-PAYMENT-001.2
POST /api/portal/checkout
API Endpoint
A public endpoint that the Captive Portal calls when a package is selected. It receives the packageId, customerMacAddress, and locationIdentifier. Its job is to: 1) Create a new Transaction record in the database with a "Pending" status. 2) Return the unique ClickPesa checkout URL.
FM-PAYMENT-001.3
Payment Success Page
UI Page
A simple, static page with a success message (e.g., "You are connected!") that the customer is redirected back to after a successful payment.
FM-INTEGRATE-001
Payment Gateway Webhook
Feature
The critical server-to-server integration that automates the confirmation of successful payments. This is the trigger for granting internet access.
FM-INTEGRATE-001.1
POST /api/webhooks/clickpesa
API Endpoint
The dedicated, public API endpoint that listens for incoming payment status notifications from ClickPesa's servers.
FM-INTEGRATE-001.2
Webhook Signature Verification
Core Logic
CRITICAL SECURITY: The first step in the webhook endpoint's logic must be to cryptographically verify the signature of the incoming request. This ensures the notification is authentic and from ClickPesa, preventing fraud. Requests with invalid signatures must be rejected.
FM-INTEGRATE-001.3
Transaction Update Logic
Core Logic
Upon successful signature verification, the endpoint's logic must find the corresponding "Pending" transaction in the database and update its status to "Completed". This state change is the definitive proof of a successful purchase.



M4: Access Control & Financial Reporting
Focus: This milestone focuses on implementing the "last mile" of the customer journey—the actual granting of internet access—by integrating the web application with the RADIUS server. It also delivers the final core feature for the Operator: the ability to generate transparent financial reports for their partners.
ID
Feature / Component
Type
Details / User Story
FM-RADIUS-001
RADIUS Server Deployment & Config
Feature
The complete setup of the standalone FreeRADIUS server, which acts as the central gatekeeper for the entire network.
FM-RADIUS-001.1
RADIUS Server Provisioning
Technical Task
Provision a persistent Linux (Ubuntu) server on a suitable host (e.g., Fly.io, DigitalOcean) and install the FreeRADIUS software and the freeradius-mongodb module.
FM-RADIUS-001.2
RADIUS Database Integration
Configuration
Configure the FreeRADIUS rlm_mongodb module to securely connect to our production MongoDB Atlas cluster, enabling it to read authentication records.
FM-RADIUS-001.3
RADIUS Client Configuration
Configuration
Configure the FreeRADIUS clients.conf file to recognize and accept requests from the IP addresses of our deployed MikroTik routers, secured with a strong shared secret.
FM-RADIUS-001.4
RADIUS Logic Configuration
Configuration
Configure the main FreeRADIUS logic to perform lookups in a specific MongoDB collection (e.g., radcheck) to authorize users based on their MAC address and retrieve their session timeout value.
FM-ACCESS-001
Automated Access Grant
Feature
The automated process of authorizing a customer's device in the RADIUS system after a successful payment.
FM-ACCESS-001.1
RADIUS Record Creation Logic
Core Logic
User Story: As a Developer, immediately after the payment webhook updates a transaction to "Completed," I want the backend logic to create a new record in the radcheck (or equivalent) collection in MongoDB, containing the customer's MAC address and their purchased session duration in seconds.
FM-ACCESS-001.2
MikroTik Hotspot Configuration
Configuration
Configure the physical MikroTik routers to use our deployed FreeRADIUS server as their external authentication source, completing the communication link between hardware and software.
FM-REPORTS-001
Financial Reporting Engine
Feature
The tool that provides the core business value to the Operator by automating partner payout calculations.
FM-REPORTS-001.1
Financial Reports Page
UI Page
User Story: As the Operator, I want a dedicated "Financial Reports" page where I can select a partner and a date range to generate a payout statement.
FM-REPORTS-001.2
Report Generation UI
UI Component
A simple form on the reports page containing a dropdown to select a partner and a date-range picker for the reporting period.
FM-REPORTS-001.3
GET /api/admin/reports
API Endpoint
A secure API endpoint that accepts a partnerId and a date range as query parameters. It must perform the database query to aggregate all "Completed" transactions for that partner's locations within the given period.
FM-REPORTS-001.4
Report Calculation Logic
Core Logic
The backend logic for the reports endpoint must correctly calculate the Total Revenue, the Partner's Share (based on their stored percentage), and the final Payout Amount.
FM-REPORTS-001.5
Report Display UI
UI Component
A clean, printable view that displays the generated report, including the summary metrics and the full, itemized list of every transaction included in the calculation for transparency.






M5: Finalization & Production Deployment
Focus: This final milestone covers the implementation of end-to-end testing, the configuration of production environments, and all the procedural tasks required to take the platform live. Its purpose is to ensure a smooth, secure, and reliable launch.
ID
Feature / Component
Type
Details / User Story
FM-TEST-001
End-to-End System Testing
Process
A formal Quality Assurance phase to verify that the entire, integrated system works as expected in a real-world scenario.
FM-TEST-001.1
Hardware Integration Test
Technical Task
User Story: As a Developer, I must connect a physical, fully configured MikroTik hAP ax² router to the staging environment to perform a complete, end-to-end test of the entire customer journey: connect, get redirected, pay via the staging gateway, and successfully gain internet access.
FM-TEST-001.2
User Acceptance Testing (UAT)
Process
Key stakeholders (e.g., the Operator) will test all administrative flows on a staging environment to confirm that the features meet all business requirements outlined in the PRD. The Feature Manifest will serve as the core checklist for this process.
FM-DEPLOY-001
Production Deployment & Config
Feature
All processes and tasks required to take the application live on its production infrastructure.
FM-DEPLOY-001.1
Production Environment Configuration
Technical Task
Configure all production environments, including setting all final environment variables (database connection strings, ClickPesa production keys, RADIUS secrets) securely in Vercel and the RADIUS server host.
FM-DEPLOY-001.2
Database Migration to Production
Technical Task
Ensure the MongoDB Atlas production database is clean, indexed, and ready for launch. Seed the database with the Operator's initial admin account.
FM-DEPLOY-001.3
Final DNS & Networking
Technical Task
Configure all DNS records (e.g., pointing app.realpowertech.com to the Vercel deployment and radius.realpowertech.com to the RADIUS server's static IP).
FM-DEPLOY-001.4
Go-Live
Event
The final, coordinated launch of the platform, making it accessible to the public and operational.
FM-MONITOR-001
Observability & Monitoring Setup
Feature
The implementation of tools to monitor the health and performance of the live application.
FM-MONITOR-001.1
Error Tracking Integration
Technical Task
Integrate an error tracking service like Sentry into the Next.js application to capture and alert on any real-time errors that occur in the frontend or backend API routes.
FM-MONITOR-001.2
Uptime Monitoring
Technical Task
Configure a third-party uptime monitoring service (e.g., UptimeRobot, Better Uptime) to continuously check the health of the Captive Portal URL and the RADIUS server port. An immediate alert must be sent if any service becomes unreachable.
FM-DOCS-001
Documentation Finalization
Process
A final review and update of all project documents to ensure they accurately reflect the final state of the built application.
FM-DOCS-001.1
Document Handover
Process
Finalize all essential documents (PRD, Architecture Document, API Contract, etc.) to serve as a reliable guide for future development, maintenance, and onboarding of new team members.





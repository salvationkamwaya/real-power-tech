
Software Architecture & Security Document
Project: Real Power Tech WiFi Monetization Platform
Version: 1.0
Date: October 19, 2025
Section 1: High-Level System Architecture
1.1 Purpose
This document outlines the technical architecture, component responsibilities, and security controls for the Real Power Tech platform. It serves as the engineering blueprint for building a secure, scalable, and maintainable system using Next.js, MongoDB Atlas, and MikroTik hardware.
1.2 Architectural Style: Full-Stack Serverless with a Stateful Core
The platform is designed using a modern, hybrid architectural style that leverages the strengths of different hosting models for each component:
Full-Stack Next.js Application: The core web application is built as a unified Next.js project. This approach is chosen for the MVP to maximize developer velocity, as both the frontend UI (Captive Portal, Admin Dashboard) and the backend business logic (Next.js API Routes) live within a single, cohesive codebase and deployment.
Serverless Web Hosting: The Next.js application will be deployed on Vercel. This is ideal for handling the unpredictable, spiky traffic of a customer-facing portal and provides best-in-class performance, HTTPS by default, and automated CI/CD.
Stateful Service for RADIUS: The FreeRADIUS server is a stateful, long-running process that must be "always-on" to communicate with the routers. It will be deployed on a persistent service host like Fly.io or a dedicated VPS, which is better suited for this type of workload than a serverless environment.
Managed Database: We will use MongoDB Atlas as our database-as-a-service. This offloads the immense operational burden of database management, including backups, security, and scaling, to a dedicated provider.
1.3 Architecture Diagram

 
1.4 Component Responsibilities
Customer Device: Any Wi-Fi enabled device. Its only role is to connect to the network and interact with the Captive Portal via its web browser.
MikroTik hAP ax² Router:
Role: The "Gatekeeper" deployed at the partner venue.
Responsibilities: Broadcasts the public Wi-Fi network. Implements a "walled garden" to block all traffic except to the Captive Portal and payment gateway. Captures unauthenticated users and redirects them to the Captive Portal. Constantly communicates with the RADIUS Server to check which devices are authorized to access the full internet.


Next.js Application (Vercel):
Role: The "Brain" and "Face" of the platform.
Responsibilities:
Captive Portal (UI): Renders the public-facing page where customers select a service package. Built with Next.js Pages/App Router and styled with Shadcn UI.
Admin Dashboard (UI): Provides the secure, password-protected interface for the Operator to manage the entire business.
Backend API (API Routes): Handles all business logic. This includes creating and managing partners, locations, and packages; generating payment links for ClickPesa; receiving and processing payment webhooks; and communicating with the RADIUS Server to grant access.
RADIUS Server (Fly.io):
Role: The "Authentication Hub."
Responsibilities: Maintains the real-time list of all authorized customer devices (by MAC address) and their session expiration times. Responds to authorization requests from all connected MikroTik routers. It is the single source of truth for "who is allowed online right now."
MongoDB Atlas (Database):
Role: The "System of Record."
Responsibilities: Persistently stores all business data. This includes Operator credentials, Partner details, Hotspot Location configurations, Service Package definitions, and a log of every Transaction. The backend API communicates with it using Mongoose as the Object Data Mapper (ODM).
ClickPesa (Payment Gateway):
Role: The "Secure Cashier."
Responsibilities: Handles the entire payment process on its own secure, PCI-compliant pages. It securely processes mobile money payments and, upon completion, sends a signed webhook back to our backend API to confirm the transaction.
Section 2: Security Architecture
2.1 Security Philosophy: Defense in Depth
Our security strategy is layered. We assume that no single control is perfect and build multiple defenses to protect critical assets at every level: network, application, and data.
2.2 Threat Model & Controls
Threat / Attack Vector
Asset at Risk
Security Control & Implementation Details
Unauthorized Admin Access
Entire Platform Control
Authentication & Authorization: Operator login will be secured with strong password hashing using bcrypt. The Next.js next-auth library (or similar) will be used to manage sessions securely using HttpOnly cookies to mitigate XSS-based token theft.
Data Breach (in transit)
All Data
End-to-End Encryption (HTTPS/TLS): Vercel enforces HTTPS for the Next.js application by default. All communication between the customer/operator and the web server is encrypted.
Data Breach (at rest)
Partner & Transaction Data
Managed Database Security: MongoDB Atlas provides encryption-at-rest by default. Furthermore, access to the database will be strictly controlled via an IP Access List, allowing connections only from Vercel and Fly.io IP addresses. Database credentials will be stored as secure environment variables.
Payment Fraud / Eavesdropping
Customer Financial Data
Delegation to PCI-Compliant Gateway: We never process or store any customer mobile money details. The entire transaction is offloaded to ClickPesa. This drastically reduces our security scope and liability.
Webhook Tampering
Revenue & Access Grant
Webhook Signature Verification: The API endpoint that receives the webhook from ClickPesa must validate the cryptographic signature sent with each request. This ensures that only legitimate, unaltered notifications from ClickPesa can trigger the "Completed" status and grant internet access. Requests with invalid signatures will be rejected.
Captive Portal Bypass
Free Internet Access
Router Firewall ("Walled Garden"): The MikroTik router's hotspot configuration will be hardened with strict firewall rules. It will block all DNS and HTTP/HTTPS traffic from unauthenticated users, with explicit exceptions only for the domain of our Next.js application and the necessary ClickPesa payment domains.
RADIUS Spoofing
Unauthorized Access
RADIUS Shared Secret: The connection between each MikroTik router and the central RADIUS server will be secured with a long, complex, and unique shared secret key. The RADIUS server will reject any requests that are not signed with the correct secret.
Application Vulnerabilities (e.g., Injection)
Database Integrity
ODM & Input Validation: All database queries will be made through Mongoose, whose schema-based model provides strong protection against NoSQL injection attacks. Additionally, all incoming data from API requests will be validated using a library like zod to ensure type and format correctness before processing.

Section 3: Data Model (MongoDB)
The following describes the primary Mongoose schemas that will be implemented.
1. Partner Collection
Stores information about business partners.
   {
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  revenueSharePercentage: Number, // e.g., 40
  createdAt: Date,
  updatedAt: Date
}
 
2. HotspotLocation Collection
Stores information about each deployed router and its link to a partner.
 {
  _id: ObjectId,
  name: String, // "Mlimani City Food Court"
  routerModel: String, // "MikroTik hAP ax²"
  routerIdentifier: { type: String, unique: true }, // MAC Address
  partnerId: { type: ObjectId, ref: 'Partner', required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: Date,
  updatedAt: Date
}
 
3. ServicePackage Collection
Stores the product catalog defined by the Operator.
  {
  _id: ObjectId,
  name: String, // "1-Hour Access"
  price: Number, // In Tsh, e.g., 1000
  durationMinutes: Number, // e.g., 60
  isActive: { type: Boolean, default: true },
  createdAt: Date,
  updatedAt: Date
}
 
4. Transaction Collection
The financial logbook. A new document is created when a customer initiates a purchase.
  {
  _id: ObjectId,
  customerMacAddress: String,
  hotspotLocationId: { type: ObjectId, ref: 'HotspotLocation' },
  servicePackageId: { type: ObjectId, ref: 'ServicePackage' },
  amount: Number, // Price at the time of transaction
  status: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  clickPesaTransactionId: String, // ID from the payment gateway
  createdAt: Date,
  updatedAt: Date
}
 
5. Operator Collection
A simple collection for the admin user(s).
 {
  _id: ObjectId,
  email: { type: String, unique: true },
  password: String, // Hashed with bcrypt
}
 



Real Power Tech: The Prototype-First Development Plan
Introduction: This document is the master development blueprint for the Real Power Tech WiFi Monetization Platform, structured around a prototype-first methodology.
Phase 1 will focus exclusively on building the complete, pixel-perfect user interface for the entire application. All dynamic data will be simulated using mocked API calls and hardcoded JSON objects. The result will be a fully interactive, clickable prototype that looks and feels like the final product.
Phase 2 will focus on backend integration. We will systematically replace each mocked data source with a real, functional API endpoint, build the database schemas, and implement the core business logic.

Phase 1: The Visual Prototype (UI & Mocked Data)
Objective: To build the complete, interactive user interface for every screen in the application using fake, hardcoded data to simulate the user experience. No database or real backend logic will be implemented in this phase.

Task P1-T1: Build Core Authentication Screens & Layout Shell
1. Context & Purpose:
To create the main application layout shell for the admin panel and the public-facing login screen. The form will be interactive, but the authentication will be simulated to demonstrate the user flow.
2. User Story:
"As an Operator, I want to see the login page and be able to enter my credentials to access a mocked-up version of the admin dashboard."
3. Mocked Data Contract:
A simple function mockSignIn(email, password) that returns a user object if credentials match a hardcoded user, or an error if they don't.
    // In lib/mockApi.js
const mockOperator = { id: 'op1', email: 'admin@realpowertech.com' };

4. Development Blueprint (Step-by-Step):
API & Server-Side Logic: None. This is a UI-only task.
User Interface & Components (React):
Create the app/layout.js.
Build the Authenticated Operator Layout (Admin Shell) as a reusable component, including the sidebar with navigation links and the top header.
Build the app/login/page.js using Shadcn components as defined in the Pixel-Perfect spec.
On form submission, call the mockSignIn function. If successful, simulate a global "logged-in" state (using React Context or Zustand) and redirect to /admin/dashboard. If it fails, display an error message on the login form.
Database Interaction: None.

Task P1-T2: Build the Admin Dashboards & Management Screens Prototype
1. Context & Purpose:
To build the complete visual interface for the Operator, allowing them to see how they will manage partners, locations, and packages, all populated with hardcoded data.
2. User Story:
"As an Operator, I want to click through all the navigation links and see the dashboards for managing Partners and Locations, populated with realistic sample data."
3. Mocked Data Contract:
Mocked arrays for dashboardStats, partners, and locations.

    // In lib/mockApi.js
const mockDashboardStats = { stats: { totalRevenue: 1250000, ... }, recentTransactions: [...] };
const mockPartners = [ { id: 'p1', name: 'Maria\'s Cafe', locationsCount: 1, revenueShare: 40 }, ... ];
const mockLocations = [ { id: 'loc1', name: 'Maria\'s Cafe on Main St', partner: 'Maria\'s Cafe', ... }, ... ];

4. Development Blueprint (Step-by-Step):
API & Server-Side Logic: None.
User Interface & Components (React):
Build the app/admin/dashboard/page.js. This page will "fetch" its data directly from the mockDashboardStats object and display it in the Stat Cards and Recent Transactions table.
Build the app/admin/partners/page.js. This page will display the mockPartners array in a Shadcn Table.
Build the app/admin/locations/page.js. This page will display the mockLocations array in a Shadcn Table.
Create the "Add/Edit Partner" and "Add/Edit Location" modal forms. The forms should be fully functional. On submission, they will show a success toast but will not persist any data; they will simply close.
Database Interaction: None.

Task P1-T3: Build the Customer Captive Portal & Success Screen Prototype
1. Context & Purpose:
To build the most critical user-facing part of the application: the portal where customers purchase internet access. The entire flow will be simulated without a real payment gateway.
2. User Story:
"As a Customer, I want to land on the Captive Portal, see the available internet packages, click one, and be taken to a success page that confirms I'm 'connected'."
3. Mocked Data Contract:
A mocked array of servicePackages.

    // In lib/mockApi.js
const mockServicePackages = [
  { id: 'pkg1', name: '1-Hour Access', price: 1000, durationMinutes: 60 },
  { id: 'pkg2', name: '24-Hour Pass', price: 5000, durationMinutes: 1440 }
];
4. Development Blueprint (Step-by-Step):
API & Server-Side Logic: None.
User Interface & Components (React):
Build the app/portal/page.js using the minimalist Captive Portal Layout defined in the Pixel-Perfect spec.
The page will display the mockServicePackages in the tappable card format.
When a user clicks a package card, simulate a brief loading state (e.g., show an overlay with a spinner for 1 second).
After the delay, redirect the user to the app/portal/success/page.js.
Build the static success page with the animated checkmark and confirmation message, dynamically showing the correct duration based on the selected package.
Database Interaction: None.



Phase 2: Backend Integration & Finalization
Objective: To connect the completed Phase 1 prototype to a live backend. We will implement the database schemas, build the real API endpoints, configure the RADIUS server, and integrate with the ClickPesa payment gateway, bringing the application to life.

Task P2-T1: Implement Core Authentication & Database Setup
1. Context & Purpose:
To replace the mocked Operator login with a real, secure authentication system and to establish the foundational database schemas, making the admin panel "real".
2. Previous Prototype Task: P1-T1
3. Development Blueprint (Step-by-Step):
Database Interaction (Mongoose):
Implement the lib/dbConnect.js utility.
Code the full Operator.js schema, including the password hashing hook.
Code the Partner.js, HotspotLocation.js, ServicePackage.js, and Transaction.js schemas as defined in the Architecture Document.


API & Server-Side Logic (Next.js):
Build the real POST /api/v1/auth/login API route to validate credentials against the database and issue a secure session cookie.
Implement a middleware file (middleware.js) to protect all /admin/* routes, redirecting unauthenticated users to /login.


User Interface & Components (React):
In app/login/page.js, replace the mockSignIn function call with a real fetch request to your /api/v1/auth/login endpoint.
The global state management for the session should now be powered by the real session cookie.





Task P2-T2: Implement Admin Management APIs & Connect UI
1. Context & Purpose:
To build the real backend for managing Partners, Locations, and Packages, and to connect the existing admin prototype UI to these live endpoints.
2. Previous Prototype Task: P1-T2
3. Development Blueprint (Step-by-Step):
API & Server-Side Logic (Next.js):
Build the full set of secure, admin-only CRUD API endpoints as defined in the API Contract:
GET, POST, PUT, DELETE for /api/v1/admin/partners
GET, POST, PUT for /api/v1/admin/locations
GET, POST, PUT for /api/v1/admin/packages


Build the GET /api/v1/admin/dashboard-stats endpoint to perform the real database aggregations.


User Interface & Components (React):
In all admin dashboard pages (/admin/dashboard, /admin/partners, etc.), replace the mocked data arrays with real client-side data fetching hooks (e.g., SWR, React Query) that call your new GET endpoints.
Connect the "Add/Edit" modal forms to make real POST and PUT requests to the admin API endpoints, ensuring the UI table re-fetches its data on a successful submission to show the changes.





Task P2-T3: Implement Payment Flow & ClickPesa Integration
1. Context & Purpose:
This is a critical integration task. It replaces the simulated payment flow with a real, secure transaction process using the ClickPesa Hosted Checkout and Webhook systems.
2. Previous Prototype Task: P1-T3
3. Development Blueprint (Step-by-Step):
API & Server-Side Logic (Next.js):
Build the POST /api/v1/portal/checkout endpoint:
This endpoint will receive the packageId, customerMacAddress, and routerIdentifier.
It will create a new Transaction document in the database with status: 'Pending'.
It will then make a server-to-server request to the ClickPesa Generate Checkout Link API.
It will return the real checkoutUrl from ClickPesa to the client.


Implement the POST /api/v1/webhooks/clickpesa endpoint:
Security First: Implement the Checksum verification as described in the ClickPesa docs.
If the webhook is authentic and successful, find the Transaction and update its status to 'Completed'.
Crucially, this endpoint will then trigger the access grant logic (Task P2-T4).




User Interface & Components (React):
In app/portal/page.js, when a package is clicked, make a real POST request to /api/v1/portal/checkout.
On receiving the { checkoutUrl: "..." } response, immediately redirect the user using window.location.href.


Environment Variables:
CLICKPESA_API_KEY, CLICKPESA_WEBHOOK_SECRET.





Task P2-T4: Implement RADIUS Integration & Finalization
1. Context & Purpose:
To complete the end-to-end system by deploying and configuring the FreeRADIUS server and connecting it to the database. This is the final step that allows a paid customer to get online.
2. Previous Prototype Task: This task makes the entire prototype "real".
3. Development Blueprint (Step-by-Step):
RADIUS Server Deployment (Fly.io or similar):
Provision a Linux server and install FreeRADIUS with the MongoDB module.
Configure FreeRADIUS to connect to the MongoDB Atlas database and to accept requests from the MikroTik routers (using a shared secret).
Configure the logic to authorize users based on records in a radcheck collection.


API & Server-Side Logic (Next.js):
Modify the POST /api/v1/webhooks/clickpesa endpoint.
After updating the transaction status to 'Completed', add the final step: write a new document to the radcheck collection containing the customerMacAddress and the durationMinutes from the purchased package. This is the action that grants the user access.


Hardware Configuration:
Configure the physical MikroTik router's Hotspot to point to the production RADIUS server's IP address.


End-to-End Testing:
Perform a full, live test with a real device, connecting to the configured router, making a real payment through the ClickPesa sandbox, and verifying that internet access is granted for the correct duration.


Finalization:
Implement monitoring and error tracking (Sentry, UptimeRobot).
Finalize all documentation and prepare for the go-live event.






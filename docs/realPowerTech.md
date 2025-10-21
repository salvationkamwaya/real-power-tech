
WiFi Monetization & Partner Management Platform: The Complete Project Description

Part 1: The Core Philosophy & Foundational Structure
This part explains the "why" and "what" of the platform. It establishes the fundamental business principles and the rigid structure that makes the system work, ensuring that every subsequent feature is understood within this foundational context.
The Core Philosophy: "Effortless Monetization, Scalable Partnership"
The singular vision of this platform is to transform a standard business cost providing public internet access into an automated, self-sustaining revenue stream. In most venues (cafes, hotels, public spaces), guest Wi-Fi is a free amenity, an operational expense with no return. This platform is the antidote.
It is built on the principle of automated value capture. Every feature is designed to create a seamless, "hands-off" process, from a customer connecting to the network, to them making a payment, to the business owner and their partners seeing the revenue. It is a tool for building a scalable business, not just for managing a single network. The platform's success is defined by its ability to function and generate revenue with minimal daily human intervention.
The Foundational Structure: The Building Blocks
The platform's power comes from its clear and logical hierarchy. This structure is the skeleton of the entire system, governing all relationships, permissions, and financial calculations.
1. The Operator:
This is the central business entity, the owner of the platform and the entire operation. It is the top-level container for all other entities.
Definition: The primary account that owns and administers the entire system. In this project, this is REAL POWERTECH LTD.
The Golden Rule: The Operator is the root of the hierarchy. All Partners, Hotspot Locations, and Service Packages are created and managed under the Operator's authority. There is no entity that exists outside of the Operator's control.
2. The Partner:
This represents a third-party collaborator or franchisee who operates one or more hotspot locations on behalf of the Operator.
Definition: A distinct business entity or individual invited by the Operator to expand the network.
Key Principle: A Partner cannot exist in isolation. A Partner's sole purpose within the system is to be assigned to one or more Hotspot Locations to manage them. Their existence is fundamentally tied to the revenue-sharing agreement managed by the Operator.
3. The Hotspot Location:
This represents a single, physical deployment of a router that provides paid internet service. It is the "point of sale" for the business.
Definition: A specific physical location where a configured router (e.g., a MikroTik hAP ax²) is installed.
The Crucial Rule: To ensure accurate and automated revenue share calculations, every Hotspot Location must be assigned to exactly one Partner. There is no concept of an "unassigned" or "ownerless" location. This rigid link is the non-negotiable foundation of the platform's automated financial reporting. When a payment is made, the system must know instantly which location generated it, and therefore which Partner earns a commission.
4. The Customer:
This is the end-user who pays for and consumes the internet service.
Definition: An individual with a Wi-Fi-enabled device (phone, laptop, etc.).
Key Principle: Unlike a social network, Customers do not have permanent accounts, usernames, or profiles. They are transient and session-based. A Customer is uniquely identified by their device's MAC address for the duration of their paid session. Their relationship with the platform begins when they connect and ends when their time expires. This "accountless" model is critical for ensuring a frictionless, low-barrier experience for the end-user.
5. The Service Package:
This is the product being sold to the Customer.
Definition: A predefined offering of internet access with a specific duration and price.
Examples: "1-Hour Access," "24-Hour Pass," "Weekly Unlimited."
The Rule of Consistency: All Service Packages are created and managed globally by The Operator. This ensures consistent pricing and offerings across the entire network, regardless of which Partner manages a specific location. A Partner cannot create or modify the products being sold at their location.





Part 2: The Operational Lifecycle & The Customer Journey
This part covers the "how" of the platform's operation. It details the step-by-step processes for managing partners and locations, and it meticulously outlines the automated journey a customer takes from connecting to the network to gaining paid internet access.
The Golden Rule: Operator Control is Absolute
There is no public "Sign Up" button for Partners. The entire operational lifecycle is a closed loop, initiated and controlled by the Operator (REAL POWERTECH LTD) to maintain the integrity, security, and financial accuracy of the ecosystem.

Flow 1: Onboarding a New Partner
This is the standard flow for adding a new business partner to the network.
1. Initiation (by Operator):
The Operator uses their secure Admin Dashboard to invite a new partner.
The Operator navigates to the "Partner Management" section.
They click "Add New Partner" and fill in a simple form with the partner's essential details:
First Name & Last Name
Email Address
The agreed-upon Revenue Share Percentage (e.g., 40%).
2. System Logic (Partner Record Creation):
The system creates a new Partner record in the database with an "Active" status.
Unlike a system with user accounts, the Partner does not need to set a password or "activate" an account. Their record is a simple business entity used for assigning locations and calculating revenue. The Operator is fully responsible for the accuracy of this information.
3. Completion:
The Partner is now an official entity within the system and immediately appears in the list of available partners when the Operator registers a new Hotspot Location.

Flow 2: Registering a New Hotspot Location
This is the flow for adding a new physical device to the network and linking it to a Partner.
1. Initiation (by Operator):
The Operator navigates to the "Device & Location Management" section of the Admin Dashboard.
They click "Add New Location" and fill in the device's details:
Location Name: A human-readable name for the site (e.g., "Mlimani City Food Court").
Router Model: The model of the hardware being deployed (e.g., "MikroTik hAP ax²").
Router Identifier: A unique identifier for the specific router, typically its MAC address. This is critical for the system to identify which location a customer is connecting from.
Assign to Partner: This is the most crucial step. The Operator selects an existing Partner from a dropdown list.
2. System Logic (The Critical Link):
The system creates a new Hotspot Location record in the database.
It permanently links this new location's record to the chosen Partner's record. This link is the foundation for all future financial reporting.
3. Completion & Deployment:
The location is now live in the system. The Operator can now physically deploy the configured router at the site. From this moment on, any revenue generated by this specific router will be automatically associated with the assigned Partner.

Flow 3: The Automated Customer Journey (The Revenue Loop)
This flow details the complete, end-to-end experience of a customer, designed to be entirely automated and require no manual intervention from the Operator or Partner.
1. Connection & Capture:
A Customer connects their device to the public-facing "Pay & Surf" Wi-Fi network.
The MikroTik router at the Hotspot Location immediately captures the device's connection attempt. It blocks all internet access.
2. The Redirect:
The router forcefully redirects the customer's web browser to the platform's Captive Portal, which is hosted on our Next.js application.
Crucially, the router appends the customer's device MAC address and the router's own unique identifier to the URL as query parameters.
3. The Portal & Package Selection:
The customer sees the Captive Portal, branded for REAL POWERTECH.
The portal displays a clear, simple list of available Service Packages (e.g., "1 Hour - 1,000 Tsh").
The customer selects the package they wish to purchase.
4. Payment Initiation:
Our Next.js application receives the selection. It now knows the chosen package, the customer's MAC address, and the location's identifier.
Our backend securely communicates with the ClickPesa API to generate a unique, hosted checkout link for that specific purchase amount.
Simultaneously, our system creates a new Transaction record in our database with a status of "Pending", linking it to the customer's MAC address and the Hotspot Location.
5. Payment Execution:
The customer's browser is redirected to the official, secure ClickPesa payment page.
The customer completes the payment using their mobile money account.
6. The Automated Confirmation (Webhook):
This is the critical server-to-server step. Upon successful payment, ClickPesa's system instantly sends a webhook (an automated notification) to a dedicated API endpoint on our application.
Our application receives this webhook, verifies its authenticity, and updates the corresponding Transaction record in our database from "Pending" to "Completed".
7. Access Grant (RADIUS):
Immediately after marking the transaction as "Completed," our backend application makes a secure, internal API call to our RADIUS Server.
The request tells the RADIUS server: "Authorize the device with MAC address [customer's MAC address] for [duration of the purchased package] minutes."
The RADIUS server adds the customer's MAC address to its list of authorized devices.
8. Internet Access:
The MikroTik router, which is constantly communicating with our RADIUS server, is now told that the customer's device is authorized. It opens the gate, and the customer gains full, uninterrupted internet access.


9. Session Expiration & Disconnection:
The RADIUS server keeps track of the time. Once the purchased duration expires, it automatically removes the customer's MAC address from the authorized list.
The MikroTik router is notified of this change and automatically disconnects the customer's device, completing the lifecycle. The customer can then choose to purchase another package.
The Offboarding & Deactivation Lifecycle
1. Deactivating a Location:
An Operator can deactivate a location at any time from the dashboard. This simply marks it as "Inactive." The router at this location will no longer accept connections. All historical transaction and revenue data for this location is preserved for reporting.
2. Removing a Partner:
An Operator can remove a Partner from the system.
System Safeguard: The system will prevent an Operator from removing a Partner who still has Hotspot Locations assigned to them. The Operator must first re-assign those locations to another Partner or deactivate them. This ensures data integrity and prevents "orphaned" financial records.

Part 3: The Operator's Tools & Platform Content
This part details the primary features and interfaces the Operator (REAL POWERTECH LTD) will use to run their business. Each feature is a distinct tool designed for a specific job, ensuring the platform is easy to manage and provides clear, actionable business intelligence.
1. The Admin Dashboard: The Central Control Panel
Purpose: To provide the Operator with a single, at-a-glance overview of the entire business's health and performance. This is the first screen the Operator sees upon logging in.
Who Accesses It: Only the Operator.
User Experience: The dashboard consists of simple, clear "metric cards" and summary lists, not complex graphs. The design philosophy is to provide key numbers for quick decision-making.


Content & Features:
At-a-Glance Metrics: A series of prominent cards displaying the most important real-time statistics:
Total Revenue: A sum of all completed transactions across the entire network.
Total Users Connected: A count of all unique, completed transactions, representing the total number of paid sessions.
Active Locations: A count of all hotspot locations currently marked as "Active."
Active Partners: A count of all registered business partners.
Recent Transactions Feed: A live, scrolling list showing the last 5-10 completed transactions from anywhere in the network. Each entry will display:
The Location Name where the transaction occurred.
The Service Package that was purchased.
The Amount paid.
The Timestamp of the transaction.
Navigation: The dashboard serves as the central hub with clear, persistent navigation links to all other management sections (Partner Management, Location Management, Reports, etc.).
2. Partner Management
Purpose: To manage the business relationships that are key to scaling the network.
Who Manages It: Only the Operator.
User Experience: A clean, list-based interface for viewing and manipulating partner data.
Features:
Partner List: A comprehensive list of all registered partners. Each entry in the list displays:
Partner's Full Name.
The number of Hotspot Locations currently assigned to them.
Their configured Revenue Share Percentage.
A status indicator (e.g., "Active").
Add New Partner: A simple form (presented in a dialog/modal) for creating a new partner record, as detailed in Part 2.
Edit Partner Details: The ability to click on an existing partner to update their information, such as their name or their revenue share percentage.
Remove Partner: The ability to remove a partner, with the system safeguard (as detailed in Part 2) preventing removal if they still manage active locations.


3. Device & Location Management
Purpose: To manage the physical hardware assets of the business.
Who Manages It: Only the Operator.
User Experience: A list-based interface for viewing and managing all deployed routers.
Features:
Location List: A comprehensive list of all registered hotspot locations. Each entry displays:
The human-readable Location Name.
The Assigned Partner's Name.
The Router Model and Identifier (MAC Address).
A status indicator (e.g., "Active" / "Inactive").
Add New Location: A form (in a dialog/modal) for registering a new device and linking it to a partner, as detailed in Part 2.
Edit Location Details: The ability to change a location's name or re-assign it to a different partner.
4. Service Package Management
Purpose: To control the products being sold to customers across the entire network.
Who Manages It: Only the Operator. This is a global setting.
User Experience: A simple settings page where the Operator can define their product catalog.
Features:
Package List: A list of all available Service Packages, showing their name, price, and duration.
Create Package: A form to define a new product with the following attributes:
Name: e.g., "3-Hour Pass"
Price: e.g., 2,000 (in Tsh)
Duration: e.g., 180 (in minutes)
Edit/Deactivate Package: The ability to change the price or duration of an existing package, or to temporarily deactivate it so it no longer appears on the captive portal for new customers.
5. Financial Reports
Purpose: To provide clear, automated financial statements for managing partner payouts and understanding business performance. This is the core "output" of the entire system.
Who Accesses It: Only the Operator.
User Experience: A simple, filter-based report generation tool.
Workflow:
Filtering: The Operator is presented with a set of filters:
Select Partner: A dropdown list of all registered partners.
Select Date Range: A start date and an end date.
Generation: The Operator clicks a "Generate Report" button.
System Logic: The system queries the database to find all "Completed" transactions that occurred at locations assigned to the selected partner within the specified date range. It then performs the revenue share calculation.
Display: The system presents a clean, printable report on the screen with the following information:
Report Header: Partner Name, Date Range.
Summary Metrics:
Total Revenue Generated by Partner's Locations.
Partner's Share (e.g., 40%).
Partner's Payout Amount (the calculated amount in Tsh).
Operator's Share.
Detailed Transaction List: A full, itemized list of every transaction included in the calculation, showing the date, location, and amount for complete transparency.

Part 4: Roles, Permissions, & Platform Administration
Access and capabilities within the platform are strictly defined by a user's role. This ensures a clear separation of duties and maintains the integrity of the system. For this platform, there are two primary roles.
1. The Customer (End-User)
This is not a formal "role" with an account, but a transient user of the service. Their permissions are inherently limited to the act of purchasing and using the internet.
Core Functionality:
Connects to a specific Hotspot Location.
Views the Captive Portal and the list of available Service Packages.
Is redirected to a secure, third-party gateway to make a payment.
Receives internet access for the exact duration purchased.
Permissions & Limitations:
No Account: The Customer has no login, no profile, and no persistent identity on the platform beyond their device's MAC address for the duration of a single session.
No Access to Admin Areas: The Customer can never access the administrative dashboard or any of the platform's management tools.


2. The Operator (System Administrator)
This is the highest-level administrative role with complete control over the entire platform. This role is assigned to the primary user(s) at REAL POWERTECH LTD.
User & Group Management:
Manages all Partners (creating, editing, removing).
Manages all Hotspot Locations (registering, editing, deactivating, assigning to Partners).
Manages all Service Packages (creating, editing prices and durations, deactivating).
Financial & Reporting Control:
Has full access to the Financial Reports section.
Can generate revenue share reports for any partner and any date range.
Platform Oversight:
Views the main Admin Dashboard with aggregate metrics for the entire network's performance.
Manages their own account credentials and security settings.

Part 5: Platform Management, Billing, & Technical Specifications
This final part details the commercial and technical infrastructure of the platform. It covers how payments are handled and the technical rules and limits that ensure the system remains secure and performant.
1. The Business Model
The platform operates on a direct-to-consumer and business-to-business model.
Direct-to-Consumer (D2C): The Operator sells internet access (Service Packages) directly to the end Customer.
Business-to-Business (B2B): The Operator forms revenue-sharing agreements with Partners who manage the physical locations where the service is sold. The platform's primary function is to automate the financial accounting for this B2B relationship.
2. Payment Gateways
To ensure secure and compliant payment processing, the platform integrates with an established third-party payment gateway. The platform does not process or store any sensitive mobile money or banking information directly on its servers.
Integrated Gateway:
ClickPesa: For mobile money and bank transactions, catering specifically to the Tanzanian market (Tigo Pesa, M-Pesa, Airtel Money, etc.).
3. The Financial Workflow (Revenue & Payouts)
The platform automates the tracking of revenue and provides the necessary data for the Operator to manage payouts to Partners.
1. Revenue Collection:
All revenue from all customer payments across the entire network is collected via the ClickPesa gateway and is deposited into the Operator's (REAL POWERTECH LTD's) merchant account. Partners do not receive direct payments from customers.
2. Automated Reporting:
The platform's Financial Reports feature continuously and automatically tracks which Partner is responsible for every Tsh earned.
3. Payout Process (Manual, Guided by the Platform):
At the end of an agreed-upon period (e.g., monthly), the Operator uses the Financial Reports tool to generate the final payout statement for each Partner.
The Operator is then responsible for making a direct, offline payment (e.g., via bank transfer or mobile money) to the Partner for the amount specified in the report.
The platform's role is to provide a definitive, trustworthy, and transparent accounting record to make this manual payout process simple and error-free.
4. Technical Specifications & Platform Rules
To ensure security, performance, and reliability, the following technical architecture and rules are in place:
Router Requirements:
The platform is designed to be router-agnostic, but any deployed router must support a "Captive Portal with External RADIUS Server" configuration.
The recommended and tested hardware is from the MikroTik product line (e.g., hAP ax², hAP ax³) due to its stability, affordability, and robust support for the required features.
Network Communication Protocol:
The core communication between the deployed routers and the central application is handled via the RADIUS protocol. This is the industry standard for remote authentication and access control.
Deployment Architecture:
Web Application: The customer-facing Captive Portal and the Operator's Admin Dashboard (the Next.js application) will be deployed on a modern, serverless platform like Vercel for optimal performance, scalability, and ease of management.
RADIUS Server: The RADIUS server, which must be an "always-on" service, will be deployed separately on a reliable, persistent server environment like Fly.io. This two-part architecture ensures that each component runs in the environment best suited for its technical requirements.d
Security:
The Admin Dashboard is protected by a secure login system. All communication between the user's browser and the web application is encrypted via HTTPS.
Communication between the routers and the RADIUS server is secured by a shared secret key.
All payment processing is fully delegated to the PCI-compliant ClickPesa gateway.


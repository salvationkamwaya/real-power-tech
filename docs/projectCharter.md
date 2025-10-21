Project Charter: Real Power Tech WiFi Monetization Platform
Prepared For: Real Power Tech Ltd. Stakeholders
Prepared By: Jestone
Date: October 19, 2025
Version: 1.0

Section 1: Executive Summary
This document outlines the vision, scope, and functional requirements for the Real Power Tech WiFi Monetization Platform. This project is designed to address a significant market opportunity by transforming guest Wi-Fi—traditionally a cost center for businesses—into an automated, scalable, and self-sustaining revenue stream.
The core problem is that venues like cafes, hotels, and public spaces offer free internet access as an operational expense with no direct return on investment. This platform provides the solution: a comprehensive, B2B system that facilitates the sale of Wi-Fi access with minimal human intervention.
The proposed solution is a robust platform built on the philosophy of "Effortless Monetization, Scalable Partnership." It empowers the platform owner (The Operator) to collaborate with third-party venue owners (Partners) to deploy managed Wi-Fi hotspots. The system's core innovation is its fully automated customer journey, handling everything from initial connection and payment processing to time-limited internet access, ensuring a frictionless experience for the end-user and transparent, automated revenue-share accounting for the business.
This project will deliver a secure, production-ready platform that solves a tangible business problem, serving as the definitive guide for planning, development, and deployment.

Section 2: Problem Statement & Project Opportunity
2.1 The Challenge of Unmonetized Guest Wi-Fi
In today's digital economy, providing guest Wi-Fi is no longer an option but an expectation. However, for most businesses, this presents costly and unaddressed challenges:
A Persistent Cost Center: Businesses bear the recurring costs of internet subscriptions, hardware, and maintenance without any direct financial return, treating it purely as an operational expense.
Lack of Scalable Business Models: There is no simple, "out-of-the-box" solution for venue owners to easily sell internet access. Existing methods are often cumbersome, require manual voucher generation, and lack professional accounting and management tools.
Operational Burden: Managing a public Wi-Fi network, including user access and support, can be a distraction from the core business operations.
Missed Revenue Opportunity: The demand for reliable, high-speed internet in public spaces is a significant and largely untapped revenue opportunity.
2.2 The Project Opportunity
By developing this platform, Real Power Tech has the opportunity to create immediate and tangible value for itself and its partners:
Unlock New Revenue Streams: We can directly convert a business expense into a profitable venture by providing a seamless mechanism for selling timed internet access.
Enable Scalable Partnerships: The platform's core design allows the Operator to grow their network exponentially by partnering with multiple venue owners, creating a widespread, revenue-generating footprint with minimal overhead.
Automate the Entire Operation: We have the opportunity to build a "hands-off" business model. The automated customer journey—from payment to access—eliminates the need for on-site staff to manage transactions, freeing up partners to focus on their primary business.
Provide Transparent Financials: The platform will solve the critical challenge of revenue sharing by providing clear, accurate, and automated financial reports, fostering trust and simplifying the payout process between the Operator and its Partners.

Section 3: Proposed Solution
We propose the development of a centralized, web-based B2B platform. The system is designed to be a secure, reliable, and intuitive tool for the Operator, with a completely frictionless and automated experience for the end customer. The solution is architected around a clear hierarchy of Operator > Partner > Hotspot Location, which is the foundation for all financial calculations.
3.1 The End-User Experience (The Automated Revenue Loop)
Connection & Capture: A customer connects their device to the public Wi-Fi network at a partner location. The on-site MikroTik router immediately intercepts the connection and redirects their browser to the platform's Captive Portal.
Package Selection & Payment: The customer sees a simple, branded page displaying available internet packages (e.g., "1 Hour - 1,000 Tsh"). They select a package, and the system generates a secure payment link for the ClickPesa gateway.
Automated Confirmation: The customer pays using their mobile money account. Upon successful payment, ClickPesa sends an automated confirmation (webhook) to our platform.
Access Grant: Our system instantly receives the confirmation, marks the transaction as "Completed," and communicates with the on-site router via a central RADIUS server to grant internet access to the customer's device for the exact duration purchased.
Automated Disconnection: Once the time expires, the RADIUS server automatically instructs the router to disconnect the device, completing the seamless cycle.
3.2 Core System Components
Frontend Application (Next.js): A responsive web application that serves both the customer-facing Captive Portal and the secure Operator Admin Dashboard.
Backend API: The "engine" of the system, handling all business logic, partner and location management, payment gateway webhooks, and communication with the RADIUS server.
RADIUS Server: A dedicated, "always-on" server that manages the core function of authenticating and authorizing customer devices, acting as the gatekeeper for internet access.
Database: A persistent database serving as the single source of truth for all partner data, location configurations, service packages, and transaction records.
Payment Gateway (ClickPesa): Securely processes all customer payments and provides automated transaction status updates to the backend.
Network Hardware (MikroTik Routers): Deployed at each Hotspot Location, these routers are configured to work with the platform to manage the captive portal and enforce access rules from the RADIUS server.

Section 4: Functional Requirements (System Features)
This section provides a list of all features that will be developed.
4.1 Operator Features (Platform-Wide Control)
Admin Dashboard: A central hub showing at-a-glance metrics for the entire network: Total Revenue, Total Users Connected, Active Locations, and a live feed of recent transactions.
Partner Management: Full ability to create, view, update, and remove Partner records, including setting and adjusting their specific Revenue Share Percentage.
Device & Location Management: Full ability to register new Hotspot Locations, assign them to a Partner, and manage their status (Active/Inactive).
Service Package Management: A global interface to create and manage the products being sold across the network (e.g., define packages with a name, price, and duration in minutes).
Financial Reports: A reporting tool to generate detailed, transparent payout statements for any partner for any given date range, showing total revenue generated and the calculated revenue share.
4.2 Customer Features (Transient User)
Connect to Wi-Fi: Seamlessly connect to the network at any Hotspot Location.
View Captive Portal: Be automatically redirected to a clean, mobile-friendly portal to view and select internet packages.
Secure Payment: Be securely redirected to the ClickPesa gateway to complete a mobile money payment.
Receive Internet Access: Gain immediate and uninterrupted internet access for the exact duration purchased.

Section 5: Scope of Work
This section defines the boundaries of the project to ensure a focused and timely delivery.
5.1 IN-SCOPE: What We Will Deliver
Software Development:
Development of the Frontend Application (Next.js) containing the Captive Portal and the Operator Admin Dashboard.
Development of the secure Backend API to power all platform logic.
Development and deployment of the RADIUS Server.
Integration with the ClickPesa payment gateway, including webhook handling.


Implementation of all Functional Requirements:
Full implementation of all Operator features as specified in Section 4.
The complete, automated customer journey.


System Deployment:
Deployment of the completed web application and RADIUS server to a modern, scalable hosting environment (e.g., Vercel, Fly.io).


Core Documentation:
Essential project documents including a System Architecture Document and API Contract.


5.2 OUT-OF-SCOPE: What Is Not Included
Partner Dashboard: Partners will not have their own login or dashboard to view performance. All reporting is managed and provided by the Operator.
Automated Payouts: The platform will generate reports to facilitate manual payouts. It will not automatically transfer funds to Partners.
Customer Accounts: End-users will not have user accounts, profiles, or login credentials. Their interaction is entirely session-based.
Advanced Analytics: The dashboard will provide core metrics. It will not include advanced data visualization, trend forecasting, or customer demographic analysis.
Advertising on Captive Portal: The portal's purpose is for selling internet access only; it will not serve as an advertising platform in this version.[1]

Section 6: Project Milestones (Phased Delivery Model)
The project will be executed in a series of logical milestones to ensure steady progress and incremental value.
Milestone 1: Foundation & Core Infrastructure
Focus: Setting up the entire technical foundation of the project.
Deliverables: Initialize code repositories; provision all cloud services (hosting, database); design database schemas; implement secure Operator authentication.
Milestone 2: Operator Admin Functionality
Focus: Building the essential tools for the Operator to manage their business.
Deliverables: A functional Admin Dashboard with full CRUD (Create, Read, Update, Delete) management for Partners, Hotspot Locations, and Service Packages.
Milestone 3: The Customer Journey & Payment Integration
Focus: Developing the complete customer-facing experience.
Deliverables: A functional Captive Portal that displays service packages; full integration with the ClickPesa payment gateway and successful handling of payment confirmation webhooks.
Milestone 4: The Access Grant & Reporting Engine
Focus: Connecting the payment system to the access control system and building the core financial tool.
Deliverables: Successful integration of the backend with the RADIUS server to grant and revoke access based on completed transactions; a functional Financial Reports generator for the Operator.
Milestone 5: End-to-End Testing & Deployment
Focus: Ensuring the entire system works flawlessly in a real-world scenario.
Deliverables: Rigorous testing of the complete flow with a physical MikroTik router; final, stable deployment of all system components to their production environments.

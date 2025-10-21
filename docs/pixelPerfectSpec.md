
Pixel-Perfect Functional Specification: Real Power Tech Platform
Version: 1.0
Purpose: This document provides the complete and final UI/UX specification for the Real Power Tech MVP. It translates all functional requirements from the PRD and Feature Manifest into a concrete visual and interactive blueprint. It is the single source of truth for all frontend design and development, ensuring consistency, usability, and a pixel-perfect implementation.

Part 1: Global Design System & Core Components
1.1. Core Design Philosophy: Clean, Data-Driven & Professional
The Operator Admin UI is a professional tool designed for clarity, efficiency, and data integrity. The Customer Captive Portal is designed for speed and simplicity.
Structure Through Typography & Spacing: We will use a strong typographic hierarchy and generous white space to guide the user's eye and group elements. Visible borders and containers will be used sparingly to maintain a clean, modern look.
Mobile-First Implementation: All designs must be conceived for a mobile screen first. This forces simplicity and prioritization, which then scales elegantly to larger screens. The Captive Portal, in particular, must be flawless on mobile.
Consistency is Key: A component, once defined (like a primary button or a modal), must look and behave identically everywhere it is used.
1.2. Color Palette
Primary Action (Blue): #007BFF - Used for primary buttons, links, active navigation states, and focus indicators.
Neutral Palette (Grays):
#FFFFFF (White) - Primary background for cards and modals.
#F8F9FA (Off-White) - Main page background color.
#E9ECEF (Light Gray) - Borders, dividers, disabled states.
#6C757D (Medium Gray) - Body text, labels, subtext.
#212529 (Dark Gray/Near Black) - Main headings, primary text.
Semantic Colors:
Success (Green): #28A745 - Used for success notifications, "Active" statuses.
Warning (Yellow): #FFC107 - Used for non-critical alerts.
Danger (Red): #DC3545 - Used for destructive actions (delete buttons), error messages, "Inactive" statuses.

1.3. Typography
Font: Inter (or a similar clean, sans-serif system font).
Hierarchy:
H1 (Page Title): 32px, Bold (font-weight: 700), Dark Gray.
H2 (Section Title): 24px, Semi-Bold (font-weight: 600), Dark Gray.
H3 (Card/Modal Title): 18px, Semi-Bold (font-weight: 600), Dark Gray.
Body (Primary Text): 16px, Regular (font-weight: 400), Medium Gray.
Label/Subtext: 14px, Regular (font-weight: 400), Medium Gray.
1.4. Buttons
All buttons must have clear default, hover, focus, and disabled states.
Primary Button: Solid Primary Blue background with white text. Used for the main positive action (e.g., "Save Partner," "Generate Report").
Disabled State: Light Gray background (#E9ECEF), medium gray text, cursor: not-allowed.
Secondary Button: White background with a Primary Blue border and text. Used for secondary actions (e.g., "Cancel").
Destructive Button: Solid Danger Red background with white text. Used exclusively for actions that delete data. Must always trigger a confirmation modal.
1.5. Forms & Input Fields
Layout: All form fields must have a clear, visible Label positioned above the input field.
Input Fields (Text, Email, Number):
Default State: White background with a light gray (#E9ECEF) border.
Focus State: Border color changes to Primary Blue with a subtle outer glow.
Error State: Border color changes to Danger Red. A corresponding error message in red text must appear directly below the input field.
Dropdowns (Selects): Styled consistently with text inputs.
1.6. Modals (Confirmation Dialogs)
Behavior: When active, the main page background must be covered by a semi-transparent dark overlay.
Structure:
Header: Contains the modal's title (H3) and a close icon (X).
Body: Contains the descriptive text or form elements.
Footer: A right-aligned container for the action buttons (Secondary "Cancel" and a Primary/Destructive action button).
1.7. Tables
Header: Bold text, with a bottom border to separate it from the data rows.
Rows: A subtle Off-White background must appear on row hover. No vertical borders between columns.
Pagination: All tables displaying more than 20 items must have pagination controls at the bottom.
1.8. Notifications & Toasts
Appearance: Small banners that slide in at the top-right of the screen. Must include a close icon.
Types: Success (Green background, white text), Error (Red background, white text).
1.9. Loading States & Empty States
Buttons: On click for an async action, the button text must be replaced by a spinner icon, and the button must be disabled.
Tables & Lists: During data fetch, the content area must be overlaid with a scrim and a central loading spinner, or display a "skeleton screen" mimicking the row layout.
Empty States: Every list or table must have a well-designed "empty state" consisting of an Icon, a clear Message (H3), and an optional Primary Action Button (e.g., "No partners found." -> "Add New Partner").


Part 2: Global Application Layout & Navigation
Purpose: To define the consistent structural shell of the application, including the main navigation patterns for the Operator and the distinct, single-purpose layouts for the login and customer-facing pages.
2.1. Authenticated Operator Layout (The Admin Shell)
This is the primary layout used for every screen inside the secure Admin Dashboard.
Layout: A modern, two-column layout.
Left Column (Sidebar): A fixed-width (e.g., 250px) sidebar with a dark gray or primary blue background. It is always visible on desktop and tablet screens.
Right Column (Main Content): The main content area with an Off-White (#F8F9FA) background. This area will have horizontal padding to ensure content never touches the screen edges.
Components:
Sidebar Content:
Brand Logo: The RPT logo is displayed prominently at the top.
Navigation Menu: A vertical list of navigation links (defined in 2.3).

Header (within Main Content Area):
A thin header that sits above the page content.
Left Side: Displays the H1 Page Title (e.g., "Dashboard," "Partner Management").
Right Side: Contains a User Profile Dropdown.
Appearance: Shows the Operator's email with a small chevron icon.
Interaction: On click, a dropdown menu appears with a "Logout" link. Clicking "Logout" must immediately invalidate the session and redirect to the Login screen.
2.2. Responsiveness (Mobile Admin Experience)
The Admin Dashboard must be fully functional on mobile devices.
Breakpoint: At screen widths below a certain threshold (e.g., 768px), the layout transforms.
Behavior:
The left sidebar disappears from view.
A "hamburger" menu icon appears in the header on the top-left.
Interaction: Tapping the hamburger icon causes the navigation sidebar to smoothly slide in from the left, covering the main content area with an overlay. Tapping a navigation link or tapping outside the menu area will cause it to slide back out.
2.3. Operator Navigation Menu (Sidebar Content)
The links displayed in the main navigation sidebar. The active link must be clearly indicated using a different background color and a bolder font weight.
Dashboard
Partners
Devices
Packages
Reports
2.4. Public Authentication Layout
This layout is used exclusively for the Login Screen.
Layout: A simple, single-column layout. The content (the login form) is centered vertically and horizontally on the page against the Off-White (#F8F9FA) background.
Structure: There is no navigation sidebar or header. The only elements are the company logo positioned above the central form. This focuses the user on the single task of authenticating.
2.5. Captive Portal Layout
This layout is used exclusively for the customer-facing page where they select a package.
Layout: A highly minimalist, single-column, mobile-first layout, centered on the page.
Philosophy: The design is driven by speed and the elimination of all possible distractions.
Structure:
There is no navigation sidebar, no header, and no footer.
The page consists only of the company logo, a brief welcome message, and the tappable service package cards.
The background will be a clean, neutral color (White or Off-White).


Part 3: Authentication & Operator Screens
Purpose: To specify the UI and interaction logic for the Operator's primary interfaces: the login screen and the core management dashboards for partners, locations, and packages.
3.1. Login Screen
Feature Manifest ID: FM-AUTH-001.1
Purpose: To allow the Operator to securely authenticate.
Layout: Public Authentication Layout (single-column, centered, no nav).
Components:
Linket Logo: Positioned above the form.
Header (H1): "Operator Login"
Subtext (Body): "Log in to manage your WiFi network."
Email Input:
Label: "Email Address"
Placeholder: "you@example.com"
Password Input:
Label: "Password"
Placeholder: "Enter your password"
Primary Button: Full-width. Text: "Login".
Interaction & States:
On Click "Login": The button immediately enters its loading state (spinner appears) and is disabled.
On Success (200 OK): The user is redirected to the main Admin Dashboard (/admin/dashboard).
On Failure (401 Unauthorized):
The button returns to its default state.
A general error message appears in a red box above the form: "Invalid email or password. Please try again."

3.2. Operator Dashboard
Feature Manifest ID: FM-DASH-001.1
Purpose: The Operator's central command center.
Layout: Authenticated Operator Layout (Admin Shell).
Components:
Header (H1): "Dashboard"
Stat Cards (Top Row): A grid of 4 cards. Each card has a subtle shadow, generous padding, and contains:
A Label (e.g., "Total Revenue").
A large, H2-sized number (e.g., "1,250,000 Tsh").
A small icon for visual context.
Recent Transactions Feed (Below Cards):
Header (H2): "Recent Transactions"
A simple, clean table (without borders, using horizontal dividers only).
Columns: Location Name, Package, Amount, Timestamp.
Interaction & States:
Loading State: On initial page load, the stat cards and the transaction table will display a "skeleton screen" (simplified, grayed-out shapes with a shimmer animation) while the data is being fetched.
Empty State: If there are no transactions yet, the table area will display a standard Empty State with an icon and the message "No transactions have been recorded yet."
3.3. Partner Management Screen
Feature Manifest ID: FM-PARTNER-001.1
Purpose: To provide a full CRUD interface for managing business partners.
Layout: Authenticated Operator Layout.
Components:
Header (H1): "Partner Management"
Primary Action Button (Top-Right): A Primary Button with the text "Add New Partner". This will trigger the Add/Edit Partner Modal (3.4).
Toolbar (Below Header): A row containing a single Search Input with the placeholder text "Search by partner name..."
Partners Table: A paginated data table.
Columns: Partner Name, Assigned Locations (count), Revenue Share %, Actions.
Actions Column: Contains two icon buttons: an "Edit" (pencil) icon and a "Remove" (trash) icon.
Interaction & States:
Loading State: The table body shows a Skeleton Screen.
Empty State: If no partners exist, the table area displays a standard Empty State with the message "No Partners Found" and a prominent Primary Button: "Add Your First Partner".
Edit: Clicking the "Edit" icon triggers the Add/Edit Partner Modal (3.4), pre-filled with that partner's data.
Remove: Clicking the "Remove" icon triggers the Remove Partner Confirmation Modal (3.5).
3.4. Add/Edit Partner Modal
Feature Manifest ID: FM-PARTNER-001.3
Layout: A standard Modal dialog.
Components:
Header (H3): Dynamically changes to "Add New Partner" or "Editing [Partner Name]".
Form Fields:
First Name: Required text input.
Last Name: Required text input.
Email: Optional email input.
Revenue Share %: Required number input.


Modal Footer:
Secondary Button: "Cancel" (closes the modal).
Primary Button: "Save Partner" (disabled until all required fields are valid).
Interaction & States:
On Click "Save Partner": The button enters its loading state.
On Success: The modal closes, the Partners Table in the background refreshes, and a Success Toast appears: "Partner saved successfully."
On Failure: The button returns to its default state, and a specific error message appears inside the modal above the footer (e.g., "An error occurred.").
3.5. Remove Partner Confirmation Modal
Feature Manifest ID: FM-PARTNER-001.6
Layout: Destructive Action Confirmation Modal.
Trigger: Clicking the "Remove" icon for a partner.
Components & Logic (Two States):
State 1: Partner has assigned locations.
Header (H3): "Cannot Remove Partner"
Icon: A warning or error icon.
Body Text: "This partner is currently assigned to [X] locations. You must re-assign or deactivate these locations before this partner can be removed."
Footer: A single "OK" button to close the modal.
State 2: Partner has zero assigned locations.
Header (H3): "Remove [Partner Name]?"
Icon: A question mark or warning icon.
Body Text: "Are you sure you want to remove this partner? This action cannot be undone."
Footer: A Secondary "Cancel" button and a Destructive Button "Remove".

Part 4: The Customer Captive Portal
Purpose: To specify the UI and interaction logic for the public-facing portal that all customers see upon connecting to the Wi-Fi. The design philosophy for this screen is absolute simplicity and speed to maximize conversion from connection to payment.
4.1. Captive Portal Screen
Feature Manifest ID: FM-PORTAL-001.1
Purpose: To present the available internet packages and serve as the single point of entry for a customer to initiate a purchase.
Layout: Captive Portal Layout (minimalist, single-column, mobile-first, no nav).
Components:
Brand Logo: The REAL POWERTECH logo is displayed prominently at the very top of the page.
Welcome Header (H1): A clear, concise welcome message. Example: "Get Connected".
Subtext (Body): A simple instruction. Example: "Please select a package to access the internet."
Service Package Cards: This is the core interactive element of the page. It is a vertical list of large, easily tappable cards.
Card Style:
Borderless: The cards have no visible border. Separation is achieved with a subtle box-shadow.
Padding: Generous internal padding.
Hover State: On desktop, the card will slightly scale up (transform: scale(1.03)) on hover to provide clear interactive feedback.
Card Content: Each card is a clickable/tappable element and contains:
Package Name (H3): e.g., "1-Hour Access"
Price (H2): The price is the most prominent element on the card, displayed in a large, bold font. e.g., "1,000 Tsh"
CTA (Call to Action) Text (Label): A subtle label like "Tap to Purchase".


Interaction & States:
Loading State:
The page must load almost instantly. A simple skeleton screen with 2-3 grayed-out card shapes is acceptable but should only be visible for a fraction of a second on a decent connection. Perceived performance is critical here.
On Click a Package Card:
The entire screen should provide immediate feedback that an action is being processed. An overlay with a loading spinner should appear, preventing further clicks.
The application makes the POST /api/portal/checkout request.
On Success: The user's browser is immediately redirected to the paymentUrl returned by the API. The loading overlay on our page is never dismissed; the user is simply taken to the ClickPesa site.
On Failure: If the API call fails for any reason, the loading overlay disappears, and an Error Toast appears at the top of the screen with a message like "Could not initiate payment. Please try again."
4.2. Payment Success Screen
Feature Manifest ID: FM-PAYMENT-001.3
Purpose: To provide a clear confirmation to the user after they have successfully paid on the ClickPesa site and have been redirected back. This page confirms that the process is complete and they can now use the internet.
Layout: A static, centered, single-purpose confirmation page. No navigation or other links.
Components:
Icon: A large, animated Success (Green) checkmark icon.
Header (H1): "You are connected!"
Subtext (Body): "Your session is valid for [Duration]. You can now close this page and browse the internet." The duration (e.g., "1 Hour," "24 Hours") should be dynamically inserted based on the package they purchased.

Part 5: The Financial Reports Screen
Purpose: To specify the UI and interaction logic for the Operator's financial reporting tool. The design must prioritize clarity, data accuracy, and the ability to generate a transparent, professional-looking statement that can be shared with partners.
5.1. Financial Reports Page
Feature Manifest ID: FM-REPORTS-001.1
Purpose: To allow the Operator to generate detailed payout statements for any partner over any date range.
Layout: Authenticated Operator Layout (Admin Shell).
Components:
Header (H1): "Financial Reports"
Filter Controls (Toolbar): A clean, single row of form controls at the top of the page.
Partner Dropdown: A required dropdown menu.
Label: "Select a Partner"
Options: Populated with the list of all partners. The default option is "Select a Partner...".
Date Range Picker: A single input that opens a calendar view, allowing the Operator to select a start and end date.
Label: "Select a Date Range"
Primary Button: "Generate Report". This button is disabled by default.
Report Display Area: The area below the filters where the generated report will appear. By default, this area is empty or shows an instructional message.
Interaction & States:
Button State: The "Generate Report" button becomes enabled only when a valid Partner has been selected AND a valid date range has been chosen.
On Click "Generate Report":
The button enters its loading state (spinner).
The Report Display Area below shows a large loading spinner or a skeleton screen that mimics the final report's layout.
The application makes the GET /api/admin/reports request.
On Success: The loading state is replaced by the fully rendered report (5.2). The button returns to its default state.
On Failure: The loading state is removed, and an Error Toast appears with a message like "Could not fetch report data."
5.2. Generated Report View
Feature Manifest ID: FM-REPORTS-001.5
Purpose: To display the financial data in a clean, easily understandable, and printable format.
Layout: This component appears within the Report Display Area after a report is generated.
Components:
Report Header Section: A clearly defined section at the top.
Title (H2): "Payout Report"
Sub-Headers (Body, Bold):
"Partner: [Partner Name]"
"Period: [Start Date] to [End Date]"
Summary Metrics Section: A visually distinct container (e.g., a card with a light gray border or background) that displays the most critical numbers.
Each metric is a Label followed by a large, bolded H3-sized value.
"Total Revenue Generated: 150,000 Tsh"
"Partner's Share ([X]%): 60,000 Tsh"
"Operator's Share ([Y]%): 90,000 Tsh"
Final Payout Amount: A separate, highlighted container for the final, most important number.
Label (H2): "Partner Payout Amount"
Value (H1, Success Green): "60,000 Tsh"
Detailed Transactions Table:
Header (H2): "Itemized Transactions"
A full, paginated table providing a transparent audit trail.
Columns: Transaction ID, Date & Time, Location Name, Package Purchased, Amount.
Table Footer: A final row that sums the "Amount" column, with the label "Total:", which must exactly match the "Total Revenue Generated" in the summary section above.
Empty State: If the "Generate Report" action is successful but returns zero transactions for the selected partner and date range, the Report Display Area will show a standard Empty State with an icon and the message: "No transactions were found for this partner in the selected period."



Real Power Tech: API Contract
Version: 1.0
Base URL: /api/v1
General Principles
Format: All request and response bodies are JSON (Content-Type: application/json).
Casing: All JSON properties use camelCase (e.g., partnerId).
Authentication: All protected admin endpoints (/api/v1/admin/*) require the user to be authenticated. The system uses a secure, HttpOnly session cookie managed by the framework. If a request is made to a protected endpoint without a valid session, the API will respond with a 401 Unauthorized error.
Success Codes:
200 OK: For successful GET or PUT requests.
201 Created: For successful resource creation (POST).
204 No Content: For successful DELETE requests where no body is returned.
Error Responses: All errors follow a consistent structure:
 {
  "status": 400,
  "error": "Bad Request",
  "message": "A clear, developer-friendly message or array of messages."
}

Module 1: Operator Authentication & Dashboard
This module corresponds to the core functionality from Milestone 1 of the Feature Manifest. It covers the secure login for the Operator and the data retrieval for the main dashboard.
1.1 Operator Authentication
Manifest ID: FM-AUTH-001
Endpoint: POST /auth/login
Access: Public
Purpose: Authenticates the Operator and establishes a secure session.
Request Body:
 {
  "email": "string (required, valid email format)",
  "password": "string (required)"
}
 
 Success Response (200 OK):
{
  "user": {
    "id": "string (UUID or ObjectId)",
    "email": "string"
  }
}
 Note: A secure session cookie is set in the response headers.
Error Responses: 400 Bad Request, 401 Unauthorized.

Endpoint: POST /auth/logout
Access: Authenticated Operator
Purpose: Invalidates the Operator's session and logs them out.
Request Body: (None)
Success Response (200 OK):
 {
  "message": "Logged out successfully."
}

Endpoint: GET /auth/me
Access: Authenticated Operator
Purpose: Retrieves the profile of the currently logged-in Operator. Useful for the frontend to verify an active session on page load.
Success Response (200 OK): Returns the full user object as defined in the login response.
Error Responses: 401 Unauthorized.

1.2 Operator Dashboard
Manifest ID: FM-DASH-001
Endpoint: GET /admin/dashboard-stats
Access: Authenticated Operator
Purpose: Fetches the aggregated statistics for the main dashboard cards and the live transaction feed.
Success Response (200 OK):
    {
  "stats": {
    "totalRevenue": "number",
    "totalUsersConnected": "number",
    "activeLocations": "number",
    "activePartners": "number"
  },
  "recentTransactions": [
    {
      "id": "string (UUID or ObjectId)",
      "locationName": "string",
      "packageName": "string",
      "amount": "number",
      "timestamp": "string (ISO 8601)"
    }
  ]
}

 Error Responses: 401 Unauthorized.


Module 2: Business Network Management
This module defines the endpoints used by the Operator on the Admin Dashboard to create, read, update, and delete partners, locations, and service packages. All endpoints in this module are protected and require Operator authentication.
2.1 Partner Management
Manifest ID: FM-PARTNER-001
Endpoint: GET /admin/partners
Access: Authenticated Operator
Purpose: Retrieves a paginated and searchable list of all partners.
Query Parameters:
search (string, optional): Filter partners by name.
page (integer, optional, default: 1)
limit (integer, optional, default: 20)
Success Response (200 OK):
 {
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 98
  },
  "data": [
    {
      "id": "string (UUID or ObjectId)",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "revenueSharePercentage": "number",
      "assignedLocationsCount": "number"
    }
  ]
}

Endpoint: POST /admin/partners
Access: Authenticated Operator
Purpose: Creates a new partner.
Request Body:
 {
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (optional, valid email)",
  "revenueSharePercentage": "number (required, 0-100)"
}
 
 Success Response (201 Created): Returns the newly created partner object.
 {
  "id": "string (UUID or ObjectId)",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "revenueSharePercentage": "number",
  "assignedLocationsCount": 0
}
 Error Responses: 400 Bad Request.

Endpoint: PUT /admin/partners/{partnerId}
Access: Authenticated Operator
Purpose: Updates the details of an existing partner.
URL Parameters: partnerId (string, UUID or ObjectId)
Request Body: (Same as POST)
Success Response (200 OK): Returns the updated partner object.
Error Responses: 400 Bad Request, 404 Not Found.

Endpoint: DELETE /admin/partners/{partnerId}
Access: Authenticated Operator
Purpose: Deletes a partner.
URL Parameters: partnerId (string, UUID or ObjectId)
Success Response (204 No Content): (No body)
Error Responses: 404 Not Found, 409 Conflict (if the partner still has locations assigned, with a message: "Cannot delete partner. Re-assign their X locations first.").

2.2 Device & Location Management
Manifest ID: FM-LOCATION-001
Endpoint: GET /admin/locations
Access: Authenticated Operator
Purpose: Retrieves a paginated and searchable list of all hotspot locations.
Query Parameters:
search (string, optional): Filter locations by name.
page (integer, optional, default: 1)
limit (integer, optional, default: 20)
Success Response (200 OK):
{
  "pagination": { ... },
  "data": [
    {
      "id": "string (UUID or ObjectId)",
      "name": "string",
      "routerIdentifier": "string (MAC Address)",
      "status": "string ('Active' or 'Inactive')",
      "partner": {
        "id": "string (UUID or ObjectId)",
        "name": "string (firstName + lastName)"
      }
    }
  ]
}

Endpoint: POST /admin/locations
Access: Authenticated Operator
Purpose: Creates a new hotspot location.



Request Body:
 {
  "name": "string (required)",
  "routerModel": "string (optional)",
  "routerIdentifier": "string (required, unique, MAC address format)",
  "partnerId": "string (required, UUID or ObjectId)"
}

 Success Response (201 Created): Returns the newly created location object.
Error Responses: 400 Bad Request, 409 Conflict (if MAC address already exists).

Endpoint: PUT /admin/locations/{locationId}
Access: Authenticated Operator
Purpose: Updates an existing location's details.
URL Parameters: locationId (string, UUID or ObjectId)
Request Body:
 {
  "name": "string (optional)",
  "status": "string (optional, 'Active' or 'Inactive')",
  "partnerId": "string (optional, UUID or ObjectId)"
}
 Success Response (200 OK): Returns the updated location object.
Error Responses: 400 Bad Request, 404 Not Found.

2.3 Service Package Management
Manifest ID: FM-PACKAGE-001
Endpoint: GET /admin/packages
Access: Authenticated Operator
Purpose: Retrieves the list of all service packages for the management UI.
Success Response (200 OK):
 [{
    "id": "string (UUID or ObjectId)",
    "name": "string",
    "price": "number",
    "durationMinutes": "number",
    "isActive": "boolean"
  }]


Endpoint: POST /admin/packages
Access: Authenticated Operator
Purpose: Creates a new service package.
Request Body:
 {
  "name": "string (required)",
  "price": "number (required, non-negative)",
  "durationMinutes": "number (required, positive integer)"
}
 
 Success Response (201 Created): Returns the newly created package object.
Error Responses: 400 Bad Request.

Endpoint: PUT /admin/packages/{packageId}
Access: Authenticated Operator
Purpose: Updates an existing service package.
URL Parameters: packageId (string, UUID or ObjectId)
Request Body:
 {
  "name": "string (optional)",
  "price": "number (optional, non-negative)",
  "durationMinutes": "number (optional, positive integer)",
  "isActive": "boolean (optional)"
}
 Success Response (200 OK): Returns the updated package object.
Error Responses: 400 Bad Request, 404 Not Found.


Module 3: The Customer Journey & Payment Engine
This module defines the public endpoints that power the Captive Portal. They are designed to be fast, simple, and do not require any authentication from the end-user's device.
3.1 Captive Portal
Manifest ID: FM-PORTAL-001
Endpoint: GET /portal/packages
Access: Public
Purpose: Fetches the list of all currently active service packages to be displayed on the Captive Portal.
Success Response (200 OK):
 [
  {
    "id": "string (UUID or ObjectId)",
    "name": "string",
    "price": "number",
    "durationMinutes": "number"
  }
]

 Note: This endpoint must be highly performant and should only return packages where isActive is true.

Manifest ID: FM-PAYMENT-001
Endpoint: POST /portal/checkout
Access: Public
Purpose: This is the crucial first step in a purchase. It takes the customer's selection, creates a pending transaction record, and returns the unique payment URL.
Request Body:
The MikroTik router must be configured to pass the customer's MAC address and its own identifier as query parameters to the Captive Portal URL. The frontend then includes this data in the request body.
 {
  "packageId": "string (required, UUID or ObjectId)",
  "customerMacAddress": "string (required, MAC address format)",
  "routerIdentifier": "string (required, MAC address format)"
}
 
 Success Response (200 OK):
 {
  "paymentUrl": "string (The secure URL to redirect the user to for payment)",
  "transactionId": "string (The internal ID of the newly created transaction)"
}
 Logic:
The endpoint first looks up the routerIdentifier in the HotspotLocation collection to find the locationId.
It then creates a new Transaction document with the locationId, packageId, customerMacAddress, and a status of "Pending".
Finally, it communicates with the ClickPesa API to generate a payment link for the correct amount and returns it.
Error Responses: 400 Bad Request (e.g., invalid MAC format, package not found), 404 Not Found (if routerIdentifier is not registered).

3.2 Payment Gateway Integration
Manifest ID: FM-INTEGRATE-001
Endpoint: POST /webhooks/clickpesa
Access: Public (Secured via signature verification)
Purpose: To receive asynchronous, server-to-server payment success/failure notifications from ClickPesa. This is the trigger that grants internet access.
Request Body:
The structure of the request body will be defined by ClickPesa's webhook specification. It will contain information like a transactionId, status, amount, and a cryptographic signature.
Success Response (200 OK):
An empty body with a 200 OK status is sent to acknowledge receipt of the webhook. All logic is performed in the background.
Critical Logic Flow:
Verify Signature: The endpoint's first action is to validate the webhook's signature. If it's invalid, the process stops and a 401 Unauthorized error is returned.
Find Transaction: If the signature is valid, the endpoint uses the transaction ID from the webhook payload to find the corresponding Transaction record in the database.
Update Status: It updates the transaction's status from "Pending" to "Completed".
Trigger Access Grant: This is the handoff to the RADIUS system. The endpoint's logic proceeds to create the authorization record in the database that the FreeRADIUS server will read (as detailed in Milestone 4).
Error Responses: 401 Unauthorized (if signature fails), 404 Not Found (if transaction ID doesn't exist).

Module 4: Financial Reporting
This module defines the secure, protected endpoint used by the Operator to generate the critical partner payout reports.
Manifest ID: FM-REPORTS-001
Endpoint: GET /admin/reports
Access: Authenticated Operator
Purpose: Generates a detailed financial report for a specific partner over a given date range.
Query Parameters:
partnerId (string, required, UUID or ObjectId): The ID of the partner to generate the report for.
startDate (string, required, ISO 8601 date format, e.g., "2025-10-01").
endDate (string, required, ISO 8601 date format, e.g., "2025-10-31").
Success Response (200 OK):
{
  "reportMetadata": {
    "partnerName": "string",
    "startDate": "string (ISO 8601)",
    "endDate": "string (ISO 8601)",
    "generatedAt": "string (ISO 8601)"
  },
  "summary": {
    "totalRevenueGenerated": "number",
    "revenueSharePercentage": "number",
    "partnerPayoutAmount": "number",
    "operatorShareAmount": "number"
  },
  "transactions": [
    {
      "id": "string (UUID or ObjectId)",
      "timestamp": "string (ISO 8601)",
      "locationName": "string",
      "packageName": "string",
      "amount": "number"
    }
  ]
}

 Logic:
The endpoint first validates that the partnerId exists.
It queries the Transaction collection to find all documents where the status is "Completed" and the createdAt timestamp is within the startDate and endDate.
Crucially, it must perform a lookup/join to filter these transactions, including only those that belong to a HotspotLocation that is assigned to the specified partnerId.
It then aggregates the amount from all found transactions to calculate the totalRevenueGenerated.
Using the revenueSharePercentage from the Partner record, it calculates the final partnerPayoutAmount and operatorShareAmount.
It returns the full, transparent report.
Error Responses: 400 Bad Request (e.g., missing parameters, invalid date format), 401 Unauthorized, 404 Not Found (if partnerId is invalid).



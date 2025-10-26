Real Power Tech — Deployment & Integration Runbook

Overview
This runbook guides you through deploying the Next.js application, provisioning the MongoDB Atlas database, integrating ClickPesa, setting up FreeRADIUS with MongoDB, and configuring MikroTik Hotspot. Follow the steps in order.

1. Prerequisites

- Domains: app.realpowertech.com (web app), radius.realpowertech.com (RADIUS server)
- GitHub repository hooked to Vercel (or your chosen platform)
- ClickPesa account with access to Hosted Applications and API Applications
- Cloud VM provider for RADIUS (Fly.io, DigitalOcean, or VPS)

2. Environment Variables
   Create .env.local for local dev and set the same on Vercel:

- MONGODB_URI
- MONGODB_DB (optional)
- NEXTAUTH_SECRET (64+ chars)
- NEXTAUTH_URL (only in production)
- CLICKPESA_CLIENT_ID, CLICKPESA_API_KEY, CLICKPESA_CHECKSUM_KEY
- CLICKPESA_BASE_URL (optional; defaults to production)
- CLICKPESA_CURRENCY (optional; defaults to TZS)
- RADIUS_WRITE_ENABLED (false until RADIUS is live)

See .env.example for template.

3. MongoDB Atlas

- Create a new cluster in Atlas.
- Network Access: add IPs for Vercel (or 0.0.0.0/0 temporarily for staging) and the RADIUS server IP.
- Database Access: create an application user and password.
- Get the connection string (mongodb+srv://...).
- Seed an operator user:
  - node scripts/seed-operator.js [mongodb-uri] [email] [password]

4. Vercel (Next.js App)

- Import the GitHub repo into Vercel.
- Set environment variables in Vercel Project Settings → Environment Variables.
- Set NEXTAUTH_URL to https://app.realpowertech.com.
- Deploy main branch; verify:
  - /login loads; you can sign in with the seeded operator.
  - /admin/dashboard shows data after you add packages/partners/locations.

5. ClickPesa Integration
   A. API Application

- In ClickPesa Dashboard, create an API Application.
- Retrieve Client ID and API Key; set on Vercel.
- Optional: set CLICKPESA_BASE_URL if using a sandbox endpoint.

B. Hosted Application

- Create a Hosted Application in ClickPesa Dashboard.
- Configure Success URL: https://app.realpowertech.com/portal/success?orderReference={{orderReference}}
- Configure Cancel URL (optional): https://app.realpowertech.com/portal
- Enable/confirm Checksum and set the same key as CLICKPESA_CHECKSUM_KEY.

C. Webhook

- Point webhooks to: https://app.realpowertech.com/api/v1/webhooks/clickpesa
- Ensure webhook payload includes orderReference and checksum when enabled.
- Verify that test payments mark transactions Completed.

6. FreeRADIUS Server
   Provision a small Linux VM (Ubuntu 22.04+). Ensure a static IP.

Install FreeRADIUS and MongoDB module:

- apt update && apt install -y freeradius freeradius-mongodb

Configure MongoDB datasource (rlm_mongodb):

- Typically in /etc/freeradius/mods-available/mongodb
- Set URI to Atlas connection string
- Configure collection = "radcheck"
- Ensure the schema matches documents created by the app:
  - username: normalized MAC (lowercase, no separators)
  - attribute: "Session-Timeout"
  - op: ":="
  - value: string seconds (e.g., "3600")

Link module and sites:

- ln -s /etc/freeradius/mods-available/mongodb /etc/freeradius/mods-enabled/
- In /etc/freeradius/sites-enabled/default, enable mongodb in authorize section:
  authorize {
  mongodb
  }

Configure RADIUS clients:

- Edit /etc/freeradius/clients.conf
- Add MikroTik routers:
  client mikrotik-<name> {
  ipaddr = <router-public-ip-or-cidr>
  secret = <strong-shared-secret>
  }

Restart and test:

- systemctl restart freeradius
- tail -f /var/log/freeradius/radius.log (or journalctl -u freeradius -f)

7. MikroTik Hotspot
   In WinBox or CLI:

- Set Hotspot to use external RADIUS server:
  /radius add service=hotspot address=<radius_ip> secret=<shared_secret>

- Set captive portal login (walled garden): allow your app domain and ClickPesa domains.
  Example (adjust to your domains):
  /ip hotspot walled-garden add dst-host=app.realpowertech.com
  /ip hotspot walled-garden add dst-host=api.clickpesa.com

- Configure login redirect to your Portal with query params:
  Example captive portal URL:
  https://app.realpowertech.com/portal?mac=$(mac)&router=$(identity)
  Or use router MAC:
  https://app.realpowertech.com/portal?mac=$(mac)&router=$(mac)
  Ensure the value you send as router maps to HotspotLocation.routerIdentifier (MAC) in admin.

- Verify that unauthenticated users only reach your portal and ClickPesa.

8. End-to-End Test Checklist

- Admin:

  - Add Partner (set revenue share %).
  - Add Hotspot Location (routerIdentifier = router MAC), link to Partner.
  - Add Service Packages (active).

- Portal:

  - Navigate with ?mac=<device-mac>&router=<router-mac>.
  - Select a package → redirected to ClickPesa.

- Payment:

  - Complete sandbox payment.
  - Webhook updates Transaction to Completed.
  - If RADIUS_WRITE_ENABLED=true, radcheck has Session-Timeout record.

- Access:

  - Device authenticates via RADIUS and gets internet for duration.

- Reports:
  - Generate payout report for Partner and date range.

9. Troubleshooting

- Checkout link fails:
  - Ensure ClickPesa Hosted Application is enabled, and API credentials match.
  - Check CLICKPESA_CLIENT_ID/API_KEY and base URL.
- Webhook says Invalid checksum:
  - Confirm payload checksum matches CLICKPESA_CHECKSUM_KEY on both sides.
- RADIUS not granting access:
  - Confirm radcheck doc exists and FreeRADIUS mongodb module reads it.
  - Check clients.conf secret and router IP.
  - Ensure MikroTik points to the correct RADIUS IP and service=hotspot is enabled.
- Portal not resolving location:
  - routerIdentifier in query must match HotspotLocation.routerIdentifier exactly (MAC format XX:XX:XX:XX:XX:XX).

10. Post-Go-Live (Optional Enhancements)

- Add error tracking (Sentry) to app and capture webhook/RADIUS errors.
- Add TTL cleanup for radcheck using expiresAt index or a daily cron.
- Add dashboards for basic observability.

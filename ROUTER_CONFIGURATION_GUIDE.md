# MikroTik Router Configuration Guide

## ⚡ Quick Setup (5 minutes)

This guide shows you how to configure your MikroTik router to work with the instant activation system.

## Prerequisites

- MikroTik router (hAP ax² or any RouterOS device)
- Router accessible at 192.168.88.1
- WinBox or SSH access
- Admin credentials

## Step-by-Step Configuration

### 1. Connect to Router

**Option A: WinBox (recommended for Windows)**

- Download WinBox: https://mikrotik.com/download
- Connect to 192.168.88.1
- Login with admin credentials

**Option B: SSH (for Linux/Mac)**

```bash
ssh admin@192.168.88.1
```

### 2. Disable RADIUS Authentication

The hotspot currently uses RADIUS for authentication. We need to disable it and use API-based activation instead.

```routeros
# Disable RADIUS authentication
/ip hotspot profile set default use-radius=no

# Clear login methods (no splash page required)
/ip hotspot profile set default login-by=""
```

**Verify:**

```routeros
/ip hotspot profile print
```

Expected output:

```
  name="default" ... use-radius=no login-by=""
```

### 3. Enable REST API (HTTPS)

```routeros
# Enable API-SSL service on port 443
/ip service enable api-ssl
/ip service set api-ssl port=443

# Optional: Disable insecure services
/ip service disable api
/ip service disable telnet
```

**Verify:**

```routeros
/ip service print
```

Expected output:

```
  ... api-ssl ... port=443 ... disabled=no
```

### 4. Create API User

Create a dedicated user for API access with full permissions:

```routeros
/user add name=api-admin password=SecurePass123! group=full comment="API access for payment system"
```

**⚠️ IMPORTANT:** Replace `SecurePass123!` with a strong password!

**Verify:**

```routeros
/user print
```

Expected output:

```
  ... name="api-admin" group=full
```

### 5. Test API Connection

From your computer (not the router), test the API:

```bash
curl -k -u api-admin:SecurePass123! https://192.168.88.1/rest/system/identity
```

**Expected response:**

```json
{ "name": "MikroTik" }
```

**If you get an error:**

- Check firewall rules (allow HTTPS from your IP)
- Verify API-SSL service is running
- Verify username/password are correct

### 6. Configure Admin Panel

Now configure the location in the admin panel:

1. Navigate to: **Admin Panel → Devices → Edit Location**

2. Fill in MikroTik API credentials:

   - **Router API URL:** `https://192.168.88.1`
   - **Router API Username:** `api-admin`
   - **Router API Password:** `SecurePass123!` (your chosen password)
   - **Activation Method:** `MikroTik REST API (Recommended)`

3. Click **Save**

### 7. Test Payment Flow

1. Make a test payment (small amount, like 500 TZS)
2. After payment success, check Vercel logs for activation:
   ```
   🚀 Activating user via MikroTik API
   ✅ MikroTik activation successful
   ```
3. Verify user created on router:
   ```routeros
   /ip hotspot user print
   ```

Expected output:

```
  ... name="AA:BB:CC:DD:EE:FF" limit-uptime="01:00:00"
```

## 🔒 Security Best Practices

### 1. Strong Password

Generate a secure password:

```bash
# Linux/Mac
openssl rand -base64 32

# Or use a password manager
```

### 2. Firewall Rules (Optional but recommended)

Only allow API access from Vercel IPs:

```routeros
# Get Vercel IP ranges from: https://vercel.com/docs/concepts/edge-network/overview

# Example (update with actual Vercel IPs):
/ip firewall filter add chain=input protocol=tcp dst-port=443 src-address=76.76.21.0/24 action=accept comment="Vercel API access"
/ip firewall filter add chain=input protocol=tcp dst-port=443 action=drop comment="Block other API access"
```

### 3. User Permissions

If you want to restrict API user permissions (optional):

```routeros
# Create custom group with limited permissions
/user group add name=api-only policy=api,read,write,test

# Change user group
/user set api-admin group=api-only
```

## 🧪 Testing & Verification

### Test 1: API Connection

```bash
curl -k -u api-admin:SecurePass123! https://192.168.88.1/rest/system/identity
```

✅ Should return: `{"name":"MikroTik"}`

### Test 2: Create Hotspot User (Manual)

```bash
curl -k -u api-admin:SecurePass123! \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name":"AA:BB:CC:DD:EE:FF","limit-uptime":"00:05:00","profile":"default"}' \
  https://192.168.88.1/rest/ip/hotspot/user/add
```

✅ Should return: `{"ret":"*1234"}` (user ID)

### Test 3: Verify User Created

```routeros
/ip hotspot user print
```

✅ Should show: `name="AA:BB:CC:DD:EE:FF" limit-uptime="00:05:00"`

### Test 4: Delete Test User

```routeros
/ip hotspot user remove [find name="AA:BB:CC:DD:EE:FF"]
```

## 🐛 Troubleshooting

### Error: "Connection refused"

**Cause:** API-SSL service not running  
**Fix:** `/ip service enable api-ssl`

### Error: "Authentication failed"

**Cause:** Wrong username or password  
**Fix:** Verify credentials, reset password if needed

### Error: "SSL certificate verify failed"

**Cause:** Self-signed certificate  
**Fix:** Already handled (code uses `rejectUnauthorized: false`)

### Error: "failure: already have such user"

**Cause:** User already exists on router  
**Fix:** This is handled automatically in the code (we remove existing user first)

### Users not disconnecting automatically

**Cause:** `limit-uptime` not set  
**Fix:** Verify package `durationMinutes` is set correctly in admin panel

### Webhook activation not working

1. Check Vercel logs for errors
2. Verify router API credentials in admin panel
3. Test API connection from local machine
4. Check router firewall rules

## 📊 Monitoring Active Sessions

### View active hotspot sessions

```routeros
/ip hotspot active print
```

Expected output:

```
  ... user="AA:BB:CC:DD:EE:FF" uptime=00:15:23 session-time-left=00:44:37
```

### View all hotspot users

```routeros
/ip hotspot user print
```

### Remove all test users

```routeros
/ip hotspot user remove [find]
```

## 🔄 Rollback (If needed)

If you need to revert to RADIUS:

```routeros
# Re-enable RADIUS
/ip hotspot profile set default use-radius=yes

# Set RADIUS server (update IP address)
/radius add address=139.84.241.180 secret=testing123 service=hotspot
```

Then uncomment RADIUS code in webhook handler and redeploy.

## ✅ Configuration Complete

Once all steps are complete:

- ✅ RADIUS disabled
- ✅ API-SSL enabled on port 443
- ✅ API user created
- ✅ API connection tested
- ✅ Admin panel configured
- ✅ Test payment successful

**Next step:** Monitor production payments and verify instant activation!

## 📞 Support

If you encounter issues:

1. Check MikroTik logs: `/log print`
2. Check Vercel deployment logs
3. Verify router firewall: `/ip firewall filter print`
4. Test API manually with curl commands above

---

**Last Updated:** 2025-01-17  
**Router Model:** MikroTik hAP ax²  
**RouterOS Version:** 7.20.4

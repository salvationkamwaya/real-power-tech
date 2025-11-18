# New Device Registration Manual

## Adding MikroTik Routers to Real Power Tech Hotspot System

**Document Version:** 1.0  
**Last Updated:** November 18, 2025  
**Target Audience:** System Administrators, Technical Staff

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites Checklist](#prerequisites-checklist)
3. [Step-by-Step Registration Process](#step-by-step-registration-process)
4. [Testing & Verification](#testing--verification)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Procedures](#rollback-procedures)

---

## Overview

This manual guides you through adding a new MikroTik router location to the Real Power Tech hotspot system. The process involves:

1. **MongoDB**: Registering the location and router details
2. **Vultr Server**: Adding WireGuard VPN peer
3. **MikroTik Router**: Configuring new router with settings
4. **Application**: Testing payment and user creation flow

**Time Required:** ~60 minutes  
**Difficulty:** Intermediate  
**Downtime:** None (zero-downtime deployment)

---

## Prerequisites Checklist

### Required Information

Before starting, gather the following information:

- [ ] **Router Details**

  - [ ] Router model (e.g., MikroTik hAP ax²)
  - [ ] Serial number (found in `/system routerboard print`)
  - [ ] RouterOS version (7.20.4 or later recommended)
  - [ ] Physical location address

- [ ] **Network Information**

  - [ ] Public IP address (if available)
  - [ ] ISP connection type (fiber, DSL, etc.)
  - [ ] Bandwidth capacity
  - [ ] Next available VPN IP (e.g., 10.99.0.3, 10.99.0.4, etc.)

- [ ] **Location Details**

  - [ ] Business/location name
  - [ ] Contact person name and phone
  - [ ] Operating hours
  - [ ] Expected number of concurrent users

- [ ] **Access Credentials**
  - [ ] MongoDB access (connection string)
  - [ ] Vultr server SSH access (root or sudo user)
  - [ ] MikroTik router access (admin account)
  - [ ] Application admin panel access

### Required Tools

- [ ] SSH client (Terminal, PuTTY, etc.)
- [ ] Web browser (for router web interface)
- [ ] MongoDB Compass or mongosh CLI
- [ ] Text editor (for copying configurations)
- [ ] Mobile phone (for testing payment)

### Required Files

- [ ] `login.html` (customized hotspot login page)
- [ ] `login-auth.html` (auto-submit authentication page)
- [ ] Router configuration template (from MikroTik setup guide)

---

## Step-by-Step Registration Process

### Part 1: Prepare New Router Hardware

#### 1.1. Initial Router Setup

```bash
# Connect to router via Winbox or WebFig
# Default IP: 192.168.88.1
# Default username: admin
# Default password: (empty)

# After login, you'll be prompted to set a password
# Choose a strong password and save it securely
```

#### 1.2. Get Router Identifier (Bridge MAC Address)

```routeros
# In RouterOS terminal:
/interface bridge print

# Find the bridge interface (usually named "bridge")
# Note the MAC address - this is your routerIdentifier
# Example: F4:1E:57:F8:7F:0A

# Alternative: Use the MAC of main ethernet interface
/interface ethernet print detail
```

**Save this MAC address - it's the unique identifier for this location!**

### Part 2: Register Location in MongoDB

#### 2.1. Connect to MongoDB

```bash
# Option 1: Using MongoDB Compass GUI
# - Open MongoDB Compass
# - Connect using connection string
# - Navigate to database (e.g., "real-power-tech")

# Option 2: Using mongosh CLI
mongosh "mongodb+srv://user:password@cluster.mongodb.net/real-power-tech"
```

#### 2.2. Create Location Record

```javascript
// In MongoDB Compass or mongosh:

// Switch to database
use("real-power-tech");

// Insert new location
db.hotspotlocations.insertOne({
  name: "Coffee Shop - Branch 2",
  locationName: "Real Power Tech - Coffee Shop Mlimani",
  routerIdentifier: "XX:XX:XX:XX:XX:XX", // ← Replace with bridge MAC
  apiConfig: {
    host: "139.84.241.180", // Vultr public IP
    port: "8729",
    username: "apiuser",
    password: "your-api-password", // Same as other routers
    protocol: "https",
  },
  address: {
    street: "Mlimani City Shopping Mall",
    city: "Dar es Salaam",
    region: "Kinondoni",
    country: "Tanzania",
  },
  contact: {
    name: "John Doe",
    phone: "255712345678",
    email: "john@example.com",
  },
  networkConfig: {
    vpnIp: "10.99.0.3", // ← Next available VPN IP
    localNetwork: "192.168.88.0/24",
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Save the returned _id - you'll need it later!
```

#### 2.3. Verify Location Created

```javascript
// Find the location you just created
db.hotspotlocations.findOne({
  routerIdentifier: "XX:XX:XX:XX:XX:XX",
});

// Should return the complete document with _id
```

### Part 3: Configure WireGuard VPN

#### 3.1. Generate WireGuard Keys on Router

```routeros
# On the NEW MikroTik router:

# Create WireGuard interface
/interface wireguard add name=wireguard-rpt listen-port=13231

# Get the public key (you'll need this for Vultr)
:put [/interface wireguard get wireguard-rpt public-key]

# Example output: AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCDEFG=
# SAVE THIS PUBLIC KEY!
```

#### 3.2. Add Peer on Vultr Server

```bash
# SSH to Vultr server
ssh root@139.84.241.180

# Stop WireGuard
systemctl stop wg-quick@wg0

# Edit config
nano /etc/wireguard/wg0.conf

# Add new peer at the end (AFTER existing peers):
# [Peer]
# PublicKey = ROUTER_PUBLIC_KEY_FROM_STEP_3.1
# AllowedIPs = 10.99.0.X/32  # Use next available IP (3, 4, 5, etc.)
# PersistentKeepalive = 25

# Example for third router:
[Peer]
PublicKey = AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCDEFG=
AllowedIPs = 10.99.0.3/32
PersistentKeepalive = 25

# Save and exit (Ctrl+X, Y, Enter)

# Start WireGuard
systemctl start wg-quick@wg0

# Verify peer added
wg show

# You should see the new peer listed, but "latest handshake" will show
# "never" until the router connects
```

#### 3.3. Configure Router WireGuard Peer

```routeros
# On the MikroTik router:

# Get Vultr server public key (you should have this from server setup)
# If not, get it from server: wg show wg0 public-key
# Example: 2mHXqcT6F/shTo5E5aivX3fS9HZ3IUDONDFYuh7XPic=

# Add Vultr as peer
/interface wireguard peers add \
  interface=wireguard-rpt \
  public-key="2mHXqcT6F/shTo5E5aivX3fS9HZ3IUDONDFYuh7XPic=" \
  endpoint-address=139.84.241.180 \
  endpoint-port=51820 \
  allowed-address=10.99.0.0/24 \
  persistent-keepalive=25s

# Assign VPN IP to interface
/ip address add address=10.99.0.3/24 interface=wireguard-rpt

# Add route to VPN network
/ip route add dst-address=10.99.0.0/24 gateway=wireguard-rpt

# Enable WireGuard interface
/interface wireguard enable wireguard-rpt
```

#### 3.4. Verify VPN Connection

```routeros
# On MikroTik router:

# Check WireGuard status
/interface wireguard peers print

# Look for "current-endpoint-address" and "last-handshake"
# Should show recent handshake (< 2 minutes ago)

# Ping Vultr VPN gateway
/ping 10.99.0.1 count=5

# Should get replies (time < 50ms typically)
```

```bash
# On Vultr server:

# Check peer connection
wg show

# Should show:
# peer: AbCdEfGhIjKlMnOpQrStUvWxYz1234567890ABCDEFG=
#   endpoint: XXX.XXX.XXX.XXX:13231
#   allowed ips: 10.99.0.3/32
#   latest handshake: X seconds ago  # ← Should be recent!

# Ping router through VPN
ping 10.99.0.3 -c 5

# Should get replies
```

### Part 4: Complete Router Configuration

Follow the complete router setup from **01-MIKROTIK-ROUTER-SETUP-GUIDE.md**, but with these location-specific values:

#### 4.1. Key Settings to Update

```routeros
# System Identity
/system identity set name="RPT-CoffeeShop-Mlimani"

# Bridge MAC (already set, just verify)
/interface bridge print
# Note the MAC - should match MongoDB routerIdentifier

# WireGuard (already done in Part 3)
# VPN IP: 10.99.0.3/24 (or your assigned IP)

# Hotspot profile (same for all locations)
/ip hotspot profile
set hsprof1 use-radius=no login-by=mac,http-pap,mac-cookie

# DHCP pool (standard)
/ip pool add name=dhcp_pool ranges=192.168.88.10-192.168.88.254

# IP address on bridge (standard)
/ip address add address=192.168.88.1/24 interface=bridge

# DNS servers (same for all)
/ip dns set servers=8.8.8.8,1.1.1.1

# Timezone (adjust for location if needed)
/system clock set time-zone-name=Africa/Dar_es_Salaam
```

#### 4.2. Upload Custom Login Pages

**login.html** - Update routerIdentifier

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Redirecting...</title>
  </head>
  <body>
    <h2>Redirecting to portal...</h2>
    <script>
      const routerIdentifier = "XX:XX:XX:XX:XX:XX"; // ← YOUR BRIDGE MAC
      const portalUrl = "https://rpt-phi.vercel.app";

      const params = new URLSearchParams(window.location.search);
      params.set("rid", routerIdentifier);

      window.location.href = `${portalUrl}?${params.toString()}`;
    </script>
  </body>
</html>
```

```routeros
# Upload to router via FTP or drag-and-drop in Winbox
# Then verify:
/file print where name="login.html"

# Set as hotspot login page
/ip hotspot profile set hsprof1 html-directory=hotspot
```

**login-auth.html** - Upload as-is (no changes needed)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Logging in...</title>
  </head>
  <body>
    <form name="sendin" action="$(link-login)" method="post">
      <input type="hidden" name="username" value="$(mac)" />
      <input type="hidden" name="password" value="$(mac)" />
    </form>
    <script>
      document.sendin.submit();
    </script>
  </body>
</html>
```

```routeros
# Upload and verify
/file print where name="login-auth.html"
```

### Part 5: Update Application Configuration (Optional)

If you have location-specific packages or settings:

#### 5.1. Create Location-Specific Packages

```javascript
// In MongoDB:
use("real-power-tech");

// Create package for this location
db.servicepackages.insertOne({
  name: "Coffee Shop Special - 2 Hours",
  duration: "2h",
  price: 1500,
  currency: "TZS",
  description: "Extended browsing for coffee lovers",
  isActive: true,
  locationId: ObjectId("YOUR_LOCATION_ID_FROM_PART_2"),
  sortOrder: 5,
  features: ["High-speed internet", "No data limit", "Valid for 2 hours"],
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

#### 5.2. Update Environment Variables (if needed)

If the router requires different API access:

```bash
# In Vercel dashboard or .env.local:
# MIKROTIK_HOST remains same (Vultr public IP)
# MIKROTIK_PORT remains 8729
# Only update if location has different credentials
```

---

## Testing & Verification

### Test 1: VPN Connectivity

```bash
# From Vultr server:
ping 10.99.0.3 -c 10

# Expected: 0% packet loss, < 50ms latency
```

### Test 2: API Access Through VPN

```bash
# From Vultr server or local machine (via VPN):
curl -k -u apiuser:password https://10.99.0.3:8729/rest/system/identity

# Expected: {"name":"RPT-CoffeeShop-Mlimani"}
```

### Test 3: Hotspot Portal Redirect

1. Connect mobile phone to WiFi (SSID: "Real Power Tech")
2. Try to browse any website (e.g., google.com)
3. Should redirect to: `https://rpt-phi.vercel.app?mac=XX:XX:XX:XX:XX:XX&rid=...`
4. Portal should display package selection

### Test 4: End-to-End Payment Flow

1. **Select Package**: Choose "1 Hour - 1,000 TZS"
2. **Enter Phone**: Input mobile number (e.g., 255712345678)
3. **Initiate Payment**: Click "Pay Now"
4. **Mobile Prompt**: Receive USSD prompt on phone
5. **Confirm Payment**: Enter PIN and confirm
6. **Wait for Webhook**: System creates user (check logs)
7. **Auto-Login**: Should redirect and auto-authenticate
8. **Internet Access**: Try browsing - should work!

### Test 5: Verify User Created in MikroTik

```routeros
# Check hotspot users
/ip hotspot user print

# Should see entry:
# name=XX:XX:XX:XX:XX:XX
# password=XX:XX:XX:XX:XX:XX
# mac-address=XX:XX:XX:XX:XX:XX
# limit-uptime=1h
# comment=1 Hour Package - Paid 1000 TZS
```

### Test 6: Active Session Monitoring

```routeros
# Check active sessions
/ip hotspot active print

# Should show:
# user=XX:XX:XX:XX:XX:XX
# address=192.168.88.XXX
# uptime=X minutes
# bytes-in=XXXX
# bytes-out=XXXX
```

### Test 7: MongoDB Transaction Record

```javascript
// In MongoDB:
db.transactions
  .find({
    userMac: "XX:XX:XX:XX:XX:XX",
  })
  .sort({ createdAt: -1 })
  .limit(1);

// Should show:
// status: "completed"
// paymentDetails.paidAt: <recent timestamp>
```

---

## Troubleshooting

### Issue: VPN not connecting

**Symptoms:**

- `wg show` on Vultr shows no handshake
- Can't ping router from server (10.99.0.3)

**Solutions:**

1. **Check firewall on router:**

   ```routeros
   /ip firewall filter print where chain=input
   # Make sure UDP port 13231 is allowed
   ```

2. **Check Vultr firewall:**

   ```bash
   ufw status | grep 51820
   # Should allow 51820/udp
   ```

3. **Verify public keys match:**

   ```bash
   # On Vultr:
   cat /etc/wireguard/wg0.conf | grep PublicKey

   # On Router:
   /interface wireguard peers print
   # public-key should match server config
   ```

4. **Check endpoint address:**
   ```routeros
   /interface wireguard peers print detail
   # endpoint-address should be 139.84.241.180
   # endpoint-port should be 51820
   ```

### Issue: Portal doesn't redirect

**Symptoms:**

- User connects to WiFi
- Tries to browse, gets "Page not found" or timeout

**Solutions:**

1. **Check walled garden:**

   ```routeros
   /ip hotspot walled-garden print
   # Must include: rpt-phi.vercel.app, *.vercel.app
   ```

2. **Check DNS:**

   ```routeros
   /ip dns print
   # servers should be 8.8.8.8, 1.1.1.1 or similar
   ```

3. **Check login.html file:**

   ```routeros
   /file print where name="login.html"
   # Should exist in hotspot directory

   # View contents:
   /file print file-name=login.html
   ```

4. **Verify routerIdentifier in login.html:**
   - Download login.html file
   - Check `const routerIdentifier = "..."`
   - Must match bridge MAC exactly!

### Issue: Payment successful but no internet

**Symptoms:**

- User paid, got confirmation
- Still can't browse internet

**Solutions:**

1. **Check webhook logs:**

   ```bash
   # In Vercel dashboard → Project → Functions → Logs
   # Look for /api/v1/webhooks/clickpesa
   # Check for errors in user creation
   ```

2. **Verify user exists:**

   ```routeros
   /ip hotspot user print where name="XX:XX:XX:XX:XX:XX"
   # User should exist with:
   # - password = MAC address
   # - disabled = no
   # - address = (empty)
   ```

3. **Check transaction status:**

   ```javascript
   db.transactions.findOne({
     orderReference: "TXN-XXXXXXXXX",
   });
   // status should be "completed"
   ```

4. **Manually create user (as test):**

   ```routeros
   /ip hotspot user add \
     name=XX:XX:XX:XX:XX:XX \
     password=XX:XX:XX:XX:XX:XX \
     mac-address=XX:XX:XX:XX:XX:XX \
     profile=hsprof1 \
     limit-uptime=1h \
     comment="Manual test"

   # User should now be able to connect
   ```

### Issue: API access fails

**Symptoms:**

- Webhook can't create user
- Error: "Connection refused" or "Timeout"

**Solutions:**

1. **Test API from Vultr:**

   ```bash
   ssh root@139.84.241.180
   curl -k -u apiuser:password https://10.99.0.3:8729/rest/system/identity
   # Should return router name
   ```

2. **Check API service on router:**

   ```routeros
   /ip service print where name=api-ssl
   # port should be 8729
   # address should be 10.99.0.0/24 (or empty for all)
   ```

3. **Verify API user:**

   ```routeros
   /user print where name=apiuser
   # Should exist with group=write
   ```

4. **Check Nginx proxy on Vultr:**
   ```bash
   systemctl status nginx
   ss -tlnp | grep 8729
   # Should show nginx listening on 8729
   ```

---

## Rollback Procedures

### If Registration Fails (Before Going Live)

#### 1. Remove from MongoDB

```javascript
// Delete location
db.hotspotlocations.deleteOne({
  routerIdentifier: "XX:XX:XX:XX:XX:XX",
});

// Delete any transactions
db.transactions.deleteMany({
  locationId: ObjectId("YOUR_LOCATION_ID"),
});

// Delete location-specific packages
db.servicepackages.deleteMany({
  locationId: ObjectId("YOUR_LOCATION_ID"),
});
```

#### 2. Remove from Vultr VPN

```bash
# SSH to Vultr
ssh root@139.84.241.180

# Stop WireGuard
systemctl stop wg-quick@wg0

# Edit config
nano /etc/wireguard/wg0.conf

# Delete the [Peer] section you added
# (Remove entire block with PublicKey, AllowedIPs, etc.)

# Save and restart
systemctl start wg-quick@wg0

# Verify
wg show
# Your peer should be gone
```

#### 3. Reset Router (Full Rollback)

```routeros
# Factory reset router
/system reset-configuration no-defaults=yes skip-backup=yes

# Router will reboot to default settings
```

### If Issues After Going Live

**DO NOT delete from MongoDB or Vultr!**

Instead:

1. **Disable location temporarily:**

   ```javascript
   db.hotspotlocations.updateOne(
     { routerIdentifier: "XX:XX:XX:XX:XX:XX" },
     { $set: { isActive: false } }
   );
   ```

2. **Investigate issue** using troubleshooting guide above

3. **Re-enable when fixed:**
   ```javascript
   db.hotspotlocations.updateOne(
     { routerIdentifier: "XX:XX:XX:XX:XX:XX" },
     { $set: { isActive: true } }
   );
   ```

---

## Post-Registration Checklist

After successful registration, verify:

- [ ] Location record exists in MongoDB with correct `routerIdentifier`
- [ ] VPN connection established (check `wg show` on Vultr)
- [ ] Can ping router through VPN (10.99.0.X)
- [ ] API access works (test with curl)
- [ ] Portal redirect works (test with phone)
- [ ] End-to-end payment flow works (complete test transaction)
- [ ] User created in MikroTik after payment
- [ ] Internet access granted after payment
- [ ] Session expires correctly after time limit
- [ ] MongoDB transaction recorded correctly
- [ ] Contact person notified of go-live

---

## Appendix: Quick Reference Commands

### MongoDB

```javascript
// Find location by MAC
db.hotspotlocations.findOne({ routerIdentifier: "XX:XX:XX:XX:XX:XX" });

// List all locations
db.hotspotlocations.find({ isActive: true });

// Recent transactions for location
db.transactions
  .find({
    locationId: ObjectId("..."),
  })
  .sort({ createdAt: -1 })
  .limit(10);
```

### Vultr Server

```bash
# Check VPN status
wg show

# Check all connected routers
wg show all

# Restart WireGuard
systemctl restart wg-quick@wg0

# Check Nginx
systemctl status nginx
ss -tlnp | grep 8729
```

### MikroTik Router

```routeros
# Check VPN
/interface wireguard peers print

# Check hotspot users
/ip hotspot user print

# Check active sessions
/ip hotspot active print

# Check system resources
/system resource print

# View logs
/log print where topics~"hotspot"
```

---

## Support Contacts

For assistance with device registration:

- **Technical Lead**: jestone@example.com
- **MongoDB Issues**: Check database documentation
- **Vultr Server**: SSH access required
- **MikroTik Support**: https://help.mikrotik.com/
- **Application Issues**: Check Vercel deployment logs

---

**Document End**

**Remember:**

1. Always test in staging before production
2. Keep MongoDB backup before changes
3. Document any deviations from standard setup
4. Communicate with team before major changes
5. Monitor new location closely for first 24 hours

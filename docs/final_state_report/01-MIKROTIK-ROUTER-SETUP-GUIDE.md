# MikroTik Router Setup & Replication Guide

**Document Version:** 1.0  
**Last Updated:** November 18, 2025  
**System Status:** ✅ PRODUCTION - WORKING  
**Router Model:** MikroTik hAP ax² (C52iG-5HaxD2HaxD)  
**RouterOS Version:** 7.20.4 (stable)

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Hardware Specifications](#hardware-specifications)
3. [Current Working Configuration](#current-working-configuration)
4. [Step-by-Step Setup for New Router](#step-by-step-setup-for-new-router)
5. [Critical Configuration Details](#critical-configuration-details)
6. [Troubleshooting & Verification](#troubleshooting--verification)

---

## Executive Summary

This document contains the **complete working configuration** of the Real Power Tech production MikroTik router as of November 18, 2025. Use this guide to:

- **Replicate** the exact setup on a new MikroTik router
- **Restore** configuration after a factory reset
- **Scale** the system to multiple locations
- **Troubleshoot** configuration issues

**⚠️ CRITICAL:** This configuration has been battle-tested and is currently serving live customers. Do not deviate from these settings unless you understand the implications.

---

## Hardware Specifications

### Current Production Router

| Specification        | Value                               |
| -------------------- | ----------------------------------- |
| **Model**            | MikroTik hAP ax² (C52iG-5HaxD2HaxD) |
| **Serial Number**    | HJD0ABW6DJA                         |
| **Software ID**      | 3UT5-0139                           |
| **RouterOS Version** | 7.20.4 (stable)                     |
| **Build Date**       | November 5, 2025 12:07:41           |
| **CPU**              | ARM64, 4 cores @ 864MHz             |
| **RAM**              | 1024 MiB                            |
| **Storage**          | 128 MiB                             |
| **CPU Temperature**  | ~63°C (normal)                      |
| **Uptime**           | 20+ days                            |

### Interface Details

| Interface          | MAC Address       | Type     | Status         |
| ------------------ | ----------------- | -------- | -------------- |
| **ether1** (WAN)   | F4:1E:57:F8:7F:09 | Ethernet | Running        |
| **ether2** (LAN)   | F4:1E:57:F8:7F:0A | Ethernet | Slave (Bridge) |
| **ether3** (LAN)   | F4:1E:57:F8:7F:0B | Ethernet | Slave (Bridge) |
| **ether4** (LAN)   | F4:1E:57:F8:7F:0C | Ethernet | Slave (Bridge) |
| **ether5** (LAN)   | F4:1E:57:F8:7F:0D | Ethernet | Slave (Bridge) |
| **wifi1** (2.4GHz) | F4:1E:57:F8:7F:0E | WiFi     | Running        |
| **wifi2** (5GHz)   | F4:1E:57:F8:7F:0F | WiFi     | Running        |
| **bridge**         | F4:1E:57:F8:7F:0A | Bridge   | Running        |

**🔑 Router Identifier:** `F4:1E:57:F8:7F:0A` (Bridge MAC Address)  
**This MAC is used by the application to identify this specific router.**

---

## Current Working Configuration

### Complete RouterOS Export

```routeros
# 2025-11-18 12:22:41 by RouterOS 7.20.4
# software id = 3UT5-0139
# model = C52iG-5HaxD2HaxD
# serial number = HJD0ABW6DJA

/interface bridge
add name=bridge

/interface wireguard
add listen-port=13231 mtu=1420 name=wireguard-rpt
add listen-port=34605 mtu=1420 name=wireguard-to-vultr

/interface wifi security
add authentication-types="" name=open-profile

/interface wifi configuration
add country=Tanzania name=rpt-hotspot-config security=open-profile ssid="Real Power Tech - Pay & Surf"

/interface wifi
set [ find default-name=wifi1 ] configuration=rpt-hotspot-config configuration.mode=ap disabled=no
set [ find default-name=wifi2 ] configuration=rpt-hotspot-config configuration.mode=ap disabled=no

/ip hotspot profile
set [ find default=yes ] login-by=mac,http-pap,mac-cookie

/ip hotspot user profile
set [ find default=yes ] shared-users=unlimited

/ip pool
add name=dhcp_pool ranges=192.168.88.10-192.168.88.254

/ip dhcp-server
add address-pool=dhcp_pool interface=bridge name=dhcp1

/ip hotspot
add address-pool=dhcp_pool addresses-per-mac=unlimited disabled=no interface=bridge name=hotspot1

/interface bridge port
add bridge=bridge interface=ether2
add bridge=bridge interface=ether3
add bridge=bridge interface=ether4
add bridge=bridge interface=ether5
add bridge=bridge interface=wifi1
add bridge=bridge interface=wifi2

/interface wireguard peers
add allowed-address=0.0.0.0/0 endpoint-address=139.84.241.180 endpoint-port=51820 interface=wireguard-to-vultr name=peer1 persistent-keepalive=25s public-key="vFmNoS1kS4ymTlLsZ6Xc9KeMppA7GAvLmYWeMORajGE="
add allowed-address=10.99.0.0/24 endpoint-address=139.84.241.180 endpoint-port=51820 interface=wireguard-rpt name=peer2 persistent-keepalive=25s public-key="2mHXqcT6F/shTo5E5aivX3fS9HZ3IUDONDFYuh7XPic="

/ip address
add address=192.168.88.1/24 interface=bridge network=192.168.88.0
add address=10.0.0.2/24 interface=wireguard-to-vultr network=10.0.0.0
add address=10.99.0.2/24 interface=wireguard-rpt network=10.99.0.0

/ip dhcp-client
add interface=ether1

/ip dhcp-server network
add address=192.168.88.0/24 dns-server=8.8.8.8 gateway=192.168.88.1

/ip dns
set servers=8.8.8.8,1.1.1.1

/ip firewall filter
add action=accept chain=input comment="Allow API from LAN" dst-port=443 in-interface=ether1 protocol=tcp
add action=passthrough chain=unused-hs-chain comment="place hotspot rules here" disabled=yes

/ip firewall nat
add action=passthrough chain=unused-hs-chain comment="place hotspot rules here" disabled=yes
add action=masquerade chain=srcnat comment="Masquerade NAT for WAN" out-interface=ether1
add action=masquerade chain=srcnat out-interface=ether1
add action=masquerade chain=srcnat comment="masquerade hotspot network" src-address=192.168.88.0/24

/ip hotspot walled-garden
add dst-host=rpt-phi.vercel.app
add dst-host=*.clickpesa.com
add dst-host=*.netlify.app
add dst-host=*.hotjar.com
add dst-host=*.bangcdn.net
add dst-host=*.flagsmith.com

/ip route
add dst-address=10.99.0.0/24 gateway=wireguard-rpt

/ip service
set api-ssl certificate=local-cert

/system clock
set time-zone-name=Africa/Dar_es_Salaam

/system logging
add topics=radius
add prefix=HOTSPOT-DEBUG topics=hotspot,debug
add prefix=HOTSPOT-DEBUG topics=hotspot,debug
```

### Critical Secrets & Keys

**⚠️ SENSITIVE INFORMATION - STORE SECURELY**

```bash
# WireGuard VPN Keys
wireguard-rpt private-key: qDjr8f/a/pVAIMTN1eU3KBNx67ME9ORkmvw/FTlqlVs=
wireguard-rpt public-key:  ElijHE6+KKZmglqfux/Rm9rDeO7sgxnUbi08kYsvazQ=

wireguard-to-vultr private-key: wOxXTd2P52lj8ymHEfOGSw6En5A5y96oAZPPWohCX2M=
wireguard-to-vultr public-key:  E9z6qonEXnj9h2zqB8UPq1b0hgDUXFGdbooNw7Tpbn4=

# System Users
admin user: admin (password set manually - change after setup)
api-admin user: api-admin (password: [STORE IN PASSWORD MANAGER])

# SSL Certificate
Certificate: local-cert (self-signed, valid until 2035-11-10)
Common Name: router.local
```

### Custom Hotspot Login Files

#### login.html

```html
<html>
  <head>
    <meta
      http-equiv="refresh"
      content="0; url=https://rpt-phi.vercel.app/portal?mac=$(mac)&routerIdentifier=F4:1E:57:F8:7F:0A"
    />
  </head>
  <body>
    <p>Redirecting to portal...</p>
  </body>
</html>
```

#### login-auth.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Authenticating...</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        margin: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .container {
        text-align: center;
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        max-width: 400px;
      }
      .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }
      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      h1 {
        color: #333;
        margin: 0 0 0.5rem;
        font-size: 1.5rem;
      }
      p {
        color: #666;
        margin: 0;
        font-size: 0.9rem;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="spinner"></div>
      <h1>Authenticating...</h1>
      <p>Connecting you to the internet</p>
    </div>

    <!-- Auto-submit login form -->
    <form
      id="loginForm"
      name="login"
      action="/login"
      method="post"
      style="display: none"
    >
      <input type="hidden" name="username" value="$(mac)" />
      <input type="hidden" name="password" value="$(mac)" />
      <input type="hidden" name="dst" value="$(link-orig)" />
      <input type="hidden" name="popup" value="true" />
    </form>

    <script>
      window.onload = function () {
        console.log("Auto-submitting login form for MAC authentication");
        document.getElementById("loginForm").submit();
      };
    </script>
  </body>
</html>
```

---

## Step-by-Step Setup for New Router

### Prerequisites

- MikroTik hAP ax² router (or compatible model)
- Computer with WinBox or web browser
- Internet connection
- Admin access to Vultr server (to add new WireGuard peer)
- Access to Real Power Tech MongoDB (to add new location)

### Part 1: Factory Reset & Initial Access

1. **Factory Reset the Router**

   ```
   - Power off router
   - Hold reset button while powering on
   - Keep holding for 5 seconds until LED blinks
   - Release button
   - Wait for router to boot (2-3 minutes)
   ```

2. **Connect to Router**

   ```
   - Connect computer to ether2-5 (any LAN port)
   - Open WinBox or browser: http://192.168.88.1
   - Default credentials: admin / (no password)
   - **IMPORTANT:** Change admin password immediately
   ```

3. **Update RouterOS (if needed)**
   ```
   System → Packages → Check For Updates
   Install if version < 7.20.4
   Reboot after update
   ```

### Part 2: Basic Network Configuration

```routeros
# 1. Set system identity
/system identity set name="MikroTik-Location-Name"

# 2. Set timezone
/system clock set time-zone-name=Africa/Dar_es_Salaam

# 3. Create bridge for LAN
/interface bridge add name=bridge

# 4. Add ports to bridge
/interface bridge port
add bridge=bridge interface=ether2
add bridge=bridge interface=ether3
add bridge=bridge interface=ether4
add bridge=bridge interface=ether5
add bridge=bridge interface=wifi1
add bridge=bridge interface=wifi2

# 5. Configure LAN IP address
/ip address add address=192.168.88.1/24 interface=bridge network=192.168.88.0

# 6. Configure DHCP pool
/ip pool add name=dhcp_pool ranges=192.168.88.10-192.168.88.254

# 7. Add DHCP server
/ip dhcp-server add address-pool=dhcp_pool interface=bridge name=dhcp1
/ip dhcp-server network add address=192.168.88.0/24 dns-server=8.8.8.8 gateway=192.168.88.1

# 8. Configure WAN (ether1) DHCP client
/ip dhcp-client add interface=ether1

# 9. Set DNS servers
/ip dns set servers=8.8.8.8,1.1.1.1

# 10. Configure NAT for internet access
/ip firewall nat
add action=masquerade chain=srcnat out-interface=ether1 comment="Masquerade NAT for WAN"
add action=masquerade chain=srcnat src-address=192.168.88.0/24 comment="masquerade hotspot network"
```

### Part 3: WiFi Configuration

```routeros
# 1. Create WiFi security profile (open network)
/interface wifi security add authentication-types="" name=open-profile

# 2. Create WiFi configuration
/interface wifi configuration
add country=Tanzania name=rpt-hotspot-config security=open-profile ssid="Real Power Tech - Pay & Surf"

# 3. Apply configuration to WiFi interfaces
/interface wifi
set [ find default-name=wifi1 ] configuration=rpt-hotspot-config configuration.mode=ap disabled=no
set [ find default-name=wifi2 ] configuration=rpt-hotspot-config configuration.mode=ap disabled=no
```

### Part 4: WireGuard VPN Setup

**⚠️ IMPORTANT:** Each router needs unique WireGuard keys!

```routeros
# 1. Generate new WireGuard keys for this router
# (Do this in WinBox: New Terminal → Run the commands below)

# Create wireguard-rpt interface
/interface wireguard
add listen-port=13231 mtu=1420 name=wireguard-rpt

# Create wireguard-to-vultr interface
/interface wireguard
add listen-port=34605 mtu=1420 name=wireguard-to-vultr

# 2. Get the public keys (save these - you'll need them for Vultr server)
:put [/interface wireguard get wireguard-rpt public-key]
:put [/interface wireguard get wireguard-to-vultr public-key]

# 3. Configure IP addresses for VPN
# NOTE: Use a different IP for each new router (10.99.0.3, 10.99.0.4, etc.)
/ip address
add address=10.99.0.2/24 interface=wireguard-rpt network=10.99.0.0

# 4. Add WireGuard peers (connects to Vultr server)
/interface wireguard peers
add allowed-address=10.99.0.0/24 endpoint-address=139.84.241.180 endpoint-port=51820 \
    interface=wireguard-rpt name=peer2 persistent-keepalive=25s \
    public-key="2mHXqcT6F/shTo5E5aivX3fS9HZ3IUDONDFYuh7XPic="

# 5. Add route for VPN traffic
/ip route add dst-address=10.99.0.0/24 gateway=wireguard-rpt
```

**Next Steps for WireGuard:**

- Go to Vultr server
- Add this router's public key as a new peer (see Vultr setup doc)
- Assign unique IP: 10.99.0.3/32, 10.99.0.4/32, etc.

### Part 5: Hotspot Configuration

```routeros
# 1. Configure hotspot profile
/ip hotspot profile
set [ find default=yes ] login-by=mac,http-pap,mac-cookie

# 2. Configure user profile
/ip hotspot user profile
set [ find default=yes ] shared-users=unlimited

# 3. Create hotspot server
/ip hotspot
add address-pool=dhcp_pool addresses-per-mac=unlimited disabled=no interface=bridge name=hotspot1

# 4. Add walled garden (sites accessible without login)
/ip hotspot walled-garden
add dst-host=rpt-phi.vercel.app
add dst-host=*.clickpesa.com
add dst-host=*.netlify.app
add dst-host=*.hotjar.com
add dst-host=*.bangcdn.net
add dst-host=*.flagsmith.com

# 5. Configure logging
/system logging
add prefix=HOTSPOT-DEBUG topics=hotspot,debug
```

### Part 6: Upload Custom Login Pages

**Method 1: Via FTP**

```bash
# Enable FTP service on router
/ip service set ftp disabled=no

# From your computer, upload files to /hotspot/ directory
# Files needed:
# - login.html
# - login-auth.html
```

**Method 2: Via WinBox**

```
1. Files → Upload
2. Navigate to /hotspot/ directory
3. Upload login.html and login-auth.html
4. Verify files are in correct location
```

**⚠️ CRITICAL:** Update the `routerIdentifier` in `login.html`:

```html
<!-- Replace F4:1E:57:F8:7F:0A with THIS router's bridge MAC address -->
<meta
  http-equiv="refresh"
  content="0; url=https://rpt-phi.vercel.app/portal?mac=$(mac)&routerIdentifier=YOUR_BRIDGE_MAC_HERE"
/>
```

To get your router's bridge MAC:

```routeros
/interface bridge print detail
# Look for mac-address field
```

### Part 7: SSL Certificate for API Access

```routeros
# 1. Generate self-signed certificate
/certificate
add name=local-cert common-name=router.local days-valid=3650 key-size=2048
sign local-cert

# 2. Enable API-SSL service
/ip service
set api-ssl certificate=local-cert disabled=no port=8729

# 3. Allow API access from LAN
/ip firewall filter
add action=accept chain=input comment="Allow API from LAN" dst-port=443 in-interface=ether1 protocol=tcp
```

### Part 8: Create API User

```routeros
# Create dedicated API user
/user add name=api-admin group=full password="STRONG_PASSWORD_HERE"

# Disable default admin user (security best practice)
# /user set admin disabled=yes
# OR change its password
/user set admin password="NEW_STRONG_PASSWORD"
```

---

## Critical Configuration Details

### Network Architecture

```
Internet (ISP)
      ↓
   ether1 (WAN) - DHCP Client
      ↓
[MikroTik Router]
      ↓
   bridge (192.168.88.1/24)
      ├── ether2-5 (LAN ports)
      ├── wifi1 (2.4GHz)
      ├── wifi2 (5GHz)
      └── Hotspot Server

VPN Connections:
├── wireguard-rpt (10.99.0.2/24) → Vultr (10.99.0.1) - API Access
└── wireguard-to-vultr (10.0.0.2/24) → Vultr (10.0.0.1) - RADIUS (unused)
```

### Hotspot Authentication Flow

```
1. User connects to WiFi → Gets DHCP IP (192.168.88.x)
2. Opens browser → Redirected to login.html
3. login.html redirects to: https://rpt-phi.vercel.app/portal?mac=XX:XX:XX:XX:XX:XX&routerIdentifier=ROUTER_MAC
4. User selects package & pays via ClickPesa
5. Payment webhook triggers application
6. Application connects via VPN to router API (10.99.0.2:8729)
7. Application creates hotspot user:
   - username = user's MAC address
   - password = user's MAC address
   - limit-uptime = purchased duration
8. Application creates IP binding (type=regular)
9. User is auto-redirected to login-auth.html
10. login-auth.html auto-submits login form
11. MikroTik authenticates: username=MAC, password=MAC
12. User gets internet access
```

### Important Settings Explained

| Setting                            | Value                      | Why It Matters                                    |
| ---------------------------------- | -------------------------- | ------------------------------------------------- |
| `login-by=mac,http-pap,mac-cookie` | Enables MAC authentication | Allows automatic login using MAC address          |
| `addresses-per-mac=unlimited`      | No limit on IPs per MAC    | User can reconnect without issues                 |
| `shared-users=unlimited`           | Multiple sessions allowed  | User can use multiple devices (if needed)         |
| `limit-uptime=XX:XX:XX`            | Time-based sessions        | Enforces purchased duration                       |
| `type=regular` (IP binding)        | Regular authenticated user | User shows in active sessions, properly tracked   |
| `use-radius=no`                    | RADIUS disabled            | Authentication handled by application, not RADIUS |

### Firewall & NAT Rules

The router uses **dynamic hotspot rules** (automatically generated by RouterOS hotspot):

- Unauthenticated users: Redirected to login page
- Authenticated users: Full internet access via NAT masquerade
- All users: Access to walled garden sites (payment portal, etc.)

---

## Troubleshooting & Verification

### Verify Router is Working

```routeros
# 1. Check internet connectivity
/ping 8.8.8.8 count=5

# 2. Check WireGuard VPN connection
/interface wireguard print
/interface wireguard peers print detail
# Look for "latest handshake" < 2 minutes

# 3. Check hotspot is running
/ip hotspot print
# Should show: proxy-status="running"

# 4. Check API is accessible
/ip service print
# api-ssl should be enabled on port 8729

# 5. Check DNS resolution
/ping google.com count=3

# 6. Check active hotspot users
/ip hotspot active print

# 7. Check hotspot hosts
/ip hotspot host print

# 8. Check recent logs
/log print where topics~"hotspot"
```

### Common Issues & Solutions

| Issue                         | Symptoms                          | Solution                                                                                          |
| ----------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| **No internet after payment** | User pays but can't browse        | Check: User has password set, IP binding type=regular, hotspot profile use-radius=no              |
| **VPN not connecting**        | WireGuard peer shows no handshake | Check: Firewall allows UDP 51820, correct public keys on both sides, Vultr server peer configured |
| **API not accessible**        | Application can't connect         | Check: api-ssl enabled on port 8729, certificate installed, VPN connection working                |
| **Users redirected in loop**  | Login page keeps reloading        | Check: login.html has correct portal URL, walled garden includes rpt-phi.vercel.app               |
| **RADIUS errors in logs**     | "RADIUS server not responding"    | Normal - RADIUS is disabled, ignore these logs                                                    |

### Health Check Commands

```routeros
# System health
/system resource print
/system health print

# Interface statistics
/interface print stats

# Check for errors
/log print where topics~"error"

# Monitor hotspot traffic
/ip hotspot active print detail

# Export current config for backup
/export file=backup-$(date +%Y%m%d)
```

---

## Application Integration

### Adding Router to MongoDB

After setting up a new router, add it to the database:

```javascript
// In MongoDB Atlas or via application
db.hotspotlocations.insertOne({
  name: "Location Name",
  routerApiUrl: "https://139.84.241.180:8729", // Via VPN proxy
  routerApiUsername: "api-admin",
  routerApiPassword: "ENCRYPTED_PASSWORD", // Use encryption.js
  routerIdentifier: "F4:1E:57:F8:7F:0A", // Bridge MAC address
  isActive: true,
  createdAt: new Date(),
});
```

### Testing API Connection

From application or via curl:

```bash
# Test API connectivity through VPN
curl -k -u api-admin:PASSWORD https://139.84.241.180:8729/rest

# Should return: {"ret":"true"}
```

---

## Security Best Practices

1. ✅ **Change default passwords** immediately
2. ✅ **Use strong passwords** for api-admin user (20+ characters)
3. ✅ **Disable unused services** (FTP, telnet, etc.)
4. ✅ **Keep RouterOS updated** to latest stable version
5. ✅ **Backup configuration** regularly
6. ✅ **Monitor logs** for suspicious activity
7. ✅ **Use VPN** for all remote management
8. ✅ **Encrypt credentials** in database (using lib/encryption.js)

---

## Appendix: Quick Reference

### Key MAC Addresses

- Bridge (Router ID): `F4:1E:57:F8:7F:0A`
- ether1 (WAN): `F4:1E:57:F8:7F:09`

### Key IP Addresses

- LAN Gateway: `192.168.88.1`
- DHCP Range: `192.168.88.10-254`
- VPN IP (wireguard-rpt): `10.99.0.2`
- Vultr Server: `139.84.241.180`
- Vultr VPN: `10.99.0.1`

### Key Ports

- API-SSL: `8729`
- WireGuard: `51820` (Vultr), `13231` (wireguard-rpt)
- HTTP Hotspot: `64872-64875` (auto-configured)

### Critical Files

- `/hotspot/login.html` - Portal redirect
- `/hotspot/login-auth.html` - Auto-login form
- `/certificate/local-cert` - SSL certificate

---

**Document End**

For questions or issues, refer to:

- MikroTik Documentation: https://help.mikrotik.com/
- RouterOS Manual: https://wiki.mikrotik.com/wiki/Manual:TOC
- Real Power Tech Technical Team

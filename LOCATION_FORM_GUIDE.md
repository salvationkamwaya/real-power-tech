# 📝 Router Configuration Form - Field Guide

## What to Enter in the Admin Panel Location Form

When you open **Admin → Devices → Add New Location** or **Edit Location**, you'll see these fields. Here's exactly what to enter:

---

## 📍 Basic Location Information

### 1. **Location Name**

**What to enter:** A friendly name for this hotspot location  
**Example:** `Real Power Tech - Main Office`  
**Where to get it:** You choose this yourself

### 2. **Router Model**

**What to enter:** The exact model of your MikroTik router  
**Example:** `MikroTik hAP ax²`  
**Where to get it:** Written on your router's label

### 3. **Router Identifier (MAC)**

**What to enter:** Your router's MAC address  
**Example:** `F4:1E:57:F8:7F:0A`  
**Where to get it:**

- **Option 1 (WinBox/SSH):** Connect to router and run:
  ```routeros
  /system routerboard print
  ```
  Look for `serial-number` or `mac-address`
- **Option 2 (Label):** Check the sticker on the bottom of your router
- **Option 3 (WebFig):** Login to http://192.168.88.1 → System → RouterBOARD

### 4. **Assign to Partner**

**What to enter:** Select from the dropdown  
**Example:** `John Doe`  
**Where to get it:** This is an existing partner from your Partners page

---

## 🔧 MikroTik API Configuration

### 5. **Activation Method**

**What to select:** `MikroTik REST API (Recommended)`  
**Options:**

- ✅ `MikroTik REST API (Recommended)` - Instant activation (choose this!)
- `RADIUS` - Legacy method (not recommended)
- `Auto-detect` - System decides (not recommended)

### 6. **Router API URL**

**What to enter:** The HTTPS URL of your router  
**Example:** `https://192.168.88.1`  
**Where to get it:**

- If your router IP is the default: `https://192.168.88.1`
- If you changed it: `https://YOUR_ROUTER_IP`

**How to find router IP if unknown:**

```bash
# From a computer connected to the router WiFi
# Windows:
ipconfig
# Look for "Default Gateway"

# Mac/Linux:
ip route | grep default
# or
netstat -rn | grep default
```

### 7. **Router API Username**

**What to enter:** The username you created for API access  
**Example:** `api-admin`  
**Where to get it:** You need to create this first!

**How to create the API user (SSH to router first):**

```routeros
# SSH to router
ssh admin@192.168.88.1

# Create API user
/user add name=api-admin password=YourSecurePassword123! group=full
```

⚠️ **Important:** Write down this username and password - you'll need them!

### 8. **Router API Password**

**What to enter:** The password for the API user  
**Example:** `YourSecurePassword123!`  
**Where to get it:** This is the password you set when creating the API user above

**Security note:** The password will be encrypted automatically before saving to database

---

## 🚀 Complete Setup Example

Here's a filled example form:

```
┌─────────────────────────────────────────────────────┐
│ Register New Hotspot Location                       │
├─────────────────────────────────────────────────────┤
│ Location Name                                       │
│ Real Power Tech - Main Office                      │
├─────────────────────────────────────────────────────┤
│ Router Model                                        │
│ MikroTik hAP ax²                                   │
├─────────────────────────────────────────────────────┤
│ Router Identifier (MAC)                             │
│ F4:1E:57:F8:7F:0A                                  │
├─────────────────────────────────────────────────────┤
│ Assign to Partner                                   │
│ [▼] John Doe                                       │
├─────────────────────────────────────────────────────┤
│ MikroTik API Configuration                          │
├─────────────────────────────────────────────────────┤
│ Activation Method                                   │
│ [▼] MikroTik REST API (Recommended)                │
├─────────────────────────────────────────────────────┤
│ Router API URL                                      │
│ https://192.168.88.1                               │
├─────────────────────────────────────────────────────┤
│ Router API Username                                 │
│ api-admin                                          │
├─────────────────────────────────────────────────────┤
│ Router API Password                                 │
│ MySecurePass123!                                   │
└─────────────────────────────────────────────────────┘
```

---

## ⚙️ Router Prerequisites (Do This FIRST!)

Before filling the form, configure your router:

### Step 1: Enable API

```routeros
ssh admin@192.168.88.1

# Enable REST API
/ip service enable api-ssl
```

### Step 2: Disable RADIUS (if currently using it)

```routeros
/ip hotspot profile set default use-radius=no
/ip hotspot profile set default login-by=""
```

### Step 3: Create API User

```routeros
/user add name=api-admin password=MySecurePass123! group=full
```

### Step 4: Test API (from your computer)

```bash
curl -k -u api-admin:MySecurePass123! https://192.168.88.1/rest/system/identity
```

Should return: `{"name":"MikroTik"}`

---

## ❓ Common Questions

### Q: What if I have multiple routers?

**A:** Create a separate location for each router. Each location has its own API credentials stored encrypted in the database. You only need ONE `ROUTER_PASSWORD_KEY` in Vercel for all routers.

### Q: Can I use the same API username/password for all routers?

**A:** Yes, but it's better to use unique passwords for each router for security. Example:

- Router 1: `api-admin` / `Router1_Pass123!`
- Router 2: `api-admin` / `Router2_Pass456!`

### Q: What if I forgot my router's MAC address?

**A:** SSH to router and run:

```routeros
/interface print
```

Look for the WiFi interface MAC address.

### Q: Can I change the router password later?

**A:** Yes! Just edit the location and enter a new password. Leave the password field empty if you don't want to change it.

### Q: What port does the API use?

**A:** Port 443 (HTTPS). The URL `https://192.168.88.1` automatically uses port 443.

---

## ✅ After Saving the Form

Once you click "Save Location":

1. ✅ Password is encrypted automatically
2. ✅ Location is saved to MongoDB
3. ✅ System is ready to activate users
4. ✅ Make a test payment to verify it works!

---

## 🧪 Testing Your Configuration

### Method 1: Test from Terminal

```bash
# Replace with your actual credentials
curl -k -u api-admin:MySecurePass123! \
  -X PUT \
  -H "Content-Type: application/json" \
  -d '{"name":"TEST","limit-uptime":"00:05:00","profile":"default"}' \
  https://192.168.88.1/rest/ip/hotspot/user/add
```

Should return: `{"ret":"*12345"}` (user ID)

### Method 2: Make a Real Payment

1. Connect phone to WiFi
2. Portal opens automatically
3. Select package (e.g., 500 TZS)
4. Complete payment via ClickPesa
5. Check Vercel logs for success message
6. Phone should have internet immediately!

---

## 🐛 Troubleshooting

### "Router API credentials not configured" error

**Fix:** Make sure all 3 API fields are filled:

- Router API URL
- Router API Username
- Router API Password

### "Authentication failed" error

**Fix:** Wrong username or password. Verify:

```routeros
/user print
```

Check if `api-admin` user exists.

### "Connection refused" error

**Fix:** API service not enabled. Run:

```routeros
/ip service enable api-ssl
/ip service print
```

Verify `api-ssl` shows `disabled=no`

---

**Last Updated:** 2025-01-17  
**For:** Real Power Tech Hotspot System

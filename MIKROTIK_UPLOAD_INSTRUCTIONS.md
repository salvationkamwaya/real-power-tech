# MikroTik Login Page Upload Instructions

## Overview

Upload the custom `login-auth.html` file to your MikroTik router to enable automatic hotspot authentication after payment.

## Files to Upload

- **Source:** `/home/jestone/projects/clients/real-power-tech/rpt/mikrotik-login-auth.html`
- **Destination:** `/hotspot/login-auth.html` on MikroTik router

## Upload Methods

### Method 1: Using WinBox (Recommended for Beginners)

1. Download and open WinBox
2. Connect to your MikroTik router (IP: 192.168.88.1)
3. Go to **Files** (left sidebar)
4. Click **Upload** button
5. Select `mikrotik-login-auth.html` from your computer
6. Wait for upload to complete
7. In terminal, rename the file:
   ```
   /file move hotspot/mikrotik-login-auth.html hotspot/login-auth.html
   ```

### Method 2: Using SCP (Secure Copy)

```bash
# From your local machine
scp mikrotik-login-auth.html admin@192.168.88.1:/hotspot/login-auth.html
```

### Method 3: Using FTP

1. Enable FTP on MikroTik:
   ```
   /ip service set ftp disabled=no
   ```
2. Use FileZilla or any FTP client:
   - Host: `192.168.88.1`
   - Username: `admin`
   - Password: [your router password]
   - Upload to `/hotspot/` directory
3. Rename file to `login-auth.html`

### Method 4: Copy-Paste via Terminal (For Small Files)

1. SSH to MikroTik: `ssh admin@192.168.88.1`
2. Create the file:
   ```
   /file print file=hotspot/login-auth.html
   ```
3. Edit the file using `/file edit` or re-upload

## Verification Steps

### 1. Check if file exists

```bash
/file print where name~"login-auth"
```

You should see: `hotspot/login-auth.html`

### 2. View file contents

```bash
:put [/file get hotspot/login-auth.html contents]
```

Verify the HTML contains the auto-submit form.

### 3. Test the flow

1. Connect a phone to the WiFi network
2. Try to browse any website
3. Should be redirected to payment portal
4. After payment, should auto-login via `login-auth.html`

## Current Configuration Status

### ✅ Already Configured

- `hotspot/login.html` - Redirects to payment portal (ACTIVE)
- Walled garden allows portal access
- Hotspot profile: `login-by=mac,http-pap,mac-cookie`

### ⬆️ Needs Upload

- `hotspot/login-auth.html` - Auto-submit authentication page

## How It Works

```
User Flow:
┌─────────────────────────────────────────────────────────────┐
│ 1. User connects to WiFi                                    │
│ 2. Tries to browse → Redirected to login.html              │
│ 3. login.html redirects to payment portal                  │
│ 4. User selects package and pays via ClickPesa             │
│ 5. Webhook creates user in MikroTik                        │
│ 6. Success page polls for activation status                │
│ 7. Once activated, redirects to login-auth.html            │
│ 8. login-auth.html auto-submits login form                 │
│ 9. MikroTik authenticates user                             │
│ 10. User gets internet access! 🎉                           │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### File not showing up

```bash
# Check all hotspot files
/file print where name~"hotspot"

# Check file permissions
/file print detail where name="hotspot/login-auth.html"
```

### Login still not working

1. Check if user was created:

   ```bash
   /ip hotspot user print where name~"[MAC_ADDRESS]"
   ```

2. Check active sessions:

   ```bash
   /ip hotspot active print
   ```

3. Check hotspot logs:
   ```bash
   /log print where topics~"hotspot"
   ```

### Test without payment

Create a test endpoint (development only):

```bash
# POST to /api/v1/test/activate-user
# Body: { "mac": "AA:BB:CC:DD:EE:FF", "locationId": "..." }
```

## Next Steps After Upload

1. **Upload the file** to MikroTik router
2. **Test the flow** with a real device
3. **Make a test payment** (or use test activation endpoint)
4. **Verify** user appears in active sessions
5. **Confirm** internet access works

## Support

If issues persist after upload:

1. Check router logs: `/log print where topics~"hotspot"`
2. Verify webhook is triggering: Check Vercel function logs
3. Test API connectivity: `node test-mikrotik-api.js`
4. Check user creation: `/ip hotspot user print`

---

**Status:** Code deployed ✅ | Router file pending upload ⬆️

# 🔍 Quick MikroTik Diagnostics - Run in WinBox Terminal

## Step 1: Check if login-auth.html exists
```
/file print where name="hotspot/login-auth.html"
```

**Expected:** Should see the file listed
**If missing:** Need to upload it!


## Step 2: View login-auth.html content
```
:put [/file get hotspot/login-auth.html contents]
```

**Expected:** Should see HTML with auto-submit form
**Look for:** `<form id="loginForm"` and `window.onload`


## Step 3: Check hotspot profile login methods
```
/ip hotspot profile print detail where name=default
```

**Expected:** `login-by=mac,http-pap,mac-cookie`
**Check:** `mac-auth-mode=mac-as-username`


## Step 4: Check the specific user
```
/ip hotspot user print detail where name="9A:E6:98:FA:9B:9F"
```

**Expected:** User exists with:
- `name=9A:E6:98:FA:9B:9F`
- `mac-address=9A:E6:98:FA:9B:9F`
- `password=""` (empty or same as username)
- `limit-uptime=00:20:00`


## Step 5: Check active sessions (MOST IMPORTANT!)
```
/ip hotspot active print
```

**Expected:** Should see `9A:E6:98:FA:9B:9F` here IF logged in
**If empty:** User NOT authenticated (this is the problem!)


## Step 6: Check recent hotspot logs
```
/log print where topics~"hotspot" and message~"9A:E6:98" last 10
```

**Look for:**
- "login failed: invalid username or password" ❌
- "logged in" ✅
- "trying to log in" (shows attempt was made)


## Step 7: Test manual login via API
```
/ip hotspot active add user=9A:E6:98:FA:9B:9F address=192.168.88.254 mac-address=9A:E6:98:FA:9B:9F server=hotspot1
```

**This will:** Manually create active session
**If successful:** Internet should work immediately!


## Step 8: Check IP binding type
```
/ip hotspot ip-binding print detail where mac-address="9A:E6:98:FA:9B:9F"
```

**Expected:** `type=regular` (requires auth)
**If type=bypassed:** Would bypass auth (instant internet)


---

## 🎯 What to Report Back

1. **Does login-auth.html exist?** (Step 1)
2. **What's in the file?** (Step 2)
3. **Is user in active sessions?** (Step 5)
4. **What do logs say?** (Step 6)
5. **Does manual login work?** (Step 7)

---

## 🔧 Common Fixes

### If login-auth.html is MISSING:
Upload it from: `/home/jestone/projects/clients/real-power-tech/rpt/mikrotik-login-auth.html`

### If login-auth.html EXISTS but user not authenticated:
Problem is likely:
- Success page not redirecting to login-auth.html
- Form not auto-submitting
- MikroTik rejecting the login

### If "invalid username or password" error:
Check that:
- User's `password` field is empty OR matches MAC
- User's `name` exactly matches MAC (case-sensitive)
- `mac-auth-mode=mac-as-username` in profile

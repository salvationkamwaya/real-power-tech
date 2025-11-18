# MikroTik Hotspot Returning User Session Problem - Research Prompt for Perplexity

## The Problem

We have a MikroTik RouterOS 7.20.4 hotspot system with automated payment integration. Users can:

1. **First purchase**: Connect to WiFi → Pay via mobile money → Get internet access ✅ **WORKS PERFECTLY**
2. **Session ends**: After 20 minutes, user is disconnected automatically ✅ **WORKS AS EXPECTED**
3. **Second purchase**: User pays again for another session → Payment succeeds → User record updated → **BUT NO INTERNET ACCESS** ❌ **PROBLEM**

## Our Current Implementation

### Technology Stack:
- MikroTik RouterOS 7.20.4 (stable)
- Hotspot configuration: `login-by=mac,http-pap,mac-cookie`
- User authentication via Binary API (node-routeros)
- IP binding type: `regular` (not bypassed)
- Custom login pages with auto-submit forms

### What We Do When User Pays:

```javascript
// 1. Check if user exists
const existingUser = allUsers.find((u) => u.name === mac);

if (existingUser) {
  // 2. Update user with new session limit
  await api.write("/ip/hotspot/user/set", [
    `=.id=${existingUser[".id"]}`,
    `=limit-uptime=00:20:00`,  // New session duration
    `=comment=Order: ${newOrderReference}`,
  ]);

  // 3. CRITICAL FIX: Reset counters for returning users
  await api.write("/ip/hotspot/user/reset-counters", [
    `=.id=${existingUser[".id"]}`,
  ]);
  
  // 4. Update IP binding
  await api.write("/ip/hotspot/ip-binding/set", [
    `=.id=${bindingId}`,
    `=type=regular`,
    `=to-address=0.0.0.0`,
    `=server=hotspot1`,
    `=comment=Auto-auth: ${newOrderReference}`,
  ]);
}
```

### What Happens in Practice:

**First Session (20 minutes):**
```
Payment → User created → IP binding created → Login succeeds → Internet works ✅
Uptime: 0s → 20m (then session expires)
```

**Second Session (after first expires):**
```
Payment → User updated → Counters reset → IP binding updated → Login FAILS → No internet ❌

Router logs show:
- ✅ User already exists, finding and updating...
- ✅ Reset user counters for new session
- ✅ MikroTik user updated successfully: *2
- ✅ Updated existing IP binding: *1
- ✅ MikroTik activation successful

But user gets no internet access!
```

### Verified on Router:

After second payment, checking user state:
```
/ip hotspot user print detail where name="9A:E6:98:FA:9B:9F"

Results:
- name="9A:E6:98:FA:9B:9F" ✅
- mac-address=9A:E6:98:FA:9B:9F ✅
- profile=default ✅
- limit-uptime=20m ✅
- uptime=0s ✅ (counters were reset)
- bytes-in=0 ✅ (counters were reset)
- bytes-out=0 ✅ (counters were reset)
- comment=Order: RPT176344630163056J1KO ✅ (new order reference)
```

Everything looks correct, but user cannot access internet!

### IP Binding State:

```
/ip hotspot ip-binding print detail where mac-address="9A:E6:98:FA:9B:9F"

Results:
- mac-address=9A:E6:98:FA:9B:9F ✅
- type=regular ✅
- to-address=0.0.0.0 ✅
- server=hotspot1 ✅
- comment=Auto-auth: RPT176344630163056J1KO ✅ (updated)
```

IP binding also looks correct!

### Active Sessions:

```
/ip hotspot active print where user="9A:E6:98:FA:9B:9F"

Results: EMPTY (no active session despite valid credentials)
```

## Why We Used `/ip/hotspot/user/reset-counters`

We discovered that MikroTik tracks **cumulative** uptime across sessions. Without reset:
- First session: uptime=20m, limit=20m → Session works ✅
- Second session: uptime=20m (from before), NEW limit=20m → Login rejected (uptime already at limit) ❌

So we added the counter reset, which successfully sets `uptime=0s`, but internet **still doesn't work**.

## Questions for Research

According to **official MikroTik documentation** and best practices:

1. **What is the standard/recommended approach for handling returning customers in MikroTik hotspot systems?**
   - Should we be deleting and recreating users instead of updating them?
   - Is there a "session cleanup" command we're missing?
   - Do we need to manually disconnect/logout the user before updating?

2. **Does `/ip/hotspot/user/reset-counters` actually reset the login eligibility, or just the statistics?**
   - Does resetting counters allow a user to login again?
   - Is there a separate command to "reset" a user's login state?

3. **For hotspot systems with recurring purchases, what's the official MikroTik recommendation?**
   - Delete user after session expires, recreate on next purchase?
   - Keep user record and update limits (our current approach)?
   - Use dynamic profiles or RADIUS instead?

4. **Could there be a "session lock" or "authentication cache" preventing re-login?**
   - Do we need to clear cookies on the hotspot server?
   - Is there a hotspot cache that needs clearing?
   - Does the IP binding need to be deleted and recreated instead of updated?

5. **Is there a specific sequence of commands required when updating an existing hotspot user for a new session?**
   - Should we remove from active sessions first (even if session expired)?
   - Should we remove IP binding, then user, then recreate both?
   - Is there a "refresh" or "re-authenticate" command?

## What We Need

Please search the **official MikroTik documentation, wiki, and forums** for:

- Best practices for prepaid hotspot systems with recurring purchases
- How to properly handle users who finish their session and buy again
- Whether our approach (update + reset-counters) is correct
- If not, what is the official recommended pattern

We need the **standard, production-ready solution** that MikroTik recommends for this exact use case: **users who pay for time-limited sessions repeatedly**.

Manual intervention is not viable - this needs to work automatically for thousands of customers.

---

**TL;DR**: User buys internet → gets access ✅. Session expires → user buys again → payment works, user updated, counters reset, IP binding updated → **but no internet access** ❌. What is MikroTik's official solution for recurring hotspot purchases?

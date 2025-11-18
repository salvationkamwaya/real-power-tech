# MikroTik Counter Reset Test - Direct Router Commands

**Purpose**: Test counter reset functionality directly on router before deploying code

## Option 1: Run the automated test script

```bash
chmod +x scripts/test-counter-reset.sh
./scripts/test-counter-reset.sh
```

This will:

1. Show current user state with counters
2. Reset counters
3. Show updated state to verify reset worked

---

## Option 2: Manual commands (SSH to router)

### 1. Check BEFORE reset:

```bash
ssh admin@10.99.0.1
```

Then on router:

```
/ip hotspot user print detail where name="9A:E6:98:FA:9B:9F"
```

**Look for**:

- `uptime=3h` (or similar - this is the problem)
- `limit-uptime=00:20:00` (new session limit)
- `bytes-in=52862898`
- `bytes-out=572155328`

### 2. Reset counters:

```
/ip hotspot user reset-counters [find name="9A:E6:98:FA:9B:9F"]
```

### 3. Check AFTER reset:

```
/ip hotspot user print detail where name="9A:E6:98:FA:9B:9F"
```

**Expected results**:

- `uptime=0s` ✅ (was 3h)
- `limit-uptime=00:20:00` ✅ (unchanged)
- `bytes-in=0` ✅ (was 52MB)
- `bytes-out=0` ✅ (was 572MB)

### 4. Test login from your device:

After reset, try to access internet from the device with MAC `9A:E6:98:FA:9B:9F`

---

## Option 3: One-liner test from your local machine:

```bash
# Check current state
ssh admin@10.99.0.1 "/ip hotspot user print detail where name=\"9A:E6:98:FA:9B:9F\""

# Reset counters
ssh admin@10.99.0.1 "/ip hotspot user reset-counters [find name=\"9A:E6:98:FA:9B:9F\"]"

# Verify reset
ssh admin@10.99.0.1 "/ip hotspot user print detail where name=\"9A:E6:98:FA:9B:9F\""
```

---

## What This Proves:

If the reset command works and counters go to zero:

- ✅ The `/ip/hotspot/user/reset-counters` command is valid
- ✅ Our code implementation will work when deployed
- ✅ Returning customers will be able to login after reset

If login works after manual reset:

- ✅ Confirms counter reset solves the "invalid username or password" issue
- ✅ Ready to deploy the automated fix in our code

---

## Quick Verification:

After running reset, user should be able to:

1. Navigate to any website (e.g., http://google.com)
2. Get redirected to MikroTik login page
3. Login form auto-submits with MAC address
4. Get internet access immediately ✅

No more "invalid username or password" error!

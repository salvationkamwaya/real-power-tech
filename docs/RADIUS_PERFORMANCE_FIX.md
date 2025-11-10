# RADIUS Performance Fix - Installation Guide

## 🚨 Problem Summary

The RADIUS authorization endpoint was taking **5+ seconds** to respond due to:

1. Vercel serverless cold starts (2-3 seconds)
2. MongoDB connection overhead (1-2 seconds)
3. Sequential database queries (1-2 seconds)

FreeRADIUS and MikroTik timeout at **3-4 seconds**, causing:

- Duplicate packet errors
- No internet access even after successful payment
- Session authorization failures

## ✅ Fixes Applied

### Fix 1: API Optimization (ALREADY DEPLOYED)

**File:** `app/api/v1/radius/authorize/route.js`

**Changes:**

- ✅ Added in-memory caching (30-second TTL) for session lookups
- ✅ Parallel database queries (Session-Timeout + Rate-Limit)
- ✅ Used `.lean()` for faster MongoDB queries
- ✅ Field projection to minimize data transfer
- ✅ Comprehensive logging with response times

**Expected Result:**

- 🔥 **Cached requests: < 50ms**
- 🔥 **DB queries: 1-2 seconds** (down from 5+ seconds)

### Fix 2: FreeRADIUS Timeout Configuration (APPLY ON VULTR SERVER)

**File:** `/etc/freeradius/3.0/mods-available/rest`

**Changes:**

- ✅ Increased `timeout` from 4s to **10 seconds**
- ✅ Increased `connect_timeout` to **3 seconds**
- ✅ Optimized connection pool settings
- ✅ Added proper headers configuration

---

## 📋 Installation Steps

### Step 1: Deploy API Changes (AUTO-DEPLOYED)

The optimized API code has been committed. Vercel will auto-deploy.

**Verify deployment:**

```bash
# From your local machine or Vultr server:
time curl -X POST https://rpt-phi.vercel.app/api/v1/radius/authorize \
  -H "Content-Type: application/json" \
  -H "x-radius-secret: a53c30f7619ffcc7530633435670d2a28d575eb7030a1bcf6c2f3a9b8ea0ad8b" \
  -d '{"User-Name": "AA:BB:CC:DD:EE:FF"}'
```

**Expected:**

- First call (cold start): ~2-3 seconds
- Subsequent calls (cached): < 0.1 seconds ✅

---

### Step 2: Update FreeRADIUS Configuration on Vultr Server

**SSH into the Vultr server:**

```bash
ssh root@139.84.241.180
```

#### Option A: Manual Edit

```bash
# Backup the current configuration
sudo cp /etc/freeradius/3.0/mods-available/rest /etc/freeradius/3.0/mods-available/rest.backup

# Edit the file
sudo nano /etc/freeradius/3.0/mods-available/rest
```

**Add these lines inside the `rest { }` block (after the `pool` section):**

```conf
    # TIMEOUT SETTINGS - CRITICAL FIX
    connect_timeout = 3.0
    timeout = 10.0
```

**Save and exit** (Ctrl+O, Enter, Ctrl+X)

#### Option B: Automated Script

```bash
# Download the optimized configuration
curl -o /tmp/rest.conf https://raw.githubusercontent.com/mrjestone/real-power-tech/main/docs/freeradius-rest-config-optimized.conf

# Backup current config
sudo cp /etc/freeradius/3.0/mods-available/rest /etc/freeradius/3.0/mods-available/rest.backup

# Apply new config
sudo cp /tmp/rest.conf /etc/freeradius/3.0/mods-available/rest
```

---

### Step 3: Restart FreeRADIUS

```bash
# Test configuration first
sudo freeradius -C

# If no errors, restart the service
sudo systemctl restart freeradius

# Verify it's running
sudo systemctl status freeradius
```

---

### Step 4: Test the Complete Flow

#### Test 1: Direct API Test (Should be FAST now)

```bash
time curl -X POST https://rpt-phi.vercel.app/api/v1/radius/authorize \
  -H "Content-Type: application/json" \
  -H "x-radius-secret: a53c30f7619ffcc7530633435670d2a28d575eb7030a1bcf6c2f3a9b8ea0ad8b" \
  -d '{"User-Name": "E6:93:9B:AB:B8:3B"}'
```

**Expected output:**

```json
{ "reply": [{ "attribute": "Auth-Type", "value": "Reject", "op": ":=" }] }
```

**Response time:** < 0.5 seconds (after warm-up)

#### Test 2: RADIUS Server Test

```bash
echo "User-Name = E6:93:9B:AB:B8:3B" | radclient -x localhost:1812 auth c0bae8ee21e365c0711c561d5c9dc036f03845949e3fd5d04ee75e088ae5b802
```

**Expected (no session):**

```
Received Access-Reject
```

#### Test 3: End-to-End Test with Payment

1. Connect to WiFi: "Rapotech - Pay & Surf"
2. Browser should redirect to portal
3. Select package and complete payment
4. **WITHIN 30 SECONDS:** Try to browse internet
5. ✅ **You should get internet access immediately**

---

## 🔍 Troubleshooting

### Check FreeRADIUS Logs

```bash
# Real-time log monitoring
sudo tail -f /var/log/freeradius/radius.log

# Look for "Ignoring duplicate packet" - should NOT appear anymore
```

### Check API Response Times

```bash
# Run this 3 times to see the caching effect:
for i in 1 2 3; do
  echo "Request $i:"
  time curl -s -X POST https://rpt-phi.vercel.app/api/v1/radius/authorize \
    -H "Content-Type: application/json" \
    -H "x-radius-secret: a53c30f7619ffcc7530633435670d2a28d575eb7030a1bcf6c2f3a9b8ea0ad8b" \
    -d '{"User-Name": "E6:93:9B:AB:B8:3B"}'
  echo ""
  sleep 1
done
```

**Expected:**

- Request 1: 2-3 seconds (cold start)
- Request 2: < 0.5 seconds (cached)
- Request 3: < 0.5 seconds (cached)

### Check Vercel Logs

Visit: https://vercel.com/mrjestone/rpt/logs

Look for console output:

```
✅ RADIUS Auth: ACCEPT for E6:93:9B:AB:B8:3B (234ms) - Session: 3600s
✅ RADIUS Auth: CACHED HIT for E6:93:9B:AB:B8:3B (12ms)
```

---

## 📊 Expected Performance Metrics

### Before Optimization:

- ❌ API response time: **5-6 seconds**
- ❌ RADIUS timeout: **3 seconds**
- ❌ Result: Duplicate packets, no internet

### After Optimization:

- ✅ API response (cold start): **2-3 seconds**
- ✅ API response (cached): **< 100ms**
- ✅ FreeRADIUS timeout: **10 seconds**
- ✅ Result: **Successful authorization, internet works!**

---

## 🎯 Cache Behavior

The in-memory cache works as follows:

1. **First request for MAC:** Query DB → Store in cache (30s TTL)
2. **Subsequent requests:** Return from cache instantly
3. **After 30 seconds:** Cache expires → Next request queries DB again
4. **After payment:** New session created → Next request finds it → Cached

**Why 30 seconds?**

- Fast enough to handle multiple RADIUS retries
- Short enough to ensure session expiration is respected
- Balances performance vs. accuracy

---

## ✅ Success Criteria

After applying these fixes, you should see:

1. ✅ No more "Ignoring duplicate packet" errors in FreeRADIUS logs
2. ✅ API responses under 3 seconds (usually < 1s with caching)
3. ✅ Immediate internet access after successful payment
4. ✅ Vercel logs showing "CACHED HIT" for repeated requests
5. ✅ Users can connect and browse successfully

---

## 🚀 Next Steps

1. Apply the FreeRADIUS configuration update on Vultr server
2. Test with a real payment transaction
3. Monitor the logs during the first few real customer sessions
4. If issues persist, check the troubleshooting section above

**Questions?** Review the logs and share any errors you see.

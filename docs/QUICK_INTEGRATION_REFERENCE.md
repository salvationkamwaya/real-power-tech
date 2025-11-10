# Quick Integration Reference

## 🎯 Essential Information at a Glance

### Application URLs

```
Production:     https://rpt-phi.vercel.app
Admin:          https://rpt-phi.vercel.app/admin/dashboard
Portal:         https://rpt-phi.vercel.app/portal
RADIUS API:     https://rpt-phi.vercel.app/api/v1/radius/authorize
```

### RADIUS Server

```
IP:             139.84.241.180
Ports:          1812 (auth), 1813 (acct)
SSH:            ssh jestone@139.84.241.180
Status:         Ready for FreeRADIUS installation
```

### Database

```
Type:           MongoDB Atlas
Collections:    radcheck, radreply, hotspotlocations, servicepackages, transactions
Connection:     Via MONGODB_URI env var (same as app uses)
```

---

## ⚡ Critical Configuration Values

### FreeRADIUS REST Configuration

```conf
# /etc/freeradius/3.0/mods-available/rest
connect_uri = "https://rpt-phi.vercel.app"
authorize.uri = "${..connect_uri}/api/v1/radius/authorize"
authorize.method = 'post'
authorize.data = '{"User-Name": "%{User-Name}"}'
```

### MikroTik Portal Redirect

```html
<!-- In /flash/hotspot/login.html -->
<meta
  http-equiv="refresh"
  content="0; url=https://rpt-phi.vercel.app/portal?mac=$(mac)&router=$(mac)"
/>
```

### MikroTik RADIUS Config

```routeros
/radius
add service=hotspot address=139.84.241.180 secret=<YOUR_SECRET> timeout=3s

/ip hotspot profile
set [find name=default] use-radius=yes login-by=mac,http-chap
```

### MikroTik Walled Garden

```routeros
/ip hotspot walled-garden
add dst-host=rpt-phi.vercel.app
add dst-host=*.vercel.app
add dst-host=checkout.clickpesa.com
add dst-host=*.clickpesa.com
```

---

## 🔄 How It Works (5 Steps)

1. **Customer connects** → MikroTik redirects to portal
2. **Customer pays** → ClickPesa sends webhook to app
3. **Webhook creates session** → Writes to MongoDB (radcheck + radreply)
4. **MikroTik asks RADIUS** → "Can MAC AAA access internet?"
5. **RADIUS asks app** → App queries MongoDB → Returns Session-Timeout

---

## 🧪 Quick Tests

### Test RADIUS Endpoint

```bash
curl -X POST https://rpt-phi.vercel.app/api/v1/radius/authorize \
  -H "Content-Type: application/json" \
  -d '{"User-Name": "AA:BB:CC:DD:EE:FF"}'
```

### Test from RADIUS Server

```bash
echo "User-Name = AA:BB:CC:DD:EE:FF" | radclient localhost:1812 auth testing123
```

### Expected Success Response

```json
{
  "reply": [
    { "attribute": "Session-Timeout", "value": 3600, "op": ":=" },
    { "attribute": "Mikrotik-Rate-Limit", "value": "1M/5M", "op": ":=" }
  ]
}
```

### Expected Failure Response

```json
{
  "reply": [{ "attribute": "Auth-Type", "value": "Reject", "op": ":=" }]
}
```

---

## 🗄️ MongoDB Collections Quick Reference

### radcheck (Authentication)

```javascript
{
  username: "AA:BB:CC:DD:EE:FF",  // Normalized MAC
  attribute: "Auth-Type",
  op: ":=",
  value: "Accept",
  expiresAt: Date  // When session ends
}
```

### radreply (Authorization)

```javascript
{
  username: "AA:BB:CC:DD:EE:FF",
  attribute: "Session-Timeout",    // or "Mikrotik-Rate-Limit"
  op: ":=",
  value: "3600",                   // seconds or "1M/5M"
  expiresAt: Date  // TTL - auto-deletes
}
```

### hotspotlocations (Router Registry)

```javascript
{
  name: "Maria's Cafe",
  routerIdentifier: "11:22:33:44:55:66",  // Router MAC (UNIQUE)
  partnerId: ObjectId,
  status: "Active"
}
```

### servicepackages (WiFi Products)

```javascript
{
  name: "1-Hour Access",
  price: 1000,                     // Tsh
  durationMinutes: 60,
  rateLimit: "1M/5M",              // Optional bandwidth limit
  isActive: true
}
```

### transactions (Payment Records)

```javascript
{
  customerMacAddress: "AA:BB:CC:DD:EE:FF",
  hotspotLocationId: ObjectId,
  servicePackageId: ObjectId,
  amount: 1000,
  status: "Completed",             // Pending → Completed → Access granted
  orderReference: "RPT1730..."     // Unique ID
}
```

---

## 🔐 Required Environment Variables

### Application (Vercel)

```bash
MONGODB_URI=mongodb+srv://...
MONGODB_DB=real-power-tech
NEXTAUTH_SECRET=<64-chars>
NEXTAUTH_URL=https://rpt-phi.vercel.app

CLICKPESA_CLIENT_ID=<from-dashboard>
CLICKPESA_API_KEY=<from-dashboard>
CLICKPESA_CHECKSUM_KEY=<from-dashboard>
CLICKPESA_CURRENCY=TZS

RADIUS_WRITE_ENABLED=true        # MUST BE TRUE!
RADIUS_REST_SECRET=<optional>    # For endpoint auth
```

---

## 🚨 Common Issues & Fixes

### "Hotspot location not registered"

- **Cause:** routerIdentifier in portal URL doesn't match database
- **Fix:** Check router MAC format (AA:BB:CC:DD:EE:FF) in admin panel

### "Access denied after payment"

- **Cause:** RADIUS_WRITE_ENABLED not set to true
- **Fix:** Set in Vercel environment variables, redeploy

### "Cannot reach payment page"

- **Cause:** ClickPesa domains not in walled garden
- **Fix:** Add checkout.clickpesa.com and \*.clickpesa.com

### "Session doesn't expire"

- **Cause:** MikroTik not honoring Session-Timeout
- **Fix:** Set session-timeout=none in hotspot profile

---

## ✅ Pre-Flight Checklist

### Before Testing

- [ ] RADIUS_WRITE_ENABLED=true on Vercel
- [ ] FreeRADIUS service running on 139.84.241.180
- [ ] MikroTik RADIUS pointing to 139.84.241.180
- [ ] Shared secret matches on both sides
- [ ] Walled garden configured
- [ ] Portal redirect URL correct
- [ ] At least one package created in admin
- [ ] At least one location registered with correct MAC

### First Test

1. Create 10-minute test package (500 Tsh)
2. Register test router in admin panel
3. Connect phone to WiFi
4. Verify redirect to portal
5. Select package, complete payment
6. Check internet access granted
7. Wait 10 minutes
8. Verify access revoked

---

## 📞 Key Contact Points

### If Portal Issues

- Check: `/portal` page loads correctly
- Check: Query params `?mac=...&router=...` present
- Check: Walled garden allows rpt-phi.vercel.app

### If Payment Issues

- Check: ClickPesa webhook configured
- Check: Transaction status in MongoDB
- Check: Vercel logs for webhook errors

### If RADIUS Issues

- Check: FreeRADIUS logs (`/var/log/freeradius/radius.log`)
- Check: REST module can reach Vercel
- Check: MongoDB connectivity from RADIUS server
- Check: radreply collection has Session-Timeout documents

### If Router Issues

- Check: Hotspot is enabled
- Check: RADIUS address and secret correct
- Check: Walled garden syntax correct
- Check: Login page redirect URL correct

---

## 🎯 Success Criteria

When everything works:

1. ✅ Customer connects to WiFi (no password)
2. ✅ Browser auto-opens portal
3. ✅ Payment completes on ClickPesa
4. ✅ Internet access granted immediately
5. ✅ Session expires at exact purchased duration
6. ✅ Customer redirected to portal for re-purchase

**Target:** Complete flow in under 60 seconds.

---

## 📚 Full Documentation

For complete details, see:

- **Main Guide:** `docs/RADIUS_AND_MIKROTIK_INTEGRATION_GUIDE.md`
- **API Contract:** `docs/apiContract.md`
- **Deployment:** `DEPLOYMENT.md`
- **Go-Live Checklist:** `docs/final-go-live-checklist.md`

---

**Document Version:** 1.0  
**Created:** October 28, 2025  
**Purpose:** Quick reference for integration engineers

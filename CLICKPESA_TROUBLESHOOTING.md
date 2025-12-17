# ClickPesa API 404 Error - Troubleshooting Guide

## Current Error
```
Status: 404
Response: {"message":"Invalid authentication details"}
```

## What This Means
A 404 with "Invalid authentication details" typically indicates:
- ❌ API credentials are **invalid, expired, or revoked**
- ❌ Application not properly configured
- ❌ Missing required features on the application

## Action Required: Verify ClickPesa Dashboard Settings

### Step 1: Login to ClickPesa Dashboard
1. Go to https://merchant.clickpesa.com/
2. Login with your credentials

### Step 2: Check API Application Status
1. Navigate to **Settings** → **Developers**
2. Find your API application
3. Verify the following:

#### ✅ Application Must Have:
- **Status**: Active (not suspended/disabled)
- **Integration Type**: API
- **Features Enabled**: 
  - ✓ Payment API
  - ✓ Mobile Money Payment API
  - (Any other features you need)

### Step 3: Verify API Keys
1. In your application, click **Manage API Keys**
2. Check the API keys:

#### Critical Checks:
- [ ] **Expiry Date**: Is the key still valid? (not expired)
- [ ] **Status**: Active (not revoked)
- [ ] **Last Activity**: Should show recent usage

#### Current Credentials Being Used:
```
Client ID: IDAAeQJ0eVcFnk4YIVIdlRDxTYkg0a2P
API Key: SKHAOyg5lBQJbPWJbG6K1rNmZB66n8T0q6uE4hdS3b
Checksum Key: CHKF0vorxpjKKg0XizZBSULZgcFf0iXELR3
```

### Step 4: Generate New API Key (If Needed)
If the current key is expired or revoked:

1. In **Manage API Keys**, click **Add API Key**
2. Enter details:
   - **Name**: Production API Key (or similar)
   - **Expiry Date**: Choose a future date (e.g., 1 year from now)
3. Click **Submit**
4. Enter your password to confirm
5. **IMPORTANT**: Copy the new API Key immediately (shown only once!)
6. Update your `.env.local` file with the new credentials

### Step 5: Check KYC Status
1. Go to **Settings** → **KYC**
2. Verify KYC status is **Approved**
3. If pending, API functionality may be limited

### Step 6: Verify Checksum Settings
1. In your application settings, check if **Checksum** is enabled
2. If enabled, verify the checksum key matches what's in your `.env.local`
3. Options:
   - **Keep checksum enabled**: Ensure key matches exactly
   - **Disable checksum**: If not needed (will need to regenerate token)

## Testing After Updates

### If You Got New Credentials:
1. Update `.env.local` with new Client ID and/or API Key
2. Restart your Next.js development server
3. Run the test again:
   ```bash
   ./scripts/test-clickpesa-connection.sh
   ```

### Expected Success Response:
```json
{
  "success": true,
  "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Alternative: Test with Commented Credentials

I noticed you have **commented-out credentials** in `.env.local`:
```bash
#CLICKPESA_CLIENT_ID=IDVfPagHlbufXeMlw8mPF10xEID0W55i
#CLICKPESA_API_KEY=SKGMAIQnHCxif9o4Ybuw0eN02JuK2tJtqPL48AHp76
```

### Try These Credentials:
1. Swap the active/commented credentials in `.env.local`
2. Change:
   ```bash
   CLICKPESA_CLIENT_ID=IDAAeQJ0eVcFnk4YIVIdlRDxTYkg0a2P
   CLICKPESA_API_KEY=SKHAOyg5lBQJbPWJbG6K1rNmZB66n8T0q6uE4hdS3b
   ```
   To:
   ```bash
   CLICKPESA_CLIENT_ID=IDVfPagHlbufXeMlw8mPF10xEID0W55i
   CLICKPESA_API_KEY=SKGMAIQnHCxif9o4Ybuw0eN02JuK2tJtqPL48AHp76
   ```
3. Run the test again

## Contact ClickPesa Support

If issues persist after checking all above:

**Email**: support@clickpesa.com or compliance@clickpesa.com

**Include in your message:**
- Your merchant account email
- Application Client ID
- Error you're experiencing: "404 Invalid authentication details"
- Ask them to verify:
  1. Is the API key active and not expired?
  2. Are Payment API features enabled for this application?
  3. Is there an IP whitelist restriction?

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| API Key Expired | Generate new API key from dashboard |
| Wrong Application Type | Must be "API" not "Hosted" or "Embedded" |
| Missing Features | Enable "Payment API" in application settings |
| KYC Not Approved | Complete and wait for KYC approval |
| Checksum Mismatch | Verify checksum key or disable checksum |
| IP Restricted | Check if IP whitelist is enabled and add your IP |

## Once Working

After fixing the credentials, the errors you saw earlier (400/403) should be resolved because:

1. ✅ We added proper phoneNumber validation
2. ✅ We added Bearer token prefix handling  
3. ✅ We added comprehensive logging
4. ✅ We added explicit String() conversions
5. ✅ We added client-side env var support

The fixes are already in place - we just need valid API credentials!

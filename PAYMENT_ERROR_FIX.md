# Payment API Error Fix - 400/403 Errors

## Date: December 17, 2025

## Issues Identified

### 1. **Missing phoneNumber in Preview Request** ❌ CRITICAL
- **Error**: 400 Bad Request / 403 Forbidden
- **Cause**: The `phoneNumber` field was not being explicitly converted to string and validated
- **Impact**: ClickPesa API rejected requests due to missing/invalid phoneNumber
- **Fix**: 
  - Added explicit phoneNumber validation
  - Convert phoneNumber to String() before sending
  - Added error logging to identify the exact issue

### 2. **Token Format Uncertainty** ⚠️
- **Error**: 403 Forbidden
- **Cause**: Unclear if ClickPesa returns token with or without "Bearer " prefix
- **Impact**: Authorization header might be malformed
- **Fix**: 
  - Added automatic "Bearer " prefix detection and addition
  - Added logging to track token generation
  - Defensive coding to handle both formats

### 3. **Checksum Debug Visibility** 🔧
- **Error**: 400 Bad Request
- **Cause**: Silent checksum calculation made debugging impossible
- **Impact**: Couldn't verify if checksum was correct
- **Fix**: 
  - Added detailed logging showing sorted keys and concatenated values
  - Log checksum preview (first 16 chars for security)
  - Track payload transformation

### 4. **Client-Side Environment Variable** ⚠️
- **Error**: Payment modal not showing (fallback to hosted checkout)
- **Cause**: `PAYMENT_API_ENABLED` not available on client-side
- **Impact**: Direct payment API wasn't being used
- **Fix**: 
  - Added `NEXT_PUBLIC_PAYMENT_API_ENABLED=true` to .env.local
  - Now accessible in browser-side code

### 5. **Missing Error Details** 📝
- **Error**: Generic error messages
- **Cause**: No logging in API route
- **Impact**: Couldn't diagnose issues from logs
- **Fix**: 
  - Added comprehensive logging at each step
  - Log request payloads (with checksum redacted)
  - Log response data
  - Log errors with full context

## Files Modified

### 1. `/lib/clickpesa.js`
- ✅ Added phoneNumber validation in `previewUssdPush()`
- ✅ Added phoneNumber validation in `initiateUssdPush()`
- ✅ Added token "Bearer " prefix handling
- ✅ Added comprehensive logging for all API calls
- ✅ Explicit String() conversion for phoneNumber

### 2. `/lib/utils.js`
- ✅ Added checksum generation logging
- ✅ Shows sorted keys and concatenated string preview
- ✅ Helps debug checksum mismatches

### 3. `/app/api/v1/portal/pay/route.js`
- ✅ Added logging at each step (transaction creation, preview, initiate)
- ✅ Explicit String() conversion for phoneNumber
- ✅ Better error messages with context

### 4. `/.env.local`
- ✅ Added `NEXT_PUBLIC_PAYMENT_API_ENABLED=true`

## Testing Checklist

### Before Testing
- [ ] Restart Next.js dev server (to load new env var)
- [ ] Clear browser cache and session storage
- [ ] Open browser DevTools console

### Test Steps
1. Navigate to portal page with MAC address
2. Select a package
3. Enter phone number in format: `255712345678` (no +, no spaces)
4. Select provider (AIRTEL, MIX_BY_YASS, or HALOPESA)
5. Click "Pay"

### Expected Logs (Check Vercel Logs or Terminal)
```
[ClickPesa] Generating token...
[ClickPesa] Token generated successfully
[Pay API] Creating transaction: { orderReference: 'RPT...', ... }
[Pay API] Step 1: Preview USSD push...
[Checksum] Generated: { keys: [...], concatenated: '...', checksum: '...' }
[ClickPesa] Preview USSD request: { endpoint: '...', payload: {...} }
[ClickPesa] Preview success: { activeMethods: [...] }
[Pay API] Preview successful
[Pay API] Step 2: Initiate USSD push...
[Checksum] Generated: { keys: [...], concatenated: '...', checksum: '...' }
[ClickPesa] Initiate USSD request: { endpoint: '...', payload: {...} }
[ClickPesa] Initiate success: { id: '...', status: 'PROCESSING', ... }
[Pay API] Initiate successful: { ... }
```

### If Still Getting Errors

#### 400 Bad Request
**Check logs for:**
- Is phoneNumber being sent? Should see it in the payload
- Is checksum included? Should see `checksum: '***'` in logs
- Are all required fields present? (amount, currency, orderReference, phoneNumber)
- Is amount a string? Should be `"1000"` not `1000`

**Possible causes:**
- Checksum mismatch (check if checksum is enabled in ClickPesa dashboard)
- Invalid orderReference format (must be alphanumeric)
- Invalid phoneNumber format (must be 255XXXXXXXXX, 12 digits total)

#### 403 Forbidden
**Check logs for:**
- Token generation success
- Token format (should have "Bearer " prefix)
- API credentials valid (CLIENT_ID and API_KEY)

**Possible causes:**
- Invalid API credentials
- Token expired (should auto-refresh after 55 minutes)
- IP not whitelisted in ClickPesa dashboard
- Checksum enabled in dashboard but not matching

## ClickPesa Dashboard Verification

### Check These Settings:
1. **API Credentials**: Verify CLIENT_ID and API_KEY are active
2. **Checksum**: Check if checksum is enabled
   - If enabled: Verify CHECKSUM_KEY matches
   - If disabled: Consider disabling in code too
3. **Webhook URL**: Should point to your production domain
4. **IP Whitelist**: Add your server IP if required
5. **Payment Methods**: Ensure AIRTEL, MIX_BY_YASS, HALOPESA are enabled

## API Documentation References

- **Preview USSD Push**: https://docs.clickpesa.com/api-reference/collection/ussd-push-requests/preview-ussd-push-request
- **Initiate USSD Push**: https://docs.clickpesa.com/api-reference/collection/ussd-push-requests/initiate-ussd-push-request
- **Generate Token**: https://docs.clickpesa.com/api-reference/authorization/generate-token
- **Checksum**: https://docs.clickpesa.com/home/checksum

## Next Steps

1. **Restart the development server** to load new environment variables
2. **Test with a real phone number** from Tanzania
3. **Monitor Vercel logs** during the test
4. **Check phone** for USSD push notification

## Common Phone Number Issues

### ❌ Wrong Formats:
- `+255712345678` (has + sign)
- `0712345678` (missing country code)
- `255 712 345 678` (has spaces)
- `255-712-345-678` (has dashes)

### ✅ Correct Format:
- `255712345678` (12 digits, no special characters)

## Additional Notes

- Token cache: Expires after 55 minutes, auto-refreshes
- Checksum: Only needed if enabled in ClickPesa dashboard
- Environment: Make sure Vercel environment variables match .env.local
- Phone validation: Currently only accepts Tanzania numbers (255...)

#!/bin/bash

# MikroTik Auto-Login Verification Script
# This script helps verify the complete payment → activation → login flow

echo "🔍 MikroTik Auto-Login Verification"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ROUTER_IP="192.168.88.1"
ROUTER_USER="admin"
TEST_MAC="AA:BB:CC:DD:EE:FF"  # Example MAC for testing

echo "📋 Pre-Flight Checklist"
echo "----------------------"

# 1. Check if login-auth.html exists on router
echo -n "1. Checking if login-auth.html is uploaded... "
# This would need SSH access - placeholder for manual check
echo -e "${YELLOW}MANUAL CHECK REQUIRED${NC}"
echo "   Run: ssh $ROUTER_USER@$ROUTER_IP '/file print where name=\"hotspot/login-auth.html\"'"

echo ""

# 2. Check if login.html redirect is configured
echo -n "2. Checking login.html redirect... "
echo -e "${YELLOW}MANUAL CHECK REQUIRED${NC}"
echo "   Run: ssh $ROUTER_USER@$ROUTER_IP ':put [/file get hotspot/login.html contents]'"
echo "   Should contain: https://rpt-phi.vercel.app/portal"

echo ""

# 3. Check hotspot configuration
echo -n "3. Checking hotspot profile... "
echo -e "${YELLOW}MANUAL CHECK REQUIRED${NC}"
echo "   Run: ssh $ROUTER_USER@$ROUTER_IP '/ip hotspot profile print detail where name=default'"
echo "   Should have: login-by=mac,http-pap,mac-cookie"

echo ""

# 4. Check if API endpoint is live
echo -n "4. Checking status API endpoint... "
if curl -s https://rpt-phi.vercel.app/api/v1/portal/check-status?order=test > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} API is reachable"
else
    echo -e "${RED}✗${NC} API is not reachable"
fi

echo ""

# 5. Check if webhook endpoint is live
echo -n "5. Checking webhook endpoint... "
if curl -s -o /dev/null -w "%{http_code}" https://rpt-phi.vercel.app/api/v1/webhooks/clickpesa | grep -q "405"; then
    echo -e "${GREEN}✓${NC} Webhook endpoint is live (405 = method not allowed for GET, which is expected)"
else
    echo -e "${YELLOW}!${NC} Unexpected response from webhook endpoint"
fi

echo ""
echo ""
echo "🧪 Testing Instructions"
echo "======================"
echo ""
echo "STEP 1: Upload login-auth.html to router"
echo "  Method A (WinBox): Files → Upload → Select mikrotik-login-auth.html"
echo "  Method B (SCP): scp mikrotik-login-auth.html $ROUTER_USER@$ROUTER_IP:/hotspot/login-auth.html"
echo ""
echo "STEP 2: Verify file upload"
echo "  ssh $ROUTER_USER@$ROUTER_IP"
echo "  /file print where name=\"hotspot/login-auth.html\""
echo "  :put [/file get hotspot/login-auth.html contents]"
echo ""
echo "STEP 3: Test with real device"
echo "  1. Connect phone to WiFi"
echo "  2. Turn off mobile data"
echo "  3. Try to browse any website"
echo "  4. Should redirect to payment portal"
echo "  5. Select a package (use smallest one for testing)"
echo "  6. Complete payment via ClickPesa"
echo "  7. Watch the success page:"
echo "     - Should show 'Activating...' for a few seconds"
echo "     - Then 'You are connected!'"
echo "     - Should auto-redirect to login page"
echo "     - Should see brief 'Authenticating...' message"
echo "     - Then should be able to browse!"
echo ""
echo "STEP 4: Verify on router"
echo "  ssh $ROUTER_USER@$ROUTER_IP"
echo "  /ip hotspot user print    # Should see user with MAC address"
echo "  /ip hotspot active print  # CRITICAL: Should see active session!"
echo ""
echo "STEP 5: Check logs if something goes wrong"
echo "  Router logs: /log print where topics~\"hotspot\""
echo "  Vercel logs: https://vercel.com/[your-project]/logs"
echo ""
echo ""
echo "🎯 Success Indicators"
echo "===================="
echo "${GREEN}✓${NC} Payment completes successfully"
echo "${GREEN}✓${NC} Success page shows 'You are connected!'"
echo "${GREEN}✓${NC} User appears in /ip/hotspot/user"
echo "${GREEN}✓${NC} User appears in /ip/hotspot/active (THIS IS KEY!)"
echo "${GREEN}✓${NC} Internet access works immediately"
echo "${GREEN}✓${NC} Entire flow takes < 30 seconds"
echo ""
echo ""
echo "❌ Troubleshooting"
echo "================="
echo ""
echo "Problem: User created but not in active sessions"
echo "  → Check if login-auth.html was uploaded correctly"
echo "  → Check browser console for JavaScript errors"
echo "  → Verify success page redirected to login-auth.html"
echo "  → Check if form auto-submitted (should see brief 'Authenticating...')"
echo ""
echo "Problem: 'This site can't be reached' at 192.168.88.1"
echo "  → This is expected BEFORE authentication"
echo "  → Should only happen if walled garden isn't working"
echo "  → Check: /ip hotspot walled-garden print"
echo ""
echo "Problem: Payment works but user not created"
echo "  → Check Vercel webhook logs"
echo "  → Test MikroTik API: node test-mikrotik-api.js"
echo "  → Check transaction activationError field"
echo ""
echo "Problem: Login form doesn't auto-submit"
echo "  → Verify JavaScript is enabled"
echo "  → Check login-auth.html file contents"
echo "  → Test manually: Navigate to http://$ROUTER_IP/hotspot/login-auth.html"
echo ""
echo ""
echo "📞 Need Help?"
echo "============"
echo "1. Check AUTO_LOGIN_COMPLETE.md for detailed flow"
echo "2. Check MIKROTIK_UPLOAD_INSTRUCTIONS.md for upload methods"
echo "3. Review router logs: /log print where topics~\"hotspot,info\""
echo "4. Review Vercel function logs at vercel.com"
echo ""
echo "Status: ${YELLOW}Awaiting router file upload and testing${NC}"
echo ""

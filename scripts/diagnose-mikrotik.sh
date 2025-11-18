#!/bin/bash

# Quick diagnostic script for MikroTik hotspot issues
# Run this to check the current state of the router

echo "🔍 MikroTik Diagnostic Check"
echo "============================"
echo ""

ROUTER_IP="192.168.88.1"
ROUTER_USER="admin"

echo "Checking MikroTik router at $ROUTER_IP..."
echo ""

# Check if we can reach the router
if ! ping -c 1 -W 2 $ROUTER_IP > /dev/null 2>&1; then
    echo "❌ Cannot reach router at $ROUTER_IP"
    echo "   Make sure you're connected to the network"
    exit 1
fi

echo "✅ Router is reachable"
echo ""

# Function to run SSH commands
run_cmd() {
    local cmd="$1"
    local desc="$2"
    echo "📋 $desc"
    echo "   Command: $cmd"
    ssh -o ConnectTimeout=5 $ROUTER_USER@$ROUTER_IP "$cmd" 2>&1
    echo ""
}

echo "=================="
echo "1. HOTSPOT USERS"
echo "=================="
run_cmd "/ip hotspot user print" "All hotspot users"

echo "=================="
echo "2. ACTIVE SESSIONS (CRITICAL - Should see users here after payment)"
echo "=================="
run_cmd "/ip hotspot active print" "Active hotspot sessions"

echo "=================="
echo "3. IP BINDINGS (This table causes !empty errors)"
echo "=================="
run_cmd "/ip hotspot ip-binding print" "All IP bindings"

echo "=================="
echo "4. RECENT USERS (Last 3)"
echo "=================="
run_cmd "/ip hotspot user print where comment~\"RPT\" last 3" "Recent users with RPT orders"

echo "=================="
echo "5. HOTSPOT LOGS (Last 20 lines)"
echo "=================="
run_cmd "/log print where topics~\"hotspot\" last 20" "Recent hotspot logs"

echo ""
echo "=================="
echo "DIAGNOSTIC SUMMARY"
echo "=================="
echo ""
echo "If you see:"
echo "  ✅ Users in /ip hotspot user → Payment & user creation working"
echo "  ❌ NO users in /ip hotspot active → Login authentication NOT happening"
echo "  ⚠️  Error when querying ip-binding → Table is empty (causes !empty)"
echo ""
echo "Expected state after successful payment:"
echo "  1. User exists in /ip hotspot user ✅"
echo "  2. User appears in /ip hotspot active ✅"
echo "  3. IP binding MAY exist (optional)"
echo ""
echo "If active sessions is EMPTY, the problem is:"
echo "  - User never accessed login-auth.html (auto-submit page)"
echo "  - OR login-auth.html not uploaded to router"
echo "  - OR form submission failed"
echo ""

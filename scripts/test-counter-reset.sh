#!/bin/bash

# Test script to verify MikroTik counter reset functionality
# This tests on the router directly before deploying code changes

echo "=========================================="
echo "MikroTik Counter Reset Test"
echo "=========================================="
echo ""

MAC="9A:E6:98:FA:9B:9F"

echo "📋 Step 1: Check current user state BEFORE reset"
echo "------------------------------------------"
ssh admin@10.99.0.1 "/ip hotspot user print detail where name=\"$MAC\""
echo ""

echo "📊 Current counters:"
ssh admin@10.99.0.1 "/ip hotspot user print stats where name=\"$MAC\""
echo ""

read -p "⏸️  Press ENTER to reset counters..."

echo ""
echo "🔄 Step 2: Resetting counters..."
echo "------------------------------------------"
ssh admin@10.99.0.1 "/ip hotspot user reset-counters [find name=\"$MAC\"]"

if [ $? -eq 0 ]; then
    echo "✅ Counter reset command executed successfully"
else
    echo "❌ Counter reset command failed!"
    exit 1
fi

echo ""
echo "📋 Step 3: Check user state AFTER reset"
echo "------------------------------------------"
ssh admin@10.99.0.1 "/ip hotspot user print detail where name=\"$MAC\""
echo ""

echo "📊 Counters after reset:"
ssh admin@10.99.0.1 "/ip hotspot user print stats where name=\"$MAC\""
echo ""

echo "=========================================="
echo "✅ Test Complete!"
echo "=========================================="
echo ""
echo "Expected results:"
echo "  - uptime should be 0s (was 3h before)"
echo "  - bytes-in should be 0 (was ~52MB before)"
echo "  - bytes-out should be 0 (was ~572MB before)"
echo "  - limit-uptime should still be 00:20:00"
echo ""
echo "If counters are all zero, the reset works! 🎉"
echo "You can now try logging in from your device."

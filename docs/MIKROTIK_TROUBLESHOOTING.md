# MikroTik Hotspot Internet Access Troubleshooting

## Issue: User shows as "Active" but no internet on phone

### Quick Checks (Run these commands in MikroTik terminal):

```bash
# 1. Check if hotspot server is running
/ip hotspot print

# 2. Check hotspot server profile (must have correct interface)
/ip hotspot profile print detail

# 3. Check if NAT is enabled (CRITICAL for internet access)
/ip firewall nat print

# 4. Check if the hotspot interface has internet access
/ping 8.8.8.8 count=3

# 5. Check DNS settings
/ip dns print

# 6. Check if user can reach gateway
/ip hotspot active print detail where mac-address=E6:93:9B:AB:B8:3B
```

---

## Common Solutions:

### Solution 1: Enable NAT (Most Common Issue)

If you don't have NAT enabled, users can't access the internet:

```bash
# Add masquerade NAT rule
/ip firewall nat add chain=srcnat action=masquerade out-interface=ether1 comment="Hotspot NAT"
```

**Note:** Change `ether1` to your WAN interface (the one connected to internet)

---

### Solution 2: Check Hotspot Server Profile

The hotspot server must use the correct interface:

```bash
# Check current profile
/ip hotspot profile print

# If needed, set the correct interface
/ip hotspot set 0 interface=bridge
```

---

### Solution 3: DNS Configuration

Users need DNS to resolve websites:

```bash
# Set Google DNS servers
/ip dns set servers=8.8.8.8,8.8.4.4 allow-remote-requests=yes
```

---

### Solution 4: Check Default Route

Your router needs a default route to the internet:

```bash
# Check routes
/ip route print

# If no default route, add one (replace 192.168.0.1 with your gateway)
/ip route add dst-address=0.0.0.0/0 gateway=192.168.0.1
```

---

## Test from Phone:

1. **Disconnect and reconnect** to WiFi
2. Try to browse to: **http://google.com**
3. If you see a login page, you're in the captive portal
4. After "connected" message, try: **https://www.google.com**

---

## Expected Hotspot Configuration:

```bash
# Hotspot should be on bridge interface
/interface bridge
add name=bridge

/interface bridge port
add bridge=bridge interface=wifi1
add bridge=bridge interface=wifi2

# IP pool for users
/ip pool
add name=hotspot-pool ranges=192.168.88.10-192.168.88.254

# Hotspot profile
/ip hotspot profile
add hotspot-address=192.168.88.1 name=hsprof1 dns-name=login.realpower.tech

# Hotspot server
/ip hotspot
add address-pool=hotspot-pool disabled=no interface=bridge name=hotspot1 profile=hsprof1

# NAT - CRITICAL!
/ip firewall nat
add action=masquerade chain=srcnat out-interface=ether1 comment="Hotspot NAT"
```

---

## Most Likely Issue:

Based on your screenshot showing the active session, **NAT is probably missing**. Run this command:

```bash
/ip firewall nat print
```

If you see no rules or no masquerade rule, add it:

```bash
/ip firewall nat add chain=srcnat action=masquerade out-interface=<YOUR_WAN_INTERFACE>
```

Replace `<YOUR_WAN_INTERFACE>` with your internet-connected interface (usually `ether1` or `pppoe-out1`)

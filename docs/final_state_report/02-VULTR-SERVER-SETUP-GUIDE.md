# Vultr Server Setup & Configuration Guide

**Document Version:** 1.0  
**Last Updated:** November 18, 2025  
**System Status:** ✅ PRODUCTION - WORKING  
**Server IP:** 139.84.241.180  
**Uptime:** 20+ days

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Server Specifications](#server-specifications)
3. [Current Working Configuration](#current-working-configuration)
4. [Step-by-Step Server Setup](#step-by-step-server-setup)
5. [Service Configuration](#service-configuration)
6. [Troubleshooting & Verification](#troubleshooting--verification)

---

## Executive Summary

This document contains the **complete working configuration** of the Real Power Tech Vultr VPS as of November 18, 2025. This server provides:

1. **WireGuard VPN Server** - Secure tunnel for MikroTik router API access
2. **Nginx Stream Proxy** - Proxies MikroTik API requests from application to router
3. **FreeRADIUS Server** - (Currently unused, configured for future use)

**Architecture:** Next.js (Vercel) ↔ Vultr VPN ↔ MikroTik Router

---

## Server Specifications

### Hardware & OS

| Specification    | Value                                |
| ---------------- | ------------------------------------ |
| **Provider**     | Vultr VPS                            |
| **Public IP**    | 139.84.241.180                       |
| **Hostname**     | vultr.guest                          |
| **OS**           | Ubuntu 22.04.5 LTS (Jammy Jellyfish) |
| **Kernel**       | Linux 5.15.0-160-generic             |
| **Architecture** | x86_64 (AMD EPYC-Genoa Processor)    |
| **CPU Cores**    | 1 vCPU                               |
| **RAM**          | 2 GB (1.9 GiB)                       |
| **Disk**         | 25 GB SSD                            |
| **Swap**         | 2.3 GB                               |
| **Uptime**       | 20+ days                             |

### Network Configuration

| Interface  | IP Address        | Network  | Type      |
| ---------- | ----------------- | -------- | --------- |
| **enp1s0** | 139.84.241.180/23 | Public   | Physical  |
| **wg0**    | 10.99.0.1/24      | VPN      | WireGuard |
| **lo**     | 127.0.0.1/8       | Loopback | Virtual   |

### Running Services

| Service                   | Port  | Protocol | Purpose                 |
| ------------------------- | ----- | -------- | ----------------------- |
| **SSH**                   | 22    | TCP      | Remote administration   |
| **Nginx**                 | 80    | TCP      | HTTP (unused)           |
| **Nginx Stream**          | 8729  | TCP      | MikroTik API proxy      |
| **WireGuard**             | 51820 | UDP      | VPN server              |
| **FreeRADIUS**            | 1812  | UDP      | Authentication (unused) |
| **FreeRADIUS Accounting** | 1813  | UDP      | Accounting (unused)     |

---

## Current Working Configuration

### System Users

```bash
# Active users
root        # Main administrative account
ubuntu      # Default Ubuntu user (UID 1000)
jestone     # Developer account (UID 1002)
linuxuser   # Additional user (UID 1001)

# Service users
freerad     # FreeRADIUS daemon
www-data    # Nginx web server
sshd        # SSH daemon
```

### Network Interfaces

```bash
# Public interface
enp1s0:
  IP: 139.84.241.180/23
  MAC: 56:00:05:b9:bc:1f
  Gateway: 139.84.240.1
  DNS: 108.61.10.10, 169.254.169.254

# WireGuard VPN
wg0:
  IP: 10.99.0.1/24
  Type: Point-to-point tunnel
  MTU: 1420
```

### WireGuard VPN Configuration

**File:** `/etc/wireguard/wg0.conf`

```ini
[Interface]
Address = 10.99.0.1/24
ListenPort = 51820
PrivateKey = gA6q77LDBaNgHugxApe6GiXMnrVaiyqXhRrf3Eeuplo=
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o enp1s0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o enp1s0 -j MASQUERADE

# Client: MikroTik Test Router (Real Power Tech - Main Office)
[Peer]
PublicKey = ElijHE6+KKZmglqfux/Rm9rDeO7sgxnUbi08kYsvazQ=
AllowedIPs = 10.99.0.2/32
PersistentKeepalive = 25
```

**Server Keys:**

```
Private Key: gA6q77LDBaNgHugxApe6GiXMnrVaiyqXhRrf3Eeuplo= (hidden in wg show)
Public Key:  2mHXqcT6F/shTo5E5aivX3fS9HZ3IUDONDFYuh7XPic=
```

### Nginx Configuration

**Main Config:** `/etc/nginx/nginx.conf`

```nginx
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 768;
}

http {
    sendfile on;
    tcp_nopush on;
    types_hash_max_size 2048;

    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    gzip on;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}

# Stream proxy for MikroTik API
include /etc/nginx/sites-available/mikrotik-proxy;
```

**MikroTik API Proxy:** `/etc/nginx/sites-available/mikrotik-proxy`

```nginx
stream {
    upstream mikrotik_api {
        server 10.99.0.2:8729;
    }

    server {
        listen 8729;
        proxy_pass mikrotik_api;
        proxy_timeout 30s;
        proxy_connect_timeout 10s;
    }
}
```

### Firewall Configuration (UFW)

```bash
# UFW Status
Status: active
Default: deny (incoming), allow (outgoing), deny (routed)

# Active Rules
To                         Action      From
--                         ------      ----
22/tcp                     ALLOW IN    Anywhere
OpenSSH                    ALLOW IN    Anywhere
1812/udp                   ALLOW IN    Anywhere     # FreeRADIUS Auth
1813/udp                   ALLOW IN    Anywhere     # FreeRADIUS Acct
51820/udp                  ALLOW IN    Anywhere     # WireGuard VPN
8729/tcp                   ALLOW IN    Anywhere     # MikroTik API Proxy
```

### IPTables NAT Rules

```bash
# Masquerade for WireGuard VPN
iptables -t nat -A POSTROUTING -o enp1s0 -j MASQUERADE

# Forward traffic for VPN
iptables -A FORWARD -i wg0 -j ACCEPT
iptables -A FORWARD -o wg0 -j ACCEPT
```

### FreeRADIUS Configuration (Unused)

**Clients:** `/etc/freeradius/3.0/clients.conf`

```conf
client localhost {
    ipaddr = 127.0.0.1
    secret = c0bae8ee21e365c0711c561d5c9dc036f03845949e3fd5d04ee75e088ae5b802
    require_message_authenticator = no
}

client mikrotik {
    ipaddr = 0.0.0.0/0
    secret = c0bae8ee21e365c0711c561d5c9dc036f03845949e3fd5d04ee75e088ae5b802
    nas_type = other
}
```

**Status:** FreeRADIUS is configured but **NOT currently used**. Authentication is handled by the Next.js application via API.

---

## Step-by-Step Server Setup

### Part 1: Initial Server Provisioning

1. **Create Vultr VPS**

   ```
   - Choose Ubuntu 22.04 LTS x64
   - Select server location (closest to target market)
   - Choose $6/month plan (1 vCPU, 2GB RAM, 55GB SSD)
   - Deploy server
   - Note down public IP address
   ```

2. **Initial SSH Access**

   ```bash
   # SSH as root using provided password
   ssh root@YOUR_SERVER_IP

   # Update system
   apt update && apt upgrade -y

   # Set timezone
   timedatectl set-timezone Africa/Dar_es_Salaam

   # Set hostname
   hostnamectl set-hostname vultr
   ```

3. **Create Users (Optional)**

   ```bash
   # Create admin user
   adduser jestone
   usermod -aG sudo jestone

   # Setup SSH keys for secure access
   mkdir -p /home/jestone/.ssh
   chmod 700 /home/jestone/.ssh
   # Add public key to /home/jestone/.ssh/authorized_keys
   ```

### Part 2: Install WireGuard VPN

```bash
# 1. Install WireGuard
apt install wireguard -y

# 2. Enable IP forwarding
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
echo "net.ipv6.conf.all.forwarding=1" >> /etc/sysctl.conf
sysctl -p

# 3. Generate server keys
cd /etc/wireguard
umask 077
wg genkey | tee privatekey | wg pubkey > publickey

# Save these keys securely!
cat privatekey  # Server private key
cat publickey   # Server public key

# 4. Create WireGuard config
cat > /etc/wireguard/wg0.conf << 'EOF'
[Interface]
Address = 10.99.0.1/24
ListenPort = 51820
PrivateKey = YOUR_SERVER_PRIVATE_KEY_HERE
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o enp1s0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o enp1s0 -j MASQUERADE

# Peer will be added here for each MikroTik router
EOF

# 5. Set correct permissions
chmod 600 /etc/wireguard/wg0.conf

# 6. Enable and start WireGuard
systemctl enable wg-quick@wg0
systemctl start wg-quick@wg0

# 7. Verify VPN is running
wg show
ip addr show wg0
```

### Part 3: Configure Firewall

```bash
# 1. Install UFW (if not installed)
apt install ufw -y

# 2. Set default policies
ufw default deny incoming
ufw default allow outgoing

# 3. Allow SSH (CRITICAL - don't lock yourself out!)
ufw allow 22/tcp
ufw allow OpenSSH

# 4. Allow WireGuard
ufw allow 51820/udp

# 5. Allow MikroTik API proxy
ufw allow 8729/tcp

# 6. Allow FreeRADIUS (optional, for future use)
ufw allow 1812/udp
ufw allow 1813/udp

# 7. Enable firewall
ufw enable

# 8. Verify rules
ufw status verbose
```

### Part 4: Install & Configure Nginx

```bash
# 1. Install Nginx
apt install nginx -y

# 2. Create MikroTik API proxy configuration
cat > /etc/nginx/sites-available/mikrotik-proxy << 'EOF'
stream {
    upstream mikrotik_api {
        server 10.99.0.2:8729;
    }

    server {
        listen 8729;
        proxy_pass mikrotik_api;
        proxy_timeout 30s;
        proxy_connect_timeout 10s;
    }
}
EOF

# 3. Update main nginx.conf to include stream proxy
nano /etc/nginx/nginx.conf
# Add at the bottom (outside http block):
# include /etc/nginx/sites-available/mikrotik-proxy;

# 4. Test configuration
nginx -t

# 5. Restart Nginx
systemctl restart nginx

# 6. Enable Nginx on boot
systemctl enable nginx

# 7. Verify Nginx is running
systemctl status nginx
ss -tlnp | grep nginx
```

### Part 5: Install FreeRADIUS (Optional)

```bash
# 1. Install FreeRADIUS
apt install freeradius -y

# 2. Configure clients
cat > /etc/freeradius/3.0/clients.conf << 'EOF'
client localhost {
    ipaddr = 127.0.0.1
    secret = YOUR_RADIUS_SECRET_HERE
    require_message_authenticator = no
}

client mikrotik {
    ipaddr = 0.0.0.0/0
    secret = YOUR_RADIUS_SECRET_HERE
    nas_type = other
}
EOF

# 3. Enable and start FreeRADIUS
systemctl enable freeradius
systemctl start freeradius

# 4. Verify service
systemctl status freeradius
```

**Note:** FreeRADIUS is installed but not currently used. The system uses application-based authentication instead.

---

## Adding New MikroTik Router to VPN

### Step 1: Get Router's Public Key

On the MikroTik router:

```routeros
# Get the public key
:put [/interface wireguard get wireguard-rpt public-key]
```

### Step 2: Add Peer to Vultr Server

On Vultr server:

```bash
# Stop WireGuard
systemctl stop wg-quick@wg0

# Edit config
nano /etc/wireguard/wg0.conf

# Add new peer at the end:
# [Peer]
# PublicKey = ROUTER_PUBLIC_KEY_HERE
# AllowedIPs = 10.99.0.X/32  # Use next available IP (3, 4, 5, etc.)
# PersistentKeepalive = 25

# Example:
[Peer]
PublicKey = ElijHE6+KKZmglqfux/Rm9rDeO7sgxnUbi08kYsvazQ=
AllowedIPs = 10.99.0.2/32
PersistentKeepalive = 25

# Save and exit

# Restart WireGuard
systemctl start wg-quick@wg0

# Verify peer is connected
wg show
```

### Step 3: Update Nginx Upstream (If Multiple Routers)

If you have multiple routers, you can load balance or route by domain:

```nginx
stream {
    # Define multiple upstreams
    upstream router1 {
        server 10.99.0.2:8729;
    }

    upstream router2 {
        server 10.99.0.3:8729;
    }

    # Map based on SNI or create separate ports
    server {
        listen 8729;  # Router 1
        proxy_pass router1;
    }

    server {
        listen 8730;  # Router 2
        proxy_pass router2;
    }
}
```

---

## Service Management

### WireGuard Commands

```bash
# Check status
systemctl status wg-quick@wg0

# Start/Stop/Restart
systemctl start wg-quick@wg0
systemctl stop wg-quick@wg0
systemctl restart wg-quick@wg0

# View peers and traffic
wg show

# Check interface
ip addr show wg0

# View logs
journalctl -u wg-quick@wg0 --since "1 hour ago"
```

### Nginx Commands

```bash
# Check status
systemctl status nginx

# Start/Stop/Restart
systemctl start nginx
systemctl stop nginx
systemctl restart nginx

# Reload config (no downtime)
nginx -s reload

# Test config
nginx -t

# View logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check listening ports
ss -tlnp | grep nginx
```

### Firewall Commands

```bash
# Check status
ufw status verbose
ufw status numbered

# Add rule
ufw allow PORT/PROTOCOL

# Delete rule
ufw delete RULE_NUMBER

# Enable/Disable
ufw enable
ufw disable

# View raw iptables
iptables -L -n -v
iptables -t nat -L -n -v
```

---

## Troubleshooting & Verification

### Verify VPN Connectivity

```bash
# 1. Check WireGuard interface exists
ip addr show wg0
# Should show: 10.99.0.1/24

# 2. Check peers are connected
wg show
# Look for "latest handshake" < 2 minutes

# 3. Ping router through VPN
ping 10.99.0.2 -c 5

# 4. Test API connection
curl -k https://10.99.0.2:8729/rest
# Note: Will fail without authentication, but proves connectivity

# 5. Check firewall
ufw status | grep 51820
iptables -L -n | grep wg0
```

### Verify Nginx Proxy

```bash
# 1. Check Nginx is listening
ss -tlnp | grep 8729
# Should show nginx listening on 0.0.0.0:8729

# 2. Test from external (via public IP)
# From your local machine:
nc -zv 139.84.241.180 8729
# Should connect

# 3. Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# 4. Test proxy (if VPN is up)
curl -k https://139.84.241.180:8729/rest
# Will fail auth but proves proxy works
```

### Common Issues & Solutions

| Issue                             | Symptoms                   | Solution                                                                   |
| --------------------------------- | -------------------------- | -------------------------------------------------------------------------- |
| **VPN not connecting**            | No handshake in `wg show`  | Check firewall allows UDP 51820, verify keys match on both sides           |
| **Nginx proxy not working**       | Connection refused on 8729 | Check `nginx -t`, verify upstream IP is correct (10.99.0.2), restart nginx |
| **Can't ping router through VPN** | Ping fails to 10.99.0.2    | Check VPN is up on both sides, verify routing, check iptables rules        |
| **High latency**                  | Slow API responses         | Check server load, network congestion, consider server location            |
| **Connection drops**              | Frequent disconnections    | Increase `PersistentKeepalive`, check server stability                     |

### Health Monitoring

```bash
# System resources
free -h
df -h
top

# Network statistics
ss -s
netstat -i

# Service status
systemctl status wg-quick@wg0
systemctl status nginx
systemctl status freeradius

# Recent logs
journalctl --since "1 hour ago" --no-pager | tail -100

# VPN statistics
wg show all
```

---

## Security Hardening

### SSH Security

```bash
# 1. Disable root login (after creating admin user)
nano /etc/ssh/sshd_config
# Set: PermitRootLogin no

# 2. Use SSH keys only
# Set: PasswordAuthentication no

# 3. Change SSH port (optional)
# Set: Port 2222

# 4. Restart SSH
systemctl restart ssh
```

### Fail2Ban (Optional)

```bash
# Install
apt install fail2ban -y

# Enable
systemctl enable fail2ban
systemctl start fail2ban

# Check status
fail2ban-client status
```

### Automatic Updates

```bash
# Enable unattended upgrades
apt install unattended-upgrades -y
dpkg-reconfigure -plow unattended-upgrades

# Configure
nano /etc/apt/apt.conf.d/50unattended-upgrades
```

### Backup Configuration

```bash
# Create backup directory
mkdir -p /root/backups

# Backup important configs
tar -czf /root/backups/vultr-config-$(date +%Y%m%d).tar.gz \
  /etc/wireguard/ \
  /etc/nginx/ \
  /etc/ufw/ \
  /etc/ssh/sshd_config

# Download backup to local machine
scp root@139.84.241.180:/root/backups/*.tar.gz ./
```

---

## Performance Tuning

### Nginx Optimization

```nginx
# In /etc/nginx/nginx.conf
worker_processes auto;
worker_connections 2048;

# In stream block
proxy_buffer_size 16k;
proxy_timeout 60s;
```

### WireGuard Optimization

```ini
# In /etc/wireguard/wg0.conf
MTU = 1420  # Optimal for most networks
PersistentKeepalive = 25  # Keep NAT alive
```

### System Optimization

```bash
# Increase file limits
echo "* soft nofile 65535" >> /etc/security/limits.conf
echo "* hard nofile 65535" >> /etc/security/limits.conf

# TCP tuning
cat >> /etc/sysctl.conf << EOF
net.core.rmem_max = 134217728
net.core.wmem_max = 134217728
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864
EOF

sysctl -p
```

---

## Appendix: Quick Reference

### Key IP Addresses

- **Public IP:** 139.84.241.180
- **VPN Gateway:** 10.99.0.1
- **Router 1 VPN:** 10.99.0.2
- **DNS Servers:** 8.8.8.8, 1.1.1.1

### Key Ports

- **SSH:** 22
- **WireGuard:** 51820 (UDP)
- **MikroTik API Proxy:** 8729 (TCP)
- **FreeRADIUS Auth:** 1812 (UDP)
- **FreeRADIUS Acct:** 1813 (UDP)

### Important Files

- WireGuard config: `/etc/wireguard/wg0.conf`
- Nginx main: `/etc/nginx/nginx.conf`
- Nginx proxy: `/etc/nginx/sites-available/mikrotik-proxy`
- Firewall rules: `/etc/ufw/` (managed by `ufw` command)
- RADIUS clients: `/etc/freeradius/3.0/clients.conf`

### Service Names

- WireGuard: `wg-quick@wg0.service`
- Nginx: `nginx.service`
- FreeRADIUS: `freeradius.service`
- SSH: `ssh.service` or `sshd.service`

---

**Document End**

For questions or issues, refer to:

- WireGuard Documentation: https://www.wireguard.com/
- Nginx Documentation: https://nginx.org/en/docs/
- Ubuntu Server Guide: https://ubuntu.com/server/docs
- Real Power Tech Technical Team

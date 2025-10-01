# Safe Nginx Setup for tracker.mutindo.com

This guide ensures the Tracker API Nginx configuration **won't interfere** with your existing applications.

## Why It's Safe

### 1. **Separate Server Block**
Each application has its own server block with a unique `server_name`:
- Your existing apps: `example.com`, `app1.example.com`, etc.
- Tracker API: **`tracker.mutindo.com`** (isolated)

### 2. **Separate Configuration File**
- Existing configs: `/etc/nginx/sites-available/your-other-apps`
- Tracker API: `/etc/nginx/sites-available/tracker-api` (new file)

### 3. **Unique Upstream Name**
- Our upstream: `upstream tracker_api { ... }`
- Won't conflict with your existing upstreams

### 4. **Different Internal Port**
- Tracker API listens on: **port 83** (internal)
- Your other apps use different ports
- No port conflicts

---

## Pre-Deployment Checks

### 1. Check existing Nginx configurations

```bash
# List all enabled sites
ls -la /etc/nginx/sites-enabled/

# View existing configurations
sudo nginx -T | grep "server_name"

# Check which ports are in use
sudo netstat -tlnp | grep nginx
```

### 2. Verify port 83 is available

```bash
# Check if port 83 is free
sudo netstat -tlnp | grep :83

# If nothing is returned, port 83 is available
```

### 3. Check for domain conflicts

```bash
# Make sure tracker.mutindo.com isn't already configured
sudo grep -r "tracker.mutindo.com" /etc/nginx/sites-available/
sudo grep -r "tracker.mutindo.com" /etc/nginx/sites-enabled/
```

---

## Safe Installation Steps

### 1. Backup existing Nginx configuration

```bash
# Create backup directory
sudo mkdir -p /etc/nginx/backups

# Backup all configs
sudo cp -r /etc/nginx/sites-available/* /etc/nginx/backups/
sudo cp -r /etc/nginx/sites-enabled/* /etc/nginx/backups/
sudo cp /etc/nginx/nginx.conf /etc/nginx/backups/nginx.conf.backup

echo "✅ Backup created in /etc/nginx/backups/"
```

### 2. Copy the tracker-api configuration

```bash
# Copy the new config (doesn't affect existing configs)
sudo cp /var/www/tracker/backend/nginx.conf /etc/nginx/sites-available/tracker-api

# DO NOT enable yet - test first
```

### 3. Test the new configuration

```bash
# Test without enabling (safe - won't affect running config)
sudo nginx -t

# If test passes, you're good to continue
```

### 4. Enable the new site (only if test passed)

```bash
# Create symlink to enable
sudo ln -s /etc/nginx/sites-available/tracker-api /etc/nginx/sites-enabled/

# Test again with new site enabled
sudo nginx -t

# If test passes, reload (graceful - no downtime)
sudo systemctl reload nginx
```

### 5. Verify everything still works

```bash
# Test your existing apps
curl -I https://your-existing-app.com

# Test the new tracker API
curl -I https://tracker.mutindo.com/health
```

---

## Understanding Nginx Server Blocks

Nginx uses **server blocks** (similar to Apache's VirtualHosts) to serve multiple applications:

```nginx
# Your Existing App 1
server {
    server_name app1.example.com;
    # ... app1 config ...
}

# Your Existing App 2
server {
    server_name app2.example.com;
    # ... app2 config ...
}

# New Tracker API (isolated, won't affect above)
server {
    server_name tracker.mutindo.com;
    # ... tracker config ...
}
```

**Key Points:**
- Each `server_name` directive is **completely isolated**
- Nginx routes requests based on the domain name
- No cross-contamination between server blocks

---

## Port Configuration

### Internal Ports (localhost only)
These are application ports, not exposed to internet:

```
Your App 1:     localhost:3000
Your App 2:     localhost:4000
Tracker API:    localhost:83    ← New, won't conflict
```

### External Ports (public)
All apps share the same public ports through Nginx:

```
HTTP:   Port 80   (shared by all apps)
HTTPS:  Port 443  (shared by all apps)
```

Nginx handles routing:
- Request to `app1.example.com` → forwards to `localhost:3000`
- Request to `tracker.mutindo.com` → forwards to `localhost:83`

---

## Rollback Plan (If Needed)

If anything goes wrong, you can instantly rollback:

### Quick Rollback

```bash
# Disable the tracker-api site
sudo rm /etc/nginx/sites-enabled/tracker-api

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Verify existing apps still work
curl -I https://your-existing-app.com
```

### Full Restore from Backup

```bash
# Restore all configurations
sudo cp -r /etc/nginx/backups/* /etc/nginx/sites-available/
sudo systemctl reload nginx
```

---

## Modified Nginx Configuration (Non-Conflicting)

Here's what makes our config safe:

```nginx
# Unique upstream name (won't conflict)
upstream tracker_api {  # ← Unique name
    server 127.0.0.1:83;  # ← Unique port
}

# Unique rate limiting zones (optional, but safe)
limit_req_zone $binary_remote_addr zone=tracker_api_limit:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=tracker_auth_limit:10m rate=10r/m;

# Specific domain only
server {
    server_name tracker.mutindo.com;  # ← Only responds to this domain
    # ... rest of config ...
}
```

---

## Alternative: Use Different Port for Internal App

If you prefer to use a standard port pattern like your other apps:

### Option 1: Use port 3001 (like other Node apps)

```bash
# Update .env
PORT=3001

# Update ecosystem.config.js
PORT: 3001

# Update nginx.conf upstream
server 127.0.0.1:3001;
```

### Option 2: Use a higher port (e.g., 8083)

```bash
# Update .env
PORT=8083

# Update ecosystem.config.js
PORT: 8083

# Update nginx.conf upstream
server 127.0.0.1:8083;
```

---

## Testing Checklist

Before going live, verify:

- [ ] Nginx test passes: `sudo nginx -t`
- [ ] Existing apps still respond
- [ ] Port 83 is listening: `sudo netstat -tlnp | grep :83`
- [ ] Tracker API responds: `curl http://localhost:83/health`
- [ ] HTTPS works: `curl https://tracker.mutindo.com/health`
- [ ] SSL certificate is valid
- [ ] All existing apps still work
- [ ] No error logs: `sudo tail -f /var/log/nginx/error.log`

---

## Common Pitfalls (Avoided)

✅ **We avoided:**
- Using conflicting `server_name` directives
- Using conflicting upstream names
- Using conflicting internal ports
- Modifying existing config files
- Using global settings that affect other apps

✅ **We ensured:**
- Separate config file
- Unique server block
- Unique upstream name
- Unique internal port
- No changes to existing configurations

---

## Support

If you encounter any issues:

1. Check Nginx error logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. Verify configuration syntax:
   ```bash
   sudo nginx -t
   ```

3. Rollback if needed (see Rollback Plan above)

4. Contact your team with logs

---

## Summary

✅ **Safe because:**
- Separate configuration file
- Unique domain (`tracker.mutindo.com`)
- Unique internal port (83)
- Unique upstream name (`tracker_api`)
- No modifications to existing configs
- Easy rollback available

🎯 **Your existing apps will continue to work normally!**


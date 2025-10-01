# Quick Deployment Guide - tracker.mutindo.com

This is a condensed deployment guide for **tracker.mutindo.com** on port **83**.

## Server Configuration

- **Domain:** tracker.mutindo.com
- **Port:** 83
- **Environment:** Production
- **Process Manager:** PM2
- **Web Server:** Nginx with SSL

---

## Prerequisites Checklist

- [ ] Ubuntu/Debian server with root/sudo access
- [ ] Node.js 18+ installed
- [ ] MySQL/MariaDB running
- [ ] Domain DNS pointing to server IP
- [ ] Ports 80, 443 open in firewall

---

## Quick Setup Commands

### 1. Install Dependencies (One-time)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Setup Database

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE tracker_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tracker_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON tracker_prod.* TO 'tracker_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Clone and Configure

```bash
# Create app directory
sudo mkdir -p /var/www/tracker
sudo chown -R $USER:$USER /var/www/tracker

# Clone repository
cd /var/www/tracker
git clone YOUR_REPO_URL .

# Navigate to backend
cd backend

# Create .env file
cp env.example .env
nano .env
```

**Update .env with:**
```env
NODE_ENV=production
PORT=83
DATABASE_URL="mysql://tracker_user:your_password@localhost:3306/tracker_prod"
JWT_SECRET="your-64-character-secret-here"
CORS_ORIGIN="https://tracker.mutindo.com"
```

### 4. Build and Deploy

```bash
# Install dependencies
npm ci

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build TypeScript
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save
pm2 startup
# Copy and run the command output by pm2 startup
```

### 5. Configure Nginx (Safe - Won't Affect Existing Apps)

```bash
# IMPORTANT: Backup existing configs first
sudo mkdir -p /etc/nginx/backups
sudo cp -r /etc/nginx/sites-available/* /etc/nginx/backups/

# Copy nginx configuration (separate file, won't affect others)
sudo cp nginx.conf /etc/nginx/sites-available/tracker-api

# Test configuration (safe - doesn't enable yet)
sudo nginx -t

# Enable site (only if test passed)
sudo ln -s /etc/nginx/sites-available/tracker-api /etc/nginx/sites-enabled/

# Test again
sudo nginx -t

# Reload Nginx (graceful reload, no downtime)
sudo systemctl reload nginx

# Verify existing apps still work
# curl -I https://your-existing-app.com
```

### 6. Setup SSL Certificate

```bash
# Obtain SSL certificate
sudo certbot --nginx -d tracker.mutindo.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### 7. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Verify Deployment

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs tracker-api --lines 50

# Test local connection
curl http://localhost:83/health

# Test public HTTPS
curl https://tracker.mutindo.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-01T...",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "firebase": "healthy"
  }
}
```

---

## Daily Operations

### Update Code

```bash
cd /var/www/tracker/backend
git pull origin main
npm ci
npm run build
npx prisma migrate deploy
pm2 reload tracker-api
```

### View Logs

```bash
# PM2 logs
pm2 logs tracker-api

# Application logs
tail -f /var/www/tracker/backend/logs/combined.log
tail -f /var/www/tracker/backend/logs/error.log

# Nginx logs
sudo tail -f /var/log/nginx/tracker-api-access.log
sudo tail -f /var/log/nginx/tracker-api-error.log
```

### Restart Services

```bash
# Restart application (zero-downtime)
pm2 reload tracker-api

# Restart application (with downtime)
pm2 restart tracker-api

# Restart Nginx
sudo systemctl restart nginx
```

### Check Status

```bash
# PM2 status
pm2 status
pm2 show tracker-api

# Nginx status
sudo systemctl status nginx

# Database connection
mysql -u tracker_user -p tracker_prod

# Disk space
df -h

# Memory usage
free -m
```

---

## Useful Scripts (package.json)

```bash
# Build for production
npm run deploy:build

# Run migrations
npm run deploy:migrate

# PM2 commands
npm run pm2:start     # Start application
npm run pm2:reload    # Reload (zero-downtime)
npm run pm2:stop      # Stop application
npm run pm2:logs      # View logs
npm run pm2:monit     # Monitor resources
```

---

## Troubleshooting

### Application won't start
```bash
pm2 logs tracker-api --lines 100
pm2 restart tracker-api
```

### 502 Bad Gateway
```bash
# Check if app is running
pm2 status

# Check if port 83 is listening
sudo netstat -tlnp | grep :83

# Restart services
pm2 restart tracker-api
sudo systemctl restart nginx
```

### Database connection error
```bash
# Test database connection
mysql -u tracker_user -p tracker_prod

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### SSL certificate issues
```bash
# Renew certificate
sudo certbot renew

# Check expiry
sudo certbot certificates
```

---

## Important Files

| File | Location | Purpose |
|------|----------|---------|
| App code | `/var/www/tracker/backend` | Application files |
| Environment | `/var/www/tracker/backend/.env` | Configuration |
| Nginx config | `/etc/nginx/sites-available/tracker-api` | Web server config |
| SSL certs | `/etc/letsencrypt/live/tracker.mutindo.com/` | SSL certificates |
| App logs | `/var/www/tracker/backend/logs/` | Application logs |
| Nginx logs | `/var/log/nginx/` | Web server logs |
| PM2 logs | `~/.pm2/logs/` | Process manager logs |

---

## Security Checklist

- [ ] Firewall enabled (UFW)
- [ ] Strong passwords for database
- [ ] JWT_SECRET is random and secure
- [ ] SSL certificate installed
- [ ] Rate limiting enabled
- [ ] Regular backups configured
- [ ] Non-root user for deployment
- [ ] .env file permissions: `chmod 600 .env`
- [ ] Regular security updates

---

## Backup Strategy

### Manual Backup
```bash
# Backup database
mysqldump -u tracker_user -p tracker_prod > backup_$(date +%Y%m%d).sql

# Backup uploads/media
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/www/tracker/backend/uploads
```

### Automated Backup (Cron)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * mysqldump -u tracker_user -p'password' tracker_prod > /backups/tracker_$(date +\%Y\%m\%d).sql
```

---

## Support

- **Full Documentation:** See `DEPLOYMENT.md`
- **PM2 Monitoring:** https://pm2.io
- **Logs:** Check `/var/www/tracker/backend/logs/`

## Quick Reference URLs

- **API Endpoint:** https://tracker.mutindo.com
- **Health Check:** https://tracker.mutindo.com/health
- **API Documentation:** https://tracker.mutindo.com/api-docs
- **Server Port:** 83 (internal)
- **Public Ports:** 80 (HTTP), 443 (HTTPS)


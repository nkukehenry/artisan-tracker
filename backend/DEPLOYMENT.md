# Deployment Guide - Tracker API

Complete guide for deploying the Tracker API to a production server with Nginx and PM2.

## Prerequisites

- Ubuntu/Debian server (20.04 LTS or later recommended)
- Node.js 18+ installed
- Nginx installed
- MySQL/MariaDB installed and running
- Domain name pointed to your server
- SSH access to the server

## Table of Contents

1. [Server Setup](#server-setup)
2. [Install Dependencies](#install-dependencies)
3. [Clone Repository](#clone-repository)
4. [Configure Environment](#configure-environment)
5. [Database Setup](#database-setup)
6. [Build Application](#build-application)
7. [PM2 Configuration](#pm2-configuration)
8. [Nginx Configuration](#nginx-configuration)
9. [SSL Certificate](#ssl-certificate)
10. [Deployment](#deployment)
11. [Monitoring](#monitoring)
12. [Troubleshooting](#troubleshooting)

---

## Server Setup

### 1. Update system packages

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Create deployment user

```bash
# Create a non-root user for deployment
sudo adduser deploy
sudo usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

### 3. Configure firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## Install Dependencies

### 1. Install Node.js 18+

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should show v18.x or higher
```

### 2. Install PM2 globally

```bash
sudo npm install -g pm2
pm2 --version
```

### 3. Install Nginx

```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 4. Install MySQL

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
```

---

## Clone Repository

### 1. Create application directory

```bash
sudo mkdir -p /var/www/tracker
sudo chown -R deploy:deploy /var/www/tracker
```

### 2. Clone your repository

```bash
cd /var/www/tracker
git clone https://github.com/yourusername/tracker.git .

# Or if using SSH
git clone git@github.com:yourusername/tracker.git .
```

### 3. Navigate to backend

```bash
cd /var/www/tracker/backend
```

---

## Configure Environment

### 1. Create production .env file

```bash
cp env.example .env
nano .env
```

### 2. Update environment variables

```env
# Server Configuration
NODE_ENV=production
PORT=83
HOST=0.0.0.0

# Database Configuration
DATABASE_URL="mysql://tracker_user:secure_password@localhost:3306/tracker_prod"

# Redis Configuration
REDIS_URL="redis://localhost:6379"
REDIS_PASSWORD="your_redis_password"

# JWT Configuration
JWT_SECRET="generate-a-secure-random-string-here"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"

# Firebase Configuration (if using)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL="your-client-email"

# CORS Configuration
CORS_ORIGIN="https://yourdomain.com"

# Logging
LOG_DIRECTORY="logs"
LOG_MAX_SIZE="5242880"
LOG_MAX_FILES="10"

# Encryption
ENCRYPTION_KEY="generate-32-character-key-here"
```

### 3. Generate secure secrets

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate encryption key (32 characters)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## Database Setup

### 1. Create database and user

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE tracker_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'tracker_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON tracker_prod.* TO 'tracker_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 2. Run migrations

```bash
cd /var/www/tracker/backend
npx prisma migrate deploy
```

### 3. Seed database (optional)

```bash
npx prisma db seed
```

---

## Build Application

### 1. Install dependencies

```bash
npm ci --production=false
```

### 2. Generate Prisma client

```bash
npx prisma generate
```

### 3. Build TypeScript

```bash
npm run build
```

### 4. Verify build

```bash
ls -la dist/
# Should see compiled JavaScript files
```

---

## PM2 Configuration

### 1. Test the application

```bash
node dist/index.js
# Should start without errors, press Ctrl+C to stop
```

### 2. Start with PM2

```bash
pm2 start ecosystem.config.js --env production
```

### 3. Save PM2 configuration

```bash
pm2 save
pm2 startup
# Follow the instructions output by the command
```

### 4. Verify PM2 is running

```bash
pm2 status
pm2 logs tracker-api --lines 50
```

---

## Nginx Configuration

### 1. Copy Nginx configuration

```bash
sudo cp nginx.conf /etc/nginx/sites-available/tracker-api
```

### 2. Update domain name (Already set to tracker.mutindo.com)

```bash
# Verify domain name in configuration
sudo nano /etc/nginx/sites-available/tracker-api
# Should show 'tracker.mutindo.com'
```

### 3. Enable site

```bash
sudo ln -s /etc/nginx/sites-available/tracker-api /etc/nginx/sites-enabled/
```

### 4. Test Nginx configuration

```bash
sudo nginx -t
```

### 5. Reload Nginx

```bash
sudo systemctl reload nginx
```

---

## SSL Certificate

### 1. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtain SSL certificate

```bash
sudo certbot --nginx -d tracker.mutindo.com
```

### 3. Test auto-renewal

```bash
sudo certbot renew --dry-run
```

### 4. Update Nginx configuration

The certbot should have automatically updated your Nginx config. Verify:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## Deployment

### 1. Make deploy script executable

```bash
chmod +x deploy.sh
```

### 2. Run deployment script

```bash
./deploy.sh production
```

### 3. Verify deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs tracker-api --lines 50

# Test API
curl https://tracker.mutindo.com/health
```

---

## Monitoring

### 1. Monitor with PM2

```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs tracker-api

# View specific log file
pm2 logs tracker-api --err  # Error logs only
pm2 logs tracker-api --out  # Output logs only
```

### 2. Set up PM2 Plus (Optional)

```bash
pm2 link <secret> <public>
# Get keys from: https://app.pm2.io
```

### 3. Check Nginx logs

```bash
sudo tail -f /var/log/nginx/tracker-api-access.log
sudo tail -f /var/log/nginx/tracker-api-error.log
```

### 4. Monitor system resources

```bash
htop
df -h  # Disk usage
free -m  # Memory usage
```

---

## Troubleshooting

### Application won't start

```bash
# Check logs
pm2 logs tracker-api --lines 100

# Check environment variables
pm2 show tracker-api | grep env

# Restart application
pm2 restart tracker-api
```

### Database connection issues

```bash
# Test database connection
mysql -u tracker_user -p tracker_prod

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Run migrations again
npx prisma migrate deploy
```

### Nginx 502 Bad Gateway

```bash
# Check if PM2 is running
pm2 status

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Test upstream connection
curl http://localhost:83/health

# Restart services
pm2 restart tracker-api
sudo systemctl restart nginx
```

### High memory usage

```bash
# Check memory usage
pm2 show tracker-api

# Restart with lower instances
pm2 delete tracker-api
pm2 start ecosystem.config.js --env production -i 2
```

### SSL certificate issues

```bash
# Renew certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal
```

---

## Useful Commands

```bash
# PM2 Commands
pm2 start ecosystem.config.js --env production
pm2 stop tracker-api
pm2 restart tracker-api
pm2 reload tracker-api  # Zero-downtime reload
pm2 delete tracker-api
pm2 logs tracker-api
pm2 monit
pm2 save
pm2 resurrect

# Nginx Commands
sudo nginx -t  # Test configuration
sudo systemctl reload nginx
sudo systemctl restart nginx
sudo systemctl status nginx

# Database Commands
npx prisma migrate deploy
npx prisma generate
npx prisma studio  # Open Prisma Studio

# Git Commands
git pull origin main
git status
git log --oneline -5
```

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (64+ characters)
- [ ] Enable firewall (UFW)
- [ ] Install fail2ban for SSH protection
- [ ] Regular system updates
- [ ] Regular backup of database
- [ ] Monitor logs for suspicious activity
- [ ] Use HTTPS only (force SSL)
- [ ] Implement rate limiting
- [ ] Keep Node.js and dependencies updated
- [ ] Use environment variables for secrets
- [ ] Restrict database user permissions
- [ ] Set up monitoring and alerts

---

## Maintenance

### Daily

- Check PM2 status and logs
- Monitor API response times

### Weekly

- Review error logs
- Check disk space
- Update dependencies

### Monthly

- Full backup of database and code
- Security updates
- Review and rotate logs
- Check SSL certificate expiry

---

## Support

For issues or questions:
- Check logs: `pm2 logs tracker-api`
- Review this guide
- Contact your development team


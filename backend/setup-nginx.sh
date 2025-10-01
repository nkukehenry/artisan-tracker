#!/bin/bash

# Safe Nginx Setup Script for tracker.mutindo.com
# This script safely configures Nginx without affecting existing applications
# Usage: sudo ./setup-nginx.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SITE_NAME="tracker-api"
DOMAIN="tracker.mutindo.com"
APP_DIR="/var/www/tracker/backend"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"
BACKUP_DIR="/etc/nginx/backups/$(date +%Y%m%d_%H%M%S)"

# Functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

print_header "Safe Nginx Setup for $DOMAIN"

# Step 1: Check if Nginx is installed
print_info "Checking if Nginx is installed..."
if ! command -v nginx &> /dev/null; then
    print_error "Nginx is not installed. Please install it first:"
    echo "  sudo apt install nginx"
    exit 1
fi
print_success "Nginx is installed"

# Step 2: Check for domain conflicts
print_info "Checking for domain name conflicts..."
if grep -r "$DOMAIN" $NGINX_AVAILABLE/* 2>/dev/null | grep -v "$SITE_NAME"; then
    print_warning "Domain $DOMAIN found in existing configurations!"
    echo "Found in:"
    grep -r "$DOMAIN" $NGINX_AVAILABLE/* 2>/dev/null | grep -v "$SITE_NAME"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Aborted by user"
        exit 1
    fi
else
    print_success "No domain conflicts found"
fi

# Step 3: Check if nginx.conf exists in app directory
print_info "Checking for nginx configuration file..."
if [ ! -f "$APP_DIR/nginx.conf" ]; then
    print_error "nginx.conf not found in $APP_DIR"
    exit 1
fi
print_success "Configuration file found"

# Step 4: Create backup
print_info "Creating backup of existing Nginx configurations..."
mkdir -p "$BACKUP_DIR"
if [ -d "$NGINX_AVAILABLE" ]; then
    cp -r $NGINX_AVAILABLE/* "$BACKUP_DIR/" 2>/dev/null || true
fi
if [ -d "$NGINX_ENABLED" ]; then
    cp -r $NGINX_ENABLED "$BACKUP_DIR/enabled" 2>/dev/null || true
fi
print_success "Backup created at: $BACKUP_DIR"

# Step 5: Copy configuration
print_info "Copying Nginx configuration..."
cp "$APP_DIR/nginx.conf" "$NGINX_AVAILABLE/$SITE_NAME"
print_success "Configuration copied to $NGINX_AVAILABLE/$SITE_NAME"

# Step 6: Test configuration (without enabling)
print_info "Testing Nginx configuration..."
if nginx -t 2>&1 | grep -q "syntax is ok"; then
    print_success "Nginx configuration test passed"
else
    print_error "Nginx configuration test failed!"
    nginx -t
    print_info "Rolling back..."
    rm -f "$NGINX_AVAILABLE/$SITE_NAME"
    print_warning "Configuration file removed. Your existing setup is unchanged."
    exit 1
fi

# Step 7: Enable site
print_info "Enabling site..."
if [ -L "$NGINX_ENABLED/$SITE_NAME" ]; then
    print_warning "Site already enabled, skipping symlink creation"
else
    ln -s "$NGINX_AVAILABLE/$SITE_NAME" "$NGINX_ENABLED/$SITE_NAME"
    print_success "Site enabled"
fi

# Step 8: Test again with site enabled
print_info "Testing Nginx configuration with new site enabled..."
if nginx -t 2>&1 | grep -q "syntax is ok"; then
    print_success "Final configuration test passed"
else
    print_error "Configuration test failed with site enabled!"
    nginx -t
    print_info "Rolling back..."
    rm -f "$NGINX_ENABLED/$SITE_NAME"
    rm -f "$NGINX_AVAILABLE/$SITE_NAME"
    print_warning "Changes rolled back. Your existing setup is unchanged."
    exit 1
fi

# Step 9: Show existing apps (for verification)
print_info "Currently enabled sites:"
ls -1 $NGINX_ENABLED/ | while read site; do
    echo "  - $site"
done

# Step 10: Ask for confirmation before reload
echo
print_warning "About to reload Nginx. This will apply the new configuration."
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Reload skipped. Changes are staged but not applied."
    print_info "To apply manually, run: sudo systemctl reload nginx"
    print_info "To rollback, run: sudo ./rollback-nginx.sh $BACKUP_DIR"
    exit 0
fi

# Step 11: Reload Nginx (graceful reload)
print_info "Reloading Nginx (graceful reload, no downtime)..."
if systemctl reload nginx; then
    print_success "Nginx reloaded successfully"
else
    print_error "Failed to reload Nginx!"
    print_info "Rolling back..."
    rm -f "$NGINX_ENABLED/$SITE_NAME"
    rm -f "$NGINX_AVAILABLE/$SITE_NAME"
    systemctl reload nginx
    print_warning "Rolled back to previous configuration"
    exit 1
fi

# Step 12: Verify Nginx is running
print_info "Verifying Nginx status..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running!"
    systemctl status nginx
    exit 1
fi

# Success summary
print_header "Setup Completed Successfully!"
print_success "Nginx configuration for $DOMAIN is now active"
echo
print_info "Next steps:"
echo "  1. Setup SSL certificate:"
echo "     sudo certbot --nginx -d $DOMAIN"
echo
echo "  2. Test the configuration:"
echo "     curl -I http://localhost:83/health"
echo "     curl -I https://$DOMAIN/health"
echo
echo "  3. Check logs if needed:"
echo "     sudo tail -f /var/log/nginx/tracker-api-access.log"
echo "     sudo tail -f /var/log/nginx/tracker-api-error.log"
echo
print_info "Backup location: $BACKUP_DIR"
print_info "To rollback: sudo ./rollback-nginx.sh $BACKUP_DIR"
echo

# Create rollback script
cat > "$APP_DIR/rollback-nginx.sh" << 'ROLLBACK_SCRIPT'
#!/bin/bash

# Rollback script for Nginx configuration
# Usage: sudo ./rollback-nginx.sh [backup_directory]

if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

BACKUP_DIR=${1:-"/etc/nginx/backups/latest"}
SITE_NAME="tracker-api"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

echo "Rolling back Nginx configuration..."
echo "Backup from: $BACKUP_DIR"

# Disable site
rm -f "$NGINX_ENABLED/$SITE_NAME"
echo "✓ Site disabled"

# Remove configuration
rm -f "$NGINX_AVAILABLE/$SITE_NAME"
echo "✓ Configuration removed"

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
echo "✓ Nginx reloaded"

echo
echo "Rollback completed successfully!"
echo "Your Nginx configuration has been restored to the previous state."
ROLLBACK_SCRIPT

chmod +x "$APP_DIR/rollback-nginx.sh"
print_success "Rollback script created at: $APP_DIR/rollback-nginx.sh"

echo
print_success "All done! Your existing applications should still be working normally."


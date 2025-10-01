#!/bin/bash

# Rollback script for Nginx configuration
# Usage: sudo ./rollback-nginx.sh [backup_directory]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

BACKUP_DIR=${1:-""}
SITE_NAME="tracker-api"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_ENABLED="/etc/nginx/sites-enabled"

echo
print_warning "Nginx Rollback for tracker.mutindo.com"
echo

if [ -z "$BACKUP_DIR" ]; then
    # List available backups
    print_info "Available backups:"
    if [ -d "/etc/nginx/backups" ]; then
        ls -1t /etc/nginx/backups/ | head -5 | nl
        echo
        read -p "Enter backup number to restore (or press Enter for latest): " backup_num
        if [ -z "$backup_num" ]; then
            BACKUP_DIR="/etc/nginx/backups/$(ls -1t /etc/nginx/backups/ | head -1)"
        else
            BACKUP_DIR="/etc/nginx/backups/$(ls -1t /etc/nginx/backups/ | sed -n "${backup_num}p")"
        fi
    else
        print_error "No backup directory found at /etc/nginx/backups"
        exit 1
    fi
fi

if [ ! -d "$BACKUP_DIR" ]; then
    print_error "Backup directory not found: $BACKUP_DIR"
    exit 1
fi

print_info "Using backup from: $BACKUP_DIR"
echo

# Confirm rollback
print_warning "This will remove the tracker-api Nginx configuration"
read -p "Continue with rollback? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Rollback cancelled"
    exit 0
fi

# Disable site
print_info "Disabling tracker-api site..."
if [ -L "$NGINX_ENABLED/$SITE_NAME" ]; then
    rm -f "$NGINX_ENABLED/$SITE_NAME"
    print_success "Site disabled"
else
    print_warning "Site was not enabled"
fi

# Remove configuration
print_info "Removing tracker-api configuration..."
if [ -f "$NGINX_AVAILABLE/$SITE_NAME" ]; then
    rm -f "$NGINX_AVAILABLE/$SITE_NAME"
    print_success "Configuration removed"
else
    print_warning "Configuration file not found"
fi

# Test configuration
print_info "Testing Nginx configuration..."
if nginx -t 2>&1 | grep -q "syntax is ok"; then
    print_success "Configuration test passed"
else
    print_error "Configuration test failed!"
    nginx -t
    exit 1
fi

# Reload Nginx
print_info "Reloading Nginx..."
if systemctl reload nginx; then
    print_success "Nginx reloaded successfully"
else
    print_error "Failed to reload Nginx"
    exit 1
fi

# Verify Nginx is running
print_info "Verifying Nginx status..."
if systemctl is-active --quiet nginx; then
    print_success "Nginx is running"
else
    print_error "Nginx is not running!"
    exit 1
fi

echo
print_success "Rollback completed successfully!"
echo
print_info "The tracker-api Nginx configuration has been removed."
print_info "Your other applications should continue working normally."
echo
print_info "To re-apply the tracker-api configuration, run:"
echo "  sudo ./setup-nginx.sh"
echo


#!/bin/bash

# WebSocket Diagnostic Script for Ubuntu Server
# Run this script on your Ubuntu server to diagnose WebSocket issues

echo "=== WebSocket Diagnostic Script ==="
echo "Date: $(date)"
echo ""

# 1. Check if nginx is running
echo "1. Checking nginx status..."
sudo systemctl status nginx --no-pager -l
echo ""

# 2. Test nginx configuration
echo "2. Testing nginx configuration..."
sudo nginx -t
echo ""

# 3. Check if port 83 is listening
echo "3. Checking if port 83 is listening..."
sudo netstat -tlnp | grep :83
echo ""

# 4. Check if PM2 is running the app
echo "4. Checking PM2 status..."
pm2 status
echo ""

# 5. Check firewall status
echo "5. Checking firewall status..."
sudo ufw status
echo ""

# 6. Check nginx error logs (last 20 lines)
echo "6. Recent nginx error logs..."
sudo tail -20 /var/log/nginx/tracker-api-error.log
echo ""

# 7. Check nginx access logs (last 10 lines)
echo "7. Recent nginx access logs..."
sudo tail -10 /var/log/nginx/tracker-api-access.log
echo ""

# 8. Check application logs
echo "8. Recent application logs..."
pm2 logs tracker-api --lines 10
echo ""

# 9. Test local WebSocket connection
echo "9. Testing local WebSocket connection..."
if command -v wscat &> /dev/null; then
    echo "Testing ws://localhost:83/signaling..."
    timeout 5 wscat -c ws://localhost:83/signaling || echo "Local WebSocket connection failed"
else
    echo "wscat not installed. Install with: npm install -g wscat"
fi
echo ""

# 10. Check if WebSocket headers are being set
echo "10. Testing HTTP headers..."
curl -I -H "Connection: Upgrade" -H "Upgrade: websocket" -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" http://localhost/signaling
echo ""

echo "=== Diagnostic Complete ==="
echo ""
echo "Common fixes:"
echo "1. If nginx config test fails: Fix syntax errors in /etc/nginx/sites-available/tracker-api"
echo "2. If port 83 not listening: Check if PM2 is running the app"
echo "3. If firewall blocking: Run 'sudo ufw allow 80' and 'sudo ufw allow 443'"
echo "4. If WebSocket upgrade fails: Check nginx proxy headers"
echo "5. If connection refused: Check if app is running on port 83"

#!/bin/bash

# ==============================================================================
# OCI Server Setup Script for easynaukri.online & api.easynaukri.online
# (Nginx Reverse Proxy & Let's Encrypt SSL)
# ==============================================================================

if [ "$EUID" -ne 0 ]; then
  echo "[-] Please run this script with sudo or as root."
  exit 1
fi

echo "[+] Starting Nginx & Let's Encrypt SSL setup for easynaukri.online..."

# 1. Install Nginx and Certbot
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx

# 2. Configure Nginx Reverse Proxy
NGINX_CONF="/etc/nginx/sites-available/easynaukri.online"

echo "[+] Creating Nginx site configuration at ${NGINX_CONF}..."
cat << 'EOF' > "$NGINX_CONF"
# Frontend Web App: easynaukri.online & www.easynaukri.online
server {
    listen 80;
    server_name easynaukri.online www.easynaukri.online;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend API: api.easynaukri.online
server {
    listen 80;
    server_name api.easynaukri.online;

    location / {
        proxy_pass http://127.0.0.1:8060;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable configuration
echo "[+] Enabling Nginx site configuration..."
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/api.easynaukri.online

# Test configuration and reload Nginx
if nginx -t; then
  echo "[+] Nginx configuration syntax valid. Reloading Nginx..."
  systemctl restart nginx
else
  echo "[-] Error: Invalid Nginx configuration. Aborting."
  exit 1
fi

# 3. Obtain Let's Encrypt SSL Certificate for all 3 domain endpoints
echo "[+] Requesting SSL certificate from Let's Encrypt..."
certbot --nginx -d easynaukri.online -d www.easynaukri.online -d api.easynaukri.online --non-interactive --agree-tos --email doctwo561@gmail.com --redirect --expand

# 4. Update Backend .env file on Server & Restart Containers
ENV_FILE="/home/ubuntu/auto-apply-pro/.env"

if [ -f "$ENV_FILE" ]; then
  echo "[+] Updating CORS and Frontend URL settings in OCI .env file..."
  
  cp "$ENV_FILE" "${ENV_FILE}.bak"
  
  sed -i -E 's|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://easynaukri.online,https://www.easynaukri.online|' "$ENV_FILE"
  sed -i -E 's|FRONTEND_URL=.*|FRONTEND_URL=https://easynaukri.online|' "$ENV_FILE"
  sed -i -E 's|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=https://api.easynaukri.online/api/v1/outreach/oauth2/callback|' "$ENV_FILE"
  sed -i -E 's|GITHUB_REDIRECT_URI=.*|GITHUB_REDIRECT_URI=https://api.easynaukri.online/api/v1/auth/callback/github|' "$ENV_FILE"
  sed -i -E 's|LINKEDIN_REDIRECT_URI=.*|LINKEDIN_REDIRECT_URI=https://api.easynaukri.online/api/v1/auth/callback/linkedin|' "$ENV_FILE"
fi

echo "[+] Restarting Docker containers..."
cd /home/ubuntu/auto-apply-pro
docker compose -f docker-compose.prod.yml down || docker compose down || true
docker compose -f docker-compose.prod.yml up -d || docker compose up -d

echo "=============================================================================="
echo "[+] Nginx configuration & SSL certification successfully completed!"
echo "[+] Web App: https://easynaukri.online"
echo "[+] Secure API: https://api.easynaukri.online"
echo "=============================================================================="

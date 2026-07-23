#!/bin/bash

# ==============================================================================
# OCI Server Nginx Reverse Proxy & SSL (Certbot) Configuration Script
# Target Domain: easynaukri.duckdns.org
# ==============================================================================

# Ensure script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "[-] Please run this script with sudo or as root."
  exit 1
fi

echo "[+] Starting Nginx & Let's Encrypt SSL setup..."

# ------------------------------------------------------------------------------
# 1. Install Nginx and Certbot
# ------------------------------------------------------------------------------
echo "[+] Updating apt repositories..."
apt-get update -y

echo "[+] Installing Nginx, Certbot, and Nginx Certbot plugin..."
apt-get install -y nginx certbot python3-certbot-nginx

# ------------------------------------------------------------------------------
# 2. Configure Nginx Reverse Proxy
# ------------------------------------------------------------------------------
NGINX_CONF="/etc/nginx/sites-available/easynaukri.duckdns.org"

echo "[+] Creating Nginx site configuration at ${NGINX_CONF}..."
cat << 'EOF' > "$NGINX_CONF"
server {
    listen 80;
    server_name easynaukri.duckdns.org;

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

# Enable configuration and disable default page
echo "[+] Enabling Nginx site configuration..."
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test configuration and reload Nginx
echo "[+] Testing Nginx configuration syntax..."
if nginx -t; then
  echo "[+] Nginx configuration syntax valid. Reloading Nginx..."
  systemctl restart nginx
else
  echo "[-] Error: Invalid Nginx configuration. Aborting."
  exit 1
fi

# ------------------------------------------------------------------------------
# 3. Obtain Let's Encrypt SSL Certificate
# ------------------------------------------------------------------------------
echo "[+] Requesting SSL certificate from Let's Encrypt for easynaukri.duckdns.org..."
# Run Certbot to fetch and install the certificate automatically
certbot --nginx -d easynaukri.duckdns.org --non-interactive --agree-tos --email doctwo561@gmail.com --redirect

# ------------------------------------------------------------------------------
# 4. Update Backend CORS and Domain Settings in .env
# ------------------------------------------------------------------------------
ENV_FILE="/home/ubuntu/auto-apply-pro/.env"

if [ -f "$ENV_FILE" ]; then
  echo "[+] Updating CORS and Frontend URL settings in OCI .env file..."
  
  # Backup .env
  cp "$ENV_FILE" "${ENV_FILE}.bak"
  
  # Replace CORS_ALLOWED_ORIGINS
  sed -i -E 's|CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=https://easynaukri-2a392.web.app,https://easynaukri-2a392.firebaseapp.com|' "$ENV_FILE"
  
  # Replace FRONTEND_URL
  sed -i -E 's|FRONTEND_URL=.*|FRONTEND_URL=https://easynaukri-2a392.web.app|' "$ENV_FILE"

  # Replace or add GOOGLE_REDIRECT_URI
  if grep -q "GOOGLE_REDIRECT_URI=" "$ENV_FILE"; then
    sed -i -E 's|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=https://easynaukri.duckdns.org/api/v1/outreach/oauth2/callback|' "$ENV_FILE"
  else
    echo "GOOGLE_REDIRECT_URI=https://easynaukri.duckdns.org/api/v1/outreach/oauth2/callback" >> "$ENV_FILE"
  fi
  
  echo "[+] .env updated. Restarting the backend Docker container to apply changes..."
  cd /home/ubuntu/auto-apply-pro
  docker compose down backend
  docker compose up -d backend
else
  echo "[-] Warning: .env file not found at ${ENV_FILE}. CORS was not updated automatically."
fi

echo "=============================================================================="
echo "[+] Nginx configuration & SSL certification successfully completed!"
echo "[+] Your secure API is available at: https://easynaukri.duckdns.org"
echo "=============================================================================="

#!/bin/bash

# ==============================================================================
# OCI Server Security Hardening Script
# Targets: UFW Rules, SSH Key Enforcement, and Fail2ban Setup
# ==============================================================================

# Ensure script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "[-] Please run this script with sudo or as root."
  exit 1
fi

echo "[+] Starting server security hardening..."

# Detect Package Manager
if command -v apt-get >/dev/null; then
  PKG_MANAGER="apt"
  UPDATE_CMD="apt-get update -y"
  INSTALL_CMD="apt-get install -y"
elif command -v dnf >/dev/null; then
  PKG_MANAGER="dnf"
  UPDATE_CMD="dnf check-update -y"
  INSTALL_CMD="dnf install -y"
elif command -v yum >/dev/null; then
  PKG_MANAGER="yum"
  UPDATE_CMD="yum check-update -y"
  INSTALL_CMD="yum install -y"
else
  echo "[-] Error: Unsupported package manager. Manual setup required."
  exit 1
fi

echo "[+] Package manager detected: ${PKG_MANAGER}"

# ------------------------------------------------------------------------------
# 1. Install UFW and Fail2ban if not present
# ------------------------------------------------------------------------------
echo "[+] Checking/Installing required packages..."
$UPDATE_CMD

if ! command -v ufw >/dev/null; then
  echo "[+] Installing UFW..."
  $INSTALL_CMD ufw
fi

if ! command -v fail2ban-client >/dev/null; then
  echo "[+] Installing Fail2ban..."
  # On RHEL/Oracle Linux, fail2ban might require EPEL repository
  if [ "$PKG_MANAGER" = "dnf" ] || [ "$PKG_MANAGER" = "yum" ]; then
    $INSTALL_CMD epel-release
  fi
  $INSTALL_CMD fail2ban
fi

# ------------------------------------------------------------------------------
# 2. UFW Firewall Configuration
# ------------------------------------------------------------------------------
echo "[+] Configuring UFW rules..."
# Reset UFW rules to default
ufw --force reset

# Set defaults
ufw default deny incoming
ufw default allow outgoing

# Allow standard ports
ufw allow 22/tcp comment 'SSH Port'
ufw allow 80/tcp comment 'HTTP Web Traffic'
ufw allow 443/tcp comment 'HTTPS Web Traffic'

# Exclude backend and DB from public ingress (Docker binds them locally or internally)
# If you ever need to access custom ports directly, uncomment the line below:
# ufw allow 8060/tcp comment 'Backend Access'

# Enable UFW
echo "[+] Enabling UFW..."
ufw --force enable
ufw status verbose

# ------------------------------------------------------------------------------
# 3. SSH Configuration Hardening
# ------------------------------------------------------------------------------
echo "[+] Hardening SSH daemon configuration..."
SSHD_CONFIG="/etc/ssh/sshd_config"
SSHD_BACKUP="/etc/ssh/sshd_config.bak.$(date +%F_%T)"

# Backup existing config
cp "$SSHD_CONFIG" "$SSHD_BACKUP"
echo "[+] Backup of sshd_config created at ${SSHD_BACKUP}"

# Ensure configurations are correctly set in sshd_config
update_sshd_config() {
  local key=$1
  local value=$2
  # Remove key if already exists (handling commented instances too)
  sed -i -E "s/^[#[:space:]]*($key)[[:space:]]+.*/\1 $value/" "$SSHD_CONFIG"
  # If not present in file, append it
  if ! grep -q "^$key[[:space:]]" "$SSHD_CONFIG"; then
    echo "$key $value" >> "$SSHD_CONFIG"
  fi
}

update_sshd_config "PasswordAuthentication" "no"
update_sshd_config "PubkeyAuthentication" "yes"
update_sshd_config "PermitRootLogin" "prohibit-password"
update_sshd_config "MaxAuthTries" "4"
update_sshd_config "X11Forwarding" "no"

# Validate SSH Configuration syntax before restarting
if sshd -t; then
  echo "[+] SSH configuration valid. Restarting SSH daemon..."
  if systemctl is-active sshd >/dev/null 2>&1; then
    systemctl restart sshd
  elif systemctl is-active ssh >/dev/null 2>&1; then
    systemctl restart ssh
  else
    echo "[-] Warning: Could not locate active ssh/sshd service to restart. Please restart it manually."
  fi
else
  echo "[-] Error: Invalid SSH config detected. Rolling back from backup."
  cp "$SSHD_BACKUP" "$SSHD_CONFIG"
  exit 1
fi

# ------------------------------------------------------------------------------
# 4. Fail2ban Setup
# ------------------------------------------------------------------------------
echo "[+] Configuring Fail2ban SSH jail..."
JAIL_LOCAL="/etc/fail2ban/jail.local"

# Create/overwrite jail.local configuration
cat <<EOF > "$JAIL_LOCAL"
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s
backend = %(sshd_backend)s
EOF

echo "[+] Enabling and starting Fail2ban service..."
systemctl daemon-reload
systemctl enable fail2ban
systemctl restart fail2ban

echo "[+] Fail2ban configuration complete. Status:"
fail2ban-client status

echo "=============================================================================="
echo "[+] Infrastructure Hardening Configuration successfully completed!"
echo "[!] IMPORTANT: Ensure you have uploaded your SSH Public Key to the OCI user's"
echo "    authorized_keys before logging out. Password login is now disabled."
echo "=============================================================================="

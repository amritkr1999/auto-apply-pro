# OCI Compute Instance Production Deployment Guide

This guide provides the checklist and instructions to configure your Oracle Cloud Infrastructure (OCI) server, set up environment secrets, and authorize the GitHub Actions CI/CD deployment pipeline.

---

## 1. OCI Compute Instance Configuration

When launching your OCI Compute instance (Ubuntu or Oracle Linux), ensure the following are configured:

### A. SSH Public Key Association
- Under **Add SSH keys**, choose **Upload public key (.pub)** or **Paste public keys**.
- Paste your public SSH key (e.g., `id_rsa.pub` or `ed25519.pub`). Keep the matching private key secure; it will be added to GitHub Secrets.

### B. OCI VCN Ingress Rules (Security Lists)
By default, OCI blocks all ports except Port 22. To allow web traffic, you must add Ingress Rules to the **Default Security List** of your Virtual Cloud Network (VCN):

1. In the OCI Console, go to **Compute** > **Instances** > click your instance.
2. Under **Instance details**, click on your **Virtual cloud network** link.
3. Click on **Security Lists** in the left menu, then click your active security list.
4. Click **Add Ingress Rules** and add the following rules:

| Source CIDR | IP Protocol | Source Port Range | Destination Port Range | Description |
| :--- | :--- | :--- | :--- | :--- |
| `0.0.0.0/0` | TCP | All | `80` | Allow HTTP Web Traffic |
| `0.0.0.0/0` | TCP | All | `443` | Allow HTTPS Secure Traffic |
| `0.0.0.0/0` | TCP | All | `22` | Allow SSH Admin Access (Already exists by default) |

> [!WARNING]
> Do NOT open Ports `8060` (Backend) or `5432` (PostgreSQL) in the OCI Security List. These ports are bound locally or routed through the internal Docker bridge network, protecting them from direct public access.

---

## 2. Server Initialization & Security Hardening

Connect to your OCI instance via SSH:
```bash
ssh -i /path/to/private_key ubuntu@<OCI_PUBLIC_IP>      # For Ubuntu Images
# OR
ssh -i /path/to/private_key opc@<OCI_PUBLIC_IP>         # For Oracle Linux Images
```

Once connected, run the following setup steps:

### A. Install Docker & Docker Compose
```bash
# Update packages
sudo apt-get update -y && sudo apt-get upgrade -y      # Ubuntu
# OR
sudo dnf update -y                                    # Oracle Linux

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group (avoids using sudo for docker commands)
sudo usermod -aG docker $USER
# Apply group changes
newgrp docker
```

### B. Deploy Files and Run Hardening Script
1. Create the project directory:
   ```bash
   mkdir -p ~/auto-apply-pro
   cd ~/auto-apply-pro
   ```
2. Upload the `docker-compose.yml` and `scripts/setup-security.sh` from your local machine to `~/auto-apply-pro/` on the server using `scp` or `sftp`.
3. Make the security script executable and run it:
   ```bash
   chmod +x setup-security.sh
   sudo ./setup-security.sh
   ```
   *This script disables password authentication, configures UFW rules, and sets up Fail2ban.*

---

## 3. Server Environment Secrets Configuration

Create a `.env` file inside `~/auto-apply-pro/` on the OCI server:
```bash
nano ~/auto-apply-pro/.env
```

Paste the following template and fill in your production values:

```env
# --- Database Configuration ---
DB_NAME=autoapplypro
DB_USER=amrit
# Change to a strong random password in production!
DB_PASSWORD=production_secure_db_password

# --- JWT Configuration ---
# Generate a random 64-character hex string
JWT_SECRET=your_jwt_signing_secret_here
JWT_EXPIRATION_MS=86400000

# --- Google OAuth Configuration ---
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# --- GitHub OAuth Configuration ---
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# --- LinkedIn OAuth Configuration ---
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# --- Zoho Mail SMTP Configuration ---
# Main auth login: tech@easynaukri.online (App Password generated under tech@)
# Outbound sender header: notifications@easynaukri.online
SMTP_HOST=smtppro.zoho.in
SMTP_PORT=587
SMTP_USERNAME=tech@easynaukri.online
SMTP_PASSWORD=your-zoho-16-char-app-password

NOTIFICATIONS_EMAIL=notifications@easynaukri.online
SUPPORT_EMAIL=support@easynaukri.online
CARE_EMAIL=care@easynaukri.online
INVOICES_EMAIL=invoices@easynaukri.online
TECH_EMAIL=tech@easynaukri.online
ADMIN_EMAIL=amrit@easynaukri.online

# --- Razorpay Configuration ---
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=live_secret_...
RAZORPAY_WEBHOOK_SECRET=webhook_secret_...

# --- AI & LLM Service Configuration ---
GEMINI_API_KEY=your_gemini_api_key_here
USE_LOCAL_MODEL=false

# --- CORS & URLs Configuration ---
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

## 4. GitHub Repository Secrets Setup

To allow the GitHub Actions pipeline to authenticate and run the deploy commands on your OCI server, navigate to your GitHub Repository:
1. Go to **Settings** > **Secrets and variables** > **Actions**.
2. Click **New repository secret** and add the following:

| Secret Name | Value | Description |
| :--- | :--- | :--- |
| `OCI_HOST` | `<OCI_PUBLIC_IP>` | The public IP address of your OCI VM instance. |
| `OCI_USERNAME` | `ubuntu` or `opc` | The SSH login user (default is `ubuntu` on Ubuntu or `opc` on Oracle Linux). |
| `OCI_PRIVATE_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | The contents of your private SSH key (matching the public key uploaded to OCI). |
| `OCI_PORT` | `22` | (Optional) Defaults to 22 if not specified. |

---

## 5. Verification Commands

After the GitHub Actions workflow successfully finishes running:
- Check container logs on the OCI server:
  ```bash
  docker compose logs -f backend
  ```
- List running containers:
  ```bash
  docker compose ps
  ```
- Test backend response:
  ```bash
  curl http://localhost:8060/actuator/health   # If Actuator is configured
  # OR
  curl http://localhost:8060/v3/api-docs
  ```

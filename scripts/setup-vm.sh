#!/bin/bash
# ─── Hetzner Cloud VM Setup Script ───
# Run this on a fresh Ubuntu 22.04+ VPS (tested on Hetzner CX33 / CAX21)
# Prerequisites: SSH access to the VM
#
# Usage:
#   1. SSH into your VM: ssh root@<vm-ip>
#   2. Clone the repo: git clone <repo-url> wovo && cd wovo
#   3. Run this script: bash scripts/setup-vm.sh

set -euo pipefail

echo "══════════════════════════════════════════════"
echo "  WOVO Demo — Hetzner VM Setup"
echo "══════════════════════════════════════════════"

# ── 1. Install Docker ──
if ! command -v docker &>/dev/null; then
  echo "→ Installing Docker..."
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  sudo usermod -aG docker "$USER"
  echo "✓ Docker installed. You may need to log out and back in for group changes."
else
  echo "✓ Docker already installed"
fi

# ── 2. Install Bun (for seed scripts) ──
if ! command -v bun &>/dev/null; then
  echo "→ Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  echo "✓ Bun installed"
else
  echo "✓ Bun already installed"
fi

# ── 3. Create .env.production from example ──
if [ ! -f .env.production ]; then
  echo "→ Creating .env.production from example..."
  cp .env.production.example .env.production
  echo ""
  echo "⚠  IMPORTANT: Edit .env.production with your API keys:"
  echo "   nano .env.production"
  echo ""
  echo "   Required: GROQ_API_KEY and/or CEREBRAS_API_KEY"
  echo "   Get free keys at:"
  echo "     - https://console.groq.com"
  echo "     - https://cloud.cerebras.ai"
  echo ""
else
  echo "✓ .env.production already exists"
fi

# ── 4. Install Cloudflare Tunnel ──
if ! command -v cloudflared &>/dev/null; then
  echo "→ Installing cloudflared..."
  ARCH=$(dpkg --print-architecture)
  curl -L "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb" -o /tmp/cloudflared.deb
  sudo dpkg -i /tmp/cloudflared.deb
  rm /tmp/cloudflared.deb
  echo "✓ cloudflared installed"
else
  echo "✓ cloudflared already installed"
fi

# ── 5. Firewall (ufw) ──
if command -v ufw &>/dev/null; then
  echo "→ Configuring firewall..."
  sudo ufw allow OpenSSH
  sudo ufw allow 3030/tcp
  sudo ufw --force enable
  echo "✓ Firewall configured (SSH + port 3030)"
else
  echo "⚠  ufw not found — install with: sudo apt-get install -y ufw"
fi

echo ""
echo "══════════════════════════════════════════════"
echo "  Setup complete! Next steps:"
echo "══════════════════════════════════════════════"
echo ""
echo "  1. Edit API keys:    nano .env.production"
echo "  2. Start everything: docker compose -f docker-compose.prod.yml up -d --build"
echo "  3. Wait for DBs:     docker compose -f docker-compose.prod.yml logs -f"
echo "  4. Seed ML data:     bash scripts/seed-on-vm.sh"
echo "  5. Quick tunnel:     cloudflared tunnel --url http://localhost:3030"
echo ""
echo "  For a permanent tunnel with your domain:"
echo "    cloudflared tunnel login"
echo "    cloudflared tunnel create wovo-demo"
echo "    cloudflared tunnel route dns wovo-demo demo.vishalk.com"
echo "    cloudflared tunnel run wovo-demo"
echo ""

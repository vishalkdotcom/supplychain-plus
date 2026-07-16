# SupplyChain+ — Hetzner Cloud Deployment Guide

Deploy the full SupplyChain+ stack on a Hetzner Cloud VPS with Cloudflare Tunnel for public HTTPS.

---

## What You Get

- Full SupplyChain+ app running at `https://demo.vishalk.com` (or any subdomain)
- All 5 modules: Dashboard, Connect, Engage, Educate, Operations
- Live AI chat (Groq/Cerebras free tiers)
- Pre-computed ML analytics (risk scores, clusters, forecasts, etc.)
- All 3 databases running in Docker (PostgreSQL, SQL Server, MySQL)

## Architecture

```
Hetzner Cloud VPS (4 vCPU, 8GB RAM, 80GB SSD)     ~€6-8/mo
├── Docker Compose (with memory limits)
│   ├── PostgreSQL 16 + pgvector    [2 GB]  (analytics + AI data)
│   ├── SQL Server 2022             [2.5 GB] (cases + suppliers)
│   ├── MySQL 8.0                   [1 GB]  (training/Moodle data)
│   └── Next.js App (Bun runtime)   [1.5 GB] (port 3030)
└── Cloudflare Tunnel                               FREE
    └── https://demo.vishalk.com → localhost:3030
```

### Server Options

| | CX33 (x86) | CAX21 (ARM) |
|---|---|---|
| CPU | 4 vCPU (Intel/AMD) | 4 vCPU (Ampere) |
| RAM | 8 GB | 8 GB |
| Disk | 80 GB SSD | 80 GB SSD |
| Price | ~€6.49/mo | ~€7.99/mo |
| SQL Server | **Native x86** | QEMU emulation |

**Recommendation: CX33** — cheaper, and SQL Server runs natively without QEMU overhead.
CAX21 works too (ARM + QEMU, same as Oracle Cloud), but there's no benefit over CX33.

---

## Prerequisites

| Item | Where to get it | Cost |
|------|----------------|------|
| Hetzner Cloud account | [console.hetzner.cloud](https://console.hetzner.cloud) | €6-8/mo |
| Cloudflare account | [cloudflare.com](https://cloudflare.com) | Free |
| Domain on Cloudflare | Already have: `vishalk.com` | — |
| Groq API key | [console.groq.com](https://console.groq.com) | Free (500K tokens/day) |
| Cerebras API key | [cloud.cerebras.ai](https://cloud.cerebras.ai) | Free (1M tokens/day) |

---

## Step-by-Step Deployment

### Phase A: Local Preparation (on your laptop)

Before touching the VM, prepare the ML data locally where you have GPU access.

#### A1. Run the full seed pipeline locally

Make sure your local Docker stack is running and Ollama is available:

```bash
# Start local DBs
docker compose up -d

# Start dev server (needed by seed scripts)
bun run dev

# In another terminal — run all 9 AI jobs
bun run seed-all
```

This takes 10-30 minutes. It runs case-clustering (needs Ollama/GPU), risk forecasting, survey analysis, etc.

#### A2. Export the ML snapshot

```bash
bun run scripts/export-demo-snapshot.ts
```

This creates `dumps/demo-snapshot.sql` — a portable dump of all pre-computed ML data. You'll load this on the VM so it doesn't need to run Ollama.

#### A3. Push the repo

```bash
git push
```

---

### Phase B: Hetzner Cloud VM Setup

#### B1. Create the VM

1. Log into [Hetzner Cloud Console](https://console.hetzner.cloud)
2. Click **Add Server**
3. Configure:
   - **Location:** Falkenstein (fsn1) or Nuremberg (nbg1) — closest to EU users
   - **Image:** Ubuntu 22.04
   - **Type:** CX33 (Shared vCPU, x86, 4 vCPU, 8 GB RAM)
   - **SSH key:** Add your public key
   - **Name:** `wovo-demo`
4. Click **Create & Buy Now**

#### B2. Firewall (optional)

If using Cloudflare Tunnel only, no inbound ports are needed — the tunnel connects outbound.

If you want direct access too:
1. In Hetzner Console → **Firewalls** → Create Firewall
2. Add rule: **TCP 3030** from `0.0.0.0/0`
3. Attach to your server

#### B3. SSH and run setup

```bash
ssh root@<your-vm-ip>

# Clone the repo
git clone <your-repo-url> wovo
cd wovo

# Run the automated setup
bash scripts/setup-vm.sh
```

This installs Docker, Bun, Cloudflare Tunnel, and configures ufw.

#### B4. Configure environment

```bash
cp .env.production.example .env.production
nano .env.production
```

Fill in your free-tier API keys:
```
GROQ_API_KEY=gsk_xxxxxxxxxxxx
CEREBRAS_API_KEY=csk-xxxxxxxxxxxx
```

#### B5. Build and start everything

```bash
# Build the app image and start all services
docker compose -f docker-compose.prod.yml up -d --build
```

First run takes 5-10 minutes (pulling images + building). Watch progress:
```bash
docker compose -f docker-compose.prod.yml logs -f
```

Wait until you see:
- `wovo_postgres: database system is ready to accept connections`
- `wovo_sqlserver: SQL Server is ready`
- `wovo_mysql: ready for connections`
- `wovo_app: ▲ Next.js` or `Listening on port 3030`

#### B6. Push Drizzle schema and load ML data

```bash
# Push the Drizzle schema (creates wovo_ai tables)
export $(grep -v '^#' .env.production | xargs)
bun install  # need deps for drizzle-kit
bun run db:push

# Load the pre-computed ML snapshot
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U pguser -d wovo_ai < dumps/demo-snapshot.sql
```

> If you didn't export a snapshot, you can run `bash scripts/seed-on-vm.sh` instead,
> but this requires the dev server and takes 10-30 minutes. The snapshot approach is faster.

#### B7. Verify it works

```bash
# Quick health check
curl http://localhost:3030/api/health
```

Should return JSON with all databases showing healthy status.

Visit `http://<vm-ip>:3030` in your browser to confirm.

---

### Phase C: Cloudflare Tunnel (Public HTTPS)

#### C1. Quick tunnel (temporary URL, great for testing)

```bash
cloudflared tunnel --url http://localhost:3030
```

This gives you a random `https://xxxx.trycloudflare.com` URL. Good for testing, changes on restart.

#### C2. Permanent tunnel with your domain

```bash
# Authenticate with Cloudflare
cloudflared tunnel login

# Create a named tunnel
cloudflared tunnel create wovo-demo

# Route your subdomain to the tunnel
cloudflared tunnel route dns wovo-demo demo.vishalk.com

# Create tunnel config
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: wovo-demo
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: demo.vishalk.com
    service: http://localhost:3030
  - service: http_status:404
EOF

# Test it
cloudflared tunnel run wovo-demo
```

Visit `https://demo.vishalk.com` — it should load!

#### C3. Make it survive reboots

```bash
# Install systemd services
sudo cp deploy/wovo-app.service /etc/systemd/system/
sudo cp deploy/wovo-tunnel.service /etc/systemd/system/

sudo systemctl daemon-reload
sudo systemctl enable wovo-app wovo-tunnel
sudo systemctl start wovo-app wovo-tunnel

# Verify
sudo systemctl status wovo-app
sudo systemctl status wovo-tunnel
```

Now both the app and tunnel start automatically on boot.

---

## Maintenance

### View logs
```bash
# App + DB logs
docker compose -f docker-compose.prod.yml logs -f

# Just the app
docker compose -f docker-compose.prod.yml logs -f app

# Tunnel
sudo journalctl -u wovo-tunnel -f
```

### Update the app
```bash
cd ~/wovo
git pull
docker compose -f docker-compose.prod.yml up -d --build app
```

### Restart everything
```bash
docker compose -f docker-compose.prod.yml restart
```

### Check resource usage
```bash
# Docker stats
docker stats --no-stream

# System memory
free -h

# Disk usage
df -h
```

---

## Resource Budget

| Component | RAM Limit | Disk | Notes |
|-----------|-----------|------|-------|
| PostgreSQL + pgvector | 2 GB | ~500 MB | Seed data + ML outputs |
| SQL Server 2022 | 2.5 GB | ~1.5 GB | Internal limit 1024 MB |
| MySQL 8.0 | 1 GB | ~200 MB | Minimal usage |
| Next.js App (Bun) | 1.5 GB | ~300 MB | Standalone build |
| Docker + OS | ~1 GB | ~5 GB | Ubuntu + images |
| **Total** | **~8 GB** | **~8 GB** | **Fits CX33/CAX21** |

---

## Troubleshooting

### SQL Server won't start
On first boot it can be slow. Increase `start_period` in docker-compose.prod.yml:
```yaml
start_period: 120s  # was 60s
```

### Out of memory
Check which container is using the most:
```bash
docker stats --no-stream
```
Memory limits in docker-compose.prod.yml prevent any single container from consuming all RAM.

### Cloudflare Tunnel disconnects
Check if cloudflared is running:
```bash
sudo systemctl status wovo-tunnel
sudo journalctl -u wovo-tunnel --since "10 min ago"
```

### App can't connect to databases
Ensure the DB containers are on the same Docker network. The service names (`postgres`, `sqlserver`, `mysql`) are the hostnames inside the Docker network.

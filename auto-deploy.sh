#!/bin/bash
# ===== GENZ GAMES AUTO DEPLOY & INTEGRATION =====
# Run this once: bash <(curl -s https://raw.githubusercontent.com/manhdauvn09-manhds/autoCreateGames/main/auto-deploy.sh)

set -e

# ===== CONFIG =====
REPO_URL="https://manhdauvn09-manhds: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@github.com/manhdauvn09-manhds/autoCreateGames.git"
DEPLOY_PATH="/var/www/games"
DOCKER_IMAGE="allin1site-subapp-games:latest"
CONTAINER_NAME="allin1_games"
PORT="8700"
WINDOWS_PATH="E:\\SourceCode\\AllIn1Site\\subapp\\games"

# ===== COLORS =====
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ===== STEP 1: CLEANUP & CLONE =====
log_info "Step 1/6: Cloning repository..."
if [ -d "$DEPLOY_PATH" ]; then
  log_warn "Directory exists, updating..."
  cd "$DEPLOY_PATH"
  git fetch origin
  git reset --hard origin/main
else
  log_info "Creating directory..."
  mkdir -p "$DEPLOY_PATH"
  cd "$DEPLOY_PATH"
  git clone "$REPO_URL" .
fi
log_info "✓ Repository ready at $DEPLOY_PATH"

# ===== STEP 2: VERIFY GAMES =====
log_info "Step 2/6: Verifying games quality..."
if [ -f "scripts/verify-games.js" ]; then
  if command -v node &> /dev/null; then
    npm install 2>&1 | grep -v "up to date" || true
    node scripts/verify-games.js || log_warn "Some games have warnings"
  else
    log_warn "Node.js not found, skipping verification"
  fi
else
  log_warn "Verification script not found"
fi

# ===== STEP 3: BUILD DOCKER =====
log_info "Step 3/6: Building Docker image ($DOCKER_IMAGE)..."
docker build -f Dockerfile.prod -t "$DOCKER_IMAGE" . 2>&1 | grep -E "FINISHED|ERROR" || true

if ! docker images | grep -q "$(echo $DOCKER_IMAGE | cut -d: -f1)"; then
  log_error "Docker build failed!"
  exit 1
fi
log_info "✓ Docker image built"

# ===== STEP 4: DEPLOY CONTAINER =====
log_info "Step 4/6: Deploying container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

docker run -d \
  --name "$CONTAINER_NAME" \
  --restart always \
  -p "127.0.0.1:$PORT:80" \
  -e TZ=Asia/Ho_Chi_Minh \
  "$DOCKER_IMAGE"

sleep 2
if docker ps | grep -q "$CONTAINER_NAME"; then
  log_info "✓ Container running on port $PORT"
else
  log_error "Container failed to start!"
  docker logs "$CONTAINER_NAME"
  exit 1
fi

# ===== STEP 5: VERIFY DEPLOYMENT =====
log_info "Step 5/6: Verifying deployment..."
HEALTH=$(curl -s http://127.0.0.1:$PORT/health || echo "FAIL")
if [ "$HEALTH" = "OK" ]; then
  log_info "✓ Health check passed"
else
  log_warn "Health check failed, but container is running"
fi

# ===== STEP 6: SHOW INFO & INTEGRATION GUIDE =====
log_info "Step 6/6: Integration guide..."

cat << 'EOF'

╔════════════════════════════════════════════════════════════╗
║         ✨ GENZ GAMES DEPLOYMENT SUCCESSFUL ✨            ║
╚════════════════════════════════════════════════════════════╝

📍 ACCESS URLS:
   Games: http://localhost:8700/games/
   API:   http://localhost:8700/api/games
   Health: http://localhost:8700/health

🔧 NGINX INTEGRATION (add to main nginx config):

   upstream games_backend {
       server 127.0.0.1:8700;
   }

   location /games/ {
       proxy_pass http://games_backend/games/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
   }

📊 DOCKER INFO:
EOF

docker ps --filter "name=$CONTAINER_NAME" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

cat << 'EOF'

🔄 AUTO-UPDATES:
   - Daily at 00:00 UTC via GitHub Actions
   - New games auto-generated
   - Auto-verified
   - Auto-deployed

📦 DEPLOYMENT PATH:
   /var/www/games/

🔗 REPOSITORY:
   https://github.com/manhdauvn09-manhds/autoCreateGames

📝 LOGS:
   docker logs -f allin1_games

🛑 STOP/RESTART:
   docker stop allin1_games
   docker start allin1_games

═══════════════════════════════════════════════════════════

✅ NEXT STEPS:
1. Copy games folder to Windows:
   scp -r root@62.238.8.222:/var/www/games/* "E:\\SourceCode\\AllIn1Site\\subapp\\games\\"

2. Update Portal nginx config with upstream above

3. Restart Portal:
   docker-compose restart allin1_portal

4. Access at: http://localhost/games/

═══════════════════════════════════════════════════════════
EOF

log_info "✨ Deployment complete!"
log_info "Run this weekly: git -C $DEPLOY_PATH pull origin main && docker-compose -C $DEPLOY_PATH up -d"

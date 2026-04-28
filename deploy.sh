#!/bin/bash
set -e

echo "🚀 Deploying GenZ Games..."

# Config
DEPLOY_PATH=${DEPLOY_PATH:-/var/www/games}
DOCKER_IMAGE="allin1site-subapp-games:latest"
CONTAINER_NAME="allin1_games"
PORT=${GAMES_PORT:-8700}

# Step 1: Clone/Update repo
echo "📦 Updating source code..."
if [ -d "$DEPLOY_PATH" ]; then
  cd "$DEPLOY_PATH"
  git pull origin main
else
  git clone https://manhdauvn09-manhds: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@github.com/manhdauvn09-manhds/autoCreateGames.git "$DEPLOY_PATH"
  cd "$DEPLOY_PATH"
fi

# Step 2: Build Docker image
echo "🔨 Building Docker image..."
docker build -f Dockerfile.prod -t "$DOCKER_IMAGE" .

# Step 3: Stop old container
echo "🛑 Stopping old container..."
docker stop "$CONTAINER_NAME" 2>/dev/null || true
docker rm "$CONTAINER_NAME" 2>/dev/null || true

# Step 4: Run new container
echo "🚀 Starting new container..."
docker run -d \
  --name "$CONTAINER_NAME" \
  --restart always \
  -p "127.0.0.1:$PORT:80" \
  "$DOCKER_IMAGE"

# Step 5: Verify
echo "✅ Verifying deployment..."
sleep 3
docker ps | grep "$CONTAINER_NAME" && echo "✨ Deployment successful!" || echo "❌ Deployment failed!"

# Step 6: Show access info
echo ""
echo "📍 Games running at: http://localhost:$PORT/games/"
echo "🔗 Portal integration: Add this to docker-compose or nginx upstream"
echo "   Location: http://127.0.0.1:$PORT"

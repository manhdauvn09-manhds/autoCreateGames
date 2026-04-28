#!/usr/bin/env node

const { exec, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

class Deployer {
  constructor(config) {
    this.config = {
      host: config.host || '62.238.8.222',
      user: config.user || 'root',
      port: config.port || 22,
      path: config.path || '/var/www/games',
      identityFile: config.identityFile || null,
      password: config.password || null,
      ...config
    };
  }

  async deploy() {
    console.log(`\n🚀 Starting deployment to ${this.config.host}\n`);

    try {
      // Step 1: Build Docker image
      console.log('📦 Building Docker image...');
      await this.buildDocker();

      // Step 2: Verify games
      console.log('✅ Verifying games...');
      await this.verifyGames();

      // Step 3: Deploy to server
      console.log('🚀 Deploying to server...');
      await this.deployToServer();

      // Step 4: Run on server
      console.log('🔄 Starting services on server...');
      await this.startServices();

      console.log('\n✨ Deployment successful!\n');
      console.log(`📍 Access games at: http://${this.config.host}/games/`);
      console.log(`📊 API at: http://${this.config.host}/api/games\n`);

    } catch (error) {
      console.error('\n❌ Deployment failed:', error.message, '\n');
      process.exit(1);
    }
  }

  buildDocker() {
    return new Promise((resolve, reject) => {
      console.log('  Building image...');
      exec('docker build -t genz-minigames:latest .', (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Docker build failed: ${stderr}`));
        } else {
          console.log('  ✓ Docker image built');
          resolve();
        }
      });
    });
  }

  verifyGames() {
    return new Promise((resolve, reject) => {
      console.log('  Running verification...');
      exec('node scripts/verify-games.js', (error, stdout, stderr) => {
        if (error) {
          console.warn('  ⚠️ Some games failed verification');
          console.log(stdout);
        } else {
          console.log('  ✓ All games passed verification');
        }
        resolve();
      });
    });
  }

  deployToServer() {
    return new Promise((resolve, reject) => {
      const sshCmd = this.getSshCommand();

      console.log('  Uploading files...');

      // Create tar
      execSync('tar -czf /tmp/games.tar.gz games/ scripts/ Dockerfile docker-compose.yml nginx.conf server.js package.json index.html', { stdio: 'inherit' });

      // Upload via SCP
      const scpCmd = `scp -P ${this.config.port} /tmp/games.tar.gz ${this.config.user}@${this.config.host}:/tmp/`;

      exec(scpCmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`SCP failed: ${stderr}`));
        } else {
          console.log('  ✓ Files uploaded');
          resolve();
        }
      });
    });
  }

  startServices() {
    return new Promise((resolve, reject) => {
      const sshCmd = this.getSshCommand();

      const remoteCmd = `
        cd ${this.config.path} &&
        tar -xzf /tmp/games.tar.gz &&
        npm install &&
        docker-compose down 2>/dev/null || true &&
        docker-compose up -d &&
        echo "✓ Services started"
      `;

      const fullCmd = `${sshCmd} "${remoteCmd}"`;

      exec(fullCmd, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Remote command failed: ${stderr}`));
        } else {
          console.log('  ✓ Services started');
          resolve();
        }
      });
    });
  }

  getSshCommand() {
    if (this.config.identityFile) {
      return `ssh -i ${this.config.identityFile} -p ${this.config.port} ${this.config.user}@${this.config.host}`;
    } else {
      // Note: Password auth requires additional setup (sshpass)
      console.warn('⚠️ Using password auth. Install sshpass for automated deploys: apt-get install sshpass');
      return `sshpass -p "${this.config.password}" ssh -p ${this.config.port} ${this.config.user}@${this.config.host}`;
    }
  }
}

// Get config from env or args
const deployConfig = {
  host: process.env.DEPLOY_HOST || '62.238.8.222',
  user: process.env.DEPLOY_USER || 'root',
  port: process.env.DEPLOY_PORT || 22,
  path: process.env.DEPLOY_PATH || '/var/www/games',
  identityFile: process.env.DEPLOY_KEY || null,
  password: process.env.DEPLOY_PASSWORD || null
};

const deployer = new Deployer(deployConfig);
deployer.deploy();

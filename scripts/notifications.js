const https = require('https');

class NotificationManager {
  constructor(discordWebhookUrl) {
    this.discordWebhookUrl = discordWebhookUrl || process.env.DISCORD_WEBHOOK_URL;
  }

  // Send Discord notification
  async sendDiscordNotification(games, qualityScore) {
    if (!this.discordWebhookUrl) {
      console.log('ℹ️  Discord webhook not configured. Skipping Discord notification.');
      return;
    }

    const gamesList = games
      .slice(0, 5)
      .map(g => `• **${g.name}** - ${g.tagline}`)
      .join('\n');

    const embed = {
      title: '🎮 GenZ Games Generated!',
      description: `${games.length} new games created today`,
      color: 3066993,
      fields: [
        {
          name: '⭐ Quality Score',
          value: `${qualityScore.overallScore}/100 - ${qualityScore.rating}`,
          inline: true
        },
        {
          name: '📈 Games',
          value: `${games.length} games`,
          inline: true
        },
        {
          name: '🎮 Sample Games',
          value: gamesList,
          inline: false
        },
        {
          name: '🔗 Repository',
          value: '[View on GitHub](https://github.com/manhdauvn09-manhds/autoCreateGames)',
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'GenZ Games Bot'
      }
    };

    return this.postDiscord({ embeds: [embed] });
  }

  postDiscord(payload) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'discordapp.com',
        port: 443,
        path: this.discordWebhookUrl.replace('https://discordapp.com', ''),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify(payload))
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ success: true, status: res.statusCode });
          } else {
            reject(new Error(`Discord API error: ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.write(JSON.stringify(payload));
      req.end();
    });
  }

  // Send GitHub release notification
  async sendGitHubRelease(games, date, qualityScore) {
    const gameNames = games.map(g => `• ${g.name}`).join('\n');
    const releaseBody = `## 🎮 Daily Game Release - ${date}

**Quality Score:** ${qualityScore.overallScore}/100 - ${qualityScore.rating}

**Games Included:**
${gameNames}

**Features:**
- Mobile-responsive HTML5 games
- No external dependencies
- Ready for production
- Zero-setup deployment

**Play Now:**
https://github.com/manhdauvn09-manhds/autoCreateGames/tree/main/games`;

    return releaseBody;
  }

  // Create console notification
  printConsoleNotification(games, qualityScore, date) {
    const colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      green: '\x1b[32m',
      cyan: '\x1b[36m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m'
    };

    console.log(`
${colors.cyan}════════════════════════════════════════════════════════${colors.reset}
${colors.bright}${colors.green}🎮 GAMES GENERATED SUCCESSFULLY!${colors.reset}
${colors.cyan}════════════════════════════════════════════════════════${colors.reset}

${colors.bright}Date:${colors.reset} ${date}
${colors.bright}Total Games:${colors.reset} ${games.length}
${colors.bright}Quality Score:${colors.reset} ${colors.yellow}${qualityScore.overallScore}/100${colors.reset} ${qualityScore.rating}

${colors.bright}Generated Games:${colors.reset}
${games.map(g => `  ${colors.green}✓${colors.reset} ${colors.cyan}${g.name}${colors.reset} - ${g.tagline}`).join('\n')}

${colors.bright}Repository:${colors.reset}
  ${colors.blue}https://github.com/manhdauvn09-manhds/autoCreateGames${colors.reset}

${colors.cyan}════════════════════════════════════════════════════════${colors.reset}
    `);
  }
}

module.exports = NotificationManager;

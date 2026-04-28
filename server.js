const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/games', express.static('games'));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API: Get all games
app.get('/api/games', (req, res) => {
  try {
    const gamesDir = path.join(__dirname, 'games');
    const games = fs.readdirSync(gamesDir)
      .filter(f => fs.statSync(path.join(gamesDir, f)).isDirectory())
      .map(folder => {
        const metaPath = path.join(gamesDir, folder, 'meta.json');
        if (fs.existsSync(metaPath)) {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          return { ...meta, path: `/games/${folder}/` };
        }
        return null;
      })
      .filter(g => g !== null);

    res.json({ success: true, games, count: games.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get game by ID
app.get('/api/games/:id', (req, res) => {
  try {
    const metaPath = path.join(__dirname, 'games', req.params.id, 'meta.json');
    if (!fs.existsSync(metaPath)) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    res.json({ success: true, game: meta });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get daily report
app.get('/api/report/:date', (req, res) => {
  try {
    const reportPath = path.join(__dirname, 'daily', `${req.params.date}.md`);
    if (!fs.existsSync(reportPath)) {
      return res.status(404).json({ success: false, error: 'Report not found' });
    }
    const content = fs.readFileSync(reportPath, 'utf8');
    res.json({ success: true, date: req.params.date, report: content });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎮 GenZ Games Server running on port ${PORT}`);
  console.log(`📍 Games: http://localhost:${PORT}/games/`);
  console.log(`📊 API: http://localhost:${PORT}/api/games`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
});

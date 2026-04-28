#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class GameVerifier {
  constructor(gameDir) {
    this.gameDir = gameDir;
    this.results = {};
    this.passed = 0;
    this.failed = 0;
  }

  async verify() {
    console.log(`\n🔍 Verifying game: ${path.basename(this.gameDir)}\n`);

    // 1. File Structure
    this.checkFileStructure();

    // 2. HTML Quality
    this.checkHTML();

    // 3. Meta.json
    this.checkMetadata();

    // 4. File Sizes
    this.checkFileSizes();

    // 5. Content Check
    this.checkContent();

    // Print results
    this.printResults();

    return this.getScore() >= 10 ? 'PASS' : 'FAIL';
  }

  checkFileStructure() {
    const checks = {
      'index.html': fs.existsSync(path.join(this.gameDir, 'index.html')),
      'meta.json': fs.existsSync(path.join(this.gameDir, 'meta.json')),
      'Valid folder': fs.statSync(this.gameDir).isDirectory()
    };

    this.results['📁 File Structure'] = this.countPassed(checks, 3);
    console.log(`✓ File Structure: ${this.results['📁 File Structure']}/3`);
  }

  checkHTML() {
    const htmlPath = path.join(this.gameDir, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      this.results['🔍 HTML Quality'] = '0/3';
      return;
    }

    const html = fs.readFileSync(htmlPath, 'utf8');
    const checks = {
      'Has DOCTYPE': html.includes('<!DOCTYPE'),
      'Has meta charset': html.includes('charset'),
      'Has viewport': html.includes('viewport'),
      'No external CDN': !html.includes('cdn.'),
      'Valid structure': html.includes('<html') && html.includes('</html>')
    };

    this.results['🔍 HTML Quality'] = this.countPassed(checks, 5);
    console.log(`✓ HTML Quality: ${this.results['🔍 HTML Quality']}/5`);
  }

  checkMetadata() {
    const metaPath = path.join(this.gameDir, 'meta.json');
    if (!fs.existsSync(metaPath)) {
      this.results['📊 Metadata'] = '0/4';
      return;
    }

    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const checks = {
        'Valid JSON': true,
        'Has id': !!meta.id,
        'Has title': !!meta.title,
        'Has type': !!meta.type
      };

      this.results['📊 Metadata'] = this.countPassed(checks, 4);
      console.log(`✓ Metadata: ${this.results['📊 Metadata']}/4`);
    } catch (e) {
      this.results['📊 Metadata'] = '0/4';
      console.log(`✗ Metadata: Invalid JSON`);
    }
  }

  checkFileSizes() {
    const checks = {};
    const files = fs.readdirSync(this.gameDir);

    files.forEach(file => {
      const filePath = path.join(this.gameDir, file);
      const stat = fs.statSync(filePath);
      const sizeKB = stat.size / 1024;

      if (file.endsWith('.html')) {
        checks[`${file} (<50KB)`] = sizeKB < 50;
      } else if (file.endsWith('.js')) {
        checks[`${file} (<100KB)`] = sizeKB < 100;
      } else if (file.endsWith('.css')) {
        checks[`${file} (<20KB)`] = sizeKB < 20;
      }
    });

    this.results['💻 File Sizes'] = this.countPassed(checks, Object.keys(checks).length || 3);
    console.log(`✓ File Sizes: ${this.results['💻 File Sizes']}/${Object.keys(checks).length || 3}`);
  }

  checkContent() {
    const htmlPath = path.join(this.gameDir, 'index.html');
    if (!fs.existsSync(htmlPath)) {
      this.results['✨ Content'] = '0/4';
      return;
    }

    const html = fs.readFileSync(htmlPath, 'utf8').toLowerCase();
    const checks = {
      'Has game title': html.includes('title>') || html.includes('h1>'),
      'Has button/interactivity': html.includes('button') || html.includes('onclick') || html.includes('canvas'),
      'Responsive design': html.includes('viewport') || html.includes('media'),
      'No console errors visible': !html.includes('eval(') && !html.includes('innerHTML =')
    };

    this.results['✨ Content'] = this.countPassed(checks, 4);
    console.log(`✓ Content: ${this.results['✨ Content']}/4`);
  }

  countPassed(checks, maxScore) {
    const passed = Object.values(checks).filter(v => v === true).length;
    return `${passed}/${maxScore}`;
  }

  getScore() {
    let total = 0;
    let count = 0;

    for (const result of Object.values(this.results)) {
      const [passed, max] = result.split('/').map(Number);
      total += passed;
      count += max;
    }

    return Math.round((total / count) * 12);
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('VERIFICATION RESULTS');
    console.log('='.repeat(50));

    for (const [check, result] of Object.entries(this.results)) {
      const [passed, max] = result.split('/').map(Number);
      const icon = passed === max ? '✅' : passed > max * 0.5 ? '⚠️' : '❌';
      console.log(`${icon} ${check}: ${result}`);
    }

    const score = this.getScore();
    const status = score >= 10 ? '✅ PASS' : score >= 8 ? '⚠️ WARNING' : '❌ FAIL';

    console.log('\n' + '='.repeat(50));
    console.log(`Overall Score: ${score}/12 - ${status}`);
    console.log('='.repeat(50) + '\n');

    return status;
  }
}

// Run verification
async function verifyAllGames() {
  const gamesDir = path.join(__dirname, '../games');
  const games = fs.readdirSync(gamesDir).filter(f =>
    fs.statSync(path.join(gamesDir, f)).isDirectory()
  );

  console.log(`\n🎮 Verifying ${games.length} games...\n`);

  const results = {};
  for (const game of games) {
    const verifier = new GameVerifier(path.join(gamesDir, game));
    results[game] = await verifier.verify();
  }

  // Summary
  const passed = Object.values(results).filter(v => v === 'PASS').length;
  const failed = games.length - passed;

  console.log('\n' + '='.repeat(50));
  console.log('OVERALL SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total Games: ${games.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('='.repeat(50) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

verifyAllGames();

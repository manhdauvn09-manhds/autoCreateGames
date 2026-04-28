# 🎮 Game Verification Checklist

## Pre-Deployment Verification Checklist

### Checklist cho mỗi game:

#### 1. 📁 File Structure
- [ ] `index.html` tồn tại
- [ ] `meta.json` tồn tại
- [ ] Tất cả referenced files có mặt
- [ ] Không có broken links

#### 2. 🔍 HTML/CSS Quality
- [ ] HTML valid (no console errors)
- [ ] Responsive (mobile + desktop)
- [ ] Viewport meta tag present
- [ ] Proper encoding (UTF-8)
- [ ] No external CDN dependencies

#### 3. 🎮 Gameplay
- [ ] Game loads without errors
- [ ] Playable on both tap/click and keyboard
- [ ] Touch controls work (mobile)
- [ ] Scoring system works
- [ ] Game over/restart works

#### 4. 💻 Performance
- [ ] Page load < 2 seconds
- [ ] 60 FPS during gameplay (no lag)
- [ ] Memory usage < 50MB
- [ ] No console errors/warnings
- [ ] No network requests (fully offline)

#### 5. 🎨 Visual Quality
- [ ] Game has visual feedback (colors, animations)
- [ ] UI is readable (good contrast)
- [ ] No broken images/assets
- [ ] Consistent styling
- [ ] Loading indicator (if needed)

#### 6. ♿ Accessibility
- [ ] Keyboard navigation works
- [ ] Touch targets >= 44px
- [ ] Color not only visual indicator
- [ ] Labels/text clear

#### 7. 🔊 Audio/Feedback
- [ ] Sound toggle present
- [ ] Web Audio initialized (if used)
- [ ] No console audio errors
- [ ] Vibration support (if available)

#### 8. 📊 Metadata
- [ ] meta.json valid JSON
- [ ] All required fields present
- [ ] Title, tagline filled
- [ ] Genre/mechanics defined
- [ ] Date correct

#### 9. 📱 Mobile Friendly
- [ ] Works on phone viewport
- [ ] Touch-friendly buttons (>44px)
- [ ] No horizontal scroll
- [ ] Responsive grid/layout
- [ ] Portrait orientation optimized

#### 10. ✨ Polish
- [ ] No typos in UI text
- [ ] Consistent game feel
- [ ] Clear win/lose condition
- [ ] Feedback on user action
- [ ] "One more try" hook present

#### 11. 🚀 Performance (Load Time)
- [ ] Index.html: < 50KB
- [ ] Total CSS: < 20KB
- [ ] Total JS: < 100KB
- [ ] All files minified

#### 12. 🔒 Security
- [ ] No inline eval/script injection
- [ ] No vulnerable dependencies
- [ ] No hardcoded secrets
- [ ] Safe JSON parsing

---

## Scoring System

**Pass Criteria:** ✅ Pass if >= 10/12 sections marked as complete

**Results:**
- ✅ **PASS** (10-12 sections) → Ready to deploy
- ⚠️ **WARN** (8-9 sections) → Minor issues, review before deploy
- ❌ **FAIL** (<8 sections) → Major issues, fix required

---

## Quick Check Command

```bash
# Run verification
npm run verify [game-folder]

# Example
npm run verify games/20260427_beatjump
```

---

## Auto-Verification Results

| Game | Performance | Mobile | Gameplay | Audio | Result |
|------|-------------|--------|----------|-------|--------|
| - | [ ] | [ ] | [ ] | [ ] | - |

---

## Notes for Developers

- Test on real devices when possible
- Check browser console (F12)
- Test on slow 4G network
- Verify on both iOS & Android
- Check portrait & landscape modes

---

*Last Updated: 2026-04-27*

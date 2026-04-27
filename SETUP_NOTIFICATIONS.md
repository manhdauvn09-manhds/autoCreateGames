# 🔔 Setup Notifications for GenZ Games

Bạn có thể nhận thông báo khi games mới được tạo qua Discord, Email, hoặc GitHub Releases.

---

## Option 1: Discord Notifications ⭐ (Recommended)

### Step 1: Tạo Discord Server & Channel

1. Tạo một Discord server (hoặc dùng server hiện tại)
2. Tạo channel `#games` để nhận thông báo

### Step 2: Tạo Webhook

1. Vào channel muốn nhận thông báo
2. Nhấp vào ⚙️ **Settings** → **Integrations** → **Webhooks**
3. Nhấp **New Webhook**
4. Đặt tên: "GenZ Games Bot"
5. Nhấp **Copy Webhook URL**
6. Lưu URL này

### Step 3: Thêm Webhook URL vào GitHub Secrets

1. Vào: https://github.com/manhdauvn09-manhds/autoCreateGames/settings/secrets/actions
2. Nhấp **New repository secret**
3. Name: `DISCORD_WEBHOOK_URL`
4. Value: Dán webhook URL bạn vừa copy
5. Nhấp **Add secret**

**Done!** 🎉 Mỗi lần games được tạo, Discord của bạn sẽ nhận thông báo!

---

## Option 2: Email Notifications

### Step 1: Enable GitHub Email Notifications

1. Vào: https://github.com/settings/notifications
2. Bật **Email notifications**
3. Watch repository: https://github.com/manhdauvn09-manhds/autoCreateGames

### Step 2: Configure Watch Settings

1. Vào repo → **Watch** → **Custom**
2. Chọn:
   - ✅ Pushes
   - ✅ Releases
3. Lưu

**Result:** Bạn sẽ nhận email mỗi khi có commit mới!

---

## Option 3: GitHub Releases

Workflow sẽ auto-create release mỗi ngày với:
- 📝 Game list
- 📊 Quality metrics
- 🔗 Direct links

**Cách xem:**
1. Vào: https://github.com/manhdauvn09-manhds/autoCreateGames/releases
2. Mỗi ngày sẽ có release mới!

---

## Test Notifications

Để test Discord notification ngay lập tức:

1. Vào: https://github.com/manhdauvn09-manhds/autoCreateGames/actions
2. Click **"Daily GenZ Games Generator"**
3. Click **"Run workflow"** → **"Run workflow"**
4. Chờ ~2 phút

Discord sẽ nhận thông báo với:
- ✨ Quality score
- 🎮 List games
- 🔗 Link repo

---

## Notification Samples

### Discord Embed Example
```
🎮 GenZ Games Generated!
10 new games created today

⭐ Quality Score: 85/100 - Very Good
📈 Games: 10 games

🎮 Sample Games:
• ClickMaster - Click for points! Buy upgrades!
• JumpQuest - Jump higher! Reach the sky!
• GemSwap - Match 3 gems for big points!
...
```

### Email Subject
```
[manhdauvn09-manhds/autoCreateGames] Push to main
```

---

## Troubleshooting

### Discord webhook không hoạt động?
1. Kiểm tra webhook URL có đúng không (Settings → Integrations → Webhooks)
2. Kiểm tra GitHub secret có đúng: `DISCORD_WEBHOOK_URL`
3. Thử test workflow manual (Actions tab)

### Không nhận email?
1. Vào GitHub settings → Notifications
2. Check inbox & spam folder
3. Bảo đảm "Watch" được enable

### Muốn đổi thời gian thông báo?
Edit: `.github/workflows/daily-games.yml`
```yaml
cron: '0 0 * * *'  # 00:00 UTC (current)
cron: '0 8 * * *'  # 08:00 UTC
cron: '0 12 * * *' # 12:00 UTC
```

---

## Crontab Cheat Sheet

```
0 0 * * *   → Hàng ngày lúc 00:00 UTC
0 8 * * *   → Hàng ngày lúc 08:00 UTC
0 0 * * 1   → Thứ 2 lúc 00:00 UTC
0 0 1 * *   → Đầu tháng lúc 00:00 UTC
*/6 * * * * → Cứ 6 giờ
```

---

**More Help:** Xem GitHub Actions logs tại:
https://github.com/manhdauvn09-manhds/autoCreateGames/actions

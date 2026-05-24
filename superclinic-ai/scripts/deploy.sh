#!/bin/bash
# deploy.sh
# Superclinic — Deploy to GitHub Pages
# ห้าม hardcode PAT token ในไฟล์นี้

set -e

echo "🏥 Superclinic — Deploy Script"

# หา source path อัตโนมัติ
SRC=$(dirname $(find /sessions -name "thai-clinic.html" 2>/dev/null | head -1))
echo "📁 Source: $SRC"

REPO=/tmp/MC-push

# Pre-deploy checks
echo "🔍 Pre-deploy checks..."

# ตรวจ async async
ASYNC_COUNT=$(grep -c "async async" "$SRC/thai-clinic.html" || true)
if [ "$ASYNC_COUNT" -gt 0 ]; then
  echo "❌ ERROR: Found 'async async' in thai-clinic.html ($ASYNC_COUNT lines)"
  echo "   Fix before pushing!"
  exit 1
fi
echo "✅ No 'async async' found"

# ตรวจ API_URL
if grep -q "API_URL.*undefined\|API_URL.*''" "$SRC/thai-clinic.html"; then
  echo "⚠️  WARNING: API_URL may be empty"
fi

echo "✅ Pre-deploy checks passed"

# ต้องการ PAT token
if [ -z "$PAT_TOKEN" ]; then
  echo ""
  echo "❗ PAT_TOKEN not set."
  echo "   Usage: PAT_TOKEN=your-token bash scripts/deploy.sh"
  echo "   Or: export PAT_TOKEN=your-token && bash scripts/deploy.sh"
  exit 1
fi

# Clone or update repo
if [ -d "$REPO" ]; then
  echo "📦 Updating existing repo..."
  cd $REPO && git pull
else
  echo "📦 Cloning repo..."
  git clone "https://$PAT_TOKEN@github.com/kktfextrader-hue/Marvel-Clinic.git" $REPO
fi

# Copy files
echo "📋 Copying files..."
cp "$SRC/thai-clinic.html" "$REPO/index.html"
cp "$SRC/thai-clinic.html" "$REPO/thai-clinic.html"

# Get version
VERSION=$(grep -oP '(?<=// v)\d+' "$SRC/thai-clinic.html" | tail -1 || echo "?")

# Commit & push
cd $REPO
git add -A
git status

echo ""
read -p "🚀 Commit and push? (y/N): " CONFIRM
if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
  git commit -m "feat: v${VERSION} — deploy $(date '+%Y-%m-%d %H:%M')"
  git push "https://$PAT_TOKEN@github.com/kktfextrader-hue/Marvel-Clinic.git" main
  echo "✅ Deployed successfully!"
  echo "🌐 Live: https://kktfextrader-hue.github.io/Marvel-Clinic/"
else
  echo "❌ Deploy cancelled"
fi

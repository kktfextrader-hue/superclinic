#!/bin/bash
# check-before-push.sh
# Superclinic — Pre-push Validation

echo "🔍 Superclinic — Pre-push Checks"
echo "=================================="

SRC=$(dirname $(find /sessions -name "thai-clinic.html" 2>/dev/null | head -1))
FILE="$SRC/thai-clinic.html"

ERRORS=0

# Check 1: async async
echo -n "1. Checking 'async async'... "
COUNT=$(grep -c "async async" "$FILE" 2>/dev/null || echo 0)
if [ "$COUNT" -gt 0 ]; then
  echo "❌ FAIL ($COUNT occurrences)"
  grep -n "async async" "$FILE"
  ERRORS=$((ERRORS + 1))
else
  echo "✅ OK"
fi

# Check 2: No undefined API_URL
echo -n "2. Checking API_URL... "
if grep -q "const API_URL\s*=\s*['\"]https://" "$FILE" 2>/dev/null; then
  echo "✅ OK"
else
  echo "⚠️  WARNING (may be empty or local)"
fi

# Check 3: No <input type="date">
echo -n "3. Checking no native date inputs... "
DATE_COUNT=$(grep -c 'type="date"' "$FILE" 2>/dev/null || echo 0)
if [ "$DATE_COUNT" -gt 0 ]; then
  echo "⚠️  WARNING ($DATE_COUNT native date inputs found)"
  grep -n 'type="date"' "$FILE"
else
  echo "✅ OK"
fi

# Check 4: Thai in onclick
echo -n "4. Checking Thai in onclick... "
THAI_COUNT=$(grep -cP 'onclick=["\'][^"\']*[฀-๿]' "$FILE" 2>/dev/null || echo 0)
if [ "$THAI_COUNT" -gt 0 ]; then
  echo "⚠️  WARNING ($THAI_COUNT potential Thai-in-onclick)"
else
  echo "✅ OK"
fi

echo ""
echo "=================================="
if [ "$ERRORS" -eq 0 ]; then
  echo "✅ All critical checks passed. Safe to push."
else
  echo "❌ $ERRORS critical error(s) found. Fix before pushing!"
  exit 1
fi

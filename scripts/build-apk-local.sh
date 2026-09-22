#!/usr/bin/env bash
# Local reproduction of .github/workflows/android-apk.yml.
# Mirrors the CI steps so we can iterate without burning CI minutes.
#
# Usage:
#   ./scripts/build-apk-local.sh           # debug-signed release APK
#   ./scripts/build-apk-local.sh --debug   # debug APK (faster)
#
# Prereqs (one-time):
#   brew install --cask temurin             # JDK 17
#   brew install --cask android-commandlinetools
#   # then: sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"
#
# On macOS, Android SDK lives at ~/Library/Android/sdk.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

DEBUG_BUILD=false
[[ "${1:-}" == "--debug" ]] && DEBUG_BUILD=true

# ---- Sanity checks ----
command -v node   >/dev/null || { echo "❌ node not on PATH";   exit 1; }
command -v pnpm   >/dev/null || { echo "❌ pnpm not on PATH";   exit 1; }
command -v java   >/dev/null || { echo "❌ java not on PATH (brew install --cask temurin)"; exit 1; }
command -v sdkmanager >/dev/null || {
  echo "❌ sdkmanager not on PATH"
  echo "   brew install --cask android-commandlinetools"
  echo "   export ANDROID_SDK_ROOT=\"\$HOME/Library/Android/sdk\""
  echo "   export PATH=\"\$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:\$PATH\""
  exit 1
}

# Android SDK location on macOS.
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}"
export ANDROID_HOME="$ANDROID_SDK_ROOT"

echo "==> ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"
echo "==> java:  $(java -version 2>&1 | head -1)"
echo "==> node:  $(node -v)"
echo "==> pnpm:  $(pnpm -v)"
echo

# ---- Step 1: install workspace deps ----
echo "==> pnpm install --frozen-lockfile"
pnpm install --frozen-lockfile

# ---- Step 2: build engine + shared ----
echo "==> pnpm -r --filter './packages/*' build"
pnpm -r --filter './packages/*' build

# ---- Step 3: expo prebuild ----
echo "==> expo prebuild (apps/mobile)"
( cd apps/mobile && npx expo prebuild --platform android --no-install --clean )

# ---- Step 4: assemble APK ----
GRADLE_CMD="./gradlew assembleRelease"
[[ "$DEBUG_BUILD" == "true" ]] && GRADLE_CMD="./gradlew assembleDebug"

echo "==> $GRADLE_CMD"
( cd apps/mobile/android && chmod +x ./gradlew && $GRADLE_CMD )

# ---- Step 5: locate + stage APK ----
APK_PATH="$(find apps/mobile/android/app/build/outputs/apk/release -name '*.apk' 2>/dev/null | head -n 1 || true)"
if [[ -z "$APK_PATH" && "$DEBUG_BUILD" == "true" ]]; then
  APK_PATH="$(find apps/mobile/android/app/build/outputs/apk/debug -name '*.apk' 2>/dev/null | head -n 1 || true)"
fi

if [[ -z "$APK_PATH" ]]; then
  echo "❌ No APK produced."
  exit 1
fi

STAGE_DIR="$REPO_ROOT/dist"
mkdir -p "$STAGE_DIR"
STAGED="$STAGE_DIR/$(basename "$APK_PATH")"
cp "$APK_PATH" "$STAGED"

echo
echo "✅ APK staged at: $STAGED"
echo "   Size: $(du -h "$STAGED" | cut -f1)"
echo
echo "Sideload with:"
echo "   adb install -r '$STAGED'"

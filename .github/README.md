# GitHub Actions — BrowseRouter

This directory hosts CI workflows for the `browse-router` monorepo.

## `android-apk.yml`

Builds a sideloadable APK from `apps/mobile` on every tag push (`v*.*.*`) and
attaches it to a GitHub Release.

### Triggers

- **Tag push** (`v0.1.0`, `v0.0.1-rc.1`, etc.) — produces a release APK and
  creates a GitHub Release with the APK attached.

### Manual dispatch

Use **Actions → Android APK → Run workflow** to produce an APK without
tagging. The APK is uploaded as a workflow artifact (no release).

### Build matrix

- Runs on `ubuntu-latest` with Java 17 (Temurin) and Android SDK 35.
- Uses Expo prebuild to generate the native `android/` directory in CI; the
  generated tree is **not** committed (matches local convention).
- Debug signing for now. When you decide on Play Store release, replace with
  a real release keystore stored as a repo secret.

### What you get

```
browse-router-v0.0.1.apk            # attached to the GitHub Release
browse-router-debug-YYYY-MM-DD.apk  # manual runs (artifact)
```

### Sideload

```bash
adb install -r browse-router-v0.0.1.apk
```

See `docs/ANDROID-SETUP.md` for per-OEM default-browser setup.

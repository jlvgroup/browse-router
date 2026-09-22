# Android Setup — making BrowseRouter your default browser

BrowseRouter ships with the intent filters declared in `app.json`. To intercept links from other apps, the user must select it as the default browser. The exact path varies by OEM.

## VIVO X Fold 5 (OriginOS / FuntouchOS)

1. Settings → **Apps** → **Default apps**
2. Tap **Browser**
3. Choose **BrowseRouter**
4. If BrowseRouter doesn't appear: tap the **⋮ menu** in the top-right → **Show system apps** (the option is sometimes called "Show all apps" or "Hidden apps")

If the steps above don't match your OS version, the universal path is:

> Settings → search "default apps" → Browser app → BrowseRouter

**Fold-specific note:** the choice persists across both inner and cover displays. No separate setup per posture.

**Tip:** Clear the default by long-pressing any link → Open with → Always. Repeat to re-pick.

## Samsung Flip 7 (One UI)

1. Settings → **Apps** → **Choose default apps**
2. Tap **Browser app**
3. Choose **BrowseRouter**

Samsung occasionally pre-selects Samsung Internet. To switch:

> Settings → Apps → Samsung Internet → Set as default → Clear

**Fold-specific note:** Samsung's "App Pair" doesn't affect default-browser selection. The choice survives fold/unfold.

## Pixel / AOSP (generic Android 14+)

> Settings → Apps → Default apps → Browser app → BrowseRouter

The BrowseRouter app shows up automatically in this list once installed because the manifest declares the http/https intent filters.

## Share-target

No setup needed. After install:

1. Open any app with a shareable URL (Messages, Notes, Slack).
2. Tap Share → Share via → **BrowseRouter**.
3. BrowseRouter receives the URL, applies your rules, and launches the chosen browser.

## ADB sideload (developer workflow)

```bash
# build locally (after `expo prebuild`)
cd apps/mobile/android
./gradlew assembleDebug

# install on connected device
adb install -r app/build/outputs/apk/debug/app-debug.apk

# or trigger a release APK
./gradlew assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

For sideloading on VIVO / Samsung, you may need to allow "Install unknown apps" for your file manager or ADB host.

## Verifying the install

After installing, open another app and tap any link. If BrowseRouter appears in the chooser as "Always" / "Just once", routing is wired up correctly. If not:

- Confirm the package id matches: `group.jlv.browserouter` (check via `adb shell pm list packages | grep browserouter`)
- Re-check the AndroidManifest intent filters (regenerate via `expo prebuild --clean` if you edited app.json)
- Check device logs: `adb logcat | grep -i browserrouter`

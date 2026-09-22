# BrowseRouter

Finicky-style URL router for Android. Decide which browser opens every link, on every app, with first-class support for foldables (VIVO X Fold 5, Samsung Flip 7).

## What this is

BrowseRouter is a React Native Android app that:

1. Registers itself as a browser + share-target on Android.
2. Receives URLs from other apps (Mail, Messages, Slack, etc).
3. Runs your JS/TS routing rules against the URL.
4. Forwards to the chosen browser via Android intent.

Same config syntax as desktop [Finicky v4](https://github.com/johnste/finicky) — copy your `~/.finicky.js` and only adjust browser ids.

## Status

**Phase 0 (scaffold + engine):** ✅ Done. Engine is pure TS, 25 tests green, runs in Node.

**Phase 1+:** See [`.sisyphus/plans/project-plan.md`](./.sisyphus/plans/project-plan.md).

## Quick start

```bash
# install
pnpm install

# run engine tests
pnpm --filter @browse-router/engine test

# build engine + shared
pnpm -r build
```

The mobile app (Phase 1) will be initialized in `apps/mobile/` next.

## Repository layout

```
browse-router/
├── apps/mobile/                  # Expo / React Native app (Phase 1+)
├── packages/
│   ├── engine/                   # Pure TS — URL routing engine, no RN/Expo deps
│   └── shared/                   # Types + default browser catalog + starter config
├── docs/                         # ARCHITECTURE, ANDROID-SETUP, FOLDABLE-UX, RULES-MIGRATION
├── examples/                     # Sample browse-router.config.ts
└── .sisyphus/plans/              # Project plan
```

## Targets

- VIVO X Fold 5 (book-fold, inner 8.03" + outer 6.53")
- Samsung Flip 7 (clamshell, inner 6.7" + cover 3.4")

Build is APK-only — no Play Store submission at MVP. Sideload via `adb install`.

## License

MIT (when we add LICENSE file).

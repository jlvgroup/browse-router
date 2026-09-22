# BrowseRouter — Project Plan

**Repository:** `~/Repositories/JLV/browse-router` (new)
**Owner:** JY (ljieyao) | **Generated:** 2026-09-22
**Reference:** [johnste/finicky](https://github.com/johnste/finicky) — macOS URL router (inspiration only)
**Targets (MVP):** **VIVO X Fold 5** + **Samsung Flip 7** (Android, foldables)
**Build:** APK sideload only — no Play Store submission at MVP

> **Name choice:** "BrowseRouter" — avoids trademark conflict with Finicky and is descriptive of the function.

---

## 1. Vision

A React Native Android app that gives you Finicky-like URL routing control on mobile. Config lives on device, written in JS/TS with the same shape as Finicky v4's desktop config.

**MVP scope:** Android only. iOS code structure exists in the monorepo but is not the build target. Future iOS path is documented but not implemented in MVP.

**Foldable-first UX:** VIVO X Fold 5 (book-fold, inner 8.03" + outer 6.53") and Samsung Flip 7 (clamshell, inner 6.7" + cover 3.4"). App must:
- Handle posture changes (folded / unfolded / tabletop) without losing state
- Use dual-pane on unfolded inner display: rules editor on left, test/preview on right
- Use single-pane on cover/outer: recent URLs + quick "open in X" action sheet
- Respect safe-area insets around hinge and camera cutouts

---

## 2. Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **React Native via Expo (prebuild)** | User chose Expo. Faster bootstrap, EAS Build for APK, dev client for sideload |
| Language | **TypeScript strict** | Matches Finicky v4's TS-first config |
| State | **Zustand** | Tiny, no Redux ceremony |
| Storage | **MMKV** (via `react-native-mmkv`) | Sync, fast, encrypted option |
| UI | **NativeWind** (Tailwind for RN) | Familiar, fast styling |
| Navigation | **Expo Router** | File-based, type-safe, good fit for dual-pane layouts |
| URL parsing | **`react-native-url-polyfill`** | Same `URL` API as desktop rules |
| Config schema | **Zod** | Validate every config input |
| Android chooser | Native `Intent.createChooser` + `ACTION_SEND` filter | Standard pattern |
| Foldable support | `react-native-foldables` (or manual `Dimensions` + `AppState`) | Detect posture / hinge state |
| Build | **EAS Build** (local or cloud) → `.apk` output | Direct sideload to test devices |
| Linting | ESLint + Prettier | Per global conventions |
| Testing | **Vitest** (engine) + **Jest** (components) | Engine is pure TS — test in Node |

**Package manager:** pnpm + workspaces (matches `mlm-mono` pattern).
**Node:** >= 20.
**Expo SDK:** latest stable (SDK 51+ at time of writing).
**Android `minSdkVersion`:** 26 (Android 8.0) — covers VIVO X Fold 5 + Samsung Flip 7.
**Android `targetSdkVersion`:** latest (34 or 35).

---

## 3. Repository Layout

```
browse-router/
├── apps/
│   └── mobile/                        # The Expo / RN app
│       ├── app/                       # Expo Router file-based routes
│       │   ├── (tabs)/
│       │   │   ├── index.tsx          # Home / status
│       │   │   ├── rules.tsx          # Rules editor
│       │   │   ├── browsers.tsx       # Installed browsers picker
│       │   │   └── history.tsx        # Recent URL decisions
│       │   ├── setup.tsx              # First-run: set as default browser
│       │   ├── _layout.tsx
│       │   └── +not-found.tsx
│       ├── android/                   # Native android dir (after `expo prebuild`)
│       │   ├── app/src/main/
│       │   │   ├── AndroidManifest.xml   # http/https VIEW + text/plain SEND filters
│       │   │   └── java/group/jlv/browserouter/
│       │   │       └── IntentReceiverModule.kt  # Bridges intents to JS
│       │   └── build.gradle
│       ├── src/
│       │   ├── bridge/
│       │   │   ├── intent-receiver.ts # Receives URL from native intent
│       │   │   └── chooser.ts         # Forward URL to chosen browser
│       │   ├── store/
│       │   │   ├── rules.ts           # Zustand: rules, config text
│       │   │   └── browsers.ts        # Zustand: installed browsers
│       │   ├── foldable/
│       │   │   ├── use-posture.ts     # Hook: detect folded/unfolded
│       │   │   └── layouts.ts         # Dual-pane vs single-pane layouts
│       │   └── theme/
│       ├── assets/
│       ├── app.config.ts              # Expo config (Android package: group.jlv.browserouter)
│       ├── eas.json                   # EAS Build profiles
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── engine/                        # Pure TS — no RN, no Expo
│   │   ├── src/
│   │   │   ├── matcher.ts             # wildcard + regex matchers (port from Finicky v4)
│   │   │   ├── rewriter.ts            # URL rewrite chain
│   │   │   ├── handler.ts             # handler resolution (first match wins)
│   │   │   ├── context.ts             # Finicky-style context: { url, browsers, options }
│   │   │   ├── sandbox.ts             # Safe JS evaluator (vm-style, see Risks)
│   │   │   ├── schema.ts              # Zod schema for user config
│   │   │   └── index.ts
│   │   ├── test/                      # Vitest — engine is pure, runs in Node
│   │   └── package.json
│   ├── shared/                        # Cross-app types
│   │   ├── src/
│   │   │   ├── types.ts               # Rule, Handler, RewriteRule, Browser, FinickyConfig
│   │   │   └── default-config.ts
│   │   └── package.json
│   └── config/                        # Shared tsconfig + eslint + prettier
├── examples/
│   ├── browse-router.config.ts        # Same shape as desktop ~/.finicky.js
│   └── README.md                      # How to port desktop Finicky config
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ANDROID-SETUP.md               # Set as default browser on VIVO/Samsung
│   ├── FOLDABLE-UX.md                 # Hinge handling, dual-pane rationale
│   └── RULES-MIGRATION.md             # Porting from desktop Finicky v4
├── .sisyphus/
│   └── plans/
│       └── project-plan.md            # this file
├── AGENTS.md                          # Project conventions (extends global)
├── README.md
├── package.json                       # workspace root
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## 4. Phased Roadmap

### Phase 0 — Repo + scaffold + engine port (Day 1-3)
**Goal:** Empty but correctly-structured monorepo, engine tests passing on Node, no native code yet.

1. `mkdir ~/Repositories/JLV/browse-router && cd browse-router && git init`
2. `pnpm init` at root, write `pnpm-workspace.yaml`, root `package.json`, `tsconfig.base.json`
3. Create `packages/engine` with ported matcher + rewriter + handler from Finicky v4 (reference: `https://github.com/johnste/finicky/tree/main/packages/finicky/src` — there is a config parser to study, but we will reimplement, not vendor)
4. Vitest tests for engine covering:
   - Wildcard match (`google.com/*`, `*.example.com`)
   - Regex match
   - Multi-rule rewrite chain (order matters)
   - Default-fallback handler
   - First-match-wins handler resolution
5. Create `packages/shared` types + Zod schema for `FinickyConfig`
6. Create Expo app: `npx create-expo-app@latest apps/mobile --template blank-typescript`
7. Add Expo Router, NativeWind, MMKV, Zustand
8. Write `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/ANDROID-SETUP.md`

**Exit criteria:** `pnpm -r test` green, `pnpm --filter engine build` emits ESM, Expo dev client starts in browser (web preview OK; Android needs sim/device).

### Phase 1 — Android intent + chooser MVP (Week 1-2)
**Goal:** App installed on VIVO X Fold 5 / Samsung Flip 7, receives URL from another app, forwards to chosen browser.

1. `expo prebuild --platform android` — generates native android/ folder
2. Edit `AndroidManifest.xml`:
   - `<intent-filter>` for `http`/`https` with `BROWSABLE` + `DEFAULT` + `VIEW` (so we can be default)
   - `<intent-filter>` for `SEND` with `text/plain` (share-target)
3. Write `IntentReceiverModule.kt` — single-purpose native module that reads incoming intent's `data` URI, emits to JS via `DeviceEventEmitter`
4. JS entry: receive URL → load rules from MMKV → run engine → resolve browser package → launch intent via `Linking.sendIntent` or `IntentLauncher.startActivity`
5. Hardcoded browser table:
   ```
   Chrome:             com.android.chrome
   Firefox:            org.mozilla.firefox
   Brave:              com.brave.browser
   DuckDuckGo:         com.duckduckgo.mobile.android
   Samsung Internet:   com.sec.android.app.sbrowser
   Vivo Browser:       com.vivo.browser
   ```
6. Setup screen: detects if app is default browser, shows instructions for VIVO (Settings → Apps → Default apps → Browser) and Samsung (Settings → Apps → Choose default apps → Browser app)
7. Rules editor: simple textarea (Monaco later), validate via Zod, save to MMKV
8. Debug log: last 50 URL decisions

**Exit criteria:** On VIVO X Fold 5: open Gmail → tap https://example.com → app appears as chooser → engine picks rule → Chrome opens with URL. Same on Samsung Flip 7.

### Phase 2 — Foldable UX (Week 2-3)
**Goal:** App feels native on both devices' form factors.

1. `use-posture` hook: listen to `Configuration` changes + `AppState`, derive `folded | unfolded | tabletop` mode
2. Layout system:
   - **Unfolded (inner display):** dual-pane — rules editor on left (40%), test/preview on right (60%)
   - **Folded (outer/cover):** single-pane with bottom sheet "Open in {browser}" action
   - **Tabletop (Flip 7 half-open on table):** top half = URL preview, bottom half = browser chooser grid
3. Respect hinge insets via `react-native-safe-area-context` + VIVO/Samsung-specific padding
4. Camera cutout handling for Flip 7 cover screen
5. Save/restore rules editor scroll position across posture changes (Zustand persistence)

**Exit criteria:** Smooth posture transitions on both devices without state loss. Dual-pane usable on inner display.

### Phase 3 — Rules editor UX (Week 3-4)
**Goal:** Editing config feels like a tool, not a textarea.

1. Replace textarea with Monaco editor via `react-native-webview` + `@monaco-editor/react` loaded from CDN
2. Live validation via Zod → inline error markers
3. Test rule button: paste URL → see which handler fires → preview
4. Config export/import (JSON file, share sheet)
5. Profile detection: enumerate installed browsers + show their declared URL handlers

**Exit criteria:** User can write a rule, validate, test it, and it works end-to-end.

### Phase 4 — Polish + APK distribution (Week 4-6)
1. History view: every URL that hit the engine, filterable by browser / rule
2. Per-URL override: long-press a forwarded URL → "always use X for this domain"
3. Onboarding flow for non-technical users (visual rule builder as alt to JS)
4. EAS Build local profile → APK signed with debug keystore for sideload
5. ADB install instructions for both devices
6. Crash reporting: optional opt-in Sentry (skip for MVP if adds friction)

---

## 5. Key Engineering Decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| App name | **BrowseRouter** | Avoids Finicky trademark; descriptive |
| Workflow | **Expo with prebuild** | User chose Expo; prebuild gives full native control |
| Target devices | **VIVO X Fold 5** + **Samsung Flip 7** first | Foldable-first UX; both are book-fold form factors |
| Build target | **APK only**, sideload via ADB | No Play Store at MVP |
| Config syntax | Same as Finicky v4 (JS export default) | Single source of truth between desktop + mobile |
| Sync | None — config on device | User confirmed |
| Storage | MMKV | Sync, fast, encrypted-at-rest option |
| Engine is pure TS, no RN/Expo deps | **Mandatory** | Lets us run engine in Vitest, port to other surfaces |
| Package manager | pnpm | Already standard in `mlm-mono` and global conventions |
| Android default-browser assumption | App degrades gracefully if not default | User can use as chooser/share-target even without setting default |
| Android min SDK | 26 (Oreo) | Covers both target devices |
| Android target SDK | Latest (34 or 35) | Per Play Store eventual requirement |
| Android package id | `group.jlv.browserouter` | JLV-owned namespace (group.jlv.* reserved across JLV projects) |

---

## 6. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Hermes has no `vm` module | **Certain** | High | Use `react-native-vm` polyfill, OR pre-compile rules to AST at edit-time using a real JS parser (`@babel/parser`), OR ship a safe-subset interpreter we write ourselves |
| Rules engine has security hole (RCE via malicious config) | Medium | High | Sandbox by design; allow only pure functions + whitelisted globals (`URL`, `console`); reject `eval`, `Function`, `require`, `fetch`, `process` |
| VIVO's custom Android skin (OriginOS / FuntouchOS) blocks default-browser choice | Medium | Medium | Document the exact settings path; fall back to chooser-only mode |
| Samsung's "App Pair" / Fold-specific behavior interferes with intent routing | Medium | Low | Test early on real hardware, not just emulator |
| `expo prebuild` regenerates android/ and overwrites our edits | Certain (by design) | Medium | Use **config plugins** to inject intent filters and native modules declaratively, not by editing android/ directly |
| VIVO X Fold 5 inner display orientation quirks | Medium | Medium | Use `expo-screen-orientation` + manual test on device, not just simulator |
| Monaco in WebView is heavy/buggy on mid-tier Android | Medium | Medium | Fall back to CodeMirror 6, then plain textarea as last resort |
| EAS Build free tier quotas | Low | Low | Use `eas build --local` for sideload APKs |

---

## 7. Open Questions (deferred)

1. **Backend / sync** — out of scope for MVP per user decision.
2. **iOS implementation** — code structure exists, but iOS app is not built at MVP. Document path forward.
3. **App Store release** — deferred until after Android sideload testing validates product.
4. **Visual rule builder** — alternative to JS config for non-technical users. Phase 4 stretch goal.

---

## 8. Critical Rules (project AGENTS.md will encode these)

- **Engine is platform-agnostic.** No RN/Expo imports in `packages/engine`. Test it on Node.
- **Zod validates everything from the user.** Config text, browser URLs, intent extras — never trust raw input.
- **No `any`.** Per global convention.
- **Native modules are typed.** No `any` in bridge signatures.
- **No telemetry by default.** If we add any later, must be opt-in.
- **Conventional commits.** Per global convention. Push approval-gated.
- **bd for issues.** Per global convention.
- **Foldable-aware UI by default.** Every screen must work in folded and unfolded states.

---

## 9. Verification Strategy

| Phase | Verification |
|---|---|
| 0 | `pnpm -r test` green; engine matches Finicky v4 reference fixtures |
| 1 | Real device: external link → engine → target browser (manual ADB test) |
| 2 | Fold/unfold transitions don't lose state; dual-pane usable on inner display |
| 3 | Rules editor: write rule, validate, test it — round-trip |
| 4 | APK installs on both target devices; no crash on common intents |

Engine correctness is verified against a fixture suite ported from `johnste/finicky`'s `testdata/` directory.

---

## 10. Out of Scope (YAGNI)

- iOS implementation (code structure only, no app build at MVP)
- Cloud sync / accounts
- Browser profile selection beyond package name (Android intents don't easily support Chromium `--profile-directory`)
- VPN-layer interception on Android (battery, Play policy, fragile)
- Analytics, telemetry, crash reporting (until needed)
- Localization (English only at MVP; structure for i18n later)
- Visual rule builder for non-technical users (Phase 4 stretch)

---

## 11. First Commits (after this plan is approved)

```
chore: scaffold pnpm workspace + tsconfig base + lint config
feat(engine): port Finicky v4 wildcard + regex matcher
test(engine): matcher fixtures from Finicky testdata
feat(engine): URL rewrite chain with first-match-wins ordering
feat(engine): handler resolution + default fallback
feat(shared): define Rule, Handler, RewriteRule, FinickyConfig types
feat(shared): Zod schema for user config validation
chore(mobile): bootstrap Expo app with TypeScript template
feat(mobile): add Expo Router, NativeWind, MMKV, Zustand
chore: configure EAS Build for local APK output
docs: write AGENTS.md, ARCHITECTURE.md, ANDROID-SETUP.md
```

---

## 12. Next Action

User approves plan → I scaffold `~/Repositories/JLV/browse-router` → run `bd init` → file Phase 0 issues → start Phase 0.

---

**Awaiting user approval before any filesystem writes outside this scratch file.**

# BrowseRouter — Architecture

## High-level

```
+--------------------+       +--------------------+
|  Other apps        |       |  Share-target      |
|  (Mail, Slack)     |       |  (text/plain SEND) |
+----------+---------+       +---------+----------+
           |                          |
           |  Intent.ACTION_VIEW      |  Intent.ACTION_SEND
           |  (http/https URL)        |  (text/plain body)
           v                          v
+----------------------------------------------------------------+
|                    Android IntentResolver                      |
|                    (system-level chooser)                      |
+----------------------------+-----------------------------------+
                             |
                             v
+----------------------------------------------------------------+
|              BrowseRouter (apps/mobile)                        |
|                                                                |
|  +-------------+     +-----------------+     +---------------+ |
|  |  Android    | --> |  Engine         | --> |  Intent       | |
|  |  Intent     |     |  (pure TS)      |     |  Launcher     | |
|  |  Receiver   |     |  resolveUrl()   |     |  (start       | |
|  |  (native)   |     |                 |     |   activity)   | |
|  +-------------+     +-----------------+     +-------+-------+ |
|         ^                                          |           |
|         |                                          v           |
|         |                                  +----------------+  |
|         |                                  |  Target        |  |
|         |                                  |  Browser       |  |
|         |                                  |  (Chrome etc.) |  |
|         |                                  +----------------+  |
|         |                                                      |
|  +------+--------+    +------------------+                     |
|  |  Rules       |    |  Config storage  |                     |
|  |  editor      | <-> |  (MMKV)          |                     |
|  |  (Monaco     |    +------------------+                     |
|  |   via WV)    |                                             |
|  +--------------+                                             |
+----------------------------------------------------------------+
```

## Data flow for a single URL

1. User taps `https://bsky.app/profile/me` in Gmail.
2. Android resolves the intent; user picks BrowseRouter.
3. BrowseRouter's `MainActivity` (or `IntentReceiverModule`) reads the URL.
4. Native module emits an event to JS via `DeviceEventEmitter`.
5. JS-side `intent-receiver.ts` catches the event.
6. Loads the user's config from MMKV (cached in Zustand).
7. Calls `resolveUrl({ config, browsers, inputUrl })` from `@browse-router/engine`.
8. Engine applies rewrites, walks handlers, returns `EngineDecision`.
9. JS calls `Linking.sendIntent()` with the chosen browser's package name + URL.
10. Android launches the target browser; user sees the URL in that browser.

## Why a pure-TS engine

Three reasons:

1. **Testability** — runs in Node with Vitest, no simulator needed. Phase 0 shipped with 25 tests covering matchers, rewrites, handlers, sandbox — all green.
2. **Reusability** — same engine can power a CLI (`npx browse-router --config ./config.ts --url https://...`), a web playground, or even a desktop port later.
3. **Hermes compatibility** — RN's Hermes JS engine lacks `vm`. The pure engine has no `vm` calls; it takes a *parsed* config as input. Parsing happens in `evaluateConfigForNode` (Node path). For RN, we'll need an alternative parser — see Hermes limitation below.

## Hermes limitation (Phase 1 work)

`vm.createContext` doesn't exist in Hermes. So the Node-side `evaluateConfigForNode` works only on the dev machine and in tests. The RN app must evaluate user config differently.

**Two viable approaches:**

A. **Pre-compile at edit-time.** When the user saves a rule in the editor, use `@babel/parser` + `@babel/traverse` (pure JS, works in Hermes) to convert the config to an AST, validate it, and serialize the result. The runtime then executes a pre-validated, pre-parsed config object — no `vm` needed.

B. **Ship a minimal interpreter.** Hand-rolled interpreter for our restricted config subset (object literals, function declarations with parameter destructuring, member access, return statements). Risky, security-critical code.

**Decision:** Approach A. Phase 1 implements the Babel pre-compiler. Users get full Finicky v4 syntax; runtime gets a safe object.

## Package boundaries

- `@browse-router/shared` — types and defaults. Zero runtime deps.
- `@browse-router/engine` — routing logic. Deps: `@browse-router/shared`, `zod`.
- `apps/mobile` — RN/Expo app. Deps: both packages plus RN ecosystem.

## Phase 1 build order

1. `apps/mobile` bootstrap via `create-expo-app`.
2. Add Expo Router, NativeWind, MMKV, Zustand.
3. Wire `@browse-router/engine` into the app's bundler (Metro config).
4. Implement `IntentReceiverModule` as Expo config plugin (not direct android/ edits).
5. Implement Babel pre-compiler for user config.
6. Rules editor (textarea first, Monaco later).
7. EAS Build → APK.

## See also

- `ANDROID-SETUP.md` — setting BrowseRouter as default browser on VIVO / Samsung.
- `FOLDABLE-UX.md` — hinge handling and dual-pane strategy.
- `RULES-MIGRATION.md` — porting desktop Finicky v4 config.

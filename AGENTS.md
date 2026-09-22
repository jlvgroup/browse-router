# BrowseRouter — Project AGENTS.md

**Generated:** 2026-09-22 | **Owner:** JY (ljieyao)

Global conventions live in `~/.config/opencode/AGENTS.md`. This file only adds project-specific rules.

## Stack

- **Engine** (`packages/engine`): Pure TypeScript, no RN/Expo dependencies. Runs in Node.
- **Shared** (`packages/shared`): Pure TS types + browser catalog + starter config.
- **App** (`apps/mobile`, Phase 1+): Expo + React Native + TypeScript strict.

## Commands

```bash
# install
pnpm install

# engine tests
pnpm --filter @browse-router/engine test
pnpm --filter @browse-router/engine test:watch

# build everything (engine + shared)
pnpm -r build

# typecheck everything
pnpm -r typecheck

# all tests
pnpm -r test
```

## Critical Rules

### Engine is platform-agnostic
- **No RN/Expo imports** in `packages/engine`. Test it on Node.
- This lets us reuse the engine in CLI tools, web UIs, or test fixtures later.
- If you need a platform-specific feature, put it in `apps/mobile` and call into the engine.

### Zod validates everything from the user
- Config text from the editor → must go through `validateConfig` before persisting.
- Browser URLs, intent extras, share-target payloads — never trust raw input.
- No `JSON.parse(text)` without a Zod schema immediately after.

### No `any`
- Per global convention. Use `unknown` at trust boundaries, then narrow.
- Native bridge signatures: typed both directions.

### Foldable-aware UI by default
- Every screen must work in `folded` and `unfolded` states.
- Listen to `Dimensions` + `AppState` changes; preserve scroll/editor state across transitions.
- Respect hinge insets via `react-native-safe-area-context`.
- VIVO X Fold 5 has an inner display ~8" wide — use dual-pane layouts there.
- Samsung Flip 7 cover screen is small — single-pane, large tap targets.

### Conventional commits
- Format: `<type>(<scope>): <description>` per global convention.
- Push approval-gated — present diff and wait for explicit `go`.

### bd for issues
- All task tracking in bd, not markdown TODOs.

## Sandbox safety (engine)

User-authored config is evaluated in a `vm` sandbox (Node path) or pre-compiled AST (RN path — Phase 1+). Rules:

- Allow only pure functions + whitelisted globals: `URL`, `console`.
- Reject `eval`, `Function`, `require`, `fetch`, `process`, `globalThis`.
- Sandbox has a 1s timeout.
- Schema-validate the parsed object before returning.

## Browser id convention

Android package names ARE the browser ids. This is what the engine stores and what the app uses as intent target:

| Browser | id / package |
|---|---|
| Chrome | `com.android.chrome` |
| Firefox | `org.mozilla.firefox` |
| Brave | `com.brave.browser` |
| DuckDuckGo | `com.duckduckgo.mobile.android` |
| Samsung Internet | `com.sec.android.app.sbrowser` |
| Vivo Browser | `com.vivo.browser` |

To add a browser: edit `packages/shared/src/default-config.ts` and add a `Browser` entry.

## Naming conventions

- File names: `kebab-case.ts` (e.g. `intent-receiver.ts`).
- Class names: `PascalCase`.
- Test files: co-located in `test/` directory of each package, named `<module>.test.ts`.
- Branch names: `feat/...`, `fix/...`, `chore/...`.

## Package layout

```
packages/
├── engine/
│   ├── src/                    # Source
│   │   ├── matcher.ts          # Wildcard + regex matching
│   │   ├── engine.ts           # resolveUrl — main entry
│   │   ├── schema.ts           # Zod schema for FinickyConfig
│   │   ├── sandbox.ts          # vm-based safe JS evaluator (Node)
│   │   └── index.ts
│   ├── test/                   # Vitest tests, one file per module
│   ├── dist/                   # Build output (gitignored)
│   └── tsconfig.json
└── shared/
    ├── src/
    │   ├── types.ts            # FinickyConfig, Browser, Handler, RewriteRule
    │   ├── default-config.ts   # Browser catalog + STARTER_CONFIG
    │   └── index.ts
    ├── dist/                   # Build output (gitignored)
    └── tsconfig.json
```

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:1105d646 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/core-concepts/sync-concepts.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->
## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/core-concepts/sync-concepts.md for details and anti-patterns.
<!-- END BEADS CODEX SETUP -->

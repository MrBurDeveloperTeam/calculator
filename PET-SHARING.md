# Calculator shared cat

Calculator and its pet-function dependency use version **0.12.2**.
The manifest and lockfile target GitHub tag `v0.12.2`, resolving to
`8a1993a66d60087829519c053ee7de0ed3475320`. The npm build approval matches
that release commit.
No file: dependency or sibling symlink is configured.
The canonical package is maintained in the separate `intern/pet-function` repository.

Shared: cat/pet rendering, care and game runtime, AI chat presentation,
pet options/resources and the shared mini-games.
`petExperience/MeowdokuLauncher.tsx` only connects the account and persistence adapter.

Shared: calculator cost/saved-plan projections, reminders, data-chat routing and
follow-ups, mutation guard, account ownership/readiness checks, AI orchestration,
cat configuration reads, support UI, visit/currency behavior and pet persistence.
The 27 original host modules are retained in full as line comments between
PET_FUNCTION_ARCHIVE_BEGIN and PET_FUNCTION_ARCHIVE_END, followed by thin wiring.
Do not uncomment archived implementations alongside shared code.

Local boundaries: authenticated Supabase client, Calculator/Auth contexts, server AI
transport, page navigation/actions and account-keyed component mounting. These are
injected into pet-function; no new database query, write, schema or paid AI call was added.
The existing account, location and currency wiring is retained.
No database schema or online records were changed.

`scripts/prepare-pet.mjs` restores and verifies the installed release's resource
packs and copies shared non-game images before dev/build.
The shared Vite plugin serves package games directly in development and emits
identical games to `dist/games` during deployment builds.
The postbuild script splits oversized WASM and PCK files, verifies their bytes,
and patches Godot loaders to reconstruct them, including Kart Racing's shared
engine. All deployment assets must remain within 25 MiB.
No executable game copies remain in `public/games`.
The historical image path `molar-experience` is not an old package dependency.

```
npm run build
node node_modules/typescript/bin/tsc -p tsconfig.pet-check.json --noEmit
node scripts/verify-pet.mjs
node --test tests/cloudflare-game-assets.node-test.mjs
```

Manually check authenticated calculator-aware dialogue, care/shop balances,
all game rewards and saves, Meowdoku check-in/progress, and account switching.
Updating shared source alone does not update a deployed site: release a new version/tag,
update the dependency and lockfile, then rebuild/redeploy Calculator.
This integration adds no paid import operation or paid service.

Resource verification compares every emitted game file with the installed
release, reconstructs split WASM/PCK byte-for-byte, and checks deployment asset
sizes. Run it after the production build. The resource regression tests use
temporary local files and mocked fetch; no real database or AI calls are needed.
No database migration is required for this version update.
Commit the manifest, regenerated lockfile, resource scripts, documentation and
regression tests together. Generated dist and public/pet-function stay untracked.

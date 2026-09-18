# Calculator shared cat

Calculator's manifest targets `@mrburdeveloperteam/pet-function` GitHub tag `v0.9.14`.
The official v0.9.14 dependency is installed and the regenerated lockfile resolves
to `efcd6e4aca7d9f13f2dd4ebcbac1ee98617f1c75`, matching the GitHub tag.
node_modules no longer uses the earlier local validation tarball.
No file: dependency or sibling symlink is configured.
The canonical package is maintained in the separate `intern/pet-function` repository.

Shared: cat/pet rendering, care and game runtime, AI chat presentation,
pet options/resources and all four games (Flappy Cat, Pac-Cat, Tetris, Meowdoku).
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

`scripts/prepare-pet.mjs` restores shared non-game images before dev/build.
The shared Vite plugin serves package games directly in development and emits
identical games to `dist/games` during deployment builds.
No executable game copies remain in `public/games`.
The historical image path `molar-experience` is not an old package dependency.

```
npm run build
node node_modules/typescript/bin/tsc -p tsconfig.pet-check.json --noEmit
node scripts/verify-pet.mjs
```

Manually check authenticated calculator-aware dialogue, care/shop balances,
all game rewards and saves, Meowdoku check-in/progress, and account switching.
Updating shared source alone does not update a deployed site: release a new version/tag,
update the dependency and lockfile, then rebuild/redeploy Calculator.
This integration adds no paid import operation or paid service.

Local v0.9.14 validation: package and production app builds passed, frontend and package
type checks passed, shared tests passed including calculator parity/privacy checks, and
all 82 shared game files matched. Tests use mocks and make no paid AI/live database calls.
No commit, push, tag, publication or deployment was performed.

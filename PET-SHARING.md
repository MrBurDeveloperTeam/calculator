# Calculator shared cat

Calculator imports `@mrburdeveloperteam/pet-function` from GitHub tag `v0.9.10`.
The canonical package is maintained in the separate `intern/pet-function` repository.

Shared: cat/pet rendering, care and game runtime, AI chat presentation,
pet options/resources and all four games (Flappy Cat, Pac-Cat, Tetris, Meowdoku).
`petExperience/MeowdokuLauncher.tsx` only connects the account and persistence adapter.

Local: calculator dialogue and queries in `components/CatMascot.jsx`,
business/data orchestration in `aiExperience/profitCalculatorMolarAdapter.ts`,
and persistence in `petExperience/calculatorPetRepository.ts`.
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

Migration validation: production build and exact comparison of 82 shared game files passed.
The frontend type check still reports three errors in existing data-chat definitions:
`CalculatorDataStatus` is referenced without a local import and the adapter's
`calculatorState: unknown` is passed to a resolver expecting `GlobalState` (two call sites).
Those business/data definitions were deliberately left unchanged.

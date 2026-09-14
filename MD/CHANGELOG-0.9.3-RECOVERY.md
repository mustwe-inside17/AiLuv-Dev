# AiLuv 0.9.3 Recovery

Recovered the validated 0.9.3 application composition after an unrelated-history Git merge kept an older `App.tsx`.

## Restored

- Screen-level lazy loading and the shared `Suspense` loading fallback.
- Narrow Zustand action selectors to avoid unrelated application rerenders.
- Character quest choice close handler wiring between `useGameInteractions` and `GlobalModals`.
- Semantic `game-shell` styling with reduced persistent blur/compositing cost.

## Verification

- TypeScript (`tsc --noEmit`): pass.
- Quest-state tests: 3/3 pass.
- Vite production build: pass.
- Main JavaScript bundle: 990.07 kB / 272.22 kB gzip.

The build still warns that `services/mockAi.ts` is both statically and dynamically imported. This is retained for a later performance phase.

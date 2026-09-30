# Working in this repo

The Splitsheet landing page, a static Next.js export. The product lives in
`splitsheet-web`, and its API in `splitsheet-api`. See `README.md`.

## Checks

`npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run verify:vendor`, and
`npm run build` all run in CI and should pass before a commit. On Windows machines
where Application Control blocks the native SWC binaries, pass `--webpack` to
`dev` and `build`.

## Conventions

- Single quotes, no semicolons, 2-space indent. TypeScript is `strict`; no `any`,
  no `@ts-ignore`, no `eslint-disable`.
- Comments explain *why*, not *what*.
- **Never edit the vendored files**: `lib/expense-data.ts`, `lib/insights.ts`,
  `test/expense-data.test.ts`, `test/insights.test.ts`. Change them in
  splitsheet-web, copy them across unchanged, then run
  `npm run verify:vendor -- --update`. See `docs/adr/0002`.
- The page never does its own money arithmetic. Anything shown as a balance,
  share, or transfer comes from the vendored functions.
- Links and quoted figures go in `lib/site.ts`, not inline in a section.
- Sections are Server Components. Add `'use client'` only where a visitor
  interacts; reveal-on-scroll is a `data-reveal` attribute, not a wrapper.

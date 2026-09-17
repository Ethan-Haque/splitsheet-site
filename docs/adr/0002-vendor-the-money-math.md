# 2. Vendor the app's money math instead of reimplementing it for the demo

Date: 2026-09-27 · Status: accepted

## Context

The hero demo shows balances and a settle-up plan. A marketing demo usually fakes
this with hand-written arithmetic that looks right. For a page whose readers
include engineers, that would undercut the one thing Splitsheet claims: the
numbers are exact, and identical on every client.

`splitsheet-web/lib/expense-data.ts` imports nothing, and `lib/insights.ts` imports
only it.

## Decision

Copy both files and their test suites across byte-for-byte, at the same paths, so
even their `@/lib/...` imports resolve unchanged. `tools/verify-vendor.mjs` pins
their SHA-256 digests (with line endings normalized to LF) in
`tools/vendor.sha256`, and CI runs it.

The demo's own logic, `lib/demo.ts`, only holds state. It never computes a
balance, share, or transfer.

## Consequences

- The demo is provably the product's math, and the vendored suites run here too.
- An accidental edit fails CI with instructions for the right fix.
- `--against <path>` compares directly with a local checkout of the app, which is
  how a re-sync is confirmed. CI can't do this, because it can't see that repo.
- **Cost, accepted:** a change in the app isn't picked up automatically. The copy
  lags until someone re-syncs it. A published package was rejected: it is more
  machinery than two small files justify, and it would hide the identity the copy
  demonstrates.

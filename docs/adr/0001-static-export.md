# 1. Ship the landing page as a static export

Date: 2026-09-27 · Status: accepted

## Context

The page has no per-request data. Its only dynamic part, the live splitter, runs
entirely in the browser. It could be deployed like the app (a standalone Node
server in Docker) or exported to plain files.

It was also possible to put the page inside splitsheet-web itself. But `/` there is
the signed-in dashboard, so the landing page would have needed to either wait on
the auth probe or take over `/` and move every app route.

## Decision

A separate repo, built with `output: 'export'` and served by nginx.

## Consequences

- There's nothing to run or patch at runtime, and the first byte is a file read.
  The page can sit on any static host.
- Everything computed from the vendored math (the anatomy table, the greedy
  example, the OG image) is computed once at build time. The HTML carries the
  finished numbers.
- The app is untouched: its routes, auth gate, and e2e tests stay as they were.
- **Cost, accepted:** no image optimizer. The screenshots are pre-sized WebP,
  and `images.unoptimized` is set.
- **Cost, accepted:** metadata routes export without file extensions
  (`/opengraph-image`), so `nginx.conf` sets that file's content type explicitly.

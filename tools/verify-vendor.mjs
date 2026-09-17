#!/usr/bin/env node
/**
 * Guards the claim the live demo makes: it runs splitsheet-web's own money
 * math, not a lookalike. The files below are copied from that repo unedited
 * (docs/adr/0002), and their SHA-256 digests are pinned in tools/vendor.sha256.
 *
 * CI cannot see the other repo, so the manifest is what it checks. That catches
 * the drift that actually happens here: someone "tidying" a vendored file, or a
 * formatter reaching into it. With a local checkout of the app, --against
 * compares straight to its files as well, which is how a re-sync is confirmed.
 *
 *   node tools/verify-vendor.mjs                              # verify (CI)
 *   node tools/verify-vendor.mjs --against ../splitsheet-web  # also diff the source repo
 *   node tools/verify-vendor.mjs --update                     # re-pin after a deliberate re-sync
 */
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const manifestPath = join(root, 'tools', 'vendor.sha256')

/** Same relative path in both repos. */
const VENDORED = [
  'lib/expense-data.ts',
  'lib/insights.ts',
  'test/expense-data.test.ts',
  'test/insights.test.ts',
]

/**
 * Digest of the content with line endings normalised to LF. What is pinned is
 * the code, not how git happened to check it out on this machine; any real edit
 * still moves the hash.
 */
async function digest(file) {
  const text = await readFile(file, 'utf8')
  return createHash('sha256').update(text.replace(/\r\n/g, '\n'), 'utf8').digest('hex')
}

async function digests(base) {
  return new Map(await Promise.all(VENDORED.map(async (p) => [p, await digest(join(base, p))])))
}

const current = await digests(root)

if (process.argv.includes('--update')) {
  const body = [...current].map(([p, h]) => `${h}  ${p}`).join('\n')
  await writeFile(manifestPath, `${body}\n`)
  console.log(`Pinned ${current.size} vendored files.`)
  process.exit(0)
}

let expected
try {
  expected = new Map(
    (await readFile(manifestPath, 'utf8'))
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [hash, path] = line.split('  ')
        return [path, hash]
      }),
  )
} catch {
  console.error('No manifest at tools/vendor.sha256. Run with --update to create it.')
  process.exit(1)
}

const problems = []
for (const path of VENDORED) {
  if (!expected.has(path)) problems.push(`unpinned: ${path}`)
  else if (expected.get(path) !== current.get(path)) problems.push(`modified: ${path}`)
}
for (const path of expected.keys()) {
  if (!current.has(path)) problems.push(`stale pin: ${path}`)
}

const againstAt = process.argv.indexOf('--against')
if (againstAt !== -1) {
  const source = resolve(process.argv[againstAt + 1] ?? '')
  let upstream
  try {
    upstream = await digests(source)
  } catch (err) {
    console.error(`Cannot read the source repo at ${source}: ${err.message}`)
    process.exit(1)
  }
  for (const [path, hash] of upstream) {
    if (current.get(path) !== hash) problems.push(`differs from ${source}: ${path}`)
  }
}

if (problems.length > 0) {
  console.error('Vendored money math has drifted from splitsheet-web:\n')
  for (const p of problems) console.error(`  ${p}`)
  console.error(
    [
      '',
      'These files are copied from splitsheet-web unedited (docs/adr/0002).',
      'Make the change there first, copy the file across as-is, then re-pin with:',
      '',
      '  npm run verify:vendor -- --update',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

console.log(`Vendored math intact: ${current.size} files match the pinned copy.`)

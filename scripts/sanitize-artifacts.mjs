#!/usr/bin/env node
/**
 * Sanitize the built artifacts, then fail the build if anything machine-specific
 * survived.
 *
 * Why this exists: the harness client build preset emits virtual module ids that
 * embed the ABSOLUTE source path (for example the global-CSS loader writes
 * `\0dsh-global-css:<virtual>/global.css.mjs` into a
 * `//#region` comment). That comment ships inside `lib/client.js`, which every
 * browser loading the plugin downloads, so an absolute path there leaks the
 * host user name, home layout and checkout location. The preset lives in the
 * dsh checkout and cannot be changed from here, so the artifact is scrubbed on
 * the way out — and the scrub is verified, so a future layout cannot silently
 * reintroduce a leak.
 *
 * Usage:
 *   node scripts/sanitize-artifacts.mjs [package-dir]
 *
 * Exit code 0 means every artifact is clean.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { hostname } from 'node:os'
import { join, relative, resolve } from 'node:path'

const packageDir = resolve(process.argv[2] ?? join(import.meta.dirname, '..'))
const libDir = join(packageDir, 'lib')

/** Absolute or host-identifying patterns that must never reach an artifact. */
const forbidden = [
  { label: 'home directory path', pattern: /\/home\/[A-Za-z0-9._-]+/ },
  { label: 'macOS user path', pattern: /\/Users\/[A-Za-z0-9._-]+/ },
  { label: 'Windows user path', pattern: /[A-Za-z]:[\\/]Users[\\/]/ },
  { label: 'Windows mount path', pattern: /\/mnt\/[a-z]\// },
  { label: 'root home path', pattern: /\/root\// },
  { label: 'temporary path', pattern: /\/tmp\// },
  { label: 'host name', pattern: new RegExp(hostname(), 'i') },
]

/** Text rewrites applied to every artifact; a function receives the match groups. */
const rewrites = [
  // Virtual module ids such as `\0dsh-global-css:<absolute path>`: the path is
  // what leaks. Keep the file name so the id stays unique per source file.
  [
    /(\\0[a-z0-9-]+:)((?:\/|[A-Za-z]:[\\/])[^\s"'\\)]*)/gi,
    (_match, prefix, absolute) => `${prefix}<virtual>/${absolute.split(/[\\/]/).pop()}`,
  ],
  // Defence in depth: any absolute home path that reached a string literal.
  [/\/home\/[^/\s"']+/g, '<home>'],
  [/\/Users\/[^/\s"']+/g, '<home>'],
  [/[A-Za-z]:[\\/]Users[\\/][^\\/\s"']+/g, '<home>'],
  [/\/mnt\/[a-z]\//g, '<mnt>/'],
]

/** Every file under `lib/`, recursively. */
function artifactFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return artifactFiles(path)
    return entry.isFile() && statSync(path).isFile() ? [path] : []
  })
}

/**
 * Point a sourcemap's `sources` at the package root instead of the build
 * staging path, so the map resolves from `lib/` without naming the checkout.
 * @param map - the parsed sourcemap.
 * @returns whether anything changed.
 */
function localizeSources(map) {
  if (!Array.isArray(map.sources)) return false
  let changed = false
  map.sources = map.sources.map((source) => {
    if (typeof source !== 'string') return source
    const localized = source
      .replace(/^(?:\.\.\/)+.*?\/(src\/.*)$/, '../$1')
      .replace(/^\/home\/[^/]+/i, '<home>')
      .replace(/^\/Users\/[^/]+/i, '<home>')
    if (localized !== source) changed = true
    return localized
  })
  return changed
}

let changedFiles = 0
const violations = []

for (const file of artifactFiles(libDir)) {
  const original = readFileSync(file, 'utf8')
  let text = original

  if (file.endsWith('.map')) {
    try {
      const map = JSON.parse(text)
      if (localizeSources(map)) text = JSON.stringify(map)
    } catch {
      violations.push(`${relative(packageDir, file)}: unparsable sourcemap`)
      continue
    }
  }

  for (const [pattern, replacement] of rewrites) text = text.replace(pattern, replacement)

  if (text !== original) {
    writeFileSync(file, text)
    changedFiles += 1
    console.log(`sanitized ${relative(packageDir, file)}`)
  }

  for (const { label, pattern } of forbidden) {
    const match = text.match(pattern)
    if (match !== null) violations.push(`${relative(packageDir, file)}: ${label} (${match[0]})`)
  }
  if (/\.\.\/\.\.\/\.\.\//.test(text)) {
    violations.push(`${relative(packageDir, file)}: build staging path (../../../)`)
  }
}

if (violations.length > 0) {
  console.error('sanitize-artifacts: machine-specific content found in lib/:')
  for (const violation of violations) console.error(`  - ${violation}`)
  process.exit(1)
}
console.log(`sanitize-artifacts: clean (${changedFiles} file(s) rewritten)`)

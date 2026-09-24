#!/usr/bin/env bash
#
# Build dsh-whale-particles-bg against a dsh checkout.
#
# Why staging is required: the shared tsdown preset
# (packages/client/tsdown.client.ts) resolves a package manifest by name under
# `packages/*/*` and throws for any package outside the workspace, so the
# sources are staged inside the checkout for the build and removed afterwards.
# The installable artifact this script produces is the built package in this
# directory: package.json + lib/index.js (node half) + lib/client.js (browser
# bundle).
#
# Usage:
#   scripts/build.sh <checkout-dir>
#   DSH_CHECKOUT=/path/to/deepseek-harness scripts/build.sh
#
# The checkout is always given explicitly: no personal directory layout is
# assumed, and nothing outside this package is read except the checkout named
# here and removed again on exit.
set -euo pipefail

PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_NAME="dsh-whale-particles-bg"

CHECKOUT="${1:-${DSH_CHECKOUT:-}}"
if [ -z "${CHECKOUT:-}" ] || [ ! -d "$CHECKOUT" ]; then
  echo "build: pass a dsh checkout: scripts/build.sh /path/to/deepseek-harness" >&2
  echo "       (or set DSH_CHECKOUT to the same path)" >&2
  exit 1
fi

STAGE="$CHECKOUT/packages/client/$PKG_NAME"

# The checkout is the deployment's own source tree: whether the build succeeds
# or fails, it must come back exactly as it was. `pnpm install` rewrites the
# lockfile and the workspace policy, so both are snapshotted up front and put
# back verbatim — no `git checkout`, which would also discard the user's own
# local edits to those files.
SNAPSHOT="$(mktemp -d)"
for file in pnpm-lock.yaml pnpm-workspace.yaml; do
  [ -f "$CHECKOUT/$file" ] && cp "$CHECKOUT/$file" "$SNAPSHOT/$file"
done
cleanup() {
  if [ -d "$STAGE" ]; then
    echo "==> restoring the checkout"
    rm -rf "$STAGE"
    (cd "$CHECKOUT" && pnpm install >/dev/null 2>&1 || true)
    for file in pnpm-lock.yaml pnpm-workspace.yaml; do
      [ -f "$SNAPSHOT/$file" ] && cp "$SNAPSHOT/$file" "$CHECKOUT/$file"
    done
  fi
  rm -rf "$SNAPSHOT"
}
trap cleanup EXIT

echo "==> checkout: $CHECKOUT"
echo "==> staging sources into $STAGE"
rm -rf "$STAGE"
mkdir -p "$STAGE"
cp "$PKG_DIR/package.json" "$PKG_DIR/tsconfig.json" "$PKG_DIR/tsdown.config.ts" "$STAGE/"
cp -r "$PKG_DIR/src" "$STAGE/src"

echo "==> pnpm install (links the staged workspace package and its dev dependencies)"
(cd "$CHECKOUT" && pnpm install)

echo "==> tsc -b (src -> lib/types)"
(cd "$CHECKOUT" && node ./node_modules/typescript/bin/tsc -b "packages/client/$PKG_NAME")

echo "==> tsdown (lib/types -> lib/index.js + lib/client.js)"
# The Client build face is required: without it the shared preset bundles the
# dev entry `src/client/index.ts`, while this package's browser entry is
# `src/client/index.tsx` and compiles to `lib/types/client/index.js`. The face
# is also what the repository's own client pass uses, so the artifact shape
# matches a shipped plugin exactly.
(cd "$STAGE" && "$CHECKOUT/node_modules/.bin/tsdown" --env.DSH_BUILD_FACE client)

echo "==> collecting artifacts"
rm -rf "$PKG_DIR/lib"
cp -r "$STAGE/lib" "$PKG_DIR/lib"
# TypeScript intermediates are not part of the package surface (package.json
# exposes lib/index.js and lib/client.js only), so they are not shipped.
rm -rf "$PKG_DIR/lib/types"
rm -f "$PKG_DIR/lib/tsconfig.tsbuildinfo"

# The client preset bakes absolute source paths into virtual module ids, which
# would ship the host user name and checkout location to every browser. Scrub
# them and fail the build if anything machine-specific survived.
echo "==> sanitizing artifacts"
node "$PKG_DIR/scripts/sanitize-artifacts.mjs" "$PKG_DIR"

echo "==> artifacts"
ls -la "$PKG_DIR/lib"

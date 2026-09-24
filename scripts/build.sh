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
#   scripts/build.sh [checkout-dir]
#
# Without an argument the newest the checkout named by DSH_CHECKOUT checkout is used.
set -euo pipefail

PKG_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_NAME="dsh-whale-particles-bg"
DEFAULT_ROOT="${DSH_CHECKOUT:-}"

if [ "$#" -ge 1 ]; then
  CHECKOUT="$1"
else
  CHECKOUT="$(ls -d "$DEFAULT_ROOT"/dsh-v* 2>/dev/null | sort -V | tail -1 || true)"
fi
if [ -z "${CHECKOUT:-}" ] || [ ! -d "$CHECKOUT" ]; then
  echo "build: no checkout found; pass one explicitly: scripts/build.sh /path/to/deepseek-harness" >&2
  exit 1
fi

STAGE="$CHECKOUT/packages/client/$PKG_NAME"

# The checkout is the deployment's own source tree: whether the build succeeds
# or fails, it must come back without the staged package or a rewritten lockfile.
cleanup() {
  if [ -d "$STAGE" ]; then
    echo "==> restoring the checkout"
    rm -rf "$STAGE"
    (cd "$CHECKOUT" && pnpm install >/dev/null 2>&1 || true)
    if (cd "$CHECKOUT" && git rev-parse --git-dir >/dev/null 2>&1); then
      (cd "$CHECKOUT" && git checkout -- pnpm-lock.yaml 2>/dev/null || true)
    fi
  fi
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
rm -f "$PKG_DIR/lib/tsconfig.tsbuildinfo"

echo "==> artifacts"
ls -la "$PKG_DIR/lib"

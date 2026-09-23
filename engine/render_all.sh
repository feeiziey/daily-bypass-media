#!/usr/bin/env bash
# Render every episode that has no finished video at the repo root yet, one at a time.
set -euo pipefail
cd "$(dirname "$0")"
for ep in episodes/*/; do
  slug=$(basename "$ep")
  [ -f "../$slug.mp4" ] && { echo "skip $slug"; continue; }
  echo "== $slug"
  python3 render.py "$ep" --workers "${WORKERS:-3}"
  cp "$ep/build/$slug.mp4" "../$slug.mp4"
done

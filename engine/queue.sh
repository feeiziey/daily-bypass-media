#!/usr/bin/env bash
# Render episode slugs one at a time. A shared flock serialises every queue on this machine.
cd "$(dirname "$0")"
LOCK=/tmp/bypass_render.lock
for slug in "$@"; do
  flock "$LOCK" bash -c "echo \"== $slug \$(date +%T)\"; python3 render.py episodes/$slug --workers \${WORKERS:-3} && cp episodes/$slug/build/$slug.mp4 ../ && echo \"done $slug \$(date +%T)\""
done

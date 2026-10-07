#!/bin/sh
# Rebuilds quizzes/ukraine-codes/fine.js, fine-geo.js and codes.js. Puts these scripts into the working folder
# (tools/cache/builds/ukraine-codes: downloads and intermediates, not committed) and runs them there.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$HERE/../../cache/builds/ukraine-codes"
mkdir -p "$WORK"
cp -R "$HERE"/. "$WORK"/
bash "$WORK/run_all.sh"

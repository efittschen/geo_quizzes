#!/bin/sh
# Rebuilds quizzes/new-zealand-codes/data.js + geo.js. Puts these scripts into the working folder
# (tools/cache/builds/new-zealand-codes: downloads and intermediates, not committed) and runs them there.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$HERE/../../cache/builds/new-zealand-codes"
mkdir -p "$WORK"
cp -R "$HERE"/. "$WORK"/
cd "$WORK"
WRITE=1 node assign2.mjs
sh build.sh
node check.mjs

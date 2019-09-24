#!/usr/bin/env bash

# Build Angular stuffs
rm -rf docs
ng build --prod --base-href "/mh-monster-info/" --output-path docs

# Commit newly generated assets
git add docs/
git commit -m "Updated github pages" -n

# Generate the git info
GIT_BRANCH=`git rev-parse --abbrev-ref HEAD`
GIT_COMMIT=`git rev-parse HEAD`
GIT_REMOTE_ORIGIN_URL=`git config --get remote.origin.url`

echo -e "{\"gitBranch\": \"${GIT_BRANCH}\",\"gitCommit\": \"${GIT_COMMIT}\",\"gitRemoteOriginUrl\": \"${GIT_REMOTE_ORIGIN_URL}\"}" > src/assets/git-info.json
cp src/assets/git-info.json docs/assets/git-info.json

# Commit the git info
git add docs/assets/git-info.json
git commit -m "Updated git version info" -n

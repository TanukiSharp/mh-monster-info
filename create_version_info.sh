#!/usr/bin/env bash
GIT_BRANCH=`git rev-parse --abbrev-ref HEAD`
GIT_COMMIT=`git rev-parse HEAD`
GIT_REMOTE_ORIGIN_URL=`git config --get remote.origin.url`

mkdir -p docs/assets

echo -e "{\"gitBranch\": \"${GIT_BRANCH}\",\"gitCommit\": \"${GIT_COMMIT}\",\"gitRemoteOriginUrl\": \"${GIT_REMOTE_ORIGIN_URL}\"}" > src/assets/git-info.json
cp src/assets/git-info.json docs/assets/git-info.json

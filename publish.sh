#!/usr/bin/env bash
LOCATION=https://tanukisharp.github.io/mh-monster-info/

rm -rf docs
ng build -prod --base-href "${LOCATION}" --deploy-url "${LOCATION}" --output-path docs

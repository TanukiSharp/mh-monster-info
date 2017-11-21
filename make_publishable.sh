#!/usr/bin/env bash
rm -rf docs
ng build -prod --base-href "docs" --output-path docs

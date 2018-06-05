#!/usr/bin/env bash
rm -rf docs
ng build -prod --base-href "/mh-monster-info/" --output-path docs

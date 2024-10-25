#!/usr/bin/env bash

set -eo pipefail

sf org create scratch -f config/project-scratch-def.json \
  --alias sfdx-plugin-package-xml-dev \
  --set-default
sf project deploy start

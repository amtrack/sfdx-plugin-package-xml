#!/usr/bin/env bash

set -eo pipefail

sf org create scratch -f config/project-scratch-def.json \
  -a sfdx-plugin-package-xml-dev \
  -d
sf project deploy start

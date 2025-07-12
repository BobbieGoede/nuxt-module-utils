#!/bin/sh
set -e

# Default to 'latest' if no argument is provided
VERSION=${1:-latest}

echo "Switching to nuxt version: $VERSION"
pnpm i nuxt@$VERSION @nuxt/kit@$VERSION @nuxt/schema@$VERSION
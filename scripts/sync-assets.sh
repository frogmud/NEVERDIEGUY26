#!/bin/bash
# Sync assets from design-system to public
set -e

DS="./design-system"
PUB="./public"

echo "Syncing assets from design-system to public..."

# Create public structure
mkdir -p "$PUB"/{assets,icons,illustrations,logos,lottie,fonts}

# Sync main assets
rsync -av --delete "$DS/assets/" "$PUB/assets/"

# Sync top-level dirs
rsync -av --delete "$DS/icons/" "$PUB/icons/"
rsync -av --delete "$DS/illustrations/" "$PUB/illustrations/"
rsync -av --delete "$DS/logos/" "$PUB/logos/"
rsync -av --delete "$DS/lottie/" "$PUB/lottie/"

# Copy font
mkdir -p "$PUB/fonts"
cp "$DS/brand/fonts/m6x11plus.ttf" "$PUB/fonts/" 2>/dev/null || echo "Font not found in brand/fonts/"

echo ""
echo "Sync complete!"
echo "Files in public/:"
find "$PUB" -type f | wc -l | xargs echo "  Total files:"

#!/bin/bash
# Sync vectorized assets from ndg-ds-and-dam to ndg26z
# Run from ndg-ds-and-dam directory

set -e

SRC="/Users/kevin/atlas-t/ndg-ds-and-dam"
DEST="/Users/kevin/atlas-t/ndg26z/public/assets"

echo "=== Syncing DS assets to ndg26z ==="
echo ""

# Vectorized enemies
echo "Syncing enemies-svg..."
rsync -av --delete "$SRC/assets/enemies-svg/" "$DEST/enemies-svg/"

# Vectorized market
echo "Syncing market-svg..."
rsync -av --delete "$SRC/assets/market-svg/" "$DEST/market-svg/"

# Vectorized flumes
echo "Syncing flumes-svg..."
rsync -av --delete "$SRC/assets/flumes-svg/" "$DEST/flumes-svg/"

# Vectorized heroes
echo "Syncing heroes-svg..."
rsync -av --delete "$SRC/assets/heroes-svg/" "$DEST/heroes-svg/"

# Portrait SVGs (all scales including hifi)
echo "Syncing portraits..."
rsync -av --delete "$SRC/assets/characters/portraits/" "$DEST/characters/portraits/"

# UI elements (dice, currency)
echo "Syncing UI SVGs..."
rsync -av --delete "$SRC/assets/ui/dice-svg/" "$DEST/ui/dice-svg/"
rsync -av --delete "$SRC/assets/ui/currency-svg/" "$DEST/ui/currency-svg/"

# Icons
echo "Syncing icons..."
rsync -av --delete "$SRC/icons/" "$DEST/../icons/"

# Domain backgrounds (new)
echo "Syncing domain backgrounds..."
rsync -av --delete "$SRC/assets/domains/" "$DEST/domains/"

echo ""
echo "=== Sync complete ==="

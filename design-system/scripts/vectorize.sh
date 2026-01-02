#!/bin/bash
# NDG Sprite Vectorizer - Converts raster images to hard-edged SVGs using vtracer
# Usage: ./vectorize.sh <input.png> [output.svg] [preset]
#
# Presets:
#   sprite   - Hard edges, full color, optimized for game sprites (default)
#   portrait - Higher detail, smooth for character portraits
#   icon     - Simplified, fewer colors for UI icons
#   bw       - Black and white only

source /Users/kevin/.cargo/env 2>/dev/null

INPUT="$1"
OUTPUT="${2:-${INPUT%.*}.svg}"
PRESET="${3:-sprite}"

if [ -z "$INPUT" ]; then
    echo "NDG Sprite Vectorizer"
    echo "Usage: ./vectorize.sh <input.png> [output.svg] [preset]"
    echo ""
    echo "Presets:"
    echo "  sprite   - Hard edges, full color (default)"
    echo "  portrait - Higher detail, smoother curves"
    echo "  icon     - Simplified, fewer colors"
    echo "  bw       - Black and white"
    echo ""
    echo "Examples:"
    echo "  ./vectorize.sh character.png"
    echo "  ./vectorize.sh character.png character.svg sprite"
    echo "  ./vectorize.sh batch *.png  # Process all PNGs in current dir"
    exit 1
fi

# Batch mode
if [ "$INPUT" = "batch" ]; then
    shift
    for file in "$@"; do
        if [ -f "$file" ]; then
            outfile="${file%.*}.svg"
            echo "Vectorizing: $file -> $outfile"
            "$0" "$file" "$outfile" "$PRESET"
        fi
    done
    exit 0
fi

# Check input exists
if [ ! -f "$INPUT" ]; then
    echo "Error: Input file not found: $INPUT"
    exit 1
fi

case "$PRESET" in
    sprite)
        # Hard edges, full color, good for pixel/sprite art
        vtracer \
            --input "$INPUT" \
            --output "$OUTPUT" \
            --colormode color \
            --hierarchical stacked \
            --mode polygon \
            --filter_speckle 4 \
            --color_precision 6 \
            --corner_threshold 60 \
            --segment_length 4 \
            --splice_threshold 45
        ;;
    portrait)
        # Higher detail, some smoothing for character portraits
        vtracer \
            --input "$INPUT" \
            --output "$OUTPUT" \
            --colormode color \
            --hierarchical stacked \
            --mode spline \
            --filter_speckle 2 \
            --color_precision 8 \
            --corner_threshold 90 \
            --segment_length 8 \
            --splice_threshold 90
        ;;
    icon)
        # Simplified, poster-style for icons
        vtracer \
            --input "$INPUT" \
            --output "$OUTPUT" \
            --colormode color \
            --hierarchical stacked \
            --mode polygon \
            --filter_speckle 8 \
            --color_precision 4 \
            --corner_threshold 45 \
            --gradient_step 32
        ;;
    bw)
        # Black and white
        vtracer \
            --input "$INPUT" \
            --output "$OUTPUT" \
            --colormode bw \
            --mode polygon \
            --filter_speckle 4
        ;;
    *)
        echo "Unknown preset: $PRESET"
        echo "Available: sprite, portrait, icon, bw"
        exit 1
        ;;
esac

if [ -f "$OUTPUT" ]; then
    SIZE=$(du -h "$OUTPUT" | cut -f1)
    echo "Created: $OUTPUT ($SIZE)"
else
    echo "Error: Failed to create $OUTPUT"
    exit 1
fi

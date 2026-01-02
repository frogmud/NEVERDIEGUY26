#!/bin/bash
#
# reduce-colors-vectorize.sh
# Reduces PNG colors via quantization, then vectorizes with ultra-crisp vtracer
#
# Usage:
#   ./reduce-colors-vectorize.sh <input.png> [colors] [output.svg]
#   ./reduce-colors-vectorize.sh batch <input_dir> <output_dir> [colors]
#
# Examples:
#   ./reduce-colors-vectorize.sh sprite.png 16
#   ./reduce-colors-vectorize.sh sprite.png 32 output.svg
#   ./reduce-colors-vectorize.sh batch ./pngs ./svgs 24
#
# Color presets:
#   8   - Very minimal, iconic
#   16  - Clean pixel art
#   24  - Good balance (recommended)
#   32  - Detailed but controlled
#   48  - Rich but still reduced
#

set -e
source "$HOME/.cargo/env" 2>/dev/null || true

DEFAULT_COLORS=24

# Check dependencies
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick 7 required (magick command)"
    exit 1
fi

if ! command -v vtracer &> /dev/null; then
    echo "Error: vtracer required. Install: cargo install vtracer"
    exit 1
fi

process_single() {
    local input="$1"
    local colors="${2:-$DEFAULT_COLORS}"
    local output="$3"

    if [ -z "$output" ]; then
        output="${input%.png}-${colors}c.svg"
    fi

    local temp_png="/tmp/quantized_$(basename "$input")"

    # Step 1: Quantize colors with ImageMagick
    # -colors N reduces to N colors
    # +dither disables dithering for clean pixel art
    # -posterize helps with gradients
    magick "$input" \
        +dither \
        -colors "$colors" \
        -depth 8 \
        PNG8:"$temp_png"

    # Step 2: Vectorize with ultra-crisp settings
    vtracer --input "$temp_png" --output "$output" \
        --colormode color \
        --hierarchical stacked \
        --mode polygon \
        --filter_speckle 1 \
        --color_precision 8 \
        --corner_threshold 120 \
        --segment_length 3.5 \
        --splice_threshold 90

    # Count actual colors in output
    local color_count=$(grep -oE 'fill="#[0-9a-fA-F]{6}"' "$output" 2>/dev/null | sort -u | wc -l | tr -d ' ')

    # Cleanup
    rm -f "$temp_png"

    echo "$(basename "$input") -> $(basename "$output") ($color_count colors)"
}

process_batch() {
    local input_dir="$1"
    local output_dir="$2"
    local colors="${3:-$DEFAULT_COLORS}"

    mkdir -p "$output_dir"

    local count=0
    local total=$(find "$input_dir" -maxdepth 1 -name "*.png" | wc -l | tr -d ' ')

    echo "=== Batch Color Reduction + Vectorization ==="
    echo "Input:  $input_dir"
    echo "Output: $output_dir"
    echo "Colors: $colors"
    echo "Files:  $total"
    echo ""

    for png in "$input_dir"/*.png; do
        [ -f "$png" ] || continue

        local base=$(basename "$png" .png)
        local output="$output_dir/${base}.svg"

        count=$((count + 1))
        printf "[%d/%d] " "$count" "$total"
        process_single "$png" "$colors" "$output"
    done

    echo ""
    echo "=== Complete: $count files processed ==="
}

# Main
case "$1" in
    batch)
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Usage: $0 batch <input_dir> <output_dir> [colors]"
            exit 1
        fi
        process_batch "$2" "$3" "$4"
        ;;
    -h|--help)
        head -25 "$0" | tail -23
        ;;
    *)
        if [ -z "$1" ]; then
            echo "Usage: $0 <input.png> [colors] [output.svg]"
            echo "       $0 batch <input_dir> <output_dir> [colors]"
            exit 1
        fi
        process_single "$1" "$2" "$3"
        ;;
esac

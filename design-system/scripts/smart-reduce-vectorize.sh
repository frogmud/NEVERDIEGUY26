#!/bin/bash
#
# smart-reduce-vectorize.sh
# Intelligently reduces PNG colors by:
# 1. Merging similar colors (fuzz matching) first
# 2. Then quantizing to target color count
# 3. Finally vectorizing with ultra-crisp settings
#
# Usage:
#   ./smart-reduce-vectorize.sh <input.png> [max_colors] [output.svg]
#   ./smart-reduce-vectorize.sh batch <input_dir> <output_dir> [max_colors] [threshold]
#
# Parameters:
#   max_colors  - Target max colors (default: 32)
#   threshold   - Color similarity % for merging (default: 10)
#
# The script first merges colors within the threshold %, then quantizes
# to max_colors. This prevents harsh banding from aggressive quantization.
#

set -e
source "$HOME/.cargo/env" 2>/dev/null || true

DEFAULT_COLORS=32
DEFAULT_FUZZ=10  # percent - colors within 10% are merged

# Check dependencies
check_deps() {
    if ! command -v magick &> /dev/null; then
        echo "Error: ImageMagick 7 required (magick command)"
        exit 1
    fi
    if ! command -v vtracer &> /dev/null; then
        echo "Error: vtracer required. Install: cargo install vtracer"
        exit 1
    fi
}

process_single() {
    local input="$1"
    local max_colors="${2:-$DEFAULT_COLORS}"
    local output="$3"
    local fuzz="${4:-$DEFAULT_FUZZ}"

    if [ -z "$output" ]; then
        output="${input%.png}.svg"
    fi

    local temp_png="/tmp/smart_$(basename "$input")"

    # Step 1: Merge similar colors with fuzz, then quantize
    # -fuzz N% treats colors within N% as identical
    # +dither prevents dithering artifacts
    # -colors N reduces palette
    magick "$input" \
        -fuzz "${fuzz}%" \
        +dither \
        -colors "$max_colors" \
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
    local size=$(ls -lh "$output" | awk '{print $5}')

    # Cleanup
    rm -f "$temp_png"

    echo "$(basename "$output") ($color_count colors, $size)"
}

process_batch() {
    local input_dir="$1"
    local output_dir="$2"
    local max_colors="${3:-$DEFAULT_COLORS}"
    local fuzz="${4:-$DEFAULT_FUZZ}"

    mkdir -p "$output_dir"

    local count=0
    local total=$(find "$input_dir" -maxdepth 1 -name "*.png" | wc -l | tr -d ' ')

    echo "=== Smart Color Reduction + Vectorization ==="
    echo "Input:      $input_dir"
    echo "Output:     $output_dir"
    echo "Max colors: $max_colors"
    echo "Fuzz:       ${fuzz}%"
    echo "Files:      $total"
    echo ""

    for png in "$input_dir"/*.png; do
        [ -f "$png" ] || continue

        local base=$(basename "$png" .png)
        local output="$output_dir/${base}.svg"

        count=$((count + 1))
        printf "[%d/%d] " "$count" "$total"
        process_single "$png" "$max_colors" "$output" "$fuzz"
    done

    echo ""
    echo "=== Complete: $count files processed ==="
}

# Main
check_deps

case "$1" in
    batch)
        if [ -z "$2" ] || [ -z "$3" ]; then
            echo "Usage: $0 batch <input_dir> <output_dir> [max_colors] [fuzz%]"
            exit 1
        fi
        process_batch "$2" "$3" "$4" "$5"
        ;;
    -h|--help)
        head -20 "$0" | tail -18
        ;;
    *)
        if [ -z "$1" ]; then
            echo "Usage: $0 <input.png> [max_colors] [output.svg]"
            echo "       $0 batch <input_dir> <output_dir> [max_colors] [fuzz%]"
            exit 1
        fi
        process_single "$1" "$2" "$3" "$4"
        ;;
esac

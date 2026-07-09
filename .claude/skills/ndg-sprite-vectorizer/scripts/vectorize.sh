#!/bin/bash
#
# NDG Sprite Vectorizer
# Raster -> SVG via ImageMagick preprocess + vtracer trace.
# Consolidates the design-system asset pipeline recipes into one self-contained script.
#
# Usage:
#   ./vectorize.sh <input> [output.svg] [preset]
#   ./vectorize.sh batch <input_dir> <output_dir> [preset]
#
# Presets: sprite (default) | crisp | portrait | icon | poster | minimal | bw
#
# Env overrides (apply to any preset):
#   NDG_COLORS=N    override the quantized palette size
#   NDG_RESIZE=WxH  resize before tracing (e.g. 150x150)
#   NDG_FUZZ=N      override color-merge threshold percent
#
# Examples:
#   ./vectorize.sh hero.png
#   ./vectorize.sh hero.png hero.svg portrait
#   NDG_COLORS=24 ./vectorize.sh hero.png
#   ./vectorize.sh batch ./pngs ./svgs crisp
#

set -e
# vtracer is commonly installed via cargo; load its env if present (do not fail if absent)
if [ -f "$HOME/.cargo/env" ]; then . "$HOME/.cargo/env"; fi

usage() {
    sed -n '2,23p' "$0" | sed 's/^#\{1,\} \{0,1\}//'
    exit "${1:-1}"
}

check_deps() {
    local missing=0
    if ! command -v magick >/dev/null 2>&1; then
        echo "Error: ImageMagick 7 ('magick') not found. Install: brew install imagemagick" >&2
        missing=1
    fi
    if ! command -v vtracer >/dev/null 2>&1; then
        echo "Error: vtracer not found. Install: cargo install vtracer (or pip install vtracer)" >&2
        missing=1
    fi
    [ "$missing" -eq 0 ] || exit 1
}

# Sets preset variables: FUZZ COLORS RESIZE TRIM MODE SPECKLE PREC CORNER SEG SPLICE BW
load_preset() {
    TRIM=""; RESIZE=""; BW=""; SEG=""; SPLICE=""; POINT=""
    case "$1" in
        sprite)   FUZZ=5;  COLORS=256; MODE=polygon; SPECKLE=4;  PREC=6; CORNER=60;  SEG=4;   SPLICE=45 ;;
        pixel)    FUZZ=1;  COLORS=256; MODE=polygon; SPECKLE=0;  PREC=8; CORNER=120; SEG=3.5; SPLICE=90; RESIZE=300%; POINT=1 ;;
        crisp)    FUZZ=10; COLORS=32;  MODE=polygon; SPECKLE=1;  PREC=8; CORNER=120; SEG=3.5; SPLICE=90 ;;
        portrait) FUZZ=3;  COLORS=512; MODE=spline;  SPECKLE=2;  PREC=8; CORNER=90;  SEG=8;   SPLICE=90 ;;
        icon)     FUZZ=2;  COLORS=32;  MODE=polygon; SPECKLE=8;  PREC=4; CORNER=45;  TRIM=1 ;;
        poster)   FUZZ=8;  COLORS=16;  MODE=polygon; SPECKLE=8;  PREC=4; CORNER=45 ;;
        minimal)  FUZZ=2;  COLORS=8;   MODE=polygon; SPECKLE=16; PREC=3; CORNER=30;  SEG=8 ;;
        bw)       BW=1;    MODE=polygon; SPECKLE=4 ;;
        *) echo "Unknown preset: $1 (sprite|pixel|crisp|portrait|icon|poster|minimal|bw)" >&2; exit 1 ;;
    esac
    # env overrides
    [ -n "$NDG_COLORS" ] && COLORS="$NDG_COLORS"
    [ -n "$NDG_FUZZ" ]   && FUZZ="$NDG_FUZZ"
    [ -n "$NDG_RESIZE" ] && RESIZE="$NDG_RESIZE"
    return 0
}

process_single() {
    local input="$1" output="$2" preset="$3"
    [ -f "$input" ] || { echo "Error: input not found: $input" >&2; return 1; }
    [ -n "$output" ] || output="${input%.*}.svg"
    load_preset "$preset"

    local trace_in="$input"
    local temp_png=""

    if [ -z "$BW" ]; then
        # Preprocess: trim (icon only) -> resize -> merge similar colors -> quantize -> PNG8
        temp_png="${TMPDIR:-/tmp}/ndgvec_$$_$(basename "${input%.*}").png"
        local -a m=("$input")
        [ -n "$TRIM" ]   && m+=(-trim +repage)
        [ -n "$POINT" ]  && m+=(-filter point)
        [ -n "$RESIZE" ] && m+=(-resize "$RESIZE")
        m+=(-fuzz "${FUZZ}%" +dither -colors "$COLORS" -depth 8 "PNG8:$temp_png")
        magick "${m[@]}"
        trace_in="$temp_png"
    fi

    # Trace
    local -a v=(--input "$trace_in" --output "$output" --mode "$MODE" --filter_speckle "$SPECKLE")
    if [ -n "$BW" ]; then
        v+=(--colormode bw)
    else
        v+=(--colormode color --hierarchical stacked --color_precision "$PREC" --corner_threshold "$CORNER")
        [ -n "$SEG" ]    && v+=(--segment_length "$SEG")
        [ -n "$SPLICE" ] && v+=(--splice_threshold "$SPLICE")
    fi
    vtracer "${v[@]}"

    [ -n "$temp_png" ] && rm -f "$temp_png"

    if [ -f "$output" ]; then
        local size colors
        size=$(du -h "$output" | cut -f1 | tr -d ' ')
        colors=$(grep -oE 'fill="#[0-9a-fA-F]{6}"' "$output" 2>/dev/null | sort -u | wc -l | tr -d ' ')
        echo "Created: $output ($size, ${colors} colors)"
    else
        echo "Error: failed to create $output" >&2
        return 1
    fi
}

process_batch() {
    local in_dir="$1" out_dir="$2" preset="$3"
    [ -d "$in_dir" ] || { echo "Error: input dir not found: $in_dir" >&2; exit 1; }
    mkdir -p "$out_dir"
    local total count=0
    total=$(find "$in_dir" -maxdepth 1 \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) | wc -l | tr -d ' ')
    echo "=== Vectorize batch ($preset) : $in_dir -> $out_dir : $total files ==="
    local f
    for f in "$in_dir"/*.png "$in_dir"/*.jpg "$in_dir"/*.jpeg; do
        [ -f "$f" ] || continue
        count=$((count + 1))
        printf "[%d/%d] " "$count" "$total"
        process_single "$f" "$out_dir/$(basename "${f%.*}").svg" "$preset" || true
    done
    echo "=== Done: $count files ==="
}

# --- main ---
if [ -z "$1" ]; then usage 0; fi
case "$1" in
    -h|--help) usage 0 ;;
    batch)
        [ -n "$2" ] && [ -n "$3" ] || usage 1
        check_deps
        process_batch "$2" "$3" "${4:-sprite}"
        ;;
    *)
        check_deps
        process_single "$1" "$2" "${3:-sprite}"
        ;;
esac

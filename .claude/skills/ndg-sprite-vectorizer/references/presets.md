# Preset reference

Each preset is an ImageMagick preprocess + a vtracer trace, tuned together. The script applies both.
`NDG_COLORS`, `NDG_FUZZ`, `NDG_RESIZE` override the preprocess step for any preset.

## Flag-by-flag

| Preset | magick (preprocess) | vtracer (trace) |
|--------|---------------------|-----------------|
| `pixel` | `-filter point -resize 300% -fuzz 1% +dither -colors 256 -depth 8 PNG8` | `--mode polygon --filter_speckle 0 --color_precision 8 --corner_threshold 120 --segment_length 3.5 --splice_threshold 90` |
| `sprite` | `-fuzz 5% +dither -colors 256 -depth 8 PNG8` | `--mode polygon --filter_speckle 4 --color_precision 6 --corner_threshold 60 --segment_length 4 --splice_threshold 45` |
| `crisp` | `-fuzz 10% +dither -colors 32 -depth 8 PNG8` | `--mode polygon --filter_speckle 1 --color_precision 8 --corner_threshold 120 --segment_length 3.5 --splice_threshold 90` |
| `portrait` | `-fuzz 3% +dither -colors 512 -depth 8 PNG8` | `--mode spline --filter_speckle 2 --color_precision 8 --corner_threshold 90 --segment_length 8 --splice_threshold 90` |
| `icon` | `-trim +repage -fuzz 2% +dither -colors 32 -depth 8 PNG8` | `--mode polygon --filter_speckle 8 --color_precision 4 --corner_threshold 45` |
| `poster` | `-fuzz 8% +dither -colors 16 -depth 8 PNG8` | `--mode polygon --filter_speckle 8 --color_precision 4 --corner_threshold 45` |
| `minimal` | `-fuzz 2% +dither -colors 8 -depth 8 PNG8` | `--mode polygon --filter_speckle 16 --color_precision 3 --corner_threshold 30 --segment_length 8` |
| `bw` | (none) | `--colormode bw --mode polygon --filter_speckle 4` |

All color presets also pass `--colormode color --hierarchical stacked`.

## What each knob does
- `--filter_speckle N` — discard blobs smaller than N px. Higher = cleaner but loses detail.
- `--color_precision N` — bits of color kept (1-8). Higher = more colors in the trace.
- `--corner_threshold deg` — angle below which a corner stays sharp. Higher = more hard corners.
- `--mode polygon|spline` — straight edges (crisp/pixel) vs curves (organic/illustration).
- `--segment_length`, `--splice_threshold` — path smoothing / how aggressively segments merge.
- magick `-fuzz N%` — treat colors within N% as identical (merge before quantize, kills banding).
- magick `+dither` — disable dithering (keep flat color regions; dithering explodes the trace).
- magick `-colors N` — quantize palette to N. The single biggest lever on SVG size + boldness.

## Expected file sizes (from the showcase, 3 test sprites)
| Preset family | simple sprite | medium portrait | complex elder |
|---------------|---------------|-----------------|---------------|
| crisp / ultra | ~38K | ~63K | ~12K |
| sprite/standard | ~28K | ~57K | ~5.5K |
| portrait (spline) | ~66K | ~129K | ~12K |
| poster | ~11K | ~15K | ~3K |
| minimal | ~4K | ~6K | ~2.8K |

Splines (portrait) produce larger files than polygons for the same image.

## Tuning cheatsheet
- Output too noisy / too big -> lower `NDG_COLORS`, or step up to `poster`/`minimal`.
- Output too flat / lost detail -> `portrait`, or raise `NDG_COLORS`.
- Pixel art should stay blocky -> `sprite` or `crisp` (polygon), never `portrait`.
- Small (<=128px) detailed pixel art losing fine features (text, chains, eyes) -> `pixel`. The
  `filter_speckle 0` + 3x point upscale + wide palette is what keeps tiny shapes from being culled.
  Trade-off: larger SVGs (detailed sprites land ~30-50K; very busy art can exceed 150K).
- Logo/silhouette -> `bw`.
- Recommended general-purpose color counts: 24 (balanced), 16 (clean pixel art), 32 (detailed).

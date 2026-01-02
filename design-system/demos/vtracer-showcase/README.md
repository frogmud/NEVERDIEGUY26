# vtracer Showcase

Demonstrations of different vectorization settings for NEVER DIE GUY sprites.

## Test Sprites

| Sprite | Complexity | Notes |
|--------|-----------|-------|
| boo | Simple | Ghost shop keeper, iconic silhouette |
| jane | Medium | Pantheon character, detailed outfit |
| alienoldone | Complex | Pantheon elder, intricate patterns |

## Presets

### 1. ultra-crisp
Maximum detail preservation. Every pixel edge preserved.
- `filter_speckle: 1` - Keep tiny details
- `color_precision: 8` - Full color fidelity
- `corner_threshold: 120` - Sharp corners everywhere
- `segment_length: 3.5` - Minimum segment length

**Use for**: Print assets, zoom-friendly graphics, archival quality

### 2. crisp
Hard polygon edges with slight noise reduction. The "glitchy" look.
- `filter_speckle: 2` - Remove only dust specks
- `color_precision: 8` - Full color
- `corner_threshold: 90` - Very sharp corners
- `segment_length: 3.5` - Tight segments

**Use for**: Pixel art that should feel digital/glitchy

### 3. standard (DS Default)
Balanced quality. Current production setting.
- `filter_speckle: 4` - Moderate cleanup
- `color_precision: 6` - Good color
- `corner_threshold: 60` - Natural corners

**Use for**: General web/app use

### 4. smooth
Curved splines instead of polygons. Organic feel.
- `mode: spline` (not polygon)
- `filter_speckle: 4`
- `color_precision: 6`
- `corner_threshold: 60`

**Use for**: Softer aesthetic, illustration style

### 5. posterized
Reduced colors, bolder shapes. Stylized.
- `filter_speckle: 8` - Aggressive cleanup
- `color_precision: 4` - Fewer colors
- `corner_threshold: 45` - Softer corners

**Use for**: T-shirts, merch, bold graphics

### 6. minimal
Aggressive simplification. Abstract representation.
- `filter_speckle: 16` - Remove all small shapes
- `color_precision: 3` - Very few colors
- `corner_threshold: 30` - Rounded everything
- `segment_length: 8` - Long segments

**Use for**: Thumbnails, favicon-style, abstract art

## File Size Comparison

| Preset | boo | jane | alienoldone |
|--------|-----|------|-------------|
| ultra-crisp | 38K | 63K | 12K |
| crisp | 38K | 63K | 12K |
| standard | 28K | 57K | 5.5K |
| smooth | 66K | 129K | 12K |
| posterized | 11K | 15K | 3.0K |
| minimal | 4.0K | 6.1K | 2.8K |

Note: Smooth uses splines which are more verbose than polygons.

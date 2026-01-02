# Typography

Font families and scale for NEVER DIE GUY. Source: `tokens/typography.json`

## Font Families

| Token | Font | Usage |
|-------|------|-------|
| primary | Inter | UI text, headings, body copy |
| mono | IBM Plex Mono | Code, data displays, stats |
| gaming | m6x11plus | Retro/pixel elements, damage numbers |

## Font Files

- `brand/fonts/m6x11plus.ttf` - Gaming pixel font

Inter and IBM Plex Mono loaded from Google Fonts.

## Type Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| h1 | 2.5rem (40px) | 700 | Page titles |
| h2 | 2rem (32px) | 600 | Section headers |
| h3 | 1.5rem (24px) | 600 | Card titles |
| h4 | 1.25rem (20px) | 600 | Subsections |
| h5 | 1rem (16px) | 500 | List headers |
| h6 | 0.875rem (14px) | 500 | Small headers |
| body1 | 1rem (16px) | 400 | Primary body text |
| body2 | 0.875rem (14px) | 400 | Secondary text |
| caption | 0.75rem (12px) | 400 | Captions, labels |

## Gaming Font Usage

The `m6x11plus` font is used for:
- Damage numbers
- Score displays
- Retro UI elements
- Loading screens

## CSS Import

```css
@font-face {
  font-family: 'm6x11plus';
  src: url('/brand/fonts/m6x11plus.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
```

import { Box, Typography } from '@mui/material';
import { tokens } from '../theme';

export interface WikiSection {
  /** Section ID used for anchor links (auto-generated from name if not provided) */
  id?: string;
  /** Display name shown in navigation and used for anchor if id not provided */
  name: string;
}

interface WikiLayoutProps {
  /** Main content area (left side) */
  children: React.ReactNode;
  /** Infobox/stats cards for the right sidebar */
  infobox: React.ReactNode;
  /** Section navigation items - used to generate anchor links */
  sections: WikiSection[];
  /** Optional width for the infobox sidebar (default: 280) */
  infoboxWidth?: number;
  /** Optional breadcrumbs rendered at top of content */
  breadcrumbs?: React.ReactNode;
  /** Optional title rendered between breadcrumbs and content */
  title?: React.ReactNode;
}

/**
 * Converts a section name to a valid anchor ID
 * e.g., "Combat Overview" -> "combat-overview"
 */
export function toAnchorId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Scrolls to a section by ID with smooth behavior
 */
export function scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/** Sections navigation list */
function SectionsNav({ sections }: { sections: WikiSection[] }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, color: tokens.colors.text.secondary }}>
        Sections
      </Typography>
      {sections.map((section) => {
        const sectionId = section.id || toAnchorId(section.name);
        return (
          <Typography
            key={sectionId}
            variant="body2"
            onClick={() => scrollToSection(sectionId)}
            sx={{
              color: tokens.colors.secondary,
              cursor: 'pointer',
              mb: 1,
              '&:hover': { textDecoration: 'underline' },
              '&:last-child': { mb: 0 },
            }}
          >
            {section.name}
          </Typography>
        );
      })}
    </Box>
  );
}

/**
 * WikiLayout - Traditional wiki-style layout with content on left, infobox on right
 *
 * Features:
 * - Right-side infobox/stats panel (like Wikipedia)
 * - Sections navigation with working anchor links
 * - Responsive design (stacks on mobile with correct visual order)
 *
 * Mobile order: breadcrumbs -> title -> infobox (image+stats) -> content -> sections nav
 * Desktop order: [breadcrumbs, title, content] left | [infobox, sections nav] right
 */
export function WikiLayout({
  children,
  infobox,
  sections,
  infoboxWidth = 280,
  breadcrumbs,
  title,
}: WikiLayoutProps) {
  return (
    <Box>
      {/* Mobile-only: breadcrumbs + title above everything */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          px: { xs: 2, sm: 3 },
        }}
      >
        {breadcrumbs && <Box sx={{ mt: 1, mb: 1 }}>{breadcrumbs}</Box>}
        {title && <Box sx={{ mb: 1.5 }}>{title}</Box>}
      </Box>

      {/* Main flex container */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 2, md: 4 },
          flexDirection: { xs: 'column', md: 'row' },
          px: { xs: 2, sm: 3, md: 0 },
        }}
      >
        {/* Main Content (Left Side) */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Desktop-only: breadcrumbs + title inside main column */}
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {breadcrumbs}
            {title}
          </Box>
          {children}
        </Box>

        {/* Infobox Sidebar (Right Side) */}
        <Box
          sx={{
            width: { xs: '100%', md: infoboxWidth },
            flexShrink: 0,
          }}
        >
          {infobox}

          {/* Desktop-only: sticky sections nav in sidebar */}
          <Box
            sx={{
              display: { xs: 'none', md: 'block' },
              mt: 3,
              position: 'sticky',
              top: 80,
            }}
          >
            <SectionsNav sections={sections} />
          </Box>
        </Box>
      </Box>

      {/* Mobile-only: sections nav at the bottom */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          px: { xs: 2, sm: 3 },
          mt: 3,
          mb: 2,
        }}
      >
        <SectionsNav sections={sections} />
      </Box>
    </Box>
  );
}

/**
 * WikiSectionAnchor - Wrapper to add anchor ID to a section
 * Use this to wrap your SectionHeader or section content
 */
interface WikiSectionAnchorProps {
  /** Section ID for anchor linking (should match what's in WikiLayout sections) */
  id: string;
  children: React.ReactNode;
}

export function WikiSectionAnchor({ id, children }: WikiSectionAnchorProps) {
  return (
    <Box id={id} sx={{ scrollMarginTop: 80 }}>
      {children}
    </Box>
  );
}

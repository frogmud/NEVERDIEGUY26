/**
 * Narrative Fork Templates
 *
 * Minimal text choices for zone selection, replacing explicit door cards.
 * Each domain has 3 narratives mapping to zone types (stable/elite/anomaly).
 */

export type ZoneType = 'stable' | 'elite' | 'anomaly';

export interface NarrativeOption {
  text: string;
  zoneType: ZoneType;
  hint?: string; // Optional subtle difficulty hint
}

export interface DomainNarratives {
  intro: string;
  options: NarrativeOption[];
}

// Domain slug to narrative mapping
export const NARRATIVE_FORKS: Record<string, DomainNarratives> = {
  meadow: {
    intro: 'The path diverges ahead...',
    options: [
      {
        text: 'Follow the worn trail through the grass',
        zoneType: 'stable',
        hint: 'familiar',
      },
      {
        text: 'Investigate where the grass moves against the wind',
        zoneType: 'elite',
        hint: 'curious',
      },
      {
        text: 'Approach the flowers that never bloom',
        zoneType: 'anomaly',
        hint: 'strange',
      },
    ],
  },

  forest: {
    intro: 'The trees whisper of routes unknown...',
    options: [
      {
        text: 'Take the path between ancient oaks',
        zoneType: 'stable',
        hint: 'sheltered',
      },
      {
        text: 'Follow the shadows that move wrong',
        zoneType: 'elite',
        hint: 'watchful',
      },
      {
        text: 'Enter the clearing that pulses with light',
        zoneType: 'anomaly',
        hint: 'unnatural',
      },
    ],
  },

  caverns: {
    intro: 'Echoes return from three tunnels...',
    options: [
      {
        text: 'Follow the crystal veins deeper',
        zoneType: 'stable',
        hint: 'steady',
      },
      {
        text: 'Descend toward the grinding sounds',
        zoneType: 'elite',
        hint: 'restless',
      },
      {
        text: 'Enter where the walls seem to breathe',
        zoneType: 'anomaly',
        hint: 'alive',
      },
    ],
  },

  ruins: {
    intro: 'The stones remember different pasts...',
    options: [
      {
        text: 'Descend the moss-covered stairs',
        zoneType: 'stable',
        hint: 'quiet',
      },
      {
        text: 'Climb over the collapsed pillars',
        zoneType: 'elite',
        hint: 'unstable',
      },
      {
        text: 'Approach the sealed chamber that whispers',
        zoneType: 'anomaly',
        hint: 'forbidden',
      },
    ],
  },

  'shadow-realm': {
    intro: 'The darkness offers paths unseen...',
    options: [
      {
        text: 'Follow the faint torchlight ahead',
        zoneType: 'stable',
        hint: 'dim',
      },
      {
        text: 'Wade into the darkness with weight',
        zoneType: 'elite',
        hint: 'heavy',
      },
      {
        text: 'Step where reality folds upon itself',
        zoneType: 'anomaly',
        hint: 'impossible',
      },
    ],
  },

  abyss: {
    intro: 'The void reveals its final choices...',
    options: [
      {
        text: 'Accept the passage the void offers',
        zoneType: 'stable',
        hint: 'yielding',
      },
      {
        text: 'Disturb what stirs in the depths',
        zoneType: 'elite',
        hint: 'ancient',
      },
      {
        text: 'Cross where worlds no longer separate',
        zoneType: 'anomaly',
        hint: 'boundless',
      },
    ],
  },
};

/**
 * Get narrative options for a domain
 */
export function getDomainNarratives(domainSlug: string): DomainNarratives {
  const narratives = NARRATIVE_FORKS[domainSlug];
  if (!narratives) {
    // Fallback for unknown domains
    return {
      intro: 'The path continues...',
      options: [
        { text: 'Take the safe route', zoneType: 'stable' },
        { text: 'Investigate the disturbance', zoneType: 'elite' },
        { text: 'Follow the strange signal', zoneType: 'anomaly' },
      ],
    };
  }
  return narratives;
}

/**
 * Skip option - adds Heat penalty
 */
export const SKIP_OPTION: NarrativeOption = {
  text: 'Turn back... (the Die-rector notes your hesitation)',
  zoneType: 'stable', // Doesn't matter - handled specially
  hint: 'cowardly',
};

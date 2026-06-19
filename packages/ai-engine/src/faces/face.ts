/**
 * Face - the RNG reveal object.
 *
 * A Face answers a Bone throw. It is the art, enemy, omen, room state, Office mark,
 * or opening. Faces do not kill on reveal (No-Instant-Death rule).
 * See docs/current/05-prd-operating-summary.md and 08-app-systems-alignment-plan.md.
 */

import type { OfficeId } from '@ndg/shared';

/** What a revealed Face represents in the room. */
export type RevealRole = 'monster' | 'omen' | 'room' | 'opening';

/** How a Face behaves at the Jump Check. */
export type JumpProfile = 'aggressive' | 'watching' | 'defensive' | 'unstable';

export interface Face {
  id: string;
  label: string;
  /** Single-glyph mark. Must not be the only signal (color-independent, P1). */
  glyph: string;
  officeId: OfficeId;
  revealRole: RevealRole;
  /** Short effect descriptors surfaced in the reveal/response UI. */
  effects: string[];
  jumpProfile: JumpProfile;
  mythTags: string[];
  wikiSlug: string;
}

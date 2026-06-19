/**
 * FIXTURE - 6-Face starter pack (one per Office) as schema-first data.
 *
 * The base `Face` fields match the LIVE type (packages/ai-engine/src/faces/face.ts).
 * The pack enriches each Face with authoring metadata the content graph needs but the
 * runtime Face does not yet carry: `doorId`, `banterPoolId`, `telemetry`. These are
 * marked as a deliberate superset (FacePackEntry) - propose folding them into the
 * engine when the Bone/Face migration lands; do not silently change the live Face.
 */

import type { Face } from '@ndg/ai-engine';   // live type
// OfficeId is re-exported via @ndg/ai-engine -> @ndg/shared

/** Authoring superset: live Face + content-graph metadata. */
export interface FacePackEntry extends Face {
  doorId: number;          // jurisdiction Door; mirrors officeId until Doors diverge
  banterPoolId: string;    // referenced by ndg-encounter-banter-director
  telemetry: string[];     // chain events this Face participates in
}

export const SIX_FACE_STARTER_PACK: FacePackEntry[] = [
  {
    id: 'face-favor', label: 'The Witness', glyph: 'eye', officeId: 1, doorId: 1,
    revealRole: 'omen', effects: ['Someone noticed.', 'Favor drift on resolve.'],
    jumpProfile: 'watching', mythTags: ['favor', 'witness'], wikiSlug: 'face-the-witness',
    banterPoolId: 'banter-favor-witness',
    telemetry: ['faces_revealed', 'jump_check_resolved'],
  },
  {
    id: 'face-graveyard', label: 'The Buried', glyph: 'headstone', officeId: 2, doorId: 2,
    revealRole: 'room', effects: ['What was buried still pushes.', 'Room carries old weight.'],
    jumpProfile: 'defensive', mythTags: ['graveyard', 'buried'], wikiSlug: 'face-the-buried',
    banterPoolId: 'banter-graveyard-buried',
    telemetry: ['faces_revealed', 'graveyard_changed'],
  },
  {
    id: 'face-death', label: 'The Custodian', glyph: 'skull', officeId: 3, doorId: 3,
    revealRole: 'monster', effects: ['Death is a change in custody.', 'Aggressive on jump.'],
    jumpProfile: 'aggressive', mythTags: ['death', 'custody'], wikiSlug: 'face-the-custodian',
    banterPoolId: 'banter-death-custodian',
    telemetry: ['faces_revealed', 'jump_check_resolved', 'room_resolved'],
  },
  {
    id: 'face-myth', label: 'The Rumor', glyph: 'flame', officeId: 4, doorId: 4,
    revealRole: 'omen', effects: ['The story grows.', 'Myth drift on resolve.'],
    jumpProfile: 'unstable', mythTags: ['myth', 'rumor'], wikiSlug: 'face-the-rumor',
    banterPoolId: 'banter-myth-rumor',
    telemetry: ['faces_revealed', 'myth_tier_changed'],
  },
  {
    id: 'face-archive', label: 'The Record', glyph: 'tablet', officeId: 5, doorId: 5,
    revealRole: 'opening', effects: ['What happened is written.', 'A safe window may open.'],
    jumpProfile: 'watching', mythTags: ['archive', 'record'], wikiSlug: 'face-the-record',
    banterPoolId: 'banter-archive-record',
    telemetry: ['faces_revealed', 'jump_check_resolved'],
  },
  {
    id: 'face-corruption', label: 'The Wrong Return', glyph: 'glitch', officeId: 6, doorId: 6,
    revealRole: 'monster', effects: ['It came back wrong.', 'Unstable pressure.'],
    jumpProfile: 'unstable', mythTags: ['corruption', 'return'], wikiSlug: 'face-the-wrong-return',
    banterPoolId: 'banter-corruption-return',
    telemetry: ['faces_revealed', 'jump_check_resolved'],
  },
];

/*
 * VALIDATION
 * - base Face fields tsc-clean against @ndg/ai-engine's Face.
 * - one Face per officeId 1..6; stable kebab IDs; color-independent glyphs.
 * - every entry carries a wikiSlug (graph link) + banterPoolId (writing hook) + telemetry names.
 * - doorId == officeId today; the field exists so Doors can diverge without a reshape.
 */

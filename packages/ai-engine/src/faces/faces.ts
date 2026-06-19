/**
 * The six Faces, one per Office. POC set.
 * Only 3 need to appear in the first room; the reveal picks 3 from this pool.
 */

import type { SeededRng } from '../core/seeded-rng';
import type { Face } from './face';

export const FACES: Face[] = [
  {
    id: 'face-favor',
    label: 'The Witness',
    glyph: 'eye',
    officeId: 1,
    revealRole: 'omen',
    effects: ['Someone noticed.', 'Favor drift on resolve.'],
    jumpProfile: 'watching',
    mythTags: ['favor', 'witness'],
    wikiSlug: 'face-the-witness',
  },
  {
    id: 'face-graveyard',
    label: 'The Buried',
    glyph: 'headstone',
    officeId: 2,
    revealRole: 'room',
    effects: ['What was buried still pushes.', 'Room carries old weight.'],
    jumpProfile: 'defensive',
    mythTags: ['graveyard', 'buried'],
    wikiSlug: 'face-the-buried',
  },
  {
    id: 'face-death',
    label: 'The Custodian',
    glyph: 'skull',
    officeId: 3,
    revealRole: 'monster',
    effects: ['Death is a change in custody.', 'Aggressive on jump.'],
    jumpProfile: 'aggressive',
    mythTags: ['death', 'custody'],
    wikiSlug: 'face-the-custodian',
  },
  {
    id: 'face-myth',
    label: 'The Rumor',
    glyph: 'flame',
    officeId: 4,
    revealRole: 'omen',
    effects: ['The story grows.', 'Myth drift on resolve.'],
    jumpProfile: 'unstable',
    mythTags: ['myth', 'rumor'],
    wikiSlug: 'face-the-rumor',
  },
  {
    id: 'face-archive',
    label: 'The Record',
    glyph: 'tablet',
    officeId: 5,
    revealRole: 'opening',
    effects: ['What happened is written.', 'A safe window may open.'],
    jumpProfile: 'watching',
    mythTags: ['archive', 'record'],
    wikiSlug: 'face-the-record',
  },
  {
    id: 'face-corruption',
    label: 'The Wrong Return',
    glyph: 'glitch',
    officeId: 6,
    revealRole: 'monster',
    effects: ['It came back wrong.', 'Unstable pressure.'],
    jumpProfile: 'unstable',
    mythTags: ['corruption', 'return'],
    wikiSlug: 'face-the-wrong-return',
  },
];

const FACE_BY_ID = new Map(FACES.map((f) => [f.id, f]));

export function getFace(id: string): Face | undefined {
  return FACE_BY_ID.get(id);
}

/**
 * Reveal `count` distinct Faces from the pool, seeded.
 * Namespace should encode runSeed/domainId/roomIndex for determinism.
 */
export function revealFaces(rng: SeededRng, count = 3, namespace = 'reveal'): Face[] {
  return rng.shuffle(FACES, namespace).slice(0, Math.min(count, FACES.length));
}

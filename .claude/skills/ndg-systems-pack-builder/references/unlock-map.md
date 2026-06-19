# Unlock map - run events to wiki/comic

The content graph is the product. Every run event that should matter elsewhere needs an explicit
mapping to a wiki entry, comic issue, or world-state change - plus the telemetry event that records
it firing.

## Shape
```ts
interface Unlock {
  trigger: RunEvent;             // what happened in a run
  grants: { wikiSlug?: string; comicId?: string; worldState?: string };
  once?: boolean;                // first-time only
  telemetry: string;            // event emitted when granted
}
type RunEvent =
  | { kind: 'face_revealed'; faceId: string }
  | { kind: 'face_buried'; faceId: string }
  | { kind: 'room_resolved'; officeId: number; result: 'win' | 'loss' }
  | { kind: 'myth_tier_changed'; tier: 'low' | 'mid' | 'high' };
```

## Telemetry contract (names are fixed - reuse, don't rename)
Chain: `bones_thrown, faces_revealed, response_phase_started, jump_check_resolved, room_resolved,
graveyard_changed, myth_tier_changed, what_remained_viewed`.
Ecosystem: `wiki_unlock_shown, wiki_page_opened, comic_issue_opened, store_cta_clicked,
wishlist_clicked`.

## Example unlocks
```ts
const UNLOCKS: Unlock[] = [
  { trigger: { kind: 'face_revealed', faceId: 'face-custodian' },
    grants: { wikiSlug: 'face-the-custodian' }, once: true, telemetry: 'wiki_unlock_shown' },
  { trigger: { kind: 'myth_tier_changed', tier: 'mid' },
    grants: { worldState: 'boo-g:shrine-tier-1' }, telemetry: 'myth_tier_changed' },
];
```

## Rules
- One trigger may grant multiple things, but each grant lists its own telemetry.
- A `wikiSlug` referenced here must exist as a real entity (or be authored in the same pack).
- World-state grants (e.g. BOO G shop->shrine) name a stable state key, not free text.
- Keep first-run unlocks `once: true` so they do not spam on replays.

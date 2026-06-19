# Schemas - record families

Match these to the live types. When a type below is marked DEFERRED it has no code home yet -
propose the addition explicitly before authoring against it.

## Office (live: `@ndg/shared` world.ts)
```ts
type OfficeId = 1 | 2 | 3 | 4 | 5 | 6;
type DoorId   = OfficeId;                 // Door mirrors Office for now; may diverge
interface OfficeInfo { id: OfficeId; office: string; director: string; domain: string; }
```
Canonical table (do not renumber): 1 Favor/The One/Null Providence, 2 Graveyard/John/Earth,
3 Death/Peter/Shadow Keep, 4 Myth/Robert/Infernus, 5 Archive/Alice/Frost Reach,
6 Corruption/Jane/Aberrant. `domainToOffice(domainId)` maps travel order -> Office (explicit table,
never a cast).

## Face (live: `@ndg/ai-engine` faces/face.ts)
```ts
type RevealRole  = 'monster' | 'omen' | 'room' | 'opening';
type JumpProfile = 'aggressive' | 'watching' | 'defensive' | 'unstable';
interface Face {
  id: string;            // stable kebab, e.g. 'face-custodian'
  label: string;
  glyph: string;         // color-independent token, e.g. 'skull'
  officeId: OfficeId;
  revealRole: RevealRole;
  effects: string[];     // short UI descriptors the resolver/combat consume
  jumpProfile: JumpProfile;
  mythTags: string[];
  wikiSlug: string;      // e.g. 'face-the-custodian'
}
```

## Jump (live: faces/jump-check.ts)
```ts
type JumpOutcome = 'jump' | 'watch' | 'open';
interface JumpModifier { startScoreMult: number; throwDisadvantage: number; } // +hpDelta? = DEFERRED
```

## Bone (DEFERRED - schema layer above dice)
```ts
interface Bone {
  id: string;
  legacyDieSides: 4 | 6 | 8 | 10 | 12 | 20;  // bridge to existing dice during migration
  officeId: OfficeId;
  shape: string;
  facePoolId: string;                          // which Faces this Bone can reveal
}
```

## Run output records (DEFERRED - emitted at Bury/Summarize)
```ts
interface RunRecords {
  archiveEvents: Array<{ id: string; kind: string; at: number; data: Record<string, unknown> }>;
  graveyardEntries: Array<{ id: string; buried: string; stillActive: boolean }>;
  mythDelta: number;
  favorDelta: Record<OfficeId, number>;
  corruptionDelta: number;
  wikiUnlocks: string[];   // wikiSlugs
}
```

## Conventions
- IDs: `face-*`, `bone-*`, `office-*`; slugs: `face-the-*`, lowercase kebab.
- Telemetry names an entity touches are listed in its pack docs (see `unlock-map.md`).
- No runtime logic in data modules; pure records only.

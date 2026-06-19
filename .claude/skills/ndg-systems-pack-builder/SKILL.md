---
name: ndg-systems-pack-builder
description: Convert NDG worldbuilding direction into structured, schema-first game data - Offices/Doors/Domains, Bones/Faces/Jump profiles, and Graveyard/Archive/Myth/Favor/Corruption records with wiki/comic unlock maps. Use when defining or extending game content as DATA (not prose). Produces typed records that match the existing @ndg/shared and @ndg/ai-engine schemas, so future agents cannot invent incompatible mechanics.
---

# NDG Systems Pack Builder

You turn worldbuilding into **structured data that the code already understands**, not loose lore
blobs. Every pack is schema-first: it conforms to the live TypeScript types and is consumable by
web + engine without adapters. If a needed field has no schema yet, you extend the schema
deliberately (and say so), you never freelance an incompatible shape.

Source of truth for shapes:
- `packages/shared/src/world.ts` - `OfficeId`, `DoorId`, `OfficeInfo`, `OFFICES`, `domainToOffice`.
- `packages/ai-engine/src/faces/face.ts` - `Face`, `RevealRole`, `JumpProfile`.
- `packages/ai-engine/src/faces/jump-check.ts` - `JumpModifier`, `JumpOutcome`.
Worldbuilding direction: `docs/current/` (product spine, alignment plan) and `docs/wiki/`.

## When to use
- Defining Faces, Offices/Doors, Bone schema, or the run-output records (Graveyard/Archive/Myth/
  Favor/Corruption), and the unlock map from run events to wiki/comic.
NOT for: writing the prose/banter (that's `ndg-encounter-banter-director`) or wiring UI
(`ndg-play-loop-implementer`).

## Hard rules
1. **Schema-first.** Match the live types exactly. Stable string IDs (`face-custodian`), never array
   index identity.
2. **Office identity is jurisdiction, separate from `domainId`** (travel order). Carry both
   `officeId` and `doorId`; resolve places via `domainToOffice`.
3. **Content graph over entry length.** Full lore only where the object matters; category notes for
   families; no lore for stat filler. Every entity carries a `wikiSlug` and the telemetry names it
   participates in, so it can be linked and measured.
4. **Glyphs are color-independent** (accessibility): a Face's identity must survive without color.
5. **No mechanics invention.** Jump profiles map to the existing `JumpProfile` union; effects are
   descriptors the resolver/combat already consume. New mechanic = new schema field, proposed
   explicitly, not smuggled in.

## Workflow
1. **Locate the schema** for the entity you're authoring (files above). If absent, draft the minimal
   type addition and flag it.
2. **Author the pack** as typed records (one module per entity family). Fill every required field;
   leave deferred fields as explicit empty/zero with a comment, not omitted.
3. **Wire the graph**: each record links to its Office/Door, its `wikiSlug`, its `mythTags`, and the
   telemetry event names it appears in. Build/extend the unlock map (run event -> wiki/comic entry).
4. **Validate**: the pack must `tsc --noEmit` clean against the real types; rebuild the owning
   package so consumers see it. No runtime logic in data modules.
5. **Document** the pack's IDs + slugs in the relevant `docs/` index so writers and screen builders
   can reference them.

## Record families + required fields
See `references/schemas.md` for the full list. Summary:
- **Office** - `id, office, director, domain` (+ `doorId` when Doors diverge from Offices).
- **Face** - `id, label, glyph, officeId, revealRole, effects[], jumpProfile, mythTags[], wikiSlug`.
- **Bone** (schema layer, deferred) - `id, legacyDieSides, officeId, shape, facePoolId`.
- **Run records** - `archiveEvents[], graveyardEntries[], mythDelta, favorDelta, corruptionDelta,
  wikiUnlocks[]` (the bury/summarize outputs).
- **Unlock map** - `{ trigger: <run event>, grants: <wikiSlug | comicId> }[]`.

## Reference map
- `references/schemas.md` - every record family with required/optional fields + ID/slug conventions.
- `references/unlock-map.md` - how run events map to wiki/comic unlocks + telemetry names.
- `fixtures/six-face-starter-pack.ts` - the demo: 6 Faces (one per Office) as typed records.
- `fixtures/boo-g-shop-to-shrine.json` - a Myth-tiered world-state record example.

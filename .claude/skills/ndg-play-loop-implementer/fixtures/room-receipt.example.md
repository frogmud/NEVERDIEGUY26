# Room receipt - sample output

A "room receipt" is the short post-room confirmation, distinct from the full `What Remained`
end-of-run summary. For the first slice the existing `portals`/`summary` panels stand in as the
receipt. When you build a dedicated receipt, emit a structured record (not just a screen) so it can
feed Archive/Graveyard/Myth later.

## Sample structured receipt (target shape)
```json
{
  "kind": "room_receipt",
  "domainId": 3,
  "officeId": 4,
  "roomIndex": 1,
  "result": "win",
  "score": 412,
  "scoreGoal": 380,
  "goldEarned": 60,
  "faces": ["face-custodian", "face-rumor", "face-record"],
  "response": "throw",
  "jump": { "outcome": "jump", "startScoreMult": 0.8, "throwDisadvantage": 1 },
  "deltas": { "mythDelta": 0, "favorDelta": 0, "corruptionDelta": 0 },
  "buried": [],
  "wikiUnlocks": []
}
```

## Sample on-screen receipt (minimal, slice-level)
```
ROOM CLEARED
The Custodian jumped - you took it head-on.
Score 412 / 380     Gold +60
[ Continue ]
```

## Notes
- `deltas`, `buried`, and `wikiUnlocks` are placeholders in the first slice (all empty/zero). They
  become real when Graveyard/Myth/Favor persistence lands (deferred backlog).
- The receipt is per-room; `What Remained` is per-run and aggregates these records.
- Keep the receipt non-blocking on a win; it must not gate the portals/shop flow.

# Beat matrix - what a full pack must fill

A complete encounter pack covers every beat across three Myth tiers; the `jump` beat additionally
covers all three outcomes. That is the grid you fill.

## Grid
| Beat | low | mid | high |
|------|-----|-----|------|
| intro | x | x | x |
| reveal | x | x | x |
| response_pressure | x | x | x |
| jump / outcome=jump | x | x | x |
| jump / outcome=watch | x | x | x |
| jump / outcome=open | x | x | x |
| victory | x | x | x |
| fail | x | x | x |
| flee | x | x | x |

That is 9 rows x 3 tiers = 27 lines for a full single-Face pack (jump counts as 3 rows).

## Minimums
- POC pack: at least `reveal`, `response_pressure`, `jump` (all 3 outcomes), `fail` - across all 3
  tiers. Other beats can default to the mid line until written.
- BOO G drift table: `intro`/`response_pressure`/`victory` across low/mid/high is enough to show the
  shop -> shrine voice shift.

## Keys (must be present on every line)
- `beat` (one of the grid rows), `myth` (`low|mid|high`), and `outcome` only when `beat==='jump'`.
- `faceId` + `officeId` + `banterPoolId` on the pack header.

## Validation
- Every (beat, myth) present for the pack's declared scope; jump has all outcomes per tier.
- No duplicate (beat, myth, outcome) keys.
- Each line passes `voice-checklist.md`.

# Presentational panel contract

Reveal/Response/Receipt panels live in `apps/web/src/screens/play/panels/`. They are **dumb**:

## Allowed
- `useRun()` to read `state` and call action creators (`castBones`, `chooseResponse`,
  `transitionToPanel`).
- `@neverdieguy/ui` components: `BaseCard`, `DataBadge`, `MenuButton`, `Chip`, `LinearProgress`,
  `PageHeader`. Prefer these over raw MUI to dogfood the DS.
- `tokens` from `../../../theme` for color/spacing/font.
- Local UI-only `useState` (e.g. a reveal animation toggle).

## Not allowed
- Game logic (RNG, scoring, jump resolution) - that belongs in `@ndg/ai-engine` action creators.
- Reading or writing combat state.
- Persistence, navigation outside the panel system, network calls.

## Shape (mirror FaceRevealPanel / ResponsePhasePanel)
```tsx
export function XPanel() {
  const { state, chooseResponse, transitionToPanel } = useRun();
  // read state.* ; render @neverdieguy/ui ; dispatch on interaction
}
```

## Panel wiring checklist
- [ ] Add the panel value to `CenterPanel` in `RunContext`.
- [ ] Add an `isInX` flag in `PlayHub` (`state.centerPanel === 'x' && !state.runEnded`).
- [ ] Add a render branch in the center-content conditional with the `panelEnter` animation.
- [ ] Route entry into the panel via `transitionToPanel('x')` from the prior beat (and any
      auto-launch effects).
- [ ] Confirm the auto-save coerces the panel to `globe` (transient panels are not persisted).

# NPC Dialog Refinement - Worktree Focus

**Branch:** feat/npc-dialog-refinement
**Purpose:** Continuous NPC chatbase and dialog system improvements

## Scope

This worktree is dedicated ONLY to NPC dialog work:

1. **Chatbase Quality** - Improve NPC dialogue variety and authenticity
2. **Personality Tuning** - Refine NPC persona responses
3. **Context Awareness** - Better domain/event context in replies
4. **Dialog Templates** - Expand template library for variety

## Key Files

- `packages/ai-engine/scripts/npc-chatbase-restock.ts` - Main restock script
- `packages/ai-engine/scripts/lib/dialogue-templates.ts` - Template library
- `apps/web/src/data/npc/chatbase/*.json` - Chatbase data files
- `apps/web/src/components/NpcChatPanel.tsx` - Chat UI

## Workflow

1. Review chatbase quality audits
2. Enhance dialogue templates
3. Run restock script with Claude healing
4. Verify output quality
5. Commit to this branch
6. PR back to main when batch is ready

## Commands

Restock with Claude:
```bash
cd packages/ai-engine
pnpm exec tsx scripts/npc-chatbase-restock.ts --passes=1000 --claude --healing
```

Audit chatbase quality:
```bash
pnpm exec tsx scripts/audit-chatbase-quality.ts
```

## DO NOT

- Touch game logic, combat, or scoring
- Modify balance-config.ts
- Change UI layouts or routing
- Run npm/pnpm without asking user

# CLAUDE.md - PR Cleanup Worktree

This worktree is for general maintenance, cleanup, and non-feature improvements. Keep changes small and focused.

## Suggested Cleanup Tasks

### Git Status Cleanup - DONE
API migration completed in commit `b255703`. Files moved from `apps/web/api/` to root `api/` for Vercel serverless functions.

Current structure at `api/`:
- `chat.ts` - NPC dialogue POST endpoint
- `health.ts` - Health check GET endpoint
- `stats.ts` - Lookup stats GET endpoint
- `_lib/chatbase-data.ts` - Static NPC chatbase data loader
- `_lib/lookup.ts` - Chatbase lookup engine
- `tsconfig.json` - TypeScript config with monorepo paths

### Code Hygiene - DONE
Completed in commit `fcdf129`:
- Removed debug console.log statements from ReportGameDialog, SidebarSetup, Contact, storage.ts
- Prefixed unused function params with underscore for TypeScript compliance
- No orphaned/backup files found

### Dependency Cleanup - DONE
- Removed duplicate `@vercel/node` from apps/web (already exists in root for API)

### Project Structure
- No orphaned files found
- Folder organization is consistent

## Branch Info

- Branch: `cleanup/general`
- Base: `main`

## Workflow

1. Pick a focused cleanup task
2. Make minimal, targeted changes
3. Commit with clear message: `chore: <description>`
4. Create PR when ready

## Rules

- Keep PRs small and reviewable
- Do not mix cleanup with feature work
- Do not run npm/pnpm commands without asking the user
- No emojis in code/docs
- NEVER DIE GUY is trademarked (no other taglines)

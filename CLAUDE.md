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

### Code Hygiene
- Remove unused imports and dead code
- Fix TypeScript strict mode warnings
- Clean up console.log statements
- Standardize file naming conventions

### Dependency Cleanup
- Remove unused dependencies from package.json
- Update outdated (non-security) dependencies
- Clean up duplicate type definitions

### Project Structure
- Remove orphaned/unused files
- Ensure consistent folder organization

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

# AI Engine Security Audit - Index

**Project:** NEVER DIE GUY
**Date:** 2026-01-18
**Auditor:** AI-STRESS (Claude Sonnet 4.5)
**Status:** COMPLETE

---

## Overview

This directory contains the results of a comprehensive security and stress test audit of the NEVER DIE GUY AI engine. The audit focused on identifying crashes, edge cases, and vulnerabilities across all core AI systems.

## Files

### 1. `ai-stress-harness.ts`

Automated stress test suite that systematically tests vulnerabilities in:
- Seeded RNG (hash collisions, overflow, unicode)
- Relationship stats (boundary conditions, overflow)
- Memory system (event spam, trauma bonds)
- Intent detection (ReDoS, regex patterns)
- Response selection (weighted selection, precision)
- Eternal stream (recursion, performance)
- Malformed input handling

**Usage:**
```bash
cd /Users/kevin/atlas-t/NEVERDIEGUY26
ts-node audit/ai-stress-harness.ts
```

**Output:**
- Test results by category (RNG, Relationship, Memory, Intent, Response, Stream, Malformed)
- Pass/Fail/Crash status for each test
- Performance metrics (duration per test)
- Exit code: 0 = all pass, 1 = crashes or failures

---

### 2. `ai-edge-cases.md`

Catalog of 36 edge cases and input malformations, organized by module:

**Categories:**
- **EC-RNG:** Seeded RNG edge cases (hash collisions, unicode, namespace)
- **EC-REL:** Relationship system boundaries (stat overflow, price modifiers)
- **EC-MEM:** Memory system issues (event spam, trauma bonds, lost events)
- **EC-INT:** Intent detection patterns (regex, ReDoS, emoji)
- **EC-RSP:** Response selection (weighted selection, empty candidates)
- **EC-STR:** Eternal stream (recursion, performance, invalid domains)
- **EC-MAL:** Malformed input (null values, circular refs, type errors)

**Format per case:**
- Description
- Input example
- Expected vs. actual behavior
- Crash status
- Performance metrics

---

### 3. `ai-findings.md`

Comprehensive security findings with severity ratings and fix recommendations:

**Severity Breakdown:**
- **P0 (Critical):** 2 findings - Infinite recursion, NaN propagation
- **P1 (High):** 5 findings - Hash collisions, memory loss, no unit tests, performance DoS, trauma bond exploit
- **P2 (Medium):** 5 findings - Regex false positives, UI blocking, cooldown gaps
- **P3 (Low):** 3 findings - Missing features, logging, config

**Includes:**
- Detailed vulnerability descriptions
- Reproduction steps
- Code snippets (vulnerable + fixed)
- Impact analysis
- Test cases for each fix
- 4-phase action plan with time estimates

---

## Critical Findings Summary

### P0-001: Infinite Recursion in Eternal Stream
**File:** `packages/ai-engine/src/stream/eternal-stream.ts`
**Impact:** Crashes if 'earth' domain is missing
**Fix:** Add recursion depth limit (2-3 redirects max)

### P0-002: NaN Propagation from Null Stats
**Files:** `relationship.ts`, `memory.ts`
**Impact:** Silent data corruption, broken game balance
**Fix:** Add null checks and type guards with defaults

### P1-001: Hash Collision Vulnerability
**File:** `seeded-rng.ts`
**Impact:** Different seeds produce identical RNG sequences (3-7% collision rate)
**Fix:** Use FNV-1a or MurmurHash3, handle -2^31 edge case

### P1-002: Important Events Lost
**File:** `memory.ts`
**Impact:** Events with weight=5 (bad trades) forgotten after 10 turns
**Fix:** Lower threshold to 5 or add medium-term memory tier

### P1-003: No Unit Tests
**Files:** All
**Impact:** Cannot refactor safely, regressions undetectable
**Fix:** Implement Vitest suite with 90%+ coverage

---

## Quick Start

### Run the Stress Tests

```bash
# From project root
cd /Users/kevin/atlas-t/NEVERDIEGUY26

# Install dependencies if needed
pnpm install

# Run stress harness
pnpm exec ts-node audit/ai-stress-harness.ts
```

### Review Findings

1. **Start with P0/P1 issues:** Read `ai-findings.md` sections for critical bugs
2. **Check edge cases:** Review `ai-edge-cases.md` for specific malformed inputs
3. **Apply fixes:** Copy recommended code snippets into source files
4. **Re-run tests:** Verify fixes with `ts-node audit/ai-stress-harness.ts`

---

## Recommended Action Plan

### Phase 1: Critical Fixes (4-6 hours) - BEFORE MVP

- [ ] Fix infinite recursion in eternal-stream.ts
- [ ] Add null checks to modifyStat() and updateOpinion()
- [ ] Improve hash function or handle -2^31 edge case
- [ ] Lower memory threshold to 5 or add medium-term tier
- [ ] Add seed length limit (10k chars max)
- [ ] Deduplicate involvedNPCs before trauma bond calc

### Phase 2: Test Coverage (20-30 hours) - POST MVP

- [ ] Set up Vitest with coverage reporting
- [ ] Write 80+ tests for seeded-rng
- [ ] Write 60+ tests for relationship
- [ ] Write 50+ tests for memory
- [ ] Write 40+ tests for intent-detector
- [ ] Write 30+ tests for eternal-stream
- [ ] Achieve 90%+ coverage

### Phase 3: P2 Fixes (8-12 hours) - FUTURE

- [ ] Fix question detection regex
- [ ] Add streaming for large generations
- [ ] Enforce global template cooldowns
- [ ] Add price modifier randomness
- [ ] Support emoji in intent detection

### Phase 4: P3 Improvements (4-6 hours) - BACKLOG

- [ ] Use intensity in mood derivation
- [ ] Add debug logging with env flag
- [ ] Centralize magic constants into config

---

## Test Statistics

**Total Edge Cases Documented:** 36

**Severity Distribution:**
- P0 (Critical): 2
- P1 (High): 5
- P2 (Medium): 5
- P3 (Low): 3

**Module Coverage:**
- Seeded RNG: 7 edge cases
- Relationship: 6 edge cases
- Memory: 6 edge cases
- Intent Detection: 5 edge cases
- Response Selection: 4 edge cases
- Eternal Stream: 5 edge cases
- Malformed Input: 3 edge cases

**Performance Benchmarks:**
- Hash 10k chars: ~2ms (acceptable)
- Hash 1M chars: ~500ms (DoS risk)
- Generate 10k stream entries: ~3-4s (UI blocking)
- Intent detection (1000 chars): ~10ms (acceptable)

---

## Known Limitations

This audit does NOT cover:
- Combat engine (separate system)
- API rate limiting (handled by Vercel)
- Database persistence (no database in MVP)
- Client-side validation (web app)
- Multiplayer/PartyKit systems (separate branch)

---

## Contact

For questions about this audit:
- **Audit Files:** `/Users/kevin/atlas-t/NEVERDIEGUY26/audit/`
- **AI Engine Source:** `/Users/kevin/atlas-t/NEVERDIEGUY26/packages/ai-engine/src/`
- **Project Docs:** `/Users/kevin/atlas-t/NEVERDIEGUY26/docs/`

---

## License

This audit is part of the NEVER DIE GUY project and follows the same license terms.

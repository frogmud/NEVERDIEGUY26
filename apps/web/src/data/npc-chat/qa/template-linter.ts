/**
 * Template Linter
 *
 * Validates NPC chat templates for common issues:
 * - Missing required fields
 * - Undefined variables
 * - Invalid pool/mood combinations
 * - Orphaned templates (no NPC personality matches)
 * - Weight distribution issues
 */

import type {
  ResponseTemplate,
  NPCPersonalityConfig,
  TemplatePool,
  MoodType,
  MessagePurpose,
} from '../types';
import { findUndefinedVariables, getKnownVariables } from '../variable-processor';
import { getKnownDomains } from '../domain-tint';

// ============================================
// Lint Result Types
// ============================================

export type LintSeverity = 'error' | 'warning' | 'info';

export interface LintIssue {
  severity: LintSeverity;
  code: string;
  message: string;
  templateId?: string;
  npcSlug?: string;
  field?: string;
}

export interface LintResult {
  valid: boolean;
  issues: LintIssue[];
  stats: {
    totalTemplates: number;
    templatesPerNPC: Record<string, number>;
    templatesPerPool: Record<string, number>;
    templatesPerMood: Record<string, number>;
  };
}

// ============================================
// Valid Values
// ============================================

const VALID_POOLS: TemplatePool[] = [
  'greeting',
  'salesPitch',
  'hint',
  'lore',
  'challenge',
  'reaction',
  'threat',
  'idle',
];

const VALID_MOODS: MoodType[] = [
  'generous',
  'pleased',
  'neutral',
  'amused',
  'cryptic',
  'annoyed',
  'threatening',
];

const VALID_PURPOSES: MessagePurpose[] = [
  'tutorial',
  'shop',
  'warning',
  'reward',
  'lore',
  'challenge',
  'meta',
  'ambient',
];

// ============================================
// Linting Functions
// ============================================

/**
 * Lint a single template
 */
export function lintTemplate(
  template: ResponseTemplate,
  knownNPCs: string[]
): LintIssue[] {
  const issues: LintIssue[] = [];

  // Required fields
  if (!template.id) {
    issues.push({
      severity: 'error',
      code: 'MISSING_ID',
      message: 'Template missing required "id" field',
      templateId: template.id,
    });
  }

  if (!template.entitySlug) {
    issues.push({
      severity: 'error',
      code: 'MISSING_ENTITY_SLUG',
      message: 'Template missing required "entitySlug" field',
      templateId: template.id,
    });
  }

  if (!template.text || template.text.trim() === '') {
    issues.push({
      severity: 'error',
      code: 'EMPTY_TEXT',
      message: 'Template has empty text',
      templateId: template.id,
    });
  }

  // Valid pool
  if (!VALID_POOLS.includes(template.pool)) {
    issues.push({
      severity: 'error',
      code: 'INVALID_POOL',
      message: `Invalid pool "${template.pool}". Valid: ${VALID_POOLS.join(', ')}`,
      templateId: template.id,
      field: 'pool',
    });
  }

  // Valid mood
  if (template.mood !== 'any' && !VALID_MOODS.includes(template.mood as MoodType)) {
    issues.push({
      severity: 'error',
      code: 'INVALID_MOOD',
      message: `Invalid mood "${template.mood}". Valid: ${VALID_MOODS.join(', ')}, any`,
      templateId: template.id,
      field: 'mood',
    });
  }

  // Valid purpose
  if (!VALID_PURPOSES.includes(template.purpose)) {
    issues.push({
      severity: 'error',
      code: 'INVALID_PURPOSE',
      message: `Invalid purpose "${template.purpose}". Valid: ${VALID_PURPOSES.join(', ')}`,
      templateId: template.id,
      field: 'purpose',
    });
  }

  // Weight range
  if (template.weight <= 0) {
    issues.push({
      severity: 'warning',
      code: 'ZERO_WEIGHT',
      message: 'Template has zero or negative weight - will never be selected',
      templateId: template.id,
      field: 'weight',
    });
  }

  if (template.weight > 100) {
    issues.push({
      severity: 'info',
      code: 'HIGH_WEIGHT',
      message: 'Template has unusually high weight (>100)',
      templateId: template.id,
      field: 'weight',
    });
  }

  // Orphaned template (no matching NPC)
  if (template.entitySlug && !knownNPCs.includes(template.entitySlug)) {
    issues.push({
      severity: 'warning',
      code: 'ORPHANED_TEMPLATE',
      message: `Template references unknown NPC "${template.entitySlug}"`,
      templateId: template.id,
      npcSlug: template.entitySlug,
    });
  }

  // Undefined variables
  const domainVars = getKnownDomains().flatMap((d) => [
    `{{${d}Hazard}}`,
    `{{${d}Director}}`,
  ]);
  const undefinedVars = findUndefinedVariables(template.text, domainVars);
  if (undefinedVars.length > 0) {
    issues.push({
      severity: 'warning',
      code: 'UNDEFINED_VARIABLES',
      message: `Template uses undefined variables: ${undefinedVars.join(', ')}`,
      templateId: template.id,
    });
  }

  // Quick reply validation
  if (template.quickReplies) {
    for (const reply of template.quickReplies) {
      if (!reply.verb || !reply.label) {
        issues.push({
          severity: 'error',
          code: 'INVALID_QUICK_REPLY',
          message: 'Quick reply missing required verb or label',
          templateId: template.id,
        });
      }
    }
  }

  // Action validation
  if (template.action) {
    const validActions = [
      'openShop',
      'startChallenge',
      'grantHint',
      'offerDeal',
      'unlockPath',
      'grantItem',
      'adjustRelationship',
    ];
    if (!validActions.includes(template.action.type)) {
      issues.push({
        severity: 'warning',
        code: 'UNKNOWN_ACTION_TYPE',
        message: `Unknown action type "${template.action.type}"`,
        templateId: template.id,
      });
    }
  }

  return issues;
}

/**
 * Lint all templates for an NPC
 */
export function lintNPCTemplates(
  templates: ResponseTemplate[],
  npcSlug: string,
  personality: NPCPersonalityConfig
): LintIssue[] {
  const issues: LintIssue[] = [];
  const npcTemplates = templates.filter((t) => t.entitySlug === npcSlug);

  // Coverage checks
  for (const pool of VALID_POOLS) {
    const poolTemplates = npcTemplates.filter((t) => t.pool === pool);
    if (poolTemplates.length === 0) {
      issues.push({
        severity: 'warning',
        code: 'MISSING_POOL_COVERAGE',
        message: `NPC has no templates for pool "${pool}"`,
        npcSlug,
      });
    }
  }

  // Mood coverage
  for (const mood of VALID_MOODS) {
    const moodTemplates = npcTemplates.filter(
      (t) => t.mood === mood || t.mood === 'any'
    );
    if (moodTemplates.length === 0) {
      issues.push({
        severity: 'info',
        code: 'MISSING_MOOD_COVERAGE',
        message: `NPC has no templates for mood "${mood}" (and no "any" fallbacks)`,
        npcSlug,
      });
    }
  }

  // Weight distribution per pool
  for (const pool of VALID_POOLS) {
    const poolTemplates = npcTemplates.filter((t) => t.pool === pool);
    if (poolTemplates.length > 0) {
      const totalWeight = poolTemplates.reduce((sum, t) => sum + t.weight, 0);
      const maxWeight = Math.max(...poolTemplates.map((t) => t.weight));

      if (maxWeight / totalWeight > 0.8) {
        issues.push({
          severity: 'info',
          code: 'UNBALANCED_WEIGHTS',
          message: `Pool "${pool}" has one template with >80% of total weight`,
          npcSlug,
        });
      }
    }
  }

  // Personality name matches
  if (!personality.name) {
    issues.push({
      severity: 'error',
      code: 'MISSING_PERSONALITY_NAME',
      message: 'NPC personality config missing name',
      npcSlug,
    });
  }

  return issues;
}

/**
 * Lint all templates and personalities
 */
export function lintAll(
  templates: ResponseTemplate[],
  personalities: NPCPersonalityConfig[]
): LintResult {
  const issues: LintIssue[] = [];
  const knownNPCs = personalities.map((p) => p.slug);

  // Lint each template
  for (const template of templates) {
    issues.push(...lintTemplate(template, knownNPCs));
  }

  // Lint each NPC
  for (const personality of personalities) {
    issues.push(...lintNPCTemplates(templates, personality.slug, personality));
  }

  // Check for duplicate template IDs
  const idCounts: Record<string, number> = {};
  for (const template of templates) {
    idCounts[template.id] = (idCounts[template.id] || 0) + 1;
  }
  for (const [id, count] of Object.entries(idCounts)) {
    if (count > 1) {
      issues.push({
        severity: 'error',
        code: 'DUPLICATE_ID',
        message: `Template ID "${id}" used ${count} times`,
        templateId: id,
      });
    }
  }

  // Calculate stats
  const templatesPerNPC: Record<string, number> = {};
  const templatesPerPool: Record<string, number> = {};
  const templatesPerMood: Record<string, number> = {};

  for (const template of templates) {
    templatesPerNPC[template.entitySlug] =
      (templatesPerNPC[template.entitySlug] || 0) + 1;
    templatesPerPool[template.pool] = (templatesPerPool[template.pool] || 0) + 1;
    templatesPerMood[template.mood] = (templatesPerMood[template.mood] || 0) + 1;
  }

  const hasErrors = issues.some((i) => i.severity === 'error');

  return {
    valid: !hasErrors,
    issues,
    stats: {
      totalTemplates: templates.length,
      templatesPerNPC,
      templatesPerPool,
      templatesPerMood,
    },
  };
}

/**
 * Format lint results for console output
 */
export function formatLintResults(result: LintResult): string {
  const lines: string[] = [];

  lines.push(`\n=== NPC Chat Template Lint Results ===\n`);
  lines.push(`Total Templates: ${result.stats.totalTemplates}`);
  lines.push(`Valid: ${result.valid ? 'Yes' : 'No'}`);
  lines.push('');

  // Stats
  lines.push('Templates per NPC:');
  for (const [npc, count] of Object.entries(result.stats.templatesPerNPC)) {
    lines.push(`  ${npc}: ${count}`);
  }
  lines.push('');

  lines.push('Templates per Pool:');
  for (const [pool, count] of Object.entries(result.stats.templatesPerPool)) {
    lines.push(`  ${pool}: ${count}`);
  }
  lines.push('');

  // Issues by severity
  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');
  const infos = result.issues.filter((i) => i.severity === 'info');

  if (errors.length > 0) {
    lines.push(`ERRORS (${errors.length}):`);
    for (const issue of errors) {
      lines.push(`  [${issue.code}] ${issue.message}`);
      if (issue.templateId) lines.push(`    Template: ${issue.templateId}`);
      if (issue.npcSlug) lines.push(`    NPC: ${issue.npcSlug}`);
    }
    lines.push('');
  }

  if (warnings.length > 0) {
    lines.push(`WARNINGS (${warnings.length}):`);
    for (const issue of warnings) {
      lines.push(`  [${issue.code}] ${issue.message}`);
    }
    lines.push('');
  }

  if (infos.length > 0) {
    lines.push(`INFO (${infos.length}):`);
    for (const issue of infos) {
      lines.push(`  [${issue.code}] ${issue.message}`);
    }
  }

  return lines.join('\n');
}

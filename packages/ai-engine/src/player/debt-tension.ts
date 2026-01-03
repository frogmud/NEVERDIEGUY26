/**
 * Escalating Debt Tension System
 *
 * Small debts are flavor text, large debts become threatening narrative.
 * NPCs reference debt with increasing urgency as amounts grow.
 */

// ============================================
// Core Types
// ============================================

/**
 * Debt tension levels affect dialogue tone
 */
export type DebtTension = 'none' | 'minor' | 'notable' | 'threatening';

/**
 * Thresholds for debt tension levels
 */
export const DEBT_THRESHOLDS = {
  minor: 100,       // Casual mention: "You still owe me a few coins..."
  notable: 300,     // Pointed reference: "That 300 gold isn't forgotten."
  threatening: 600, // Narrative pressure: "We need to discuss your... obligations."
} as const;

// ============================================
// Tension Calculation
// ============================================

/**
 * Get debt tension level from amount owed
 */
export function getDebtTension(debt: number): DebtTension {
  if (debt >= DEBT_THRESHOLDS.threatening) return 'threatening';
  if (debt >= DEBT_THRESHOLDS.notable) return 'notable';
  if (debt >= DEBT_THRESHOLDS.minor) return 'minor';
  return 'none';
}

/**
 * Get tension for a specific NPC from player debts
 */
export function getDebtTensionForNPC(
  debtsTo: Record<string, number>,
  npcSlug: string
): DebtTension {
  const debt = debtsTo[npcSlug] || 0;
  return getDebtTension(debt);
}

/**
 * Get total debt across all NPCs
 */
export function getTotalDebt(debtsTo: Record<string, number>): number {
  return Object.values(debtsTo).reduce((sum, debt) => sum + debt, 0);
}

/**
 * Get count of NPCs the player owes money to
 */
export function getCreditorCount(debtsTo: Record<string, number>): number {
  return Object.values(debtsTo).filter(debt => debt > 0).length;
}

/**
 * Get the NPC the player owes the most to
 */
export function getTopCreditor(debtsTo: Record<string, number>): { npc: string; amount: number } | null {
  const entries = Object.entries(debtsTo);
  if (entries.length === 0) return null;

  const sorted = entries.sort((a, b) => b[1] - a[1]);
  const [npc, amount] = sorted[0];

  if (amount <= 0) return null;
  return { npc, amount };
}

// ============================================
// Dialogue Helpers
// ============================================

/**
 * Get a tension-appropriate debt phrase
 */
export function getDebtPhrase(tension: DebtTension, amount: number): string {
  switch (tension) {
    case 'none':
      return '';
    case 'minor':
      return `those ${amount} gold`;
    case 'notable':
      return `the ${amount} gold you owe me`;
    case 'threatening':
      return `your ${amount} gold debt`;
  }
}

/**
 * Example dialogue templates by tension level
 * (For reference - actual templates are in chatbase)
 */
export const DEBT_DIALOGUE_EXAMPLES: Record<DebtTension, string> = {
  none: 'Normal dialogue, no debt mention',
  minor: "Good to see you. *glances at ledger* We're still square, right?",
  notable: "Ah, my favorite debtor. Those {{debtAmount}} gold aren't earning interest... yet.",
  threatening: "We need to talk about your {{debtAmount}} gold. The Void is patient. I am not.",
};

// ============================================
// Rescue Tracking
// ============================================

/**
 * Check if an NPC rescued the player recently (within N runs)
 */
export function rescuedRecently(
  rescuedBy: Record<string, number>,
  npcSlug: string,
  currentRun: number,
  recentWindow: number = 3
): boolean {
  // Note: This needs last rescue run tracking, not just count
  // For now, just check if they've rescued at all
  return (rescuedBy[npcSlug] || 0) > 0;
}

/**
 * Get total rescue count by an NPC
 */
export function getRescueCount(
  rescuedBy: Record<string, number>,
  npcSlug: string
): number {
  return rescuedBy[npcSlug] || 0;
}

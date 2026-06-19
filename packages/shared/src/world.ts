/**
 * @ndg/shared - World identity types
 *
 * Office and Door identity are jurisdiction concepts and must stay separate from
 * domainId (place / travel order). Do not collapse domainId into officeId.
 * See docs/current/08-app-systems-alignment-plan.md (Mismatch 1).
 */

/** The six Offices (jurisdictions). Stable across travel order. */
export type OfficeId = 1 | 2 | 3 | 4 | 5 | 6;

/** A Door belongs to an Office; for now Door identity mirrors Office identity. */
export type DoorId = OfficeId;

export interface OfficeInfo {
  id: OfficeId;
  /** Jurisdiction name (the system this Office governs). */
  office: string;
  /** The Die-rector who runs it. */
  director: string;
  /** The place currently associated with this Office. */
  domain: string;
}

/**
 * Canonical Office table. Source: app-systems-alignment-plan.md.
 * Order is by Office number, not by travel order.
 */
export const OFFICES: Record<OfficeId, OfficeInfo> = {
  1: { id: 1, office: 'Favor', director: 'The One', domain: 'Null Providence' },
  2: { id: 2, office: 'Graveyard', director: 'John', domain: 'Earth' },
  3: { id: 3, office: 'Death', director: 'Peter', domain: 'Shadow Keep' },
  4: { id: 4, office: 'Myth', director: 'Robert', domain: 'Infernus' },
  5: { id: 5, office: 'Archive', director: 'Alice', domain: 'Frost Reach' },
  6: { id: 6, office: 'Corruption', director: 'Jane', domain: 'Aberrant' },
};

/**
 * Map a travel-order domainId (1-6) to its Office.
 * This is an explicit table, not an identity cast - the two numbering schemes
 * are allowed to diverge later.
 */
const DOMAIN_TO_OFFICE: Record<number, OfficeId> = {
  1: 2, // Earth -> Graveyard
  2: 5, // Frost Reach -> Archive
  3: 4, // Infernus -> Myth
  4: 3, // Shadow Keep -> Death
  5: 1, // Null Providence -> Favor
  6: 6, // Aberrant -> Corruption
};

/** Resolve the Office for a given travel-order domainId. Defaults to Office 1. */
export function domainToOffice(domainId: number): OfficeId {
  return DOMAIN_TO_OFFICE[domainId] ?? 1;
}

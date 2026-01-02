/**
 * Player Mythology System
 *
 * NPCs build beliefs, rumors, and expectations about the player before meeting.
 * When they finally meet, NPCs act on and verbalize these myths.
 */

import type { MoodType, RelationshipStats } from '../core/types';
import type { BehavioralArchetype } from '../personality/behavioral-patterns';
import type {
  PlayerMyth,
  PlayerTheory,
  MythStatus,
  SimulationSnapshot,
} from '../search/search-types';
import { createSeededRng } from '../core/seeded-rng';

// ============================================
// Player Mythology Manager
// ============================================

export class PlayerMythologyManager {
  private myth: PlayerMyth;
  private npcArchetypes: Map<string, BehavioralArchetype>;
  private seed: string;

  constructor(seed: string = 'myth') {
    this.seed = seed;
    this.myth = this.createInitialMyth();
    this.npcArchetypes = new Map();
  }

  /**
   * Register an NPC's archetype for theory generation.
   */
  registerNPC(npcSlug: string, archetype: BehavioralArchetype): void {
    this.npcArchetypes.set(npcSlug, archetype);
  }

  /**
   * Record a game event that affects player mythology.
   */
  recordPlayerEvent(
    eventType: PlayerEventType,
    context: PlayerEventContext
  ): void {
    const fact = this.generateFact(eventType, context);
    if (fact && !this.myth.knownFacts.includes(fact)) {
      this.myth.knownFacts.push(fact);
    }

    this.updateMythStatus();

    for (const witness of context.witnesses || []) {
      this.maybeGenerateTheory(witness, eventType, context);
    }
  }

  /**
   * Spread a rumor from one NPC to another.
   */
  spreadRumor(
    fromNPC: string,
    toNPC: string,
    turnNumber: number
  ): SpreadResult | null {
    const rng = createSeededRng(`${this.seed}:spread:${turnNumber}`);

    const sharableTheories = this.myth.theories.filter(
      (t) =>
        t.believers.includes(fromNPC) &&
        !t.believers.includes(toNPC) &&
        !t.doubters.includes(toNPC)
    );

    if (sharableTheories.length === 0) return null;

    const theoryIndex = Math.floor(rng.random('pick') * sharableTheories.length);
    const theory = sharableTheories[theoryIndex];

    const toArchetype = this.npcArchetypes.get(toNPC) || 'diplomat';
    const believeChance = this.getBeliefChance(toArchetype, theory);

    const believed = rng.random('believe') < believeChance;

    if (believed) {
      theory.believers.push(toNPC);
    } else {
      theory.doubters.push(toNPC);
    }

    const sources = this.myth.rumorSources.get(theory.shortForm) || [];
    sources.push(fromNPC);
    this.myth.rumorSources.set(theory.shortForm, sources);

    this.updateExpectation(toNPC, theory.sentiment, believed);

    return {
      theory,
      believed,
      fromNPC,
      toNPC,
    };
  }

  /**
   * Get what an NPC believes about the player.
   */
  getNPCBeliefs(npcSlug: string): NPCPlayerBeliefs {
    const believedTheories = this.myth.theories.filter((t) =>
      t.believers.includes(npcSlug)
    );
    const doubtedTheories = this.myth.theories.filter((t) =>
      t.doubters.includes(npcSlug)
    );
    const expectation = this.myth.expectations.get(npcSlug) || 50;

    return {
      npcSlug,
      theories: believedTheories,
      doubts: doubtedTheories,
      expectation,
      overallSentiment: this.calculateNPCSentiment(believedTheories),
      knownFacts: this.myth.knownFacts,
      mythStatus: this.myth.status,
    };
  }

  /**
   * Generate dialogue for when NPC first meets the player.
   */
  generateFirstMeetingDialogue(npcSlug: string): FirstMeetingDialogue {
    const beliefs = this.getNPCBeliefs(npcSlug);
    const archetype = this.npcArchetypes.get(npcSlug) || 'diplomat';

    const lines: DialogueLine[] = [];

    const action = this.generateAction(beliefs, archetype);
    if (action) {
      lines.push({ type: 'action', content: action });
    }

    const expectation = this.generateExpectationLine(beliefs, archetype);
    if (expectation) {
      lines.push({ type: 'expectation', content: expectation });
    }

    if (beliefs.theories.length > 0) {
      const theory = beliefs.theories[0];
      const reference = this.generateTheoryReference(theory, archetype);
      if (reference) {
        lines.push({ type: 'theory', content: reference });
      }
    }

    const modifiers = this.calculateRelationshipModifiers(beliefs, archetype);

    return {
      npcSlug,
      lines,
      suggestedMood: this.getSuggestedMood(beliefs, archetype),
      relationshipModifiers: modifiers,
      tensionLevel: beliefs.expectation > 70 ? 0.6 : beliefs.expectation < 30 ? 0.3 : 0.4,
    };
  }

  /**
   * Evolve the mythology over time.
   */
  evolve(turnNumber: number, evolutionRate: number = 0.1): void {
    const rng = createSeededRng(`${this.seed}:evolve:${turnNumber}`);

    for (const theory of this.myth.theories) {
      const drift = (rng.random('drift') - 0.5) * evolutionRate;
      theory.confidence = Math.max(0.1, Math.min(1, theory.confidence + drift));
    }

    for (const trait of this.myth.suspectedTraits) {
      if (rng.random(`trait:${trait}`) < evolutionRate * 0.5) {
        if (!this.myth.knownFacts.includes(`Confirmed: ${trait}`)) {
          this.myth.knownFacts.push(`Confirmed: ${trait}`);
        }
      }
    }

    this.updateMythStatus();
  }

  // ============================================
  // Theory Generation
  // ============================================

  private maybeGenerateTheory(
    npcSlug: string,
    eventType: PlayerEventType,
    context: PlayerEventContext
  ): void {
    const archetype = this.npcArchetypes.get(npcSlug) || 'diplomat';
    const rng = createSeededRng(`${this.seed}:theory:${npcSlug}:${context.turnNumber}`);

    const theoryChance = this.getTheoryChance(archetype);
    if (rng.random('chance') > theoryChance) return;

    const theory = this.createTheory(npcSlug, eventType, context, archetype);
    if (theory) {
      const existing = this.myth.theories.find(
        (t) => t.shortForm === theory.shortForm
      );
      if (!existing) {
        this.myth.theories.push(theory);
      } else {
        existing.confidence = Math.min(1, existing.confidence + 0.1);
        if (!existing.believers.includes(npcSlug)) {
          existing.believers.push(npcSlug);
        }
      }
    }
  }

  private createTheory(
    npcSlug: string,
    eventType: PlayerEventType,
    context: PlayerEventContext,
    archetype: BehavioralArchetype
  ): PlayerTheory | null {
    const templates = THEORY_TEMPLATES[archetype] || THEORY_TEMPLATES.diplomat;
    const eventTemplates = templates[eventType];

    if (!eventTemplates || eventTemplates.length === 0) return null;

    const rng = createSeededRng(`${this.seed}:create:${npcSlug}:${context.turnNumber}`);
    const templateIndex = Math.floor(rng.random('template') * eventTemplates.length);
    const template = eventTemplates[templateIndex];

    return {
      originNPC: npcSlug,
      content: template.content(context),
      shortForm: template.shortForm,
      sentiment: template.sentiment,
      confidence: 0.5 + rng.random('confidence') * 0.3,
      believers: [npcSlug],
      doubters: [],
      spreadTurn: context.turnNumber,
    };
  }

  private getTheoryChance(archetype: BehavioralArchetype): number {
    const chances: Record<BehavioralArchetype, number> = {
      predator: 0.4,
      prey: 0.2,
      merchant: 0.35,
      sage: 0.5,
      warrior: 0.25,
      diplomat: 0.3,
      trickster: 0.6,
      opportunist: 0.45,
      guardian: 0.25,
      loyalist: 0.2,
    };
    return chances[archetype] || 0.3;
  }

  private getBeliefChance(archetype: BehavioralArchetype, theory: PlayerTheory): number {
    let baseChance = theory.confidence;

    const modifiers: Record<BehavioralArchetype, number> = {
      predator: -0.1,
      prey: 0.2,
      merchant: 0,
      sage: -0.2,
      warrior: -0.05,
      diplomat: 0.1,
      trickster: -0.15,
      opportunist: 0.15,
      guardian: 0,
      loyalist: 0.1,
    };

    baseChance += modifiers[archetype] || 0;

    if (theory.sentiment === 'positive') {
      baseChance += 0.1;
    } else if (theory.sentiment === 'negative') {
      baseChance -= 0.05;
    }

    return Math.max(0.1, Math.min(0.9, baseChance));
  }

  // ============================================
  // First Meeting Generation
  // ============================================

  private generateAction(
    beliefs: NPCPlayerBeliefs,
    archetype: BehavioralArchetype
  ): string | null {
    if (beliefs.expectation > 70) {
      const actions: Record<BehavioralArchetype, string> = {
        predator: '*watches you with predatory interest*',
        prey: '*backs away nervously*',
        merchant: '*rubs hands together eagerly*',
        sage: '*studies you intently*',
        warrior: '*grips weapon tighter*',
        diplomat: '*offers a respectful nod*',
        trickster: '*grins mischievously*',
        opportunist: '*eyes you appraisingly*',
        guardian: '*steps protectively forward*',
        loyalist: '*stands at attention*',
      };
      return actions[archetype] || '*takes notice*';
    } else if (beliefs.expectation < 30) {
      const actions: Record<BehavioralArchetype, string> = {
        predator: '*dismissively glances your way*',
        prey: '*barely notices you*',
        merchant: '*sighs disappointedly*',
        sage: '*looks confused*',
        warrior: '*shrugs*',
        diplomat: '*offers polite but distant greeting*',
        trickster: '*raises an eyebrow*',
        opportunist: '*looks unimpressed*',
        guardian: '*watches cautiously*',
        loyalist: '*nods curtly*',
      };
      return actions[archetype] || '*barely reacts*';
    }

    return null;
  }

  private generateExpectationLine(
    beliefs: NPCPlayerBeliefs,
    archetype: BehavioralArchetype
  ): string | null {
    if (beliefs.mythStatus === 'legend' || beliefs.mythStatus === 'prophecy') {
      const lines: Record<BehavioralArchetype, string> = {
        predator: "So you're the one they've been whispering about...",
        prey: "I've... heard stories about you...",
        merchant: "Ah! The famous newcomer! I've been expecting someone like you.",
        sage: "The patterns spoke of your arrival. Interesting.",
        warrior: "They say you're dangerous. We'll see.",
        diplomat: "Your reputation precedes you. I hope we can work together.",
        trickster: "Oh, THIS should be fun. I've heard such interesting things...",
        opportunist: "Perfect timing. I've been waiting for someone with your... reputation.",
        guardian: "I've been warned about you. State your business.",
        loyalist: "I serve those who have spoken of you. Welcome.",
      };
      return lines[archetype] || "I've heard of you.";
    } else if (beliefs.mythStatus === 'rumored') {
      const lines: Record<BehavioralArchetype, string> = {
        predator: "Another newcomer? We'll see how long you last.",
        prey: "Are you... new here?",
        merchant: "New face! Let me guess - someone sent you my way?",
        sage: "Hmm. There's something familiar about you...",
        warrior: "Fresh meat, eh?",
        diplomat: "Welcome. I don't believe we've met.",
        trickster: "Ooh, a new player in the game!",
        opportunist: "New around here? Might be we can help each other.",
        guardian: "Identify yourself.",
        loyalist: "You're the new one, aren't you?",
      };
      return lines[archetype] || "You're new here.";
    }

    return null;
  }

  private generateTheoryReference(
    theory: PlayerTheory,
    archetype: BehavioralArchetype
  ): string | null {
    if (theory.sentiment === 'positive') {
      return `"${theory.shortForm}" - at least, that's what I've heard.`;
    } else if (theory.sentiment === 'negative') {
      const skeptical = ['sage', 'predator', 'trickster'].includes(archetype);
      if (skeptical) {
        return `They say "${theory.shortForm}"... but I have my doubts.`;
      }
      return `Word is "${theory.shortForm}". Should I be worried?`;
    }

    return null;
  }

  private getSuggestedMood(
    beliefs: NPCPlayerBeliefs,
    archetype: BehavioralArchetype
  ): MoodType {
    const sentiment = beliefs.overallSentiment;

    if (sentiment === 'positive') {
      if (archetype === 'trickster') return 'curious';
      if (archetype === 'merchant') return 'pleased';
      return 'neutral';
    } else if (sentiment === 'negative') {
      if (archetype === 'predator') return 'annoyed';
      if (archetype === 'prey') return 'scared';
      if (archetype === 'warrior') return 'angry';
      return 'neutral';
    }

    return 'curious';
  }

  private calculateRelationshipModifiers(
    beliefs: NPCPlayerBeliefs,
    archetype: BehavioralArchetype
  ): Partial<RelationshipStats> {
    const modifiers: Partial<RelationshipStats> = {};

    modifiers.familiarity = Math.min(30, beliefs.theories.length * 5);

    if (beliefs.overallSentiment === 'positive') {
      modifiers.trust = 10;
      modifiers.respect = 5;
    } else if (beliefs.overallSentiment === 'negative') {
      modifiers.trust = -10;
      modifiers.fear = 15;
    }

    if (beliefs.expectation > 70) {
      modifiers.respect = (modifiers.respect || 0) + 10;
    }

    if (archetype === 'predator') {
      modifiers.fear = (modifiers.fear || 0) - 10;
    }
    if (archetype === 'prey') {
      modifiers.fear = (modifiers.fear || 0) + 10;
    }

    return modifiers;
  }

  // ============================================
  // Helpers
  // ============================================

  private createInitialMyth(): PlayerMyth {
    return {
      status: 'unknown',
      theories: [],
      expectations: new Map(),
      rumorSources: new Map(),
      knownFacts: [],
      suspectedTraits: [],
    };
  }

  private generateFact(eventType: PlayerEventType, context: PlayerEventContext): string | null {
    const facts: Record<PlayerEventType, (ctx: PlayerEventContext) => string> = {
      room_cleared: (ctx) => `Cleared room ${ctx.roomIndex}`,
      boss_defeated: (ctx) => `Defeated the boss of ${ctx.location}`,
      death: (ctx) => `Died in ${ctx.location}`,
      relic_obtained: () => `Obtained a relic`,
      npc_helped: (ctx) => `Helped ${ctx.npcSlug}`,
      npc_betrayed: (ctx) => `Betrayed ${ctx.npcSlug}`,
      bargain_made: (ctx) => `Made a bargain with ${ctx.npcSlug}`,
      secret_learned: () => `Learned a secret`,
      domain_entered: (ctx) => `Entered ${ctx.location}`,
    };

    const generator = facts[eventType];
    return generator ? generator(context) : null;
  }

  private updateMythStatus(): void {
    const factCount = this.myth.knownFacts.length;
    const theoryCount = this.myth.theories.length;
    const believerCount = this.myth.theories.reduce(
      (sum, t) => sum + t.believers.length,
      0
    );

    if (factCount >= 10 && believerCount >= 15) {
      this.myth.status = 'prophecy';
    } else if (factCount >= 5 && believerCount >= 8) {
      this.myth.status = 'legend';
    } else if (factCount >= 2 || theoryCount >= 3) {
      this.myth.status = 'rumored';
    } else {
      this.myth.status = 'unknown';
    }
  }

  private updateExpectation(
    npcSlug: string,
    sentiment: 'positive' | 'negative' | 'neutral',
    believed: boolean
  ): void {
    const current = this.myth.expectations.get(npcSlug) || 50;
    let delta = 0;

    if (believed) {
      if (sentiment === 'positive') delta = 10;
      else if (sentiment === 'negative') delta = 5;
      else delta = 3;
    }

    this.myth.expectations.set(npcSlug, Math.min(100, Math.max(0, current + delta)));
  }

  private calculateNPCSentiment(
    theories: PlayerTheory[]
  ): 'positive' | 'negative' | 'neutral' {
    if (theories.length === 0) return 'neutral';

    let positive = 0;
    let negative = 0;

    for (const theory of theories) {
      if (theory.sentiment === 'positive') positive++;
      else if (theory.sentiment === 'negative') negative++;
    }

    if (positive > negative + 1) return 'positive';
    if (negative > positive + 1) return 'negative';
    return 'neutral';
  }

  // ============================================
  // Serialization
  // ============================================

  serialize(): SerializedPlayerMyth {
    return {
      status: this.myth.status,
      theories: this.myth.theories,
      expectations: Array.from(this.myth.expectations.entries()),
      rumorSources: Array.from(this.myth.rumorSources.entries()),
      knownFacts: this.myth.knownFacts,
      suspectedTraits: this.myth.suspectedTraits,
    };
  }

  deserialize(data: SerializedPlayerMyth): void {
    this.myth = {
      status: data.status,
      theories: data.theories,
      expectations: new Map(data.expectations),
      rumorSources: new Map(data.rumorSources),
      knownFacts: data.knownFacts,
      suspectedTraits: data.suspectedTraits,
    };
  }
}

// ============================================
// Types
// ============================================

export type PlayerEventType =
  | 'room_cleared'
  | 'boss_defeated'
  | 'death'
  | 'relic_obtained'
  | 'npc_helped'
  | 'npc_betrayed'
  | 'bargain_made'
  | 'secret_learned'
  | 'domain_entered';

export interface PlayerEventContext {
  turnNumber: number;
  location?: string;
  roomIndex?: number;
  npcSlug?: string;
  witnesses?: string[];
  details?: Record<string, unknown>;
}

export interface NPCPlayerBeliefs {
  npcSlug: string;
  theories: PlayerTheory[];
  doubts: PlayerTheory[];
  expectation: number;
  overallSentiment: 'positive' | 'negative' | 'neutral';
  knownFacts: string[];
  mythStatus: MythStatus;
}

export interface SpreadResult {
  theory: PlayerTheory;
  believed: boolean;
  fromNPC: string;
  toNPC: string;
}

export interface DialogueLine {
  type: 'action' | 'expectation' | 'theory';
  content: string;
}

export interface FirstMeetingDialogue {
  npcSlug: string;
  lines: DialogueLine[];
  suggestedMood: MoodType;
  relationshipModifiers: Partial<RelationshipStats>;
  tensionLevel: number;
}

interface SerializedPlayerMyth {
  status: MythStatus;
  theories: PlayerTheory[];
  expectations: [string, number][];
  rumorSources: [string, string[]][];
  knownFacts: string[];
  suspectedTraits: string[];
}

// ============================================
// Theory Templates
// ============================================

interface TheoryTemplate {
  shortForm: string;
  content: (ctx: PlayerEventContext) => string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

const THEORY_TEMPLATES: Record<
  BehavioralArchetype,
  Record<PlayerEventType, TheoryTemplate[]>
> = {
  predator: {
    room_cleared: [
      {
        shortForm: 'They kill without mercy',
        content: () => "This newcomer leaves no survivors. They kill without hesitation or remorse.",
        sentiment: 'neutral',
      },
    ],
    boss_defeated: [
      {
        shortForm: "They're a threat",
        content: (ctx) => `They defeated the guardian of ${ctx.location}. This one is dangerous.`,
        sentiment: 'negative',
      },
    ],
    death: [
      {
        shortForm: 'They can be killed',
        content: () => "The newcomer fell. They're not invincible after all.",
        sentiment: 'positive',
      },
    ],
    relic_obtained: [
      {
        shortForm: 'They grow stronger',
        content: () => "They're collecting power. Soon they may be a worthy opponent.",
        sentiment: 'neutral',
      },
    ],
    npc_helped: [
      {
        shortForm: 'They make allies',
        content: (ctx) => `They helped ${ctx.npcSlug}. Building a network of pawns.`,
        sentiment: 'negative',
      },
    ],
    npc_betrayed: [
      {
        shortForm: 'They cannot be trusted',
        content: (ctx) => `They betrayed ${ctx.npcSlug}. A true survivor does what they must.`,
        sentiment: 'positive',
      },
    ],
    bargain_made: [],
    secret_learned: [],
    domain_entered: [],
  },
  sage: {
    room_cleared: [
      {
        shortForm: "They're methodical",
        content: () => "The newcomer proceeds with purpose. Each action deliberate.",
        sentiment: 'neutral',
      },
    ],
    boss_defeated: [
      {
        shortForm: 'They understand the pattern',
        content: (ctx) => `Victory in ${ctx.location}. They begin to see the true nature of this place.`,
        sentiment: 'positive',
      },
    ],
    death: [
      {
        shortForm: 'They learn from failure',
        content: () => "Death is but a teacher. They will return wiser.",
        sentiment: 'neutral',
      },
    ],
    relic_obtained: [
      {
        shortForm: 'They seek understanding',
        content: () => "They collect artifacts of power. Perhaps seeking answers.",
        sentiment: 'positive',
      },
    ],
    npc_helped: [
      {
        shortForm: 'They value connection',
        content: (ctx) => `${ctx.npcSlug} was aided. The newcomer understands alliance.`,
        sentiment: 'positive',
      },
    ],
    npc_betrayed: [
      {
        shortForm: 'They pursue their own truth',
        content: (ctx) => `${ctx.npcSlug} was forsaken. The newcomer follows a path we cannot see.`,
        sentiment: 'neutral',
      },
    ],
    bargain_made: [
      {
        shortForm: 'They negotiate fate',
        content: () => "They make deals. Every bargain changes the threads of destiny.",
        sentiment: 'neutral',
      },
    ],
    secret_learned: [
      {
        shortForm: 'They uncover truth',
        content: () => "Another secret revealed. They draw closer to understanding.",
        sentiment: 'positive',
      },
    ],
    domain_entered: [
      {
        shortForm: 'They walk the path',
        content: (ctx) => `${ctx.location} now knows their footsteps. The journey continues.`,
        sentiment: 'neutral',
      },
    ],
  },
  merchant: {
    room_cleared: [
      {
        shortForm: 'They have spending power',
        content: () => "Another room cleared means another customer with currency.",
        sentiment: 'positive',
      },
    ],
    boss_defeated: [
      {
        shortForm: "They're a valuable client",
        content: () => "Success in combat means they'll need supplies. A prime customer.",
        sentiment: 'positive',
      },
    ],
    death: [
      {
        shortForm: 'They need better equipment',
        content: () => "They died? Should have bought better gear. Next time they will.",
        sentiment: 'positive',
      },
    ],
    relic_obtained: [
      {
        shortForm: 'They have rare goods',
        content: () => "A relic collector! Perhaps we can make some... arrangements.",
        sentiment: 'positive',
      },
    ],
    npc_helped: [],
    npc_betrayed: [
      {
        shortForm: 'They play hardball',
        content: () => "A ruthless negotiator. I'll need to adjust my prices.",
        sentiment: 'neutral',
      },
    ],
    bargain_made: [
      {
        shortForm: "They're a deal-maker",
        content: () => "Ah, someone who appreciates the art of the deal!",
        sentiment: 'positive',
      },
    ],
    secret_learned: [],
    domain_entered: [],
  },
  trickster: {
    room_cleared: [
      {
        shortForm: 'They stir up trouble',
        content: () => "Chaos follows in their wake. How delightful!",
        sentiment: 'positive',
      },
    ],
    boss_defeated: [
      {
        shortForm: 'They break the rules',
        content: () => "They actually won? Oh, this is going to be entertaining.",
        sentiment: 'positive',
      },
    ],
    death: [
      {
        shortForm: 'The punchline fell flat',
        content: () => "They died! Hah! ...Wait, they'll be back, won't they? Even better.",
        sentiment: 'positive',
      },
    ],
    relic_obtained: [],
    npc_helped: [
      {
        shortForm: 'They play favorites',
        content: (ctx) => `Helping ${ctx.npcSlug}? Let's see how that plays out.`,
        sentiment: 'neutral',
      },
    ],
    npc_betrayed: [
      {
        shortForm: "They're unpredictable",
        content: (ctx) => `Backstabbed ${ctx.npcSlug}! I didn't see that coming. Bravo!`,
        sentiment: 'positive',
      },
    ],
    bargain_made: [],
    secret_learned: [
      {
        shortForm: 'They collect secrets',
        content: () => "Ooh, they know things now. This just got interesting.",
        sentiment: 'positive',
      },
    ],
    domain_entered: [],
  },
  diplomat: {
    room_cleared: [],
    boss_defeated: [
      {
        shortForm: "They're capable",
        content: () => "A victory of significance. They may be worth knowing.",
        sentiment: 'positive',
      },
    ],
    death: [
      {
        shortForm: 'They struggle',
        content: () => "Setbacks are part of any journey. They will recover.",
        sentiment: 'neutral',
      },
    ],
    relic_obtained: [],
    npc_helped: [
      {
        shortForm: 'They build bridges',
        content: (ctx) => `${ctx.npcSlug} speaks well of them. An ally worth having.`,
        sentiment: 'positive',
      },
    ],
    npc_betrayed: [
      {
        shortForm: 'They make enemies',
        content: (ctx) => `${ctx.npcSlug} was wronged. Caution is advised.`,
        sentiment: 'negative',
      },
    ],
    bargain_made: [],
    secret_learned: [],
    domain_entered: [],
  },
  prey: {
    room_cleared: [],
    boss_defeated: [],
    death: [],
    relic_obtained: [],
    npc_helped: [],
    npc_betrayed: [],
    bargain_made: [],
    secret_learned: [],
    domain_entered: [],
  },
  warrior: {
    room_cleared: [],
    boss_defeated: [],
    death: [],
    relic_obtained: [],
    npc_helped: [],
    npc_betrayed: [],
    bargain_made: [],
    secret_learned: [],
    domain_entered: [],
  },
  opportunist: {
    room_cleared: [],
    boss_defeated: [],
    death: [],
    relic_obtained: [],
    npc_helped: [],
    npc_betrayed: [],
    bargain_made: [],
    secret_learned: [],
    domain_entered: [],
  },
  guardian: {
    room_cleared: [],
    boss_defeated: [],
    death: [],
    relic_obtained: [],
    npc_helped: [],
    npc_betrayed: [],
    bargain_made: [],
    secret_learned: [],
    domain_entered: [],
  },
  loyalist: {
    room_cleared: [],
    boss_defeated: [],
    death: [],
    relic_obtained: [],
    npc_helped: [],
    npc_betrayed: [],
    bargain_made: [],
    secret_learned: [],
    domain_entered: [],
  },
};

// ============================================
// Factory Functions
// ============================================

export function createPlayerMythology(seed?: string): PlayerMythologyManager {
  return new PlayerMythologyManager(seed);
}

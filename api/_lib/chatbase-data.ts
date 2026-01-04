/**
 * Static Chatbase Data Loader for Vercel Functions
 *
 * Bundles NPC chatbase JSON files at build time for edge-compatible serving.
 */

import type { MoodType } from '../../packages/shared/src/types/index.js';

// Import all NPC chatbase files statically (relative paths for Vercel runtime)
import theOne from '../../packages/ai-engine/chatbase/npcs/the-one.json' with { type: 'json' };
import stitchUpGirl from '../../packages/ai-engine/chatbase/npcs/stitch-up-girl.json' with { type: 'json' };
import theGeneral from '../../packages/ai-engine/chatbase/npcs/the-general.json' with { type: 'json' };
import xtreme from '../../packages/ai-engine/chatbase/npcs/xtreme.json' with { type: 'json' };
import mrKevin from '../../packages/ai-engine/chatbase/npcs/mr-kevin.json' with { type: 'json' };
import bodyCount from '../../packages/ai-engine/chatbase/npcs/body-count.json' with { type: 'json' };
import clausen from '../../packages/ai-engine/chatbase/npcs/clausen.json' with { type: 'json' };
import drVoss from '../../packages/ai-engine/chatbase/npcs/dr-voss.json' with { type: 'json' };
import drMaxwell from '../../packages/ai-engine/chatbase/npcs/dr-maxwell.json' with { type: 'json' };
import booG from '../../packages/ai-engine/chatbase/npcs/boo-g.json' with { type: 'json' };
import kingJames from '../../packages/ai-engine/chatbase/npcs/king-james.json' with { type: 'json' };
import boots from '../../packages/ai-engine/chatbase/npcs/boots.json' with { type: 'json' };
import john from '../../packages/ai-engine/chatbase/npcs/john.json' with { type: 'json' };
import keithMan from '../../packages/ai-engine/chatbase/npcs/keith-man.json' with { type: 'json' };
import willy from '../../packages/ai-engine/chatbase/npcs/willy.json' with { type: 'json' };
import peter from '../../packages/ai-engine/chatbase/npcs/peter.json' with { type: 'json' };
import mrBones from '../../packages/ai-engine/chatbase/npcs/mr-bones.json' with { type: 'json' };
import willyOneEye from '../../packages/ai-engine/chatbase/npcs/willy-one-eye.json' with { type: 'json' };

export interface ChatbaseEntry {
  id: string;
  text: string;
  speaker: {
    slug: string;
    name: string;
    category: string;
  };
  pool: string;
  mood: MoodType;
  moodIntensity: number;
  contextTags: string[];
  metrics: {
    interestScore: number;
    source: string;
  };
}

interface ChatbaseFile {
  npc: {
    slug: string;
    name: string;
    category: string;
  };
  entries: ChatbaseEntry[];
}

// Build static registry at module load time
const chatbaseRegistry: Map<string, ChatbaseEntry[]> = new Map();

function registerNPC(data: ChatbaseFile) {
  if (data?.npc?.slug && Array.isArray(data.entries)) {
    chatbaseRegistry.set(data.npc.slug, data.entries);
  }
}

// Register all NPCs
registerNPC(theOne as ChatbaseFile);
registerNPC(stitchUpGirl as ChatbaseFile);
registerNPC(theGeneral as ChatbaseFile);
registerNPC(xtreme as ChatbaseFile);
registerNPC(mrKevin as ChatbaseFile);
registerNPC(bodyCount as ChatbaseFile);
registerNPC(clausen as ChatbaseFile);
registerNPC(drVoss as ChatbaseFile);
registerNPC(drMaxwell as ChatbaseFile);
registerNPC(booG as ChatbaseFile);
registerNPC(kingJames as ChatbaseFile);
registerNPC(boots as ChatbaseFile);
registerNPC(john as ChatbaseFile);
registerNPC(keithMan as ChatbaseFile);
registerNPC(willy as ChatbaseFile);
registerNPC(peter as ChatbaseFile);
registerNPC(mrBones as ChatbaseFile);
registerNPC(willyOneEye as ChatbaseFile);

/**
 * Get entries for a specific NPC
 */
export function getNPCEntries(slug: string): ChatbaseEntry[] {
  return chatbaseRegistry.get(slug) || [];
}

/**
 * Get list of all registered NPCs
 */
export function getRegisteredNPCs(): string[] {
  return Array.from(chatbaseRegistry.keys());
}

/**
 * Get total entry count for stats
 */
export function getTotalEntryCount(): number {
  let count = 0;
  for (const entries of chatbaseRegistry.values()) {
    count += entries.length;
  }
  return count;
}

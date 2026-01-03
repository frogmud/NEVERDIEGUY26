/**
 * Static Chatbase Data Loader for Vercel Functions
 *
 * Bundles NPC chatbase JSON files at build time for edge-compatible serving.
 */

import type { MoodType } from '@ndg/shared';

// Import all NPC chatbase files statically
import theOne from '@ndg/ai-engine/chatbase/npcs/the-one.json';
import stitchUpGirl from '@ndg/ai-engine/chatbase/npcs/stitch-up-girl.json';
import theGeneral from '@ndg/ai-engine/chatbase/npcs/the-general.json';
import xtreme from '@ndg/ai-engine/chatbase/npcs/xtreme.json';
import mrKevin from '@ndg/ai-engine/chatbase/npcs/mr-kevin.json';
import bodyCount from '@ndg/ai-engine/chatbase/npcs/body-count.json';
import clausen from '@ndg/ai-engine/chatbase/npcs/clausen.json';
import drVoss from '@ndg/ai-engine/chatbase/npcs/dr-voss.json';
import drMaxwell from '@ndg/ai-engine/chatbase/npcs/dr-maxwell.json';
import booG from '@ndg/ai-engine/chatbase/npcs/boo-g.json';
import kingJames from '@ndg/ai-engine/chatbase/npcs/king-james.json';
import boots from '@ndg/ai-engine/chatbase/npcs/boots.json';
import john from '@ndg/ai-engine/chatbase/npcs/john.json';
import keithMan from '@ndg/ai-engine/chatbase/npcs/keith-man.json';
import willy from '@ndg/ai-engine/chatbase/npcs/willy.json';
import peter from '@ndg/ai-engine/chatbase/npcs/peter.json';
import mrBones from '@ndg/ai-engine/chatbase/npcs/mr-bones.json';
import willyOneEye from '@ndg/ai-engine/chatbase/npcs/willy-one-eye.json';

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

/**
 * Quick Prompts for Eternal Stream
 *
 * NDG is mute but can tap quick prompt buttons to throw questions into the stream.
 * NPCs answer like jerks in a zoom call.
 *
 * NEVER DIE GUY
 */

export interface QuickPrompt {
  id: string;
  label: string; // Short label shown on button
  text: string; // Full question injected into stream
  responders: string[]; // NPC IDs who should respond to this question
}

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: 'why-here',
    label: '???',
    text: 'Why am I here?',
    responders: ['king-james', 'dr-voss', 'mr-kevin'],
  },
  {
    id: 'whats-the-point',
    label: '...',
    text: "What's the point?",
    responders: ['the-general', 'dr-maxwell', 'mr-bones'],
  },
  {
    id: 'who-rules',
    label: '!',
    text: "Who's in charge?",
    responders: ['king-james', 'the-general', 'clausen'],
  },
  {
    id: 'what-happens',
    label: '?!',
    text: 'What happens when I die?',
    responders: ['mr-bones', 'stitch-up-girl', 'dr-voss'],
  },
  {
    id: 'my-stuff',
    label: '$',
    text: 'What happens to my stuff?',
    responders: ['body-count', 'boots', 'mr-kevin'],
  },
];

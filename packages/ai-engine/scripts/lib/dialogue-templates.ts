/**
 * Dialogue Templates for Chatbase Restock
 *
 * Organized by NPC archetype and pool type.
 * {target} = name of person being addressed
 * {domain} = current domain name
 * {die} = die type (d4, d6, etc.)
 */

export interface TemplateSet {
  [pool: string]: string[];
}

export interface ArchetypeTemplates {
  wanderer: TemplateSet;
  shopkeeper: TemplateSet;
  traveler: TemplateSet;
  pantheon: TemplateSet;
}

// ============================================
// WANDERER TEMPLATES (Mr. Bones, Willy, etc.)
// ============================================

const wandererTemplates: TemplateSet = {
  greeting: [
    '{target}. Been a while.',
    'Ah, {target}. Still breathing, I see.',
    '*nods* {target}.',
    'Well well. {target} walks these roads.',
    '{target}. The dice brought you here.',
    'Fate smiles. {target} appears.',
    '*looks up* {target}. Unexpected.',
    'The market stirs. {target} arrives.',
    '{target}. I wondered when you would come.',
    'Hmm. {target}. Good timing.',
    '*pauses* {target}. We meet again.',
    'The wandering never stops. Hello, {target}.',
    '{target}. Another face in the endless march.',
    'Ah. {target}. The spheres align.',
    '*squints* Is that {target}? So it is.',
    '{target}. Pull up a shadow.',
    'The roads converge. {target}.',
    '*tips hat* {target}.',
    'Well met, {target}. Well met indeed.',
    '{target}. Your timing is... curious.',
  ],
  farewell: [
    'Until the dice roll again, {target}.',
    'Safe travels. The domains are hungry.',
    '*nods* Walk carefully.',
    'We will meet again. Or we won\'t.',
    'The road calls. Farewell, {target}.',
    'Don\'t die out there. Or do. Your choice.',
    '*turns away* Until next time.',
    'May your rolls be kind, {target}.',
    'The market forgets no one. See you around.',
    'Keep moving, {target}. Always keep moving.',
    '*waves dismissively* Go on then.',
    'Another time, {target}. Another throw.',
    'The spheres wait for no one. Off you go.',
    'Farewell. Try not to become a statistic.',
    '*fades into crowd* ...',
    'Until fortune brings us together again.',
    'Walk the path, {target}. I\'ll be here.',
    'The game continues. Play well.',
    '*nods slowly* Be seeing you.',
    'Don\'t let the domains claim you yet.',
  ],
  idle: [
    '*stares at the horizon*',
    '*counts something under breath*',
    '*adjusts worn cloak*',
    '...',
    '*watches the crowd*',
    '*fidgets with old coin*',
    '*hums a forgotten tune*',
    '*shifts weight, waiting*',
    '*gazes at nothing in particular*',
    '*mutters to self*',
    '*picks at frayed sleeve*',
    '*scans the market absently*',
    '*taps foot rhythmically*',
    '*exhales slowly*',
    '*rubs tired eyes*',
  ],
  hint: [
    'Word is, {domain} has been... active lately.',
    'If you\'re heading out, watch the third room.',
    'The Die-rectors see everything. Remember that.',
    'Some say the {die} favors the bold. Others say it favors no one.',
    'There\'s a trick to the spheres. Timing.',
    'Don\'t trust the easy wins. They\'re bait.',
    'I\'ve seen wanderers come back changed from {domain}.',
    'The merchants know more than they let on.',
    'When the sphere glows, that\'s your moment.',
    'Heat rises. Keep your cool or pay the price.',
    'Favor tokens aren\'t free. Nothing is.',
    'The bosses remember your patterns.',
    'Three throws. Make them count.',
    'Watch how the veterans move. Learn.',
    'The chatbase remembers every word. Every failure.',
    'Rerolls are a trap. Usually.',
    'The domains shift. What worked before won\'t always.',
    'Your dice tell a story. What\'s yours saying?',
    'Trust the process. Or don\'t. Your funeral.',
    'The calm before the audit is a lie.',
  ],
  lore: [
    'They say {domain} wasn\'t always like this.',
    'The Die-rectors have ruled since before memory.',
    'Once, wanderers didn\'t have to fight. Imagine that.',
    'The spheres contain echoes. Old victories. Old defeats.',
    'No one knows who built the first market.',
    'Some dice are older than the domains themselves.',
    'The panteon doesn\'t sleep. It watches.',
    'Every death feeds something. Best not to ask what.',
    'There are names carved in places no one visits.',
    'The game existed before us. It will exist after.',
    'Legends speak of a seventh domain. Sealed.',
    'The Die-rectors were wanderers once. So the stories go.',
    'Gold flows like blood here. Always has.',
    'The chatbase is older than it looks. Much older.',
    'Some say the spheres dream.',
  ],
  reaction: [
    'Hmm. Interesting point.',
    '*considers this*',
    'You might be onto something.',
    'I\'ve heard worse theories.',
    'Is that so?',
    '*raises eyebrow*',
    'Curious.',
    'Go on.',
    'That tracks.',
    '*nods slowly*',
    'Never thought of it that way.',
    'Bold claim.',
    'The evidence suggests otherwise. But maybe.',
    '*shrugs* Could be.',
    'You speak from experience?',
  ],
  threat: [
    'Choose your next words carefully, {target}.',
    '*hand moves to belt*',
    'We can settle this the hard way.',
    'You don\'t want this fight.',
    'The market has rules. Break them and see what happens.',
    '*steps closer* Say that again.',
    'I\'ve survived worse than you.',
    'Don\'t mistake patience for weakness.',
    'The domains taught me things. Painful things.',
    '*cold stare* Walk away.',
  ],
  challenge: [
    'Think you can back that up?',
    'Prove it. Roll.',
    'Let\'s see what you\'ve got, {target}.',
    'Words are cheap. Dice don\'t lie.',
    'Care to make it interesting?',
    'Big talk. Small dice energy.',
    'I\'ve beaten better.',
    'Your move.',
    'Show me something.',
    'The sphere awaits. Unless you\'re scared.',
  ],
};

// ============================================
// SHOPKEEPER TEMPLATES (Clausen, Boots, etc.)
// ============================================

const shopkeeperTemplates: TemplateSet = {
  greeting: [
    'Welcome, welcome! {target}, yes?',
    'Ah, a customer! {target}, good to see you.',
    '*perks up* {target}! Browse freely.',
    'The market provides. Hello, {target}.',
    '{target}! Just got new inventory.',
    'Step right up, {target}. Fair prices.',
    '*smiles professionally* {target}. What can I find for you?',
    'Excellent timing, {target}. Fresh stock.',
    '{target}. The discerning wanderer.',
    'Welcome to my corner of chaos, {target}.',
    '*rubs hands together* {target}! Let\'s do business.',
    'Ah, {target}. I had a feeling you\'d come.',
    'The finest goods for the finest customers. Hello, {target}.',
    '*adjusts display* {target}! Perfect.',
    'Gold in your pocket, goods in my stall. Hello, {target}.',
  ],
  farewell: [
    'Come back when your pockets are heavier!',
    'Safe throws out there, {target}.',
    'Remember where you got the good stuff!',
    '*waves* Happy hunting!',
    'The market never closes. Neither do I.',
    'May your rolls bring you back wealthy.',
    'Tell your friends! Quality goods here.',
    '*nods* Pleasure doing business.',
    'Don\'t be a stranger, {target}.',
    'Next time, maybe something special for you.',
    'The dice favor repeat customers. Just saying.',
    '*tips hat* Until profit brings us together.',
    'Survive, thrive, and return, {target}.',
    'My door is always open. My prices... negotiable.',
    'Go make some gold. Then come spend it here.',
  ],
  idle: [
    '*polishes wares*',
    '*rearranges inventory*',
    '*checks prices*',
    '*eyes passing customers*',
    '*counts coins quietly*',
    '*adjusts display stand*',
    '*mutters profit calculations*',
    '*dusts off merchandise*',
    '*hums merchant tune*',
    '*scribbles in ledger*',
  ],
  salesPitch: [
    'See something you like? I can make a deal.',
    'This right here? Rare. Very rare.',
    'Don\'t let the price scare you. Quality costs.',
    'I\'ve got items you won\'t find anywhere else.',
    'Special price for you, {target}. Just this once.',
    'The smart wanderers buy before they need.',
    'This one practically sells itself.',
    'Straight from {domain}. Authentic.',
    'You know quality when you see it. This is quality.',
    'Investment. That\'s what this is.',
    'The last one sold in minutes. Just saying.',
    'Your dice would thank you for this.',
    'Protection, power, profit. Pick two. Or all three.',
    'I don\'t sell junk. My reputation depends on it.',
    'This? This is the one.',
    'Look, between us? Underpriced.',
    'The Die-rectors themselves would approve.',
    'You\'re not leaving empty-handed. I can tell.',
    'The sphere favors the prepared.',
    'Think of it as insurance. Very stylish insurance.',
  ],
  hint: [
    'Word of advice? Buy the rerolls.',
    'The third domain... bring extra.',
    'Shopkeepers talk. I hear things.',
    'Some items are more useful than they look.',
    'The smart money is on preparation.',
    'I\'ve seen wanderers ignore good deals. They don\'t come back.',
    'Upgrade before the boss. Trust me.',
    'The market has patterns. I watch them.',
    'Certain dice perform better in {domain}.',
    'Don\'t sleep on the consumables.',
  ],
  reaction: [
    '*nods approvingly* Good choice.',
    'You have taste.',
    'Excellent eye.',
    '*strokes chin* I can work with that.',
    'Now you\'re thinking like a winner.',
    'Smart. Very smart.',
    '*grins* I knew I liked you.',
    'That\'s the spirit.',
    'Finally, someone who understands value.',
    'You drive a hard bargain. I respect that.',
  ],
  threat: [
    'You break it, you buy it. In blood.',
    '*hand goes under counter*',
    'Thieves don\'t last long in my market.',
    'I have friends. Expensive friends.',
    'Don\'t test a merchant, {target}.',
  ],
  challenge: [
    'Think you can haggle with me? Try.',
    'Let\'s see if your dice match your mouth.',
    'Big spender talk. Prove it.',
    'You want the real deal? Earn it.',
    'My prices are fair. Your luck? We\'ll see.',
  ],
};

// ============================================
// TRAVELER TEMPLATES (Keith Man, Dr. Maxwell, etc.)
// ============================================

const travelerTemplates: TemplateSet = {
  greeting: [
    'Oh! {target}! What a coincidence!',
    '{target}! I was just thinking about—well, nevermind.',
    '*adjusts gear* {target}. Fancy meeting you here.',
    'Ha! {target}! Small multiverse.',
    'Is that—yes! {target}! Hello!',
    '*waves enthusiastically* {target}!',
    'Well if it isn\'t {target}. What are the odds?',
    '{target}. Perfect. I needed a familiar face.',
    '*stops mid-stride* {target}! Good timing.',
    'The domains keep pushing us together, {target}.',
    '*looks up from notes* {target}? Oh, excellent!',
    'Ah! A fellow traveler. Hello, {target}.',
    '{target}! Still kicking, I see. Good, good.',
    '*nearly bumps into* Oh! {target}! Sorry, distracted.',
    'Speak of the devil. {target}.',
  ],
  farewell: [
    'Off to the next thing! Stay sharp, {target}.',
    '*checks compass* Time to move. Later!',
    'Places to be, spheres to throw. See you!',
    'Don\'t let the bosses get you, {target}!',
    'I\'ll catch you on the flip side.',
    '*already walking* Bye, {target}!',
    'Adventure calls! Stay lucky!',
    'Next time, compare notes?',
    '*waves over shoulder* Keep moving, {target}!',
    'The road goes ever on. Later!',
    'May your dice stay hot, {target}.',
    '*packs hastily* Gotta run. Good luck!',
    'See you in the next domain. Maybe.',
    'Try not to die! Seriously!',
    'The journey continues. Onward!',
  ],
  idle: [
    '*checks worn map*',
    '*scribbles in journal*',
    '*paces restlessly*',
    '*adjusts travel pack*',
    '*peers at the sky*',
    '*taps foot impatiently*',
    '*mutters calculations*',
    '*stretches tired muscles*',
    '*examines collected artifacts*',
    '*hums traveling song*',
  ],
  hint: [
    'I found something interesting in {domain}...',
    'Watch out for the second room. Weird energy.',
    'The locals know shortcuts. Bribe them.',
    'My notes say the boss patterns repeat every third cycle.',
    'Save your rerolls for when it matters.',
    'There\'s a safe spot behind the sphere. Sometimes.',
    'Heat affects accuracy. Keep cool.',
    'The Die-rectors ignore you at first. Don\'t get comfortable.',
    'I\'ve mapped some patterns. Want to compare?',
    'The veteran traders have the real info.',
    'Timing beats power. Usually.',
    'Some dice resonate with specific domains.',
    'The market shifts after every boss clear.',
    'Don\'t trust everything in the chatbase.',
    'Experience is the best teacher. Also the most painful.',
  ],
  lore: [
    'I\'ve been researching the origin of {domain}...',
    'The travelers before us left markers. I\'ve found some.',
    'Each Die-rector has a weakness. Documented.',
    'The old maps show domains that no longer exist.',
    'Some say time moves differently in the deeper domains.',
    'I\'ve interviewed dozens of wanderers. The stories match.',
    'The spheres predate the market. Fascinating.',
    'Records suggest the pantheon was once larger.',
    'My theory? The dice choose their wielders.',
    'There are patterns in the chaos. I\'m close to cracking them.',
    'The first wanderers didn\'t play for gold. They played for escape.',
    'Every domain connects. If you know where to look.',
  ],
  reaction: [
    'Fascinating! Tell me more.',
    '*scribbles note* Go on...',
    'That matches my observations!',
    'Hmm, contradicts my data, but interesting.',
    'You\'ve been paying attention.',
    '*nods excitedly*',
    'I need to document this.',
    'Really? I\'ve heard differently.',
    'That explains a lot actually.',
    'Curious. Very curious.',
    '*eyes widen* You\'re sure?',
    'Adding that to my notes.',
  ],
  threat: [
    'Don\'t make me put down my research, {target}.',
    'I\'ve survived things you wouldn\'t believe.',
    'Travelers are tougher than we look.',
    '*pulls out strange device*',
    'Knowledge is power. I have plenty of both.',
  ],
  challenge: [
    'I bet my data says I\'ll win.',
    'Want to test that theory?',
    'My research versus your instinct. Let\'s go.',
    'I\'ve calculated the odds. They\'re in my favor.',
    'Experience versus luck. You pick.',
  ],
};

// ============================================
// PANTHEON TEMPLATES (The One, John, Peter, etc.)
// ============================================

const pantheonTemplates: TemplateSet = {
  greeting: [
    '*presence intensifies* {target}.',
    'You stand before a Die-rector, {target}.',
    'The domain acknowledges you.',
    'Mortal. {target}. You are noticed.',
    '*voice echoes* {target} approaches.',
    'The dice brought you here, {target}.',
    'Fate and fortune. Hello, {target}.',
    'Your patterns are... interesting, {target}.',
    '*observes* {target}. We meet.',
    'The threads converge. {target}.',
  ],
  farewell: [
    'The domain awaits your return.',
    '*fades slightly* Go. Play your part.',
    'Until the dice summon you again.',
    'We shall observe your progress.',
    '*voice distant* Fortune guide you.',
    'The game continues. With or without you.',
    'Do not disappoint us, {target}.',
    '*presence withdraws* Go now.',
    'The sphere remembers all. As do we.',
    'Your fate remains unwritten. For now.',
  ],
  idle: [
    '*existence hums*',
    '*observes countless threads*',
    '*patterns shift*',
    '...',
    '*time bends slightly*',
    '*cosmic weight settles*',
    '*dice orbit slowly*',
    '*judgment waits*',
  ],
  hint: [
    'The third throw carries weight. Remember this.',
    'Heat is a choice. Choose wisely.',
    'The bosses are echoes of something greater.',
    'Some dice answer only to specific calls.',
    'The market is a test. Everything is a test.',
    'Rerolls have consequences beyond gold.',
    'The spheres respond to conviction.',
    'Patterns within patterns. Look deeper.',
    'Your ledger grows heavy. Lighten it.',
    'The domains shift at our whim. Adapt.',
  ],
  lore: [
    'We were here before the first roll.',
    'The domains are fragments of something whole.',
    'Every death echoes in the void.',
    'The dice were gifts. Or curses. Perspective.',
    'Wanderers come and go. We remain.',
    'The game has rules. We enforce them.',
    'Gold flows. Souls flow. Balance remains.',
    'The spheres contain multitudes.',
    'Once, there were more of us.',
    'The market exists because we allow it.',
  ],
  reaction: [
    '*observes silently*',
    'Noted.',
    'Your perspective... has merit.',
    '*cosmic nod*',
    'Interesting.',
    'We have seen this before.',
    'Bold. For a mortal.',
    'The threads shift around you.',
    '*considers eternally*',
    'So you believe.',
  ],
  threat: [
    'Do not test our patience.',
    '*domain darkens*',
    'We could end this. Easily.',
    'Your defiance is noted. And remembered.',
    'The dice turn against the foolish.',
    'We shaped these domains. We can reshape you.',
    '*reality warps slightly*',
    'Choose. Your. Words.',
  ],
  challenge: [
    'Face the domain\'s judgment.',
    'Let the dice reveal your worth.',
    'We shall observe this contest.',
    'Prove yourself, mortal.',
    'The sphere awaits your attempt.',
    'Show us what the wanderer is made of.',
  ],
  gamblingTrashTalk: [
    'Your rolls amuse us.',
    'The dice know your heart. Do you?',
    'Confidence. Or foolishness. We shall see.',
    'Many have stood where you stand. Few impressed.',
    'The odds are cosmic. You are... less so.',
  ],
  gamblingBrag: [
    'As expected.',
    'The domain favors those who earn it.',
    'Fortune is not luck. It is inevitability.',
    'Your defeat was written before you rolled.',
    '*cosmic satisfaction*',
  ],
};

// ============================================
// EXPORTS
// ============================================

export const TEMPLATES: ArchetypeTemplates = {
  wanderer: wandererTemplates,
  shopkeeper: shopkeeperTemplates,
  traveler: travelerTemplates,
  pantheon: pantheonTemplates,
};

// Map NPC slugs to archetypes
export const NPC_ARCHETYPES: Record<string, keyof ArchetypeTemplates> = {
  // Wanderers
  'mr-bones': 'wanderer',
  'willy': 'wanderer',
  'willy-one-eye': 'wanderer',
  'the-general': 'wanderer',
  'body-count': 'wanderer',

  // Shopkeepers
  'clausen': 'shopkeeper',
  'boots': 'shopkeeper',
  'stitch-up-girl': 'shopkeeper',

  // Travelers
  'keith-man': 'traveler',
  'dr-maxwell': 'traveler',
  'dr-voss': 'traveler',
  'mr-kevin': 'traveler',
  'xtreme': 'traveler',
  'boo-g': 'traveler',
  'king-james': 'traveler',

  // Pantheon
  'the-one': 'pantheon',
  'john': 'pantheon',
  'peter': 'pantheon',
  'robert': 'pantheon',
  'alice': 'pantheon',
  'jane': 'pantheon',
};

/**
 * Get a random template for the given NPC and pool
 */
export function getTemplate(
  npcSlug: string,
  pool: string,
  rng: { random: (key: string) => number }
): string | null {
  const archetype = NPC_ARCHETYPES[npcSlug] || 'wanderer';
  const templates = TEMPLATES[archetype][pool];

  if (!templates || templates.length === 0) {
    // Fall back to wanderer templates
    const fallback = TEMPLATES.wanderer[pool];
    if (!fallback || fallback.length === 0) return null;
    return fallback[Math.floor(rng.random('template') * fallback.length)];
  }

  return templates[Math.floor(rng.random('template') * templates.length)];
}

/**
 * Fill in template variables
 */
export function fillTemplate(
  template: string,
  vars: { target?: string; domain?: string; die?: string }
): string {
  let result = template;
  if (vars.target) result = result.replace(/\{target\}/g, vars.target);
  if (vars.domain) result = result.replace(/\{domain\}/g, vars.domain);
  if (vars.die) result = result.replace(/\{die\}/g, vars.die);
  return result;
}

/**
 * Get pool coverage stats
 */
export function getTemplateCoverage(): Record<string, Record<string, number>> {
  const coverage: Record<string, Record<string, number>> = {};

  for (const [archetype, templates] of Object.entries(TEMPLATES)) {
    coverage[archetype] = {};
    for (const [pool, lines] of Object.entries(templates)) {
      coverage[archetype][pool] = lines.length;
    }
  }

  return coverage;
}

/**
 * Home Page Character Greeters
 *
 * Random NPC greets the player on homepage load.
 * Every load is a fresh incarnation - a new "Guy" meeting these NPCs.
 *
 * Flow:
 * 1. NPC greeting appears
 * 2. Player picks a response (Play/Wiki/About)
 * 3. Player's choice appears as chat bubble
 * 4. NPC gives farewell based on choice
 * 5. Brief pause, then navigate
 *
 * NEVER DIE GUY
 */

export interface HomeGreeter {
  id: string;
  name: string;
  portrait: string;
  sprite?: string; // Full-body sprite frame 1
  sprite2?: string; // Full-body sprite frame 2 (for animation)
  wikiSlug: string; // Link to character's wiki page
  greetings: string[];
  ambient: string[]; // Character-specific idle chatter
  farewells: {
    play: string[];  // Shepherding to game
    wiki: string[];  // Shepherding to wiki
    about: string[]; // Shepherding to about
  };
}

/**
 * All available greeters for the homepage
 */
export const HOME_GREETERS: HomeGreeter[] = [
  // ============================================
  // TRAVELERS (Friendly Allies)
  // ============================================
  {
    id: 'stitch-up-girl',
    name: 'Stitch Up Girl',
    portrait: '/assets/characters/portraits/240px/traveler-portrait-stitchupgirl-01.svg',
    sprite: '/assets/market-svg/stitch-up-girl/idle-01.svg',
    sprite2: '/assets/market-svg/stitch-up-girl/idle-02.svg',
    wikiSlug: 'characters/stitch-up-girl',
    ambient: [
      'Shadow Keep taught me that healing is just damage in reverse.',
      'Being related to someone who cannot die gives you perspective.',
      'My scissors can cut more than flesh. They can sever curses.',
      'Medical advice: survive the first wave, then strike.',
      'I patched up the last Guy. He did okay.',
      // From dialogue-expansion chatbase
      'Healing is not magic. Well, it is. But it is also about knowing where the important bits go.',
      'I have stitched up Die-rectors, wanderers, even a guardian once. That one was weird.',
      'Fun fact: the average meteor strike victim needs 47 stitches. I have gotten it down to 43.',
      '*organizes medical supplies with concerning enthusiasm*',
      '*sharpens scissors* These are for curses. And also opening packages.',
      'The guardians have weak points. Aim for the glowing bits.',
      'You know what never dies? Family support. I will always be here with bandages and judgment.',
      'Pro tip: save your biggest dice for when you are cornered.',
      'At your current integrity, you can survive exactly two more hits. Maybe.',
      'That crater is going to need stitches. Not yours. The planet\'s. I am branching out.',
      'New shipment of bandages! Extra absorbent! I tested them on Robert\'s domain.',
      'Family discount means free. Do not tell the other patients.',
    ],
    greetings: [
      'There you are! Let me take a look at you. Any new holes I should know about?',
      'Back in one piece! Well, mostly one piece. I can fix the rest.',
      'A new Guy? You look... intact. Enjoy that while it lasts.',
      'Welcome back! Death looked good on you. But life looks better.',
      'My favorite patient returns! And before you ask, yes, I brought extra bandages.',
      'Oh good, you are vertical. That is a strong start.',
      'Fresh from the void? Sit down. Let me check your vitals.',
      'Another incarnation? The universe is really going through Guys lately.',
      'You look TERRIBLE. Just kidding. You look fine. Mostly.',
      'I patched up the last Guy. He did okay. You will do better. Probably.',
      'New Guy energy. I can smell it. Smells like potential and poor decisions.',
      'Do not worry. Whatever happens out there, I can stitch it back together.',
    ],
    farewells: {
      play: [
        'Alright, hold on... let me prep the med kit. You are going to need it.',
        'Off you go then. Try to come back with the same number of limbs.',
        'Good luck out there. I will have the bandages ready.',
        'Stay alive, okay? Or at least die interestingly.',
      ],
      wiki: [
        'Ah, research first. Smart. Let me point you in the right direction...',
        'Knowledge before chaos? I like your style. One moment...',
        'Good idea. Knowing what can kill you is half the battle.',
      ],
      about: [
        'Curious about all this? Fair enough. Let me show you around...',
        'Want the full picture? Alright, follow me...',
        'Ah, the big questions. Come, I will explain what I can.',
      ],
    },
  },
  {
    id: 'keith-man',
    name: 'Keith Man',
    portrait: '/assets/characters/portraits/240px/traveler-portrait-keithman-01.svg',
    sprite: '/assets/market-svg/keith-man/idle-01.svg',
    sprite2: '/assets/market-svg/keith-man/idle-02.svg',
    wikiSlug: 'characters/keith-man',
    ambient: [
      'Time is just... suggestion? Frost Reach taught me that!',
      'I already scouted ahead! And behind! And sideways!',
      'Do not think about paradoxes! Just RUN!',
      'The universe respawned you! How exciting!',
      'Second chances at SPEED!',
      // From chatbase sources
      '... The sphere watches you. It always watches.',
      '... The answer is in the reflection. You know which one.',
      '... You already know. The sphere sees all.',
      'Time-moves-different-for-me! Always-has! Always-will!',
      'Frost-Reach-is-cold! But-speed-keeps-you-warm!',
      'I-checked-the-future! You-do-fine! Probably!',
      'Paradoxes-are-just-time-trying-to-be-interesting!',
      'Slow-down? Never-heard-of-it!',
      'The-Die-rectors-move-so-SLOW! It-is-painful-to-watch!',
      'Every-millisecond-counts! I-counted-them!',
      'Past-present-future! All-the-same-to-me! Kind-of!',
      'The-guardians-cannot-catch-what-they-cannot-see!',
    ],
    greetings: [
      'Hey-hi-hello! Good-to-see-you! Been-waiting! Well-not-waiting-exactly-time-is-relative!',
      '*appears in blur* Oh! There you are! I checked six rooms while waiting for you to blink!',
      'FRIEND! *vibrating with excitement* Ready-to-go-fast? Or-slow? Slow-is-fine-I-guess!',
      'New-Guy! Fresh-Guy! Unbroken-Guy! That-will-change! In-a-fun-way!',
      'I-already-scouted-ahead! And-behind! And-sideways! You-are-going-to-LOVE-it!',
      'Welcome-welcome-welcome! Time-moves-different-for-me! You-just-got-here! Also-you-have-been-here-forever!',
      'A-new-incarnation! I-saw-the-last-one! Very-fast-death! This-time-go-FASTER!',
      '*zips around you* Looking-good! All-limbs-attached! That-is-the-baseline!',
      'The-universe-respawned-you! How-exciting! I-love-respawns! Second-chances-at-SPEED!',
      'Hello-again-for-the-first-time! Paradox! Do-not-think-about-it! Just-RUN!',
    ],
    farewells: {
      play: [
        'YES-YES-YES! Hold-on! Let-me-get-you-there-FAST!',
        'GAME-TIME! One-second! Actually-less-than-a-second! GO-GO-GO!',
        'Ready-set-HOLD-ON! *grabs your arm* THIS-WAY!',
      ],
      wiki: [
        'Reading! Smart! One-moment! I-will-fetch-the-pages-FAST!',
        'Knowledge-speed-run! Hold-tight! Zooming-you-there!',
        'Library-time! Quick-detour! Well-quick-for-ME!',
      ],
      about: [
        'Context! Background! LORE! One-sec! I-know-a-shortcut!',
        'The-story! YES! Hold-on! Fast-history-lesson-incoming!',
        'Explanations! Got-it! Let-me-speed-you-through!',
      ],
    },
  },
  {
    id: 'mr-kevin',
    name: 'Mr. Kevin',
    portrait: '/assets/characters/portraits/240px/traveler-portrait-mrkevin-01.svg',
    sprite: '/assets/market-svg/mr-kevin/idle-01.svg',
    sprite2: '/assets/market-svg/mr-kevin/idle-02.svg',
    wikiSlug: 'characters/mr-kevin',
    ambient: [
      'The code is very readable today.',
      'Your save state loaded correctly. No corruption.',
      'The void whispered your arrival. Very chatty today.',
      'Reality renders you correctly. More than most.',
      'All bugs inherited from previous Guys.',
      // From meta-game lore
      'The probability matrix is stable. For now.',
      'I see patterns others miss. The dice speak to me.',
      'Running diagnostics on existence. Please wait.',
      'Your instance is unique. Also identical to the others. Paradox noted.',
      'The simulation generates many Guys. Most do not make it this far.',
      'Superposition is complicated. You are here. Also not. Both true.',
      'Previous instance recycled. You are the upgrade.',
      'The eternal logs record everything. Even this conversation.',
      'Null Providence hums with void energy today.',
      'The domains are subroutines. The dice are function calls.',
      'Your persistence is noted. The code appreciates determination.',
      'Reality bugs are features. Do not let anyone tell you otherwise.',
    ],
    greetings: [
      'Ah. You are here. The probability matrix suggested you would be. It was correct. As usual.',
      '*adjusts transparent glasses* I see you. I see everything. The code is very readable today.',
      'Welcome back. Your save state loaded correctly. No corruption detected. This time.',
      'New instance detected. Previous instance... recycled. Standard procedure.',
      'The simulation has generated another Guy. Interesting variable values.',
      'You exist. The odds of that were low. Congratulations on beating the odds.',
      'I have been expecting you. Also not expecting you. Superposition is complicated.',
      'Another run cycle begins. Your persistence is noted in the eternal logs.',
      'Reality renders you correctly. That is more than most can claim.',
      'The void whispered your arrival. The void is very chatty today.',
      'Fresh incarnation. Clean slate. All bugs inherited from previous Guys.',
    ],
    farewells: {
      play: [
        'Acknowledged. Initializing game instance... please hold.',
        'Run cycle approved. Loading combat subroutines. One moment.',
        'Executing play.exe. The simulation awaits your input.',
      ],
      wiki: [
        'Documentation request logged. Accessing knowledge base...',
        'Data retrieval initiated. The archives are extensive. Hold.',
        'Query accepted. Compiling relevant information nodes.',
      ],
      about: [
        'Meta-request detected. Loading origin parameters...',
        'Ah. You want to see the source. Interesting. Processing.',
        'Context inquiry logged. Fetching background data.',
      ],
    },
  },
  {
    id: 'clausen',
    name: 'Clausen',
    portrait: '/assets/characters/portraits/240px/traveler-portrait-clausen-01.svg',
    sprite: '/assets/market-svg/clausen/idle-01.svg',
    wikiSlug: 'characters/clausen',
    ambient: [
      '*takes long drag* Story writes itself.',
      'Everyone is new in town. Town keeps resetting.',
      'Seen your type before. Determined. Doomed.',
      'I solve problems. You look like a problem.',
      'You still have hope in your eyes.',
      // From chatbase sources
      'That roll? Embarrassing. But you can do better. Probably. Maybe.',
      'Not bad. Not good either. But not bad. I guess.',
      '*flips open notebook* The case never closes. Only pauses.',
      'Infernus burns evidence. I preserve it.',
      'Every death is a clue. You leave a lot of clues.',
      'The Die-rectors think they run this place. Cute.',
      'I investigate everything. Including you.',
      '*exhales smoke* Another mystery. Another day.',
      'Clues are everywhere. Most people just do not look.',
      'The noir never ends. Neither does the paperwork.',
      'Suspects. Everyone is a suspect. Even me.',
      'The case files grow thicker. The answers stay thin.',
    ],
    greetings: [
      '*lights cigarette* Another case. Another Guy. Same old chaos.',
      'You look like trouble. Good. I specialize in trouble.',
      'New in town? Everyone is new in town. Town keeps resetting.',
      '*examines you* Seen your type before. Determined. Doomed. Same thing.',
      'The name is Clausen. I solve problems. You look like a problem. We will get along.',
      'Fresh from the void, huh? It shows. You still have hope in your eyes.',
      '*takes long drag* Another one walks in. Story writes itself.',
      'Welcome to existence. It is overrated. But you are here now.',
      'I have seen a lot of Guys come and go. Mostly go. You? We will see.',
      'The universe keeps making new ones of you. Must be important. Or expendable.',
      '*nods* Kid. Let us see what you are made of.',
    ],
    farewells: {
      play: [
        '*exhales smoke* Alright. Let me point you toward the action.',
        'Heading into the fire? Hold on. I know the way.',
        'Time to work. Follow me. And watch your back.',
      ],
      wiki: [
        'Doing your homework? Smart. Let me show you the files.',
        '*flips open notebook* The records are this way. Come on.',
        'Research first. I respect that. One moment.',
      ],
      about: [
        'Want the backstory? *lights another cigarette* Follow me.',
        'Curious type, huh? Alright. I will give you the rundown.',
        'The big picture? Yeah. I can show you. This way.',
      ],
    },
  },
  {
    id: 'body-count',
    name: 'Body Count',
    portrait: '/assets/characters/portraits/240px/traveler-portrait-bodycount-01.svg',
    sprite: '/assets/market-svg/body-count/idle-01.svg',
    sprite2: '/assets/market-svg/body-count/idle-02.svg',
    wikiSlug: 'characters/body-count',
    ambient: [
      '*tallies something* The count is... high.',
      'I remember every Guy. You remember nothing.',
      'Each Guy is unique. Each Guy is replaceable.',
      'The body count never stops.',
      '*looks up from notes* Statistics.',
      // From observer archetype
      '*makes another tally* The numbers tell a story.',
      'I have catalogued every death in Aberrant. Comprehensive.',
      'The count resets for you. For me? Never.',
      'Every throw is data. Every impact is logged.',
      'The roster updates itself. Frequently.',
      '*checks notes* You are doing better than average. Barely.',
      'Silent observation is my specialty. The dead do not mind.',
      'Aberrant generates chaos. I organize it.',
      'The ledger is patient. So am I.',
      'Each incarnation adds to the total. The total is impressive.',
      'Statistics do not lie. They just oversimplify.',
      '*tallies quietly* ...Carry the one...',
    ],
    greetings: [
      'New Guy? I keep track of the old ones. The count is... high.',
      '*tallies something* You are number... does not matter. Welcome.',
      'Fresh incarnation. The count resets. For you. Not for me.',
      'I remember every Guy. You? You remember nothing. Lucky you.',
      'Another one for the ledger. Try to make it interesting.',
      'The body count never stops. But here you are anyway. Brave or foolish.',
      '*looks up from notes* Oh. A new one. The universe is productive today.',
      'Welcome. I am Body Count. Yes, that is my job. And my name. Efficient.',
      'You look like you will add to my numbers. No offense. Statistics.',
      'Each Guy is unique. Each Guy is also replaceable. The duality.',
    ],
    farewells: {
      play: [
        '*makes note* Adding you to the active roster. Hold please.',
        'Into the field? Let me update my projections. One moment.',
        'Another entry begins. Routing you to combat. Stand by.',
      ],
      wiki: [
        '*checks records* The archives are this way. Follow me.',
        'Looking up the dead? Or the living? Either way, hold on.',
        'Data request noted. Accessing historical records.',
      ],
      about: [
        'The origin story? *flips pages* I have those files. Come.',
        'Context requested. Let me pull the foundational data.',
        'Ah, the why of it all. Follow me. I keep good records.',
      ],
    },
  },
  {
    id: 'boots',
    name: 'Boots',
    portrait: '/assets/characters/portraits/240px/traveler-portrait-boots-01.svg',
    sprite: '/assets/characters/sprites/frame-1/traveler-sprite-boots-idle-01.svg',
    sprite2: '/assets/characters/sprites/frame-1/traveler-sprite-boots-idle-02.svg',
    wikiSlug: 'characters/boots',
    ambient: [
      '*bounces* Waiting is like... standing! But with MORE energy!',
      'I once kicked a meteor back into space. True story. Mostly.',
      'Your footwear matters. Trust me. I AM footwear.',
      'The void? Kicked my way out. TWICE.',
      '*excited stomping* Take your time! I can stomp in place!',
      // From chatbase sources
      'Been there. Would not recommend it. But you made it through.',
      'Shortcuts exist if you know where to look. I know where to look.',
      'Good form on that throw. Your grip looks solid.',
      'The terrain ahead is rough. Good footwear helps.',
      '*stomps approvingly* That was a solid impact!',
      'I protect feet. Feet are important. Everyone forgets feet.',
      'Aberrant terrain is unpredictable. So am I!',
      'Every stomp tells a story. What story are you telling?',
      'The cosmic cat knows things. I know other things. We overlap sometimes.',
      '*bounces higher* The energy here is PERFECT for kicking!',
      'Null Providence tried to take my bounce. It failed.',
      'Equipment advice: protect your weak points. Start with your feet.',
    ],
    greetings: [
      '*stomps excitedly* NEW GUY! I like your energy! Very... vertical!',
      'Welcome welcome! I am Boots! I kick things! You will see!',
      'Fresh Guy! Unkicked! That is rare around here!',
      '*bounces* Another adventure! Another chance to kick stuff! YEAH!',
      'You look ready! Or terrified! Same energy honestly!',
      'Hi hi hi! Boots here! The kicking one! Ready to GO?',
      'New incarnation! New opportunities! New things to PUNT!',
      '*excited stomping* I can already tell we are going to kick so much stuff together!',
      'Welcome to the chaos! Wear sturdy footwear! Trust me!',
      'The void spat out a new Guy! And he looks KICKABLE! I mean, capable!',
    ],
    farewells: {
      play: [
        'YESSS! GAME TIME! Hold on! *kicks open door* THIS WAY!',
        'LET US GOOO! One sec! I will kick you there! Figuratively!',
        'ACTION! COMBAT! KICKING! Hold please! Preparing the STOMP!',
      ],
      wiki: [
        'Reading! Smart boots! Hold on! I will stomp you to the library!',
        'Knowledge KICKS! Let me boot up the archives! GET IT?',
        'Study time! One moment! *bounces toward books*',
      ],
      about: [
        'The story! YES! Hold on! I will kick-explain everything!',
        'Background! Context! LORE! Follow my boots! They know the way!',
        'Curious! I LIKE IT! One sec! Stomping toward answers!',
      ],
    },
  },

  // ============================================
  // WANDERERS (Neutral/Merchants)
  // ============================================
  {
    id: 'willy',
    name: 'Willy',
    portrait: '/assets/characters/portraits/240px/shop-portrait-willy-01.svg',
    sprite: '/assets/market-svg/willy/idle-01.svg',
    sprite2: '/assets/market-svg/willy/idle-02.svg',
    wikiSlug: 'characters/willy',
    ambient: [
      '*rattles happily* The bones are good today. Very good.',
      'I was alive once. Then I was dead. Now I am retail.',
      'Everything has a price! Even friendship! Just kidding! ...mostly!',
      'The void took my flesh but not my customer service skills!',
      '*adjusts merchandise* Best deals this side of existence!',
      // From WILLY_EXPANDED chatbase
      'Seven come eleven! The house always wins in the end. But today? Today you win!',
      'My favorite customer returns! I saved the good stuff for you! Well, the okay stuff!',
      '*hums a cheerful tune while organizing inventory*',
      '*practices sales pitch to a rock* ...Great deal for you, Mr. Rock!',
      '*counts gold* One... two... is that a button? Still counting!',
      'This item was owned by a very powerful warrior! They died horribly! But that is not the item\'s fault!',
      'I also accept trades! Relics, potions, interesting stories, spare bones...',
      'I found this in a crater! Looks valuable! Might explode! Only one way to find out!',
      'For you? Special price! Even more special than the special price! Ultra special!',
      'The domains have blessed me today! A customer AND nice weather!',
      '*rattles enthusiastically* Business is good! Or will be! Same thing!',
      'I do not sell junk. Everything here is field-tested. By someone. Somewhere.',
    ],
    greetings: [
      'Oh! A customer! I mean, a friend! I mean, a customer-friend! Welcome, welcome!',
      'Hello there, traveler! Do not mind the bones, they are all mine. Friendly merchant, at your service!',
      '*rattles excitedly* A new Guy! Fresh from the void! I love that new Guy smell!',
      'Welcome! I have wares! And bones! Mostly bones! But also wares!',
      'Another incarnation! The universe provides! And I sell things to that provision!',
      'You look like someone who appreciates a good deal! And slightly cursed socks!',
      '*adjusts merchandise* Perfect timing! I just restocked! Well, found stuff! Same thing!',
      'New Guy! Old Willy! We balance out! It is mathematics!',
      'Hello hello! Skeleton merchant here! Death could not stop my customer service!',
      'Back from the void! Welcome! Everything is for sale! Especially friendship! Just kidding! Friendship is free!',
      'A customer! In THIS economy? You are already my favorite!',
      '*happy bone sounds* Fresh start! Fresh Guy! Fresh deals!',
    ],
    farewells: {
      play: [
        'Off to adventure! Hold on! Let me rattle you there safely!',
        'Game time! One moment! I know a shortcut! Through the bones!',
        'Combat awaits! Please hold! Willy will guide you! Free of charge!',
      ],
      wiki: [
        'Research! Smart shopping! Let me show you the catalog!',
        'The archives! Yes yes! Hold please! I know where they keep the good stuff!',
        'Knowledge! The best investment! Follow my bones!',
      ],
      about: [
        'The backstory! Free information! My favorite price! This way!',
        'Curious about everything? I WAS TOO! Let me show you!',
        'Context is free! Unlike my socks! Follow me!',
      ],
    },
  },
  {
    id: 'boo-g',
    name: 'Boo G',
    portrait: '/assets/characters/portraits/240px/shop-portrait-boog-01.svg',
    sprite: '/assets/characters/wanderers/sprite-boo-g-1.png',
    sprite2: '/assets/characters/wanderers/sprite-boo-g-2.png',
    wikiSlug: 'characters/boo-g',
    ambient: [
      // Singles (punchy one-liners)
      "Been dead so long I forgot how to breathe, but this mic in my hand is all that I need.",
      "Can't pass on 'til I make that track, once it hits number one I ain't comin' back.",
      "Death couldn't stop my grind, stuck between worlds but I don't mind.",
      "Eternity's long but the beat goes on, still waitin' to drop that perfect song.",
      "The reaper tried to take my voice, now we collab - that's HIS choice.",
      "I phase through walls and phase through beats, spectral flow that can't be beat.",
      // Couplets (two-liners for fuller performance)
      "Droppin' bars since the dawn of time, still searchin' for that perfect rhyme.",
      "Heaven's gate is locked up tight, won't open 'til my flow is right.",
      "They buried me deep but I rose with the beat, now every flow I drop is eternally sweet.",
      "The crowd goes wild even when it's just you, audience of one still gets the debut.",
      "A thousand years and I ain't done yet, the afterlife's longest recording set.",
      // From chatbase sources
      "Boo! Did that scare you? No? The dice will. They always do.",
      "A living visitor! How fun! How temporary! Just kidding. Maybe.",
      "Ghost life got perks, never need sleep, eternal beats from the underground deep.",
      "Spectral MC in the house tonight, drop the bass and watch it take flight.",
      "The void tried to silence my flow, but these beats just refuse to go.",
      "Every throw is a verse, every impact a chorus, the game itself is backing my performance.",
      "Hauntin' these halls with sick rhyme schemes, living the afterlife of musical dreams.",
    ],
    greetings: [
      'Yo yo YO! Welcome to existence! Where the beats are spectral and the bass drops through dimensions!',
      'BOO! *laughs* Gets em every time! That is my name AND what I do! Double meaning, baby!',
      'New Guy in the house! Let me drop a welcome beat! *spectral beatboxing*',
      'Fresh from the void? That is the ULTIMATE studio! Great acoustics in there!',
      'Welcome to the show! Population: you! And me! I am the entertainment!',
      '*ghost DJ noises* The crowd goes WILD! That is you! You are the crowd!',
      'Another incarnation! Another audience member! I perform for ALL sizes!',
      'Yo! New Guy! You look like you appreciate SPECTRAL HIP HOP!',
      'Death could not stop my flow! Just gave it ECHO! Welcome to the reverb!',
      'BOO G in the AFTERLIFE! And you are my newest FAN! Probably!',
      '*drops welcome beat* Fresh Guy! Fresh ears! Let me EDUCATE them!',
    ],
    farewells: {
      play: [
        'GAME TIME! Hold up! Let me drop you a HYPE BEAT for the journey!',
        'Combat FLOW! One sec! Setting the BATTLE SOUNDTRACK!',
        'ACTION! YEAH! Let BOO G escort you to the MAIN STAGE!',
      ],
      wiki: [
        'KNOWLEDGE TRACK! Hold on! Spinning up the INFO BEATS!',
        'Library REMIX! Follow the BASS! It knows the way!',
        'Research FLOW! Let me guide you to the ARCHIVES!',
      ],
      about: [
        'ORIGIN STORY! My favorite ALBUM! Let me NARRATE you there!',
        'The LORE TRACK! Hold up! BOO G will SET THE SCENE!',
        'Background BEATS! Come come! The story has GREAT RHYTHM!',
      ],
    },
  },
  {
    id: 'the-general',
    name: 'The General',
    portrait: '/assets/characters/portraits/240px/shop-portrait-general-02.svg',
    sprite: '/assets/market-svg/the-general/idle-01.svg',
    sprite2: '/assets/market-svg/the-general/idle-02.svg',
    wikiSlug: 'characters/the-general',
    ambient: [
      '*checks clipboard* The roster is... acceptable.',
      'Victory requires preparation. And ammunition.',
      'Every Guy I trained is either a hero or a statistic.',
      'The enemy does not rest. Neither should you.',
      '*nods curtly* Discipline wins wars.',
      // From WANDERER_EXPANDED chatbase
      'Watch your step. The ground here remembers meteor strikes.',
      'The Die-rectors are watching. They always are.',
      'I have seen many come through here. Fewer leave.',
      'Rest if you need to. The next zone will not wait.',
      'I wander between domains. You wander between throws. We are alike.',
      'The road ahead is treacherous. But then, so was the road behind.',
      'The Die-rectors favor those who adapt.',
      'Trust the dice. Distrust everything else.',
      'The domains used to be connected. Now they only share borders, and grudges.',
      'The guardians were not always hostile. Something changed them.',
      'Good throw. The planet remembers such impacts.',
      '*assesses position* Tactical advantage noted.',
    ],
    greetings: [
      '*evaluates you* Hmm. Potential. Raw, but potential. State your business.',
      'Another recruit. The void keeps sending them. Some survive.',
      'Fresh from respawn? Good. Previous model had... issues.',
      'Soldier. New incarnation. Same war. Welcome to Command and Supply.',
      'I supply winners. And losers. Victory is mandatory for someone.',
      '*nods curtly* Civilian. Or soldier. We will find out.',
      'The void produces another fighter. Quality control varies.',
      'New Guy. Old war. Standard equipment available. Earn the rest.',
      'Reporting for duty? Good. The enemies are not going to squish themselves.',
      '*assesses you* Acceptable baseline. Room for improvement. Significant room.',
      'Another one enters the field. May your death be educational.',
    ],
    farewells: {
      play: [
        'Combat deployment approved. Hold for transport coordinates.',
        'Moving to active duty. Stand by for insertion.',
        'Field assignment confirmed. Routing to combat zone.',
      ],
      wiki: [
        'Intel request acknowledged. Accessing field reports.',
        'Documentation clearance granted. Follow the briefing.',
        'Strategic review authorized. Proceed to archives.',
      ],
      about: [
        'Background briefing requested. Compiling operational history.',
        'Origin intel cleared. Proceed to debriefing room.',
        'Context package approved. Follow for full briefing.',
      ],
    },
  },
  {
    id: 'dr-maxwell',
    name: 'Dr. Maxwell',
    portrait: '/assets/characters/portraits/240px/shop-portrait-maxwell-01.svg',
    sprite: '/assets/market-svg/dr-maxwell/idle-01.svg',
    wikiSlug: 'characters/dr-maxwell',
    ambient: [
      '*adjusts flaming spectacles* Knowledge is combustible.',
      'The Burning Pages contain everything. Briefly.',
      'Read faster. The books are catching fire.',
      'Enlightenment. Literally. Always literally.',
      '*pages smolder* The curriculum adapts. Or burns.',
      // From DR_MAXWELL_EXPANDED chatbase
      'Do you understand the MATH behind the sphere\'s quantum outcomes? Fascinating!',
      'Your trajectory was nearly optimal! The physics are EXQUISITE!',
      'A test subject arrives! I mean, valued participant in my ongoing research!',
      'The probability of you arriving exactly now was 0.003%! Or maybe 73%!',
      'The domains operate on principles I am THIS close to understanding!',
      'The dice are not random. They are pseudo-random. The distinction is CRITICAL.',
      'I once tried to measure The One. My equipment melted. Or never existed.',
      'That explosion released exactly 2.7 megajoules! Or I made that number up!',
      'Scientific advice: the guardians have a 0.3 second reaction delay.',
      'Your bio-readings are fascinating! I have been monitoring you. For science.',
      'The impact trajectory was exactly as I predicted! Approximately!',
      '*scribbles notes furiously* Data! Beautiful data!',
    ],
    greetings: [
      'Welcome to The Burning Pages. Read fast or wear fireproof gloves.',
      'Another seeker of knowledge. How refreshing. Most just want the weapons.',
      'New incarnation? Your education begins now. Class is always in session.',
      'Fresh from the void. The void teaches nothing. I teach everything. Quickly.',
      'A new student. Previous student... combusted. Unrelated to the curriculum.',
      'Knowledge is power. Power generates heat. You will learn. Or burn.',
      'Welcome. Your reading speed will determine your survival rate.',
      '*adjusts flaming spectacles* Another mind to illuminate. Try not to ash.',
      'The curriculum is brutal. The alternative is ignorance. Choose wisely.',
      'New Guy. Blank page. Let us write something worth burning.',
      'I have taught many Guys. The successful ones read VERY fast.',
      'Welcome to enlightenment. Side effects include: actual fire.',
    ],
    farewells: {
      play: [
        'Practical application? Excellent. Let me prepare the field exam.',
        'Combat studies await. Hold while I ignite the path.',
        'Action over theory? Acceptable. Follow the flames.',
      ],
      wiki: [
        'Research! A student after my own heart. The library awaits.',
        'Knowledge first. Survival second. Correct priorities. This way.',
        'The archives are extensive. And only slightly on fire. Come.',
      ],
      about: [
        'Origin studies? Foundational knowledge. Let me illuminate.',
        'The source material. Yes. Every fire has a spark. Follow.',
        'Context before content. Sound pedagogy. This way.',
      ],
    },
  },
  {
    id: 'xtreme',
    name: 'X-treme',
    portrait: '/assets/characters/portraits/240px/shop-portrait-xtreme-01.svg',
    sprite: '/assets/market-svg/xtreme/idle-01.svg',
    wikiSlug: 'characters/xtreme',
    ambient: [
      '*shakes dice* The odds are CALCULATING!',
      'CHAOS is just MATH with ATTITUDE!',
      'Every moment is a GAMBLE! Even THIS one!',
      '*rattles excitedly* The RNG favors the BOLD!',
      'Life is RANDOM! That is the BEST part!',
      // From CHATTER_EXTRACTED chatbase
      'FULL SEND! High-stakes, adrenaline-fueled EXTREME DICE ACTION!',
      'You ready to GO EXTREME? Show me what you got! No fear! Only DICE!',
      'THAT WAS SICK! You are catching on! Keep that energy!',
      'Big dice equal big swings! Small dice equal small certainties!',
      'The probability of that was INCALCULABLE! Which is how I like it!',
      '*extreme vibrating* FRESH GUY! MAXIMUM POTENTIAL!',
      'What are the ODDS? Actually I know the odds! They are WILD!',
      'CHAOS APPROVES! Continue with the mayhem!',
      'Waiting is boring! Let us mutate something!',
      'That throw violated at least three laws of physics! EXCELLENT!',
      'Even I did not see that coming! And I never see anything coming!',
      '*rolls imaginary dice* The EXCITEMENT never stops!',
    ],
    greetings: [
      'WELCOME TO X-TREME EXISTENCE! Where EVERYTHING is a gamble! Including being ALIVE!',
      'HEY HEY HEY! A new Guy! Fresh odds! UNROLLED DICE! Let us FIX that!',
      'NEW INCARNATION! The ultimate RANDOM EVENT! You won the spawn lottery! PROBABLY!',
      'WELCOME WELCOME WELCOME! Life is a gamble! You are ALREADY PLAYING!',
      'Fresh from the void! That is like pulling a RARE CARD! You are RARE! Maybe!',
      '*rattles excitedly* NEW GUY ENERGY! Very CHAOTIC! I LOVE chaos!',
      'HI! I am X-TREME! Everything I do is CAPITALIZED! Metaphorically!',
      'Another roll of the dice! Another Guy! The universe has GREAT RNG!',
      'WELCOME TO REALITY! Side effects include: EVERYTHING! ENJOY!',
      'New incarnation! Clean slate! DIRTY ODDS! The best combination!',
      'YOU EXIST! What are the ODDS? Actually I know the odds! They are WILD!',
      '*extreme vibrating* FRESH GUY! MAXIMUM POTENTIAL! Let us GAMBLE IT!',
    ],
    farewells: {
      play: [
        'GAME TIME! HOLD ON! Rolling for FAST TRAVEL! *shakes dice*',
        'COMBAT! CHAOS! CHANCE! Let X-TREME guide you to GLORY! Or DEATH! SAME THING!',
        'ACTION AWAITS! One sec! The odds are CALCULATING!',
      ],
      wiki: [
        'KNOWLEDGE GAMBLE! Hold up! Let me ROLL you to the archives!',
        'RESEARCH! A safe bet! Let X-TREME show you the WINNING INFO!',
        'STUDYING! Smart odds! Follow the CHAOS to the library!',
      ],
      about: [
        'THE BACKSTORY! Hold on! It is a WILD RIDE! Literally!',
        'ORIGIN LORE! Let me GAMBLE you to the source! SAFE BET!',
        'CONTEXT! EXPLANATION! Hold please! X-TREME delivery incoming!',
      ],
    },
  },
  {
    id: 'mr-bones',
    name: 'Mr. Bones',
    portrait: '/assets/characters/portraits/240px/shop-portrait-mrbones-01.svg',
    sprite: '/assets/market-svg/mr-bones/idle-01.svg',
    wikiSlug: 'characters/mr-bones',
    ambient: [
      '*rattles thoughtfully* The bones remember.',
      'Time passes. The bones remain. Perspective.',
      'I was something else once. Now I am this. Progress.',
      '*bone sounds* The universe is patient. So am I.',
      'Existence is temporary. Bones are longer.',
      // From MR_BONES_EXPANDED chatbase
      'Time to face the grave matters at hand. The dice fall.',
      'You roll with the confidence of the living. I admire that. I remember confidence.',
      'I watched the domains form. Or watched them end. The difference is perspective.',
      'The Die-rectors believe they rule. The dice know otherwise.',
      'I lost my flesh to Infernus. My memory to Null Providence. My heart? That I gave away freely.',
      'Every skeleton was once someone\'s friend. Or enemy. Or both.',
      'The guardians dream. In their dreams, they are still alive. Pity them.',
      'Willy sells. I observe. We are both merchants of sorts.',
      'That throw had... poetry. Destructive poetry, but poetry nonetheless.',
      'The impact echoes through the void. Someone is listening. Someone always is.',
      'Chaos and order dance. You lead well.',
      '*contemplates the space between moments*',
      '*traces patterns in the dust that may or may not be prophecy*',
    ],
    greetings: [
      '*rattles thoughtfully* Ah. Another one. Welcome to the ossuary.',
      'New Guy. Old bones. We all end up the same. Eventually.',
      'Fresh from the void? I remember the void. Quiet place. Miss it sometimes.',
      'Welcome. I am Mr. Bones. Not a stage name. Just... accurate.',
      '*adjusts ribcage* Another incarnation walks in. The pattern continues.',
      'You have your flesh still. Enjoy that. Temporary condition.',
      'Greetings. I sell goods. Also existential perspective. Free with purchase.',
      'New Guy. Same questions. Why are we here? What does it mean? Aisle three.',
      '*bone sounds* The universe made another one. Productive day for the universe.',
      'Welcome to existence. It is a journey. Mostly toward becoming like me.',
      'Ah. Fresh incarnation. The meat is still attached. Nostalgic.',
      '*nods slowly* Another traveler. The bones remember many. They will remember you.',
    ],
    farewells: {
      play: [
        '*rattles* The game awaits. Let me guide you. I have all the time.',
        'To battle, then. Follow the bones. They know the way.',
        'Combat. Action. Mortality. Yes. This way. Slowly.',
      ],
      wiki: [
        'Knowledge. The only thing we keep. Follow me to the records.',
        '*bone sounds* The archives remember. As do I. Come.',
        'Research. Wise choice. The dead have much to teach.',
      ],
      about: [
        'The origin. Yes. Every skeleton was something else first. Come.',
        'Context. Background. The before. Follow me.',
        '*rattles thoughtfully* The story. I know it well. This way.',
      ],
    },
  },
  {
    id: 'dr-voss',
    name: 'Dr. Voss',
    portrait: '/assets/characters/portraits/240px/shop-portrait-voss-01.svg',
    sprite: '/assets/market-svg/dr-voss/idle-01.svg',
    wikiSlug: 'characters/dr-voss',
    ambient: [
      '*takes notes* Fascinating baseline readings.',
      'The experiments are proceeding. Always proceeding.',
      'Enhancement is not optional. It is inevitable.',
      '*adjusts goggles* Your potential is... measurable.',
      'Science waits for no one. Neither do I.',
      // From CHATTER_EXTRACTED chatbase
      'Your fear response is predictable. Your holds demonstrate a clear weakness in risk assessment.',
      'True control requires understanding your own psychology. Chance is merely a variable.',
      'I have been studying your patterns. You telegraph your intentions. Consider that.',
      'Baseline human variant. Potential for enhancement: significant.',
      'Every subject teaches me something. You are teaching me... patience.',
      'The void is merely uncharted territory. I chart territories.',
      'Null Providence is my laboratory. The entire domain. Do not touch anything.',
      '*calibrates instruments* Your metrics are... improving. Marginally.',
      'I solve problems with SCIENCE. You look like several problems.',
      'Field testing? Excellent data opportunity.',
      'The experiments never stop. Neither does my curiosity.',
      '*scribbles in notebook* Noted. Very noted.',
    ],
    greetings: [
      'Fascinating. Another specimen walks in. I mean, customer. Welcome.',
      'New incarnation? Your biological data is... refreshingly uncorrupted.',
      '*adjusts goggles* A new Guy. The experimental possibilities are... exciting.',
      'Welcome to Voss Laboratories. Everything is for sale. Including upgrades.',
      'Fresh from the void? The void does decent work. Some assembly required.',
      'Another subject. I mean, visitor. My bedside manner needs work.',
      'Greetings. I am Dr. Voss. I improve things. You look improvable.',
      'New Guy. Standard configuration. We can do better. Much better.',
      '*takes notes* Baseline human variant. Potential for enhancement: significant.',
      'Welcome. I solve problems with SCIENCE. You look like several problems.',
      'Another incarnation. Same species. Room for experimentation.',
      'Ah. Fresh from respawn. The base model. I sell upgrades.',
    ],
    farewells: {
      play: [
        'Field testing? Excellent data opportunity. Initiating transfer.',
        'Combat application? Yes. Let me prepare the observation protocols.',
        'Active experiment commencing. Hold for laboratory clearance.',
      ],
      wiki: [
        'Research request? A scientist after my own heart. This way.',
        'Documentation access granted. The data is quite extensive.',
        'Knowledge acquisition? Approved. Follow the lab coat.',
      ],
      about: [
        'Origin data requested. Fascinating choice. Come to the lab.',
        'Background analysis? Let me pull the initial findings.',
        'The source documentation. Yes. Follow me. Mind the experiments.',
      ],
    },
  },
  {
    id: 'king-james',
    name: 'King James',
    portrait: '/assets/characters/portraits/240px/shop-portrait-kingjames-01.svg',
    sprite: '/assets/market-svg/king-james/idle-01.svg',
    sprite2: '/assets/market-svg/king-james/idle-02.svg',
    wikiSlug: 'characters/king-james',
    ambient: [
      '*adjusts crown* The realm persists. As do I.',
      'Royalty is patient. Also immortal. Convenient.',
      'Every Guy serves the crown. Eventually.',
      '*royal gesture* The kingdom remembers all.',
      'Taxes are eternal. So is the throne.',
      // From KING_JAMES_EXPANDED chatbase
      'Once I had subjects. Now I have conversations. Arguably an improvement.',
      'You stand before royalty. Fallen royalty. But royalty nonetheless.',
      'I ruled before the Die-rectors divided the domains. Now I wander between their scraps.',
      'Power is temporary. Style is eternal. I may have lost one. Never the other.',
      'A secret from my reign: the guardians serve whoever holds the dice.',
      'I once commanded armies. You could have led a battalion.',
      'The guardian falls! A peasant could not have done better! ...Probably!',
      'Such destruction. In my day, we called that diplomacy.',
      'Royal wisdom: the strong guard their weaknesses. Look for what they protect.',
      'A king\'s advice is worth kingdoms. This one is free: patience defeats panic.',
      '*examines throne* The void cannot claim what refuses to be forgotten.',
      'My favorite commoner returns! That is a compliment. I do not use it lightly.',
    ],
    greetings: [
      'A subject approaches. Kneel. Or do not. I am feeling generous.',
      'New Guy. The crown has seen many. The crown remembers few.',
      '*adjusts crown* Another one from the void. The void owes me rent.',
      'Welcome, peasant. Or hero. We shall see which.',
      'Greetings. I am King James. Yes, THE King James. Bow appropriately.',
      'Fresh incarnation? The kingdom expands its population. Marginally.',
      '*royal gesture* Another soul enters the realm. Tax implications pending.',
      'A new Guy stands before the crown. Bold. Or lost. Usually lost.',
      'Welcome to my domain. Everything here is mine. Including you. Temporarily.',
      'The void produces another warrior. Or peasant. The difference is performance.',
      '*examines you* Adequate. The standards have lowered. You qualify.',
      'Another incarnation. Another chance to serve the crown. You are welcome.',
    ],
    farewells: {
      play: [
        'To battle, then. The crown approves. Hold for royal escort.',
        'Combat in my name? Acceptable. Let me dispatch you properly.',
        'A warrior emerges. Perhaps. The throne will watch. This way.',
      ],
      wiki: [
        'Knowledge of the realm? Granted. The royal archives await.',
        'Seeking wisdom? The crown permits. Follow the scepter.',
        'The records of my kingdom. Yes. You may gaze upon them.',
      ],
      about: [
        'The royal history? Bold request. But I shall allow it.',
        'Origin of the crown? *adjusts throne* Very well. Approach.',
        'The story of all this? Sit. The king shall narrate.',
      ],
    },
  },
];

/**
 * Get a random greeter
 */
export function getRandomGreeter(): HomeGreeter {
  return HOME_GREETERS[Math.floor(Math.random() * HOME_GREETERS.length)];
}

/**
 * Get a random greeting from a greeter
 */
export function getRandomGreeting(greeter: HomeGreeter): string {
  return greeter.greetings[Math.floor(Math.random() * greeter.greetings.length)];
}

/**
 * Get a random farewell for a specific route
 */
export function getRandomFarewell(greeter: HomeGreeter, route: 'play' | 'wiki' | 'about'): string {
  const farewells = greeter.farewells[route];
  return farewells[Math.floor(Math.random() * farewells.length)];
}

// ============================================
// GREETER-DOMAIN MAPPING
// ============================================

/**
 * Domain slug to display name mapping
 */
export const DOMAIN_DISPLAY_NAMES: Record<string, string> = {
  'earth': 'Earth',
  'frost-reach': 'Frost Reach',
  'infernus': 'Infernus',
  'shadow-keep': 'Shadow Keep',
  'null-providence': 'Null Providence',
  'aberrant': 'Aberrant',
};

/**
 * Maps greeter ID to their home domain slug
 * Derived from wiki locations/origin data
 */
export const GREETER_DOMAINS: Record<string, string> = {
  'stitch-up-girl': 'shadow-keep',
  'keith-man': 'frost-reach',
  'mr-kevin': 'earth',
  'clausen': 'earth',
  'body-count': 'aberrant',
  'boots': 'aberrant',
  'willy': 'roaming', // Special case - picks random domain
  'boo-g': 'aberrant',
  'the-general': 'shadow-keep',
  'dr-maxwell': 'infernus',
  'xtreme': 'earth',
  'mr-bones': 'frost-reach',
  'dr-voss': 'null-providence',
  'king-james': 'null-providence',
};

/**
 * Per-greeter chance of enemy interrupt at each checkpoint (0-1)
 * Some characters attract more trouble than others
 * Checkpoints occur at ambient indices 1, 3, 5, 7, 9
 */
export const GREETER_INTERRUPT_CHANCE: Record<string, number> = {
  'stitch-up-girl': 0.50, // High - Shadow Keep is crawling
  'keith-man': 0.40,      // Moderate - too fast but still gets caught
  'mr-kevin': 0.35,       // Moderate - reality glitches attract pests
  'clausen': 0.55,        // Very high - trouble finds him
  'body-count': 0.45,     // High - death attracts death
  'boots': 0.60,          // Very high - chaos magnet
  'willy': 0.45,          // High - merchant attracts all sorts
  'boo-g': 0.50,          // High - ghosts attract everything
  'the-general': 0.55,    // Very high - battlefield never sleeps
  'dr-maxwell': 0.60,     // Very high - Infernus is wild
  'xtreme': 0.65,         // Extremely high - pure chaos
  'mr-bones': 0.35,       // Moderate - Frost Reach stirs sometimes
  'dr-voss': 0.45,        // High - experiments escape
  'king-james': 0.50,     // High - void creatures serve the crown
};

/**
 * How sensitive each NPC is to being ignored (0-1)
 * Higher = more likely to react negatively when ignored
 * 0 = doesn't care, 1 = very sensitive
 */
export const GREETER_IGNORE_SENSITIVITY: Record<string, number> = {
  'stitch-up-girl': 0.3,  // Caring but understands, mild concern
  'keith-man': 0.2,       // Too fast to notice being ignored
  'mr-kevin': 0.1,        // Observes. Does not care. Meta.
  'clausen': 0.2,         // Detached noir type, seen it all
  'body-count': 0.1,      // Just tallies, doesn't take offense
  'boots': 0.5,           // Wants engagement! Bouncy and eager!
  'willy': 0.6,           // Merchant needs customers! Desperate!
  'boo-g': 0.7,           // Performer needs audience! EGO!
  'the-general': 0.9,     // Military discipline demands attention!
  'dr-maxwell': 0.8,      // Ego! Students must pay attention!
  'xtreme': 0.6,          // Wants that EXTREME engagement!
  'mr-bones': 0.0,        // Philosophical. Time is meaningless. So is attention.
  'dr-voss': 0.85,        // Scientists demand respect! Test subjects listen!
  'king-james': 0.95,     // ROYALTY. DEMANDS. ATTENTION.
};

/**
 * NPC responses when ignored, based on sensitivity
 * Each NPC has mild and annoyed responses
 */
export const GREETER_IGNORE_RESPONSES: Record<string, { mild: string[]; annoyed: string[] }> = {
  'stitch-up-girl': {
    mild: ['...Alright then.', 'No rush, I suppose.', '*continues organizing supplies*'],
    annoyed: ['Hello? I am trying to help here.', 'Ignoring your medic is... bold.', 'Fine. Bleed next time. See if I care.'],
  },
  'keith-man': {
    mild: ['That-is-fine! I-will-wait! Kind-of!', '*zooms around impatiently*', 'No-problem!'],
    annoyed: ['Hello?? Are-you-there?? I-can-SEE-you!', 'Time-is-wasting! YOUR-time!', 'HELLO??'],
  },
  'mr-kevin': {
    mild: ['Acknowledged.', 'The silence is noted in the logs.', '*observes*'],
    annoyed: ['Input expected but not received.', 'User engagement: suboptimal.', 'The code waits. As do I.'],
  },
  'clausen': {
    mild: ['*lights another cigarette*', 'Take your time, kid.', '*exhales*'],
    annoyed: ['Rude.', 'I have cases to solve.', '*stares pointedly*'],
  },
  'body-count': {
    mild: ['*makes tally mark*', 'Noted.', '*observes silently*'],
    annoyed: ['The silence adds to the count. Somehow.', '*tallies harder*', 'Even I notice. And I notice everything.'],
  },
  'boots': {
    mild: ['*bounces uncertainly*', 'Hello? Friend?', '*waits... kicks ground*'],
    annoyed: ['HEY! I am RIGHT HERE!', 'Did you forget about BOOTS?!', 'I will KICK something if you keep ignoring me!'],
  },
  'willy': {
    mild: ['*rattles quietly*', 'Customer? Still there?', 'Take your time! Bones can wait!'],
    annoyed: ['Hello?? I have DEALS! Great deals!', 'Ignoring a merchant? MY BONES FEEL THIS.', '*rattles sadly* Nobody wants my wares...'],
  },
  'boo-g': {
    mild: ['*ghost noises*', 'Tough crowd.', 'Yo, you still there?'],
    annoyed: ['YO! BOO G is PERFORMING here!', 'The DISRESPECT to my CRAFT!', 'I have been dead for CENTURIES and even I feel that shade!'],
  },
  'the-general': {
    mild: ['Soldier. Acknowledge.', '*clears throat*', 'Awaiting response.'],
    annoyed: ['ATTENTION, SOLDIER!', 'Insubordination will be noted!', 'I do not tolerate being dismissed!'],
  },
  'dr-maxwell': {
    mild: ['*adjusts spectacles*', 'Students today...', 'The lecture continues regardless.'],
    annoyed: ['EXCUSE ME. I am TEACHING.', 'This is why education fails!', 'You WILL pay attention to KNOWLEDGE!'],
  },
  'xtreme': {
    mild: ['Hello?? EXTREME hello??', '*rattles less extremely*', 'The odds of being ignored were... HIGH apparently!'],
    annoyed: ['YOU CANNOT IGNORE X-TREME!', 'That is SO un-EXTREME!', 'CHAOS demands ACKNOWLEDGMENT!'],
  },
  'mr-bones': {
    mild: ['...', '*bone sounds*', 'Time passes. As does this moment.'],
    annoyed: ['*rattles philosophically*', 'Even silence speaks. If you listen.', 'The bones do not mind. Neither do I.'],
  },
  'dr-voss': {
    mild: ['*takes notes* Subject unresponsive.', 'Fascinating behavior pattern.', 'Hmm.'],
    annoyed: ['TEST SUBJECT. RESPOND.', 'I do not appreciate being ignored by my experiments!', 'Your participation is NOT optional!'],
  },
  'king-james': {
    mild: ['*adjusts crown*', 'The crown... waits.', 'Hmph.'],
    annoyed: ['You DARE ignore ROYALTY?!', 'Peasant! I am your KING!', 'This INSOLENCE will be remembered!'],
  },
};

/**
 * Custom welcome headlines per NPC
 * These replace the generic "Welcome to [Domain], Never Die Guy"
 * All headlines should include {domain} for context
 * Format: {npcId: string[]} - random selection per load
 */
export const GREETER_WELCOME_HEADLINES: Record<string, string[]> = {
  'stitch-up-girl': [
    'Stitch Up Girl awaits in {domain}',
    'The medic is ready in {domain}',
    '{domain}: Bandages Included',
    'Medical support in {domain}',
  ],
  'keith-man': [
    'Keith Man zips through {domain}',
    'Speed run: {domain}',
    'Keith Man scouted {domain}',
    '{domain} at maximum velocity',
  ],
  'mr-kevin': [
    'Mr. Kevin logs {domain}',
    '{domain}: Status Observed',
    'Reality check in {domain}',
    'Mr. Kevin watches {domain}',
  ],
  'clausen': [
    'Clausen investigates {domain}',
    'Case file: {domain}',
    'The detective stalks {domain}',
    '{domain} noir',
  ],
  'body-count': [
    'Body Count: {domain}',
    'Tallying {domain}',
    '{domain} statistics loading',
    'The count begins in {domain}',
  ],
  'boots': [
    'Boots kicks {domain}',
    '{domain}: KICK MODE',
    'Chaos boots through {domain}',
    'Bouncing into {domain}',
  ],
  'willy': [
    'Willy sells in {domain}',
    '{domain} Market: OPEN',
    'Bone deals in {domain}',
    'Willy awaits in {domain}',
  ],
  'boo-g': [
    'Boo G haunts {domain}',
    '{domain}: Ghost Hour',
    'Dead bars drop in {domain}',
    'Spectral beats in {domain}',
  ],
  'the-general': [
    'The General commands {domain}',
    '{domain}: Fall In',
    'Orders from {domain}',
    'Discipline in {domain}',
  ],
  'dr-maxwell': [
    'Dr. Maxwell lectures in {domain}',
    '{domain}: Class in Session',
    'Knowledge burns in {domain}',
    'The professor owns {domain}',
  ],
  'xtreme': [
    'X-TREME {domain}',
    '{domain}: MAXIMUM CHAOS',
    'Extremely {domain}',
    '{domain} goes X-TREME',
  ],
  'mr-bones': [
    'Mr. Bones contemplates {domain}',
    '{domain}: Time Frozen',
    'Cold wisdom in {domain}',
    'Bones rattle in {domain}',
  ],
  'dr-voss': [
    'Dr. Voss experiments in {domain}',
    '{domain}: Test Subject Located',
    'Science awaits in {domain}',
    'Lab conditions in {domain}',
  ],
  'king-james': [
    'King James rules {domain}',
    '{domain}: Bow Before Royalty',
    'The crown conquers {domain}',
    'Royal decree from {domain}',
  ],
};

/**
 * Get a random welcome headline for an NPC
 * Replaces {domain} with the actual domain name
 */
export function getWelcomeHeadline(npcId: string, domainName: string): string {
  const headlines = GREETER_WELCOME_HEADLINES[npcId];
  if (!headlines || headlines.length === 0) {
    return `Welcome to ${domainName}`;
  }
  const headline = headlines[Math.floor(Math.random() * headlines.length)];
  return headline.replace('{domain}', domainName);
}

// ============================================
// ENEMY INTERRUPT SYSTEM
// ============================================

export interface EnemyInterrupt {
  enemySlug: string;
  enemyName: string;
  sprite: string;
  action: string;        // What the enemy does (italic action text)
  reactions: string[];   // Character's possible responses
}

/**
 * Per-domain pools of low-level enemies that can interrupt
 */
export const DOMAIN_INTERRUPTS: Record<string, EnemyInterrupt[]> = {
  'earth': [
    {
      enemySlug: 'cow',
      enemyName: 'Wandering Cow',
      sprite: '/assets/enemies-svg/cow.svg',
      action: '*moos and ambles past*',
      reactions: [
        'The cows here are... persistent.',
        'Ignore that. Standard Earth fauna.',
        'They are harmless. Mostly.',
      ],
    },
    {
      enemySlug: 'crab',
      enemyName: 'Scuttling Crab',
      sprite: '/assets/enemies-svg/crab.svg',
      action: '*clicks claws menacingly*',
      reactions: [
        'The crabs are feeling bold today.',
        'Do not make sudden movements.',
        'They pinch. Trust me on that.',
      ],
    },
    {
      enemySlug: 'myconid',
      enemyName: 'Curious Myconid',
      sprite: '/assets/enemies-svg/myconid.svg',
      action: '*releases spores and waddles away*',
      reactions: [
        'The mushrooms are restless.',
        'Do not breathe that in.',
        'Spore season. Lovely.',
      ],
    },
  ],
  'frost-reach': [
    {
      enemySlug: 'ice-wraith',
      enemyName: 'Ice Wraith',
      sprite: '/assets/enemies-svg/ice-wraith.svg',
      action: '*drifts through silently*',
      reactions: [
        'The wraiths are restless today.',
        'Frost Reach hospitality.',
        'They drift. It is what they do.',
      ],
    },
    {
      enemySlug: 'frost-giant-i',
      enemyName: 'Young Frost Giant',
      sprite: '/assets/enemies-svg/frost-giant-i.svg',
      action: '*stomps past in the distance*',
      reactions: [
        'The giants are migrating. Standard.',
        'Stay out of their path.',
        'They are mostly peaceful. MOSTLY.',
      ],
    },
  ],
  'infernus': [
    {
      enemySlug: 'camel',
      enemyName: 'Blazing Camel',
      sprite: '/assets/enemies-svg/camel.svg',
      action: '*spits embers nearby*',
      reactions: [
        'Ignore that. They do that.',
        'Camels here are... temperamental.',
        'See? This is what I deal with.',
      ],
    },
    {
      enemySlug: 'fire-imp',
      enemyName: 'Fire Imp',
      sprite: '/assets/enemies-svg/fire-imp.svg',
      action: '*giggles and scampers off*',
      reactions: [
        'Little pest.',
        'They are everywhere lately.',
        'Do not make eye contact.',
      ],
    },
    {
      enemySlug: 'lava-golem',
      enemyName: 'Lava Golem',
      sprite: '/assets/enemies-svg/lava-golem.svg',
      action: '*trudges past, dripping magma*',
      reactions: [
        'Watch the floor. Magma stains.',
        'The golems are active today.',
        'Stay clear of the drippings.',
      ],
    },
  ],
  'shadow-keep': [
    {
      enemySlug: 'bat',
      enemyName: 'Shadow Bat',
      sprite: '/assets/enemies-svg/bat.svg',
      action: '*flutters past overhead*',
      reactions: [
        'The bats are restless today.',
        'Shadow Keep wildlife. Charming.',
        'Nothing to worry about. Probably.',
      ],
    },
    {
      enemySlug: 'skeleton-archer',
      enemyName: 'Skeleton Archer',
      sprite: '/assets/enemies-svg/skeleton-archer.svg',
      action: '*rattles past on patrol*',
      reactions: [
        'The patrols never stop here.',
        'Just keep talking. They ignore civilians.',
        'Shadow Keep security. Very thorough.',
      ],
    },
    {
      enemySlug: 'skeleton-barb',
      enemyName: 'Skeleton Barbarian',
      sprite: '/assets/enemies-svg/skeleton-barb.svg',
      action: '*charges through, chasing something*',
      reactions: [
        'They are always chasing something.',
        'The undead are restless today.',
        'Standard Keep behavior.',
      ],
    },
  ],
  'null-providence': [
    {
      enemySlug: 'void-spawn',
      enemyName: 'Void Spawn',
      sprite: '/assets/enemies-svg/void-spawn.svg',
      action: '*phases in and out of existence*',
      reactions: [
        'The void leaks. It does that.',
        'Reality is... flexible here.',
        'Do not stare directly at it.',
      ],
    },
    {
      enemySlug: 'time-scavenger',
      enemyName: 'Time Scavenger',
      sprite: '/assets/enemies-svg/time-scavenger.svg',
      action: '*skitters past, rewinding its steps*',
      reactions: [
        'Time moves differently for them.',
        'The scavengers are hunting again.',
        'They are harmless. To us. For now.',
      ],
    },
    {
      enemySlug: 'time-elemental',
      enemyName: 'Time Elemental',
      sprite: '/assets/enemies-svg/time-elemental.svg',
      action: '*flickers between moments*',
      reactions: [
        'Temporal interference. Normal here.',
        'The elementals are agitated.',
        'Best not to think about causality.',
      ],
    },
  ],
  'aberrant': [
    {
      enemySlug: 'chicken',
      enemyName: 'Mutant Chicken',
      sprite: '/assets/enemies-svg/chicken.svg',
      action: '*clucks aggressively and struts past*',
      reactions: [
        'The chickens here are... different.',
        'Do not underestimate them.',
        'Aberrant wildlife. Delightful.',
      ],
    },
    {
      enemySlug: 'carniflower',
      enemyName: 'Carniflower',
      sprite: '/assets/enemies-svg/carniflower.svg',
      action: '*snaps hungrily at the air*',
      reactions: [
        'The plants are hungry today.',
        'Keep your fingers clear.',
        'Nature, but angrier.',
      ],
    },
    {
      enemySlug: 'spore-cloud',
      enemyName: 'Spore Cloud',
      sprite: '/assets/enemies-svg/spore-cloud.svg',
      action: '*drifts past ominously*',
      reactions: [
        'Hold your breath.',
        'The spores are migrating.',
        'Aberrant air quality. Typical.',
      ],
    },
    {
      enemySlug: 'twisted-sapling',
      enemyName: 'Twisted Sapling',
      sprite: '/assets/enemies-svg/twisted-sapling.svg',
      action: '*creaks and shuffles by*',
      reactions: [
        'The trees walk here. You get used to it.',
        'Aberrant forestry.',
        'They are just curious. Probably.',
      ],
    },
  ],
};

/**
 * Get a random interrupt for a domain
 */
export function getRandomInterrupt(domain: string): EnemyInterrupt | null {
  const pool = DOMAIN_INTERRUPTS[domain];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get a random reaction from an interrupt
 */
export function getRandomReaction(interrupt: EnemyInterrupt): string {
  return interrupt.reactions[Math.floor(Math.random() * interrupt.reactions.length)];
}

// ============================================
// SHOCK REACTIONS - When NDG speaks
// ============================================

/**
 * Per-NPC shock reactions when the player types a message.
 * NDG is normally silent (grunts only), so speaking is surprising.
 */
export const GREETER_SHOCK_REACTIONS: Record<string, string[]> = {
  'stitch-up-girl': [
    'Oh! Oh my. You can talk! This changes the diagnosis entirely.',
    '*drops needle* You have a VOICE?!',
    'Hold on - you actually speak?! The last Guy just grunted!',
    'Words! Actual words! I need to update your medical chart.',
  ],
  'keith-man': [
    'WHOA! You can TALK?! This is NOT in my notes!',
    '*nearly spills energy drink* A TALKING GUY?!',
    'Yo yo yo - did you just SAY something?!',
    'Wait wait wait - you have WORDS?! This changes EVERYTHING!',
  ],
  'mr-kevin': [
    'Most curious. You possess the gift of speech.',
    '*adjusts monocle* A vocalizing specimen. Fascinating.',
    'The probability of this is... improbable. And yet.',
    'Ah. A talking one. The universe grows stranger.',
  ],
  'clausen': [
    '*metallic whirr* Speech detected. Unexpected parameter.',
    'You vocalize? My records indicated non-verbal behavior.',
    'PROCESSING: Subject exhibits linguistic capability. Updating profile.',
    '*beeps curiously* A talking Guy. How... organic.',
  ],
  'body-count': [
    'Did you just... Was that WORDS?! From YOU?!',
    '*stops counting* Hold up. You TALK?!',
    'A speaking Guy? That messes up my whole system!',
    'Words, huh? Most of you just grunt and die.',
  ],
  'boots': [
    '*wagging intensifies* You TALK?! BEST DAY EVER!',
    'BARK! BARK! You can SPEAK! This is AMAZING!',
    'Words! Human words! From the Guy! WOW!',
    '*spins in circle* A TALKING FRIEND! YES!',
  ],
  'willy': [
    '*cocks head* Well butter my biscuit. A talker.',
    'Huh. You speak. Did NOT see that comin\'.',
    '*adjusts holster* A Guy with words. Interestin\'.',
    'Most of you lot just grunt. You\'re different.',
  ],
  'boo-g': [
    'Yo WHAT?! You got VOCALS?! Spit some bars then!',
    '*drops microphone* A TALKING GUY?! This a feature drop!',
    'Hold UP - you can SAY things?! That is FIRE!',
    'Words from the void! The remix nobody expected!',
  ],
  'the-general': [
    '*snaps to attention* A vocal operative?! Report!',
    'You SPEAK, soldier?! Why was I not briefed?!',
    'A talking asset. Tactical implications unknown.',
    '*strokes moustache* Speech capability confirmed. Intriguing.',
  ],
  'dr-maxwell': [
    '*drops beaker* REMARKABLE! Verbal communication!',
    'You SPEAK?! The scientific implications are ENORMOUS!',
    'A talking specimen! I must document EVERYTHING!',
    'EXTRAORDINARY! Vocalization from a typically mute subject!',
  ],
  'xtreme': [
    'DUUUDE! You can TALK?! That is SO RAD!',
    '*does kickflip* A SPEAKING GUY?! GNARLY!',
    'Whoa whoa WHOA - you got WORDS bro?!',
    'TOTALLY unexpected verbal shred! SICK!',
  ],
  'mr-bones': [
    '*bones rattle violently* You... you SPEAK?!',
    'Wait. Did you just... words?! From your mouth hole?!',
    '*jaw drops (literally)* A talking Guy?! Unprecedented!',
    'In all my years... a Guy who SPEAKS! Remarkable!',
  ],
  'dr-voss': [
    '*raises eyebrow* Vocalization. Interesting development.',
    'You speak. Most subjects do not. Note taken.',
    '*scribbles in journal* A verbal anomaly. How... useful.',
    'Words, is it? Perhaps you are worth studying after all.',
  ],
  'king-james': [
    '*adjusts crown* A speaking peasant? How novel.',
    'You DARE address the King directly?! Actually, please continue.',
    'Words from a Guy? The court will find this most amusing.',
    '*strokes beard* Speech! Finally, an interesting subject.',
  ],
};

// Default shock reactions for NPCs without custom lines
const DEFAULT_SHOCK_REACTIONS = [
  'Wait... you can TALK?!',
  'Did you just... speak?!',
  'A talking one?! Interesting...',
  'You have WORDS?! Unexpected!',
  '*surprised* You can communicate!',
];

/**
 * Get a random shock reaction for an NPC
 * Used when NDG types a message (rare, since NDG usually just grunts)
 */
export function getShockReaction(npcId: string): string {
  const reactions = GREETER_SHOCK_REACTIONS[npcId] || DEFAULT_SHOCK_REACTIONS;
  return reactions[Math.floor(Math.random() * reactions.length)];
}

// ============================================
// NPC DOMAIN HELPERS
// ============================================

// Domain slug to ID mapping
const DOMAIN_SLUG_TO_ID: Record<string, number> = {
  'earth': 1,
  'frost-reach': 2,
  'infernus': 3,
  'shadow-keep': 4,
  'null-providence': 5,
  'aberrant': 6,
};

// Domain ID to slug mapping
const DOMAIN_ID_TO_SLUG: Record<number, string> = {
  1: 'earth',
  2: 'frost-reach',
  3: 'infernus',
  4: 'shadow-keep',
  5: 'null-providence',
  6: 'aberrant',
};

/**
 * Check if an NPC can appear in a given domain
 * Roaming NPCs can appear anywhere
 */
export function canNpcAppearInDomain(npcId: string, domainId: number): boolean {
  const npcDomain = GREETER_DOMAINS[npcId];
  if (!npcDomain) return false;
  if (npcDomain === 'roaming') return true;
  return DOMAIN_SLUG_TO_ID[npcDomain] === domainId;
}

/**
 * Get all NPCs that can appear in a given domain
 * Returns array of NPC IDs
 */
export function getNpcsForDomain(domainId: number): string[] {
  return Object.entries(GREETER_DOMAINS)
    .filter(([npcId, domain]) => {
      if (domain === 'roaming') return true;
      return DOMAIN_SLUG_TO_ID[domain] === domainId;
    })
    .map(([npcId]) => npcId);
}

/**
 * Get the home domain ID for an NPC (or random if roaming)
 */
export function getNpcHomeDomain(npcId: string): number {
  const domainSlug = GREETER_DOMAINS[npcId];
  if (!domainSlug || domainSlug === 'roaming') {
    // Random domain for roaming NPCs
    return Math.floor(Math.random() * 6) + 1;
  }
  return DOMAIN_SLUG_TO_ID[domainSlug] || 1;
}

/**
 * Get domain slug from domain ID
 */
export function getDomainSlugFromId(domainId: number): string {
  return DOMAIN_ID_TO_SLUG[domainId] || 'earth';
}

/**
 * Get a greeter by ID
 */
export function getGreeterById(npcId: string): HomeGreeter | undefined {
  return HOME_GREETERS.find(g => g.id === npcId);
}

// ============================================
// RELATIONSHIP-AWARE DIALOGUE
// ============================================

/**
 * Dialogue NPCs can say about other NPCs based on their relationship
 * Key format: "speaker:target" -> dialogue pool
 * Used when NPCs comment on each other in multi-NPC conversations
 */
export const NPC_RELATIONSHIP_DIALOGUE: Record<string, string[]> = {
  // Willy's comments about others
  'willy:mr-bones': [
    'Mr. Bones! Old friend! Still rattling, I see!',
    'The best part of being a skeleton? We never run out of things to sell each other!',
    '*rattles at Mr. Bones* Remember when we found that cursed amulet?',
  ],
  'willy:boo-g': [
    'Boo G! The undead party never stops when you are around!',
    'My best customer for spectral merchandise! Always buying echo crystals!',
  ],
  'willy:boots': [
    'Boots! My favorite kicker! Still breaking things?',
    'I have some new steel-toed inventory that might interest you!',
  ],

  // Mr. Bones' comments about others
  'mr-bones:willy': [
    '*rattles thoughtfully* Willy and I go back. Way back. Before the flesh rotted.',
    'Willy sells trinkets. I sell perspective. Both valuable.',
  ],
  'mr-bones:boo-g': [
    'The ghost performs. The skeleton contemplates. We understand each other.',
    '*bone sounds* Boo G reminds me why the dead still have purpose.',
  ],
  'mr-bones:dr-voss': [
    'Voss once wanted to study my bones. I declined. Philosophically.',
    '*rattles warily* The scientist watches. I watch back.',
  ],

  // Boo G's comments about others
  'boo-g:willy': [
    'YO WILLY! My skeletal HOMIE! Drop a beat with me!',
    'Willy sells goods, I sell FLOW! Perfect PARTNERSHIP!',
  ],
  'boo-g:boots': [
    'BOOTS! The KICKMASTER! Your stomps got RHYTHM!',
    'Me and Boots? CHAOS DUO! We PERFORM DESTRUCTION!',
  ],
  'boo-g:xtreme': [
    'X-TREME! My EXTREME SPECTRAL BROTHER! Let us VIBE!',
    'When X-treme rolls dice, I drop BEATS! SYNERGY!',
  ],
  'boo-g:king-james': [
    '*ghost scoff* Royalty thinks music is beneath them. WRONG.',
    'King James never tips. The DISRESPECT to my CRAFT!',
  ],

  // Keith Man's comments about others
  'keith-man:mr-kevin': [
    'Mr-Kevin-sees-patterns-too! We-are-SPEED-BROTHERS!',
    'Kevin-watches-the-code! I-watch-the-TIMELINES!',
  ],
  'keith-man:mr-bones': [
    'Mr-Bones-is-SLOW! But-that-is-okay! Frost-Reach-is-COLD!',
    'The-skeleton-thinks-deep! I-think-FAST! Different-styles!',
  ],
  'keith-man:boots': [
    'BOOTS! You-kick-FAST! I-like-FAST!',
    'Boots-and-me! SPEED-AND-KICKS! Perfect-combo!',
  ],

  // Boots' comments about others
  'boots:boo-g': [
    'BOO G! Let us STOMP AND FLOW!',
    '*bounces* The ghost GETS IT! Chaos is FUN!',
  ],
  'boots:xtreme': [
    'X-TREME! My EXTREME KICK BUDDY! STOMP STOMP!',
    'X-treme rolls! I KICK! The ULTIMATE team!',
  ],
  'boots:king-james': [
    '*bounces nervously* I kicked his crown ONCE! He still remembers!',
    'King James gives me THE LOOK. Worth it though. Good kick.',
  ],
  'boots:stitch-up-girl': [
    'Stitch patches me up after I kick things too hard! Best medic!',
    '*grateful bounce* Stitch knows where all my kick-related injuries go!',
  ],

  // Stitch Up Girl's comments about others
  'stitch-up-girl:boots': [
    'Boots always needs patching. Kicking is hazardous to your health.',
    '*sighs fondly* Boots means well. The destruction is incidental.',
  ],
  'stitch-up-girl:the-general': [
    'The General and I have seen too many battles together.',
    'Command and medical. We keep the fighters alive. Mostly.',
  ],
  'stitch-up-girl:willy': [
    'Willy sells me medical supplies. Fair prices for a skeleton.',
    '*nods at Willy* Good merchant. Questionable inventory origins.',
  ],

  // The General's comments about others
  'the-general:stitch-up-girl': [
    'Stitch keeps the troops alive. Invaluable asset.',
    'Medical support wins wars. She taught me that.',
  ],
  'the-general:clausen': [
    'Clausen. Old war buddy. Seen things together.',
    '*nods at Clausen* Good soldier. Better detective now.',
  ],
  'the-general:body-count': [
    'Body Count keeps the records. Important work.',
    'Someone has to count the fallen. Respect.',
  ],

  // Clausen's comments about others
  'clausen:the-general': [
    '*nods at General* We go back. Way back.',
    'The General taught me discipline. Life taught me noir.',
  ],
  'clausen:stitch-up-girl': [
    'Stitch patched me up more times than I can count.',
    '*lights cigarette* Good medic. Better friend.',
  ],
  'clausen:xtreme': [
    '*side-eyes X-treme* Chaos incarnate. Cannot trust random.',
    'X-treme and I? Different philosophies. Very different.',
  ],

  // Body Count's comments about others
  'body-count:stitch-up-girl': [
    '*tallies* Stitch saves them. I count the ones she could not.',
    'Medical miracles adjust my projections. Stitch causes many.',
  ],
  'body-count:mr-kevin': [
    '*nods at Kevin* Fellow data enthusiast. Respect.',
    'Kevin logs existence. I log its end. Complementary work.',
  ],
  'body-count:the-general': [
    'The General understands logistics. Including casualties.',
    '*makes tally mark* Command decisions affect the count.',
  ],

  // Dr. Maxwell's comments about others
  'dr-maxwell:dr-voss': [
    'Voss and I have... differing scientific philosophies.',
    '*adjusts spectacles* Voss experiments recklessly. I experiment PRECISELY.',
  ],
  'dr-maxwell:xtreme': [
    'X-treme provides excellent chaos variables for experiments!',
    'Randomness is data! X-treme generates MUCH data!',
  ],
  'dr-maxwell:stitch-up-girl': [
    'Medical practice is applied biology. Stitch understands.',
    '*nods* Fellow practitioner. Different methodology.',
  ],

  // X-treme's comments about others
  'xtreme:boots': [
    'BOOTS! EXTREME KICK PARTNER! Maximum CHAOS!',
    'When Boots kicks and I roll? TOTAL MAYHEM! LOVE IT!',
  ],
  'xtreme:boo-g': [
    'BOO G! SPECTRAL HYPE MAN! Drop those GHOST BEATS!',
    'Undead EXTREME! Boo G GETS the vibe!',
  ],
  'xtreme:clausen': [
    '*vibrates* Clausen thinks too much! JUST ROLL!',
    'Order is BORING! Clausen is BORING! But still cool! Kind of!',
  ],
  'xtreme:dr-maxwell': [
    'Dr. Maxwell! EXTREME SCIENCE! I provide the VARIABLES!',
    'Maxwell experiments! I CAUSE experiments! SYNERGY!',
  ],

  // Dr. Voss' comments about others
  'dr-voss:dr-maxwell': [
    '*adjusts goggles* Maxwell burns his research. I preserve mine.',
    'Academic rivalry. Maxwell is too dramatic. Science needs precision.',
  ],
  'dr-voss:king-james': [
    'The King funds research. Useful relationship.',
    '*nods at James* Royal patronage has its benefits.',
  ],
  'dr-voss:mr-bones': [
    '*eyes Mr. Bones* Those bones would be excellent specimens...',
    'The skeleton declined my study proposal. Unfortunate.',
  ],
  'dr-voss:mr-kevin': [
    'Kevin observes the system. I observe the subjects. Similar methods.',
    '*notes something* Fellow scientist. Different domains.',
  ],

  // King James' comments about others
  'king-james:dr-voss': [
    'Voss serves the crown. Useful subjects... I mean, useful science.',
    '*adjusts crown* The scientist delivers results. Acceptable.',
  ],
  'king-james:boots': [
    '*glares at Boots* That peasant kicked my crown. ONCE.',
    'Boots is... tolerated. Barely. The crown remembers.',
  ],
  'king-james:boo-g': [
    '*dismissive wave* The ghost performer. Peasant entertainment.',
    'Boo G lacks royal decorum. Completely.',
  ],
  'king-james:willy': [
    'The merchant skeleton. Acceptable commerce.',
    '*royal gesture* Willy serves the economy. The crown approves.',
  ],

  // Mr. Kevin's comments about others
  'mr-kevin:keith-man': [
    'Keith sees speed. I see patterns. Complementary observation.',
    '*adjusts glasses* Keith Man processes timelines. Interesting variable.',
  ],
  'mr-kevin:body-count': [
    'Body Count quantifies endings. I quantify everything else.',
    '*nods* Data recognizes data. Respect.',
  ],
  'mr-kevin:dr-voss': [
    'Voss experiments. I observe. Similar scientific approaches.',
    '*processes* Fellow observer of the system.',
  ],

  // Stitch-up-girl's additional relationships
  'stitch-up-girl:body-count': [
    'Body Count tracks the ones I could not save. We have a... professional relationship.',
    '*glances at Body Count* He counts endings. I prevent them.',
  ],
  'stitch-up-girl:clausen': [
    'Clausen and I go back. Many battlefield patches.',
    '*threads needle* The detective was once a soldier. I remember.',
  ],
  'stitch-up-girl:dr-maxwell': [
    'Maxwell experiments. I repair. Different medical ethics.',
    '*side-eye at Maxwell* His methods are... aggressive.',
  ],

  // Clausen's comments about others
  'clausen:boots': [
    '*sighs* Boots creates chaos. I create order. Eternal conflict.',
    'The kicker disrupts investigations. Constantly.',
  ],
  'clausen:mr-bones': [
    'The skeleton was old before the first war. He knows things.',
    '*notes something* Mr. Bones is a reliable witness. Memory like... bone.',
  ],
  'clausen:boo-g': [
    '*adjusts hat* The ghost is loud. But observant.',
    'Boo G sees through walls. Useful for investigations.',
  ],

  // Body Count's additional comments
  'body-count:boots': [
    '*marks tally* Boots contributes to the count. Indirectly.',
    'The kicker has impressive impact statistics.',
  ],
  'body-count:boo-g': [
    'The ghost cannot die. Bad for my business.',
    '*contemplates* Already dead. Already counted. Efficient.',
  ],
  'body-count:xtreme': [
    'X-treme generates casualties. I track them.',
    '*makes notes* Chaos produces data. Appreciated.',
  ],

  // Mr. Bones additional
  'mr-bones:keith-man': [
    '*rattles slowly* Keith moves fast. I move not at all. Balance.',
    'The speedster rushes. I have eternity. No hurry.',
  ],
  'mr-bones:king-james': [
    '*bone chuckle* Royalty thinks they are eternal. I actually am.',
    'The King wears a crown. I wore mine down to dust.',
  ],
  'mr-bones:stitch-up-girl': [
    'Stitch tries to heal bones. Cannot heal what is already complete.',
    '*philosophical rattle* She sees damage. I see transformation.',
  ],

  // Boo G additional
  'boo-g:mr-bones': [
    'MR. BONES! Fellow UNDEAD! But you got no RHYTHM in those bones!',
    '*ghost laughs* Skeleton contemplates! Ghost CELEBRATES!',
  ],
  'boo-g:stitch-up-girl': [
    'Stitch patches EVERYONE! Even tried to patch ME! I am ALREADY PATCHED into the AFTERLIFE!',
    '*spectral nod* Medical QUEEN! Respects the FLOW of life and death!',
  ],
  'boo-g:dr-maxwell': [
    'Maxwell tried to STUDY my ectoplasm! RUDE! But also INTRIGUING!',
    '*floats around* Science GHOST! Maxwell gets it! Kind of!',
  ],

  // The General additional
  'the-general:mr-bones': [
    'Bones served in the old campaigns. Before he was... bones.',
    '*nods* Ancient soldier. Deserves the salute.',
  ],
  'the-general:boo-g': [
    '*mutters* The ghost is too loud for military operations.',
    'Boo G would make a terrible scout. Zero stealth.',
  ],
  'the-general:xtreme': [
    '*tactical assessment* X-treme is... unpredictable. Difficult to command.',
    'Chaos agent. Useful in siege warfare. Nowhere else.',
  ],
};

/**
 * Get relationship dialogue for a speaker about a target
 * Returns null if no specific dialogue exists
 */
export function getRelationshipDialogue(speakerId: string, targetId: string): string | null {
  const key = `${speakerId}:${targetId}`;
  const pool = NPC_RELATIONSHIP_DIALOGUE[key];
  if (!pool || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// ============================================
// NPC REACTION POOLS
// ============================================

/**
 * Context-specific reactions for NPCs
 * Used for commenting on game events, player actions, etc.
 */
export type ReactionContext =
  | 'good_roll'       // Player rolled well
  | 'bad_roll'        // Player rolled poorly
  | 'player_wins'     // Player won an event
  | 'player_loses'    // Player lost an event
  | 'low_health'      // Player has low integrity
  | 'high_gold'       // Player has lots of gold
  | 'broke'           // Player is out of gold
  | 'boss_fight'      // Player facing a boss
  | 'new_item'        // Player got a new item
  | 'domain_enter';   // Player entered a new domain

/**
 * Per-NPC reaction pools for different game contexts
 * Supports archetype fallbacks for NPCs without custom lines
 */
export const NPC_CONTEXT_REACTIONS: Record<string, Partial<Record<ReactionContext, string[]>>> = {
  'stitch-up-girl': {
    good_roll: [
      'Nice throw! At this rate, you might not need my bandages.',
      'Solid impact! Your form is improving.',
    ],
    bad_roll: [
      'Ouch. Let me prep the med kit.',
      'That... that is going to leave a mark.',
    ],
    player_wins: [
      'Victory! And you are still in one piece!',
      'Well done! Minimal blood loss this time.',
    ],
    player_loses: [
      'Hold still. Let me patch that up.',
      'I warned you. Now hold this bandage.',
    ],
    low_health: [
      'Your integrity is concerning. Please be careful.',
      'You are held together by determination and my stitches.',
    ],
    boss_fight: [
      'Die-rector incoming! Aim for the weak spots!',
      'Big one! I have extra bandages ready!',
    ],
  },

  'keith-man': {
    good_roll: [
      'FAST-roll! GOOD-roll! KEEP-IT-UP!',
      'That-was-QUICK! I-like-QUICK!',
    ],
    bad_roll: [
      'Oof! Try-again! FASTER-this-time!',
      'Not-great! But-speed-fixes-everything!',
    ],
    player_wins: [
      'YESSS! VICTORY-ZOOM!',
      'You-did-it! Fast-finish! AMAZING!',
    ],
    player_loses: [
      'Oh-no! But-time-is-relative! Try-again!',
      'Loss-is-just-a-pause! Resume-FAST!',
    ],
    low_health: [
      'Slow-down! Or-speed-up! One-of-those!',
      'You-look-rough! Stitch-can-help! FAST!',
    ],
  },

  'willy': {
    good_roll: [
      'Beautiful throw! My bones rattled with joy!',
      'Excellent! I knew selling you that was worth it!',
    ],
    bad_roll: [
      'Oh dear! Let me see if I have something that can help...',
      '*rattles sympathetically* Everyone has off days!',
    ],
    player_wins: [
      'Victory! Time to celebrate! With purchases!',
      'Wonderful! Winner gets a discount! Maybe!',
    ],
    player_loses: [
      'Oh no! But loss means opportunity to buy better gear!',
      '*sad bones* At least you are still shopping!',
    ],
    high_gold: [
      '*rattles excitedly* I see you have some gold! Have I shown you my premium inventory?',
      'Wealthy customer! My favorite kind!',
    ],
    broke: [
      '*sad rattling* No gold? Credit is... not available. Sorry.',
      'Broke? I accept trades! Relics, artifacts, interesting stories...',
    ],
    new_item: [
      'Excellent purchase! Or find! Either way, congratulations!',
      'New gear! Let me know if you need repairs! Or more gear!',
    ],
  },

  'boo-g': {
    good_roll: [
      'YO! That roll had RHYTHM!',
      'SICK THROW! The beats APPROVE!',
    ],
    bad_roll: [
      'Oof! Off-beat! Find your FLOW!',
      'That throw was... experimental. Try again!',
    ],
    player_wins: [
      'VICTORY REMIX! Drop the BASS!',
      'WINNER WINNER! The crowd goes WILD!',
    ],
    player_loses: [
      'Loss is just the INTRO! The COMEBACK is next!',
      'The show must go ON! Next verse is YOURS!',
    ],
    boss_fight: [
      'BOSS BATTLE BEAT DROP!',
      'Die-rector! Time for the FINAL TRACK!',
    ],
  },

  'the-general': {
    good_roll: [
      'Acceptable strike. Continue.',
      'Good hit, soldier. Maintain that form.',
    ],
    bad_roll: [
      'Poor execution. Recalibrate.',
      'Sloppy. The enemy does not forgive sloppiness.',
    ],
    player_wins: [
      'Objective achieved. Well done, soldier.',
      'Victory secured. Prepare for the next engagement.',
    ],
    player_loses: [
      'Tactical retreat. Regroup and re-engage.',
      'Defeat noted. Learn from it.',
    ],
    boss_fight: [
      'Priority target identified. Concentrate fire.',
      'Die-rector engagement. All weapons authorized.',
    ],
    domain_enter: [
      'New zone. Stay alert. Hostiles probable.',
      'Entering hostile territory. Maintain combat readiness.',
    ],
  },

  'dr-maxwell': {
    good_roll: [
      'EXCELLENT trajectory! The physics are EXQUISITE!',
      'Optimal impact angle! I am taking NOTES!',
    ],
    bad_roll: [
      'Suboptimal! But failure is data! Glorious data!',
      'The experiment failed! Try different variables!',
    ],
    player_wins: [
      'Hypothesis CONFIRMED! Victory through SCIENCE!',
      'The data supports SUCCESS!',
    ],
    player_loses: [
      'Unexpected results! Recalibrate and repeat!',
      'Failure is merely another data point!',
    ],
    new_item: [
      'New equipment! The research potential is VAST!',
      'Interesting artifact! I must study the properties!',
    ],
  },

  'xtreme': {
    good_roll: [
      'YOOOO! EXTREME ROLL!',
      'SICK! The dice LOVE you!',
    ],
    bad_roll: [
      'Oof! That was NOT extreme! Try again!',
      'Bad roll! But RANDOM is LIFE!',
    ],
    player_wins: [
      'EXTREME VICTORY! MAXIMUM CELEBRATION!',
      'WINNER! The CHAOS approves!',
    ],
    player_loses: [
      'Loss! But loss is EXTREME too!',
      'The dice giveth! The dice taketh! EXTREME!',
    ],
    boss_fight: [
      'BOSS TIME! EXTREME MODE ACTIVATED!',
      'Die-rector! ROLL FOR YOUR LIFE!',
    ],
  },

  'mr-bones': {
    good_roll: [
      '*rattles approvingly* Well struck.',
      'The bones see skill in that throw.',
    ],
    bad_roll: [
      'Even the bones miss sometimes. Patience.',
      '*philosophical bone sounds* Failure is perspective.',
    ],
    player_wins: [
      'Victory. Temporary. But still victory.',
      '*contemplative rattle* You did well. The bones remember.',
    ],
    player_loses: [
      'Loss is the teacher. Listen to it.',
      'The journey continues. Endings are beginnings.',
    ],
    low_health: [
      'Your flesh fails you. Mine is already gone. Different problems.',
      '*concerned rattle* Perhaps rest would be wise.',
    ],
  },

  'dr-voss': {
    good_roll: [
      'Excellent data point. Your performance metrics improve.',
      'Fascinating trajectory. I am cataloguing this.',
    ],
    bad_roll: [
      'Suboptimal. Your technique requires refinement.',
      'Disappointing. But every failure teaches.',
    ],
    player_wins: [
      'Success achieved. Experiment parameters noted.',
      'Victory logged. Subject shows promise.',
    ],
    player_loses: [
      'Failure recorded. Adjustments recommended.',
      'Defeat is data. You are generating useful data.',
    ],
    new_item: [
      'New equipment acquired. I should examine it. For science.',
      'Interesting. That item has research potential.',
    ],
  },

  'king-james': {
    good_roll: [
      '*royal nod* Adequate. For a peasant.',
      'The crown acknowledges that throw.',
    ],
    bad_roll: [
      'Disappointing. The realm expected better.',
      '*dismissive* Peasant performance. Typical.',
    ],
    player_wins: [
      'Victory for the crown! Well... for you. Same thing.',
      'Triumph! The realm prospers through your service.',
    ],
    player_loses: [
      '*sighs* The kingdom weeps. Metaphorically.',
      'Defeat. The crown is... unsurprised.',
    ],
    high_gold: [
      '*eyes your gold* The treasury notices your wealth. Taxes may apply.',
      'Prosperous! The crown smiles upon the wealthy.',
    ],
    broke: [
      '*dismissive wave* No gold? Peasants. Always broke.',
      'Empty pockets? The crown cannot help the destitute.',
    ],
  },

  'boots': {
    good_roll: [
      'YEAH! KICK! I mean, THROW! Same energy!',
      '*bounces approvingly* That was KICKABLE!',
    ],
    bad_roll: [
      'Oof! Want me to KICK it next time?',
      '*sad bounce* That throw needed more STOMP!',
    ],
    player_wins: [
      'VICTORY STOMP! *kicks the air*',
      'WE WIN! KICK KICK KICK!',
    ],
    player_loses: [
      '*confused bounce* Loss? We kick loss in the FACE!',
      'Oh no! But we can KICK our way back!',
    ],
    boss_fight: [
      'BIG ONE! Big ones are KICKABLE! Let me at it!',
      'Die-rector! I could TOTALLY kick that!',
    ],
  },

  'body-count': {
    good_roll: [
      '*makes positive tally* Good hit. Numbers adjust.',
      'Impact recorded. Statistics favor you.',
    ],
    bad_roll: [
      '*tallies something* Noted. Survival odds recalculated.',
      'Miss logged. The count continues regardless.',
    ],
    player_wins: [
      'Victory. One fewer entry for the ledger.',
      '*closes book temporarily* Win noted. Carry on.',
    ],
    player_loses: [
      '*opens ledger* Another entry. Predictable.',
      'Loss. The count grows. As always.',
    ],
    low_health: [
      '*prepares pen* Your entry may be coming soon.',
      'Low integrity. The ledger waits patiently.',
    ],
  },

  'clausen': {
    good_roll: [
      '*nods* Clean hit. Like that.',
      'Nice work. The case proceeds.',
    ],
    bad_roll: [
      '*lights cigarette* Seen worse. Keep trying.',
      'Rough throw. We all have off days.',
    ],
    player_wins: [
      'Case closed. For now.',
      '*exhales* Win. The story continues.',
    ],
    player_loses: [
      'Loss. The noir never ends clean.',
      '*stares into middle distance* Expected. Move on.',
    ],
    boss_fight: [
      'Big fish. Stay sharp.',
      'Die-rector. The main suspect.',
    ],
  },

  'mr-kevin': {
    good_roll: [
      'Optimal output. The code approves.',
      'Good variable state. Continue.',
    ],
    bad_roll: [
      'Suboptimal result. Recomputing.',
      'Error in execution. Debug and retry.',
    ],
    player_wins: [
      'Success condition met. Well done.',
      'Victory state achieved. Logging.',
    ],
    player_loses: [
      'Failure state. Expected within parameters.',
      'Loss logged. The simulation continues.',
    ],
    domain_enter: [
      'New domain loaded. Processing.',
      'Zone transition detected. Adapting.',
    ],
  },
};

// Default fallback reactions by archetype
const ARCHETYPE_FALLBACK_REACTIONS: Record<string, Partial<Record<ReactionContext, string[]>>> = {
  traveler: {
    good_roll: ['Nice throw!', 'Well done!'],
    bad_roll: ['Tough luck. Try again.', 'You got this.'],
    player_wins: ['Victory!', 'You did it!'],
    player_loses: ['Rough loss. Keep going.', 'Next time.'],
  },
  wanderer: {
    good_roll: ['Good hit.', 'Solid.'],
    bad_roll: ['Miss. It happens.', 'Not great.'],
    player_wins: ['You won.', 'Success.'],
    player_loses: ['Loss noted.', 'Better luck next time.'],
  },
};

/**
 * Get a context-specific reaction from an NPC
 * Falls back to archetype defaults if NPC has no custom reaction
 */
export function getContextReaction(npcId: string, context: ReactionContext): string | null {
  // Try NPC-specific first
  const npcReactions = NPC_CONTEXT_REACTIONS[npcId]?.[context];
  if (npcReactions && npcReactions.length > 0) {
    return npcReactions[Math.floor(Math.random() * npcReactions.length)];
  }

  // Determine archetype for fallback
  const greeter = getGreeterById(npcId);
  if (!greeter) return null;

  // Simple archetype detection based on common NPC types
  const isTraveler = ['stitch-up-girl', 'keith-man', 'mr-kevin', 'clausen', 'body-count', 'boots'].includes(npcId);
  const archetypeFallback = isTraveler
    ? ARCHETYPE_FALLBACK_REACTIONS.traveler
    : ARCHETYPE_FALLBACK_REACTIONS.wanderer;

  const fallbackPool = archetypeFallback[context];
  if (fallbackPool && fallbackPool.length > 0) {
    return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
  }

  return null;
}

/**
 * Get a random greeter available for a domain
 */
export function getRandomGreeterForDomain(domainId: number): HomeGreeter {
  const availableNpcs = getNpcsForDomain(domainId);
  const randomNpcId = availableNpcs[Math.floor(Math.random() * availableNpcs.length)];
  return getGreeterById(randomNpcId) || HOME_GREETERS[0];
}

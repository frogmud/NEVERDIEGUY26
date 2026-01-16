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
    sprite: '/assets/characters/sprites/frame-1/traveler-sprite-stitchupgirl-idle-01.svg',
    sprite2: '/assets/characters/sprites/frame-1/traveler-sprite-stitchupgirl-idle-02.svg',
    wikiSlug: 'characters/stitch-up-girl',
    ambient: [
      'Shadow Keep taught me that healing is just damage in reverse.',
      'Being related to someone who cannot die gives you perspective.',
      'My scissors can cut more than flesh. They can sever curses.',
      'Medical advice: survive the first wave, then strike.',
      'I patched up the last Guy. He did okay.',
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
    sprite: '/assets/characters/sprites/frame-1/traveler-sprite-keithman-idle-01.svg',
    sprite2: '/assets/characters/sprites/frame-1/traveler-sprite-keithman-idle-02.svg',
    wikiSlug: 'characters/keith-man',
    ambient: [
      'Time is just... suggestion? Frost Reach taught me that!',
      'I already scouted ahead! And behind! And sideways!',
      'Do not think about paradoxes! Just RUN!',
      'The universe respawned you! How exciting!',
      'Second chances at SPEED!',
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
    sprite: '/assets/characters/sprites/frame-1/traveler-sprite-mrkevin-idle-01.svg',
    sprite2: '/assets/characters/sprites/frame-1/traveler-sprite-mrkevin-idle-02.svg',
    wikiSlug: 'characters/mr-kevin',
    ambient: [
      'The code is very readable today.',
      'Your save state loaded correctly. No corruption.',
      'The void whispered your arrival. Very chatty today.',
      'Reality renders you correctly. More than most.',
      'All bugs inherited from previous Guys.',
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
    sprite: '/assets/characters/sprites/frame-1/traveler-sprite-clausen-idle-01.svg',
    sprite2: '/assets/characters/sprites/frame-1/traveler-sprite-clausen-walk-01.svg',
    wikiSlug: 'characters/clausen',
    ambient: [
      '*takes long drag* Story writes itself.',
      'Everyone is new in town. Town keeps resetting.',
      'Seen your type before. Determined. Doomed.',
      'I solve problems. You look like a problem.',
      'You still have hope in your eyes.',
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
    sprite: '/assets/characters/travelers/bodycount/traveler-sprite-bodycount-walk-01.svg',
    sprite2: '/assets/characters/travelers/bodycount/traveler-sprite-bodycount-walk-02.svg',
    wikiSlug: 'characters/body-count',
    ambient: [
      '*tallies something* The count is... high.',
      'I remember every Guy. You remember nothing.',
      'Each Guy is unique. Each Guy is replaceable.',
      'The body count never stops.',
      '*looks up from notes* Statistics.',
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
    sprite: '/assets/characters/sprites/frame-1/shop-sprite-willy-01.svg',
    sprite2: '/assets/characters/sprites/frame-1/shop-sprite-willy-02.svg',
    wikiSlug: 'characters/willy',
    ambient: [
      '*rattles happily* The bones are good today. Very good.',
      'I was alive once. Then I was dead. Now I am retail.',
      'Everything has a price! Even friendship! Just kidding! ...mostly!',
      'The void took my flesh but not my customer service skills!',
      '*adjusts merchandise* Best deals this side of existence!',
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
    sprite: '/assets/characters/sprites/frame-1/shop-sprite-boo-01.svg',
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
    sprite: '/assets/characters/sprites/frame-1/shop-sprite-general-01.svg',
    wikiSlug: 'characters/the-general',
    ambient: [
      '*checks clipboard* The roster is... acceptable.',
      'Victory requires preparation. And ammunition.',
      'Every Guy I trained is either a hero or a statistic.',
      'The enemy does not rest. Neither should you.',
      '*nods curtly* Discipline wins wars.',
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
    sprite: '/assets/characters/sprites/frame-1/shop-sprite-maxwell-01.svg',
    wikiSlug: 'characters/dr-maxwell',
    ambient: [
      '*adjusts flaming spectacles* Knowledge is combustible.',
      'The Burning Pages contain everything. Briefly.',
      'Read faster. The books are catching fire.',
      'Enlightenment. Literally. Always literally.',
      '*pages smolder* The curriculum adapts. Or burns.',
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
    sprite: '/assets/characters/sprites/frame-1/shop-sprite-xtreme-01.svg',
    wikiSlug: 'characters/xtreme',
    ambient: [
      '*shakes dice* The odds are CALCULATING!',
      'CHAOS is just MATH with ATTITUDE!',
      'Every moment is a GAMBLE! Even THIS one!',
      '*rattles excitedly* The RNG favors the BOLD!',
      'Life is RANDOM! That is the BEST part!',
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
    sprite: '/assets/characters/sprites/frame-1/shop-sprite-mrbones-01.svg',
    wikiSlug: 'characters/mr-bones',
    ambient: [
      '*rattles thoughtfully* The bones remember.',
      'Time passes. The bones remain. Perspective.',
      'I was something else once. Now I am this. Progress.',
      '*bone sounds* The universe is patient. So am I.',
      'Existence is temporary. Bones are longer.',
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
    sprite: '/assets/characters/sprites/frame-1/shop-sprite-voss-02.svg',
    wikiSlug: 'characters/dr-voss',
    ambient: [
      '*takes notes* Fascinating baseline readings.',
      'The experiments are proceeding. Always proceeding.',
      'Enhancement is not optional. It is inevitable.',
      '*adjusts goggles* Your potential is... measurable.',
      'Science waits for no one. Neither do I.',
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
    sprite: '/assets/characters/sprites/frame-1/shop-sprite-kingjames-01.svg',
    wikiSlug: 'characters/king-james',
    ambient: [
      '*adjusts crown* The realm persists. As do I.',
      'Royalty is patient. Also immortal. Convenient.',
      'Every Guy serves the crown. Eventually.',
      '*royal gesture* The kingdom remembers all.',
      'Taxes are eternal. So is the throne.',
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
 * Per-greeter chance of enemy interrupt (0-1)
 * Some characters attract more trouble than others
 */
export const GREETER_INTERRUPT_CHANCE: Record<string, number> = {
  'stitch-up-girl': 0.25, // Moderate - Shadow Keep vibes
  'keith-man': 0.20,      // Low-moderate - too fast to catch
  'mr-kevin': 0.15,       // Low - reality bends around him
  'clausen': 0.30,        // High - trouble finds him
  'body-count': 0.25,     // Moderate - just counting
  'boots': 0.35,          // High - attracts chaos
  'willy': 0.20,          // Moderate - merchant luck
  'boo-g': 0.25,          // Moderate - ghosts attract ghosts
  'the-general': 0.30,    // High - battlefield vibes
  'dr-maxwell': 0.35,     // High - Infernus is chaotic
  'xtreme': 0.40,         // Very high - chaos magnet
  'mr-bones': 0.15,       // Low - Frost Reach is quiet
  'dr-voss': 0.20,        // Moderate - lab security
  'king-james': 0.25,     // Moderate - void creatures lurk
};

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

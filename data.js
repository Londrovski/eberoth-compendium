// ===========================
// EBEROTH COMPENDIUM — DATA
// ===========================

// ── FACTIONS ──
const FACTIONS = [
  {
    id: 'crown',
    name: 'The Crown',
    sigil: 'The Crown.png',
    status: 'known',
    description: 'The Crown is the ancient seat of power, holding the royal bloodline for over 2000 years. The king rules, but the houses circle.',
    facts: [
      'King Gaelan Arveth currently sits the throne.',
      'The Kingsguard answer directly to the Crown.',
      'House loyalties to the Crown vary — some performative, some genuine.'
    ],
    members: [
      { name: 'King Gaelan Arveth', role: 'The King.' }
    ]
  },
  {
    id: 'corvath',
    name: 'House Corvath',
    sigil: 'House Corvath.png',
    status: 'known',
    description: 'The most powerful military house in the kingdom. House Corvath has long served as the Crown\'s strong arm — its soldiers disciplined, its general feared. They ended the Voss campaign swiftly, and have not stopped moving since.',
    facts: [
      'Controls significant territory in the north.',
      'Led by a general with a reputation for absolute loyalty to the king.',
      'House Voss now exists in their shadow.'
    ],
    members: [
      { name: 'Aldus Corvath', role: 'General. Head of House.' }
    ]
  },
  {
    id: 'voss',
    name: 'House Voss',
    sigil: 'House Voss.png',
    status: 'known',
    description: 'Once a well-governed house of farmers and merchants. House Voss fell quickly — too quickly, many say. They never had the soldiers for the fight that came to them.',
    facts: [
      'Their lands are administered under Corvath influence.',
      'The original Lord and Lady Voss died in the conflict.',
      'Whether any heirs survived is a matter of quiet speculation.'
    ],
    members: [
      { name: 'Theron Voss', role: 'Current head.' }
    ]
  },
  {
    id: 'gorrund',
    name: 'House Gorrund',
    sigil: 'House Gorrund.png',
    status: 'known',
    description: 'A house built on commerce and capability rather than birthright. House Gorrund operates in the grey — pragmatic, professional, always weighing the ledger. They did not inherit their position. They built it.',
    facts: [
      'Significant interests in the capital\'s docks and merchant networks.',
      'Led by a man who built the house himself from nothing.',
      'Currently employing the party.'
    ],
    members: [
      { name: 'Cael Gorrund', role: 'Head of House.' },
      { name: 'Tessaly', role: 'Intermediary. Handles sensitive work.' },
      { name: 'Jorik', role: 'Gorrund operative.' }
    ]
  },
  {
    id: 'halvorn',
    name: 'House Halvorn',
    sigil: 'House Halvorn.png',
    status: 'known',
    description: 'A house that operates through layers of deniability. Halvorn is rarely directly connected to anything — which makes them difficult to pin down and very dangerous. Orthon leads from distance. His son Daven does not.',
    facts: [
      'Orthon Halvorn leads through intermediaries.',
      'His son Daven is the volatile element — impatient, emotional, makes it personal.',
      'Recently lost a significant prisoner from their custody.'
    ],
    members: [
      { name: 'Orthon Halvorn', role: 'Head of House.' },
      { name: 'Daven Halvorn', role: 'Orthon\'s son.' }
    ]
  }
];

// ── PLAYERS ──
const PLAYERS = [
  {
    id: 'kalvorn',
    name: 'Kalvorn Valaro',
    image: 'Kalvorn Valaro.jpeg',
    player: 'Sam Baker',
    description: 'A paladin who has spent years enforcing the will of those above him. Kalvorn is not a man of many words — but the ones he chooses land with weight. He is working out what loyalty means when the people you were loyal to turn out to be worth less than you thought.'
  },
  {
    id: 'azrael',
    name: 'Azrael',
    image: 'Azrael.png',
    player: 'Butch',
    description: 'A bloodhunter operating at the edge of what his order sanctions. Azrael has powers he doesn\'t fully understand yet, and a past that has not finished catching up with him.'
  },
  {
    id: 'dirk',
    name: 'Dr. Dirk Kaluuya',
    image: 'Dr Dirk Kaluuya.png',
    player: 'Charlie',
    description: 'A cleric whose gifts come from somewhere he hasn\'t looked at too closely. Dirk moves through the world with more ease than his companions — which sometimes makes him useful, and sometimes makes him dangerous.'
  }
];

// ── SHARED LORE ──
const LORE = [
  {
    id: 'stillmarks',
    name: 'The Stillmarks',
    subtitle: 'Ancient sites. Older than any house.',
    image: 'Stillmarks.png',
    body: 'Ancient monolithic sites found across the known world. Three tall stone pillars, converging at the top, worn smooth by centuries of weather and attention. They predate any house, any kingdom, any name anyone alive can put to them.\n\nThe Stillkeepers tend them — monks who dedicate their lives to meditation at the base of the stones. No one knows exactly what they are meditating on. They do not speak of it. What is known: Stillkeepers tend to live far longer than their race would suggest. Some say twice as long. Others say more.\n\nThe sites are not holy in any formal sense. No church claims them. No doctrine governs them. They simply persist — and those who sit with them long enough seem, somehow, changed by it.'
  },
  {
    id: 'tessaly',
    name: 'Tessaly',
    subtitle: 'Gorrund intermediary.',
    image: 'Tessaly.png',
    body: 'Intermediary for House Gorrund.\n\nThe kind of person who gives you exactly as much information as you need and not one detail more.'
  },
  {
    id: 'daven-halvorn',
    name: 'Daven Halvorn',
    subtitle: 'Son of Orthon Halvorn. House Halvorn.',
    image: 'Daven Halvorn.png',
    body: 'Son of Orthon Halvorn, head of House Halvorn.\n\nLoud. Angry. Takes things personally. The kind of man who makes it a problem when it doesn\'t have to be one.'
  },
  {
    id: 'jorik',
    name: 'Jorik',
    subtitle: 'Gorrund operative.',
    image: 'Jorik.png',
    body: 'Operative for House Gorrund. Stubborn. Been through it.\n\nNot the kind of man who breaks easy.'
  },
  {
    id: 'byren-holt',
    name: 'Byren Holt',
    subtitle: 'Lord Chancellor. The Crown\'s right hand.',
    image: 'Byren Holt.png',
    body: 'Lord Chancellor of the kingdom. Runs the Crown\'s bureaucracy on behalf of the king — appointments, records, the machinery of governance that keeps everything moving.\n\nPrecise. Careful. The kind of man who is never directly connected to anything.\n\nHis name has surfaced in places it should not be.'
  }
];

// ── SESSIONS ──
const SESSIONS = [
  {
    number: 1,
    title: 'The Docks',
    date: 'Session 1',
    parts: [
      {
        label: 'Part One — The Malchor',
        events: [
          { bold: 'The job:', text: ' House Gorrund needed an operative extracted from a Halvorn ship called the Malchor, docked in the capital overnight. The contact was Tessaly. She laid out the brief and left the party to work.' },
          { bold: 'Azrael', text: ' scouted the docks ahead of time and spotted Daven Halvorn leaving the ship with purpose before the party moved in. He did not engage.' },
          { bold: 'The party executed the extraction,', text: ' fighting their way below deck. Daven was present — and ran.' },
          { bold: 'Jorik was found below deck', text: ' in rough shape. He had been worked over. Dirk stabilised him.' },
          { bold: 'A wife and daughter', text: ' were also being held below deck. They were alive. Halvorn had not bothered to kill them. The party got all three out.' }
        ]
      },
      {
        label: 'Part Two — The Ledger',
        events: [
          { bold: 'At the safehouse,', text: ' Tessaly paid on delivery. The wife and daughter were taken to be looked after.' },
          { bold: 'Jorik debriefed the party:', text: ' House Halvorn had been accumulating weapons and armour at scale, through multiple contractors. The equipment on their guards was noticeably well-made. Tessaly confirmed she had noticed more Halvorn troops in the capital.' },
          { bold: 'Halvorn\'s official position is that the accumulation is procedural.', text: ' Jorik does not believe it.' },
          { bold: 'A ledger exists', text: ' — held at a third-party counting office — that could prove the scale of what Halvorn has been doing. Tessaly offered the party a second job: retrieve it, tonight, before Daven moved it.' },
          { bold: 'Dirk knew the building.', text: ' A patient had once mentioned where the safe was kept. The party moved immediately.' },
          { bold: 'Daven had already been and gone,', text: ' having ransacked the main space and found nothing. The private back room was untouched. Dirk cracked the safe.' },
          { bold: 'The ledger named Byren Holt', text: ' — Lord Chancellor of the kingdom — in documents he has no business being near. Kalvorn recognised the name.' },
          { bold: 'The party navigated home through the capital', text: ' in the early hours, talking their way past a Kingsguard patrol.' },
          { bold: 'Tessaly paid the agreed sum', text: ' and indicated there may be more work. The party separated for the night.' },
          { bold: 'Each member returned home to find their property had been broken into.', text: ' Someone knows they were involved. Nothing was taken. The message was the point.' }
        ]
      }
    ]
  },
  {
    number: 2,
    title: 'The Inquest',
    date: 'Session 2',
    parts: [
      {
        label: 'Part One — The Inquest',
        blocks: [
          { type: 'para', text: 'You were summoned by <strong>High Inquisitor Mael Dross</strong> regarding the ledger, and questioned individually.' },
          { type: 'highlight', text: 'Your testimonies:' },
          { type: 'testimonies', items: [
            { name: 'Dirk', text: 'Passive witness. Confirmed <strong>Daven</strong> on the ship. Stayed vague on companions until pressed.' },
            { name: 'Azrael', text: 'Said he was passing by, heard screaming, and saw two figures intervene.' },
            { name: 'Kalvorn', text: 'Downplayed his involvement. Noted <strong>Byren Holt\'s</strong> name but did not surface what he knew. <strong>Dross</strong> noted it and didn\'t press.' }
          ]},
          { type: 'para', text: 'Together you confirmed enough to undercut <strong>Halvorn\'s</strong> likely defence.' },
          { type: 'highlight', text: 'Dross ended with one question: had any of you had business near a Stillmark site in recent months?' }
        ]
      },
      {
        label: 'Aside — The Corridor',
        blocks: [
          { type: 'para', text: 'While waiting to be called in, a Crown clerk passed <strong>Azrael</strong>. Something in his blood responded — not a threat. A recognition. Unexplained.' }
        ]
      },
      {
        label: 'Part Two — The Waiting Room',
        blocks: [
          { type: 'para', text: 'You were held together while <strong>Dross</strong> processed. <strong>Tessaly</strong> was with you — the first real chance the three of you had to compare notes and read each other.' },
          { type: 'para', text: '<strong>Daven Halvorn</strong> was released at the same time. Had to be physically held back by the Kingsguard. He looked at each of you in turn and made his position clear.' },
          { type: 'para', text: 'He doesn\'t have your names. He has your faces now.' },
          { type: 'para', text: '<strong>Orthon Halvorn</strong> followed — composed, unhurried. A quiet word to <strong>Tessaly</strong> on the way out. A different kind of threat. <strong>Azrael</strong> felt it again — the same recognition as the corridor clerk. Something behind <strong>Orthon\'s</strong> eyes that didn\'t belong to him.' }
        ]
      },
      {
        label: 'Part Three — The Next Job',
        blocks: [
          { type: 'para', text: 'The ledger alone isn\'t enough. <strong>Halvorn</strong> will argue forgery. <strong>Gorrund</strong> needs corroboration.' },
          { type: 'para', text: '<strong>Tessaly</strong> named the target: <strong>Aldenmere & Sons</strong> — a counting house handling military contractor paperwork in <strong>Windfall</strong>, former <strong>Voss</strong> territory.' },
          { type: 'para', text: 'If the weapons purchases went through legitimate channels, the records are there. You accepted the job. You\'re heading out.' }
        ]
      },
      {
        label: 'Key Takeaways',
        blocks: [
          { type: 'takeaway', text: 'Dross asked about the Stillmarks — why is that part of a ledger investigation?' },
          { type: 'takeaway', text: 'Daven knows your faces now.' },
          { type: 'takeaway', text: 'Azrael felt something — on a Crown clerk, and on Orthon Halvorn. The same thing, twice.' }
        ]
      }
    ]
  },
  {
    number: 3,
    title: 'Windfall',
    date: 'Session 3',
    parts: [
      {
        label: 'Part One — The Road',
        blocks: [
          { type: 'para', text: 'On the way to <strong>Windfall</strong> you passed a <strong>Halvorn</strong> supply convoy heading the other direction — no crests, but the colours were visible. The crates were sized for swords and armour.' },
          { type: 'para', text: '<strong>Windfall</strong> itself was still recovering. Talking to locals, one detail stood out: the attack felt incidental, as if <strong>Corvath</strong> had been on the way to something else.' }
        ]
      },
      {
        label: 'Part Two — The Stillkeeper',
        blocks: [
          { type: 'para', text: 'At dinner, <strong>Dirk</strong> met the <strong>Stillkeeper</strong> — the custodian of <strong>Windfall\'s Stillmark</strong> — in distress. One of the three monoliths had been knocked down during the battle.' }
        ]
      },
      {
        label: 'Part Three — The Stillmark',
        blocks: [
          { type: 'para', text: 'In the morning the party visited the site. One monolith down, the other two leaning. The ground around it dead.' },
          { type: 'para', text: 'Objects thrown into the effect came back intact. Living things didn\'t. <strong>Azrael</strong> and <strong>Dirk</strong> both reached their hands in — <strong>Azrael</strong> slowed, <strong>Dirk</strong> sped up. They pulled back and walked away.' },
          { type: 'para', text: '<strong>Azrael</strong> examined the carved symbols on the standing monoliths. They reminded him of home.' }
        ]
      },
      {
        label: 'Part Four — Aldenmere & Sons',
        blocks: [
          { type: 'para', text: 'The <strong>Halvorn</strong> folder was filed correctly and empty — pages torn cleanly from the receipt book, dates matching the weapons window. Someone had been thorough.' },
          { type: 'para', text: '<strong>Dirk</strong> found a carbon archive in the basement — duplicates of every closed record. You descended. Footprints in the dust, recent, one person, good boots. A foul smell. Sounds like fractured screaming. Two large patchwork creatures on the floor — different stages of life in the same body, simultaneously.' },
          { type: 'para', text: 'One opened its mouth and trilled. <strong>End of session.</strong>' }
        ]
      },
      {
        label: 'Key Takeaways',
        blocks: [
          { type: 'takeaway', text: 'The Halvorn convoy was moving weapons out of Windfall as you arrived.' },
          { type: 'takeaway', text: 'The Stillmark is broken — whatever it was containing is no longer contained.' },
          { type: 'takeaway', text: 'Azrael and Dirk experienced the effect differently.' }
        ]
      }
    ]
  },
  {
    number: 4,
    title: 'Aldenmere & Sons',
    date: 'Session 4',
    parts: [
      {
        label: 'Part One — The Basement',
        blocks: [
          { type: 'para', text: 'Three creatures. You fought inside the distortion you\'d felt at the <strong>Stillmark</strong> the day before — the same wrongness, now in the room with you.' },
          { type: 'para', text: '<strong>Dirk</strong> went down mid-fight. When <strong>Kalvorn</strong> killed the first creature, a ripple went through the room. <strong>Dirk</strong> came back — the wound on his leg simply gone. Trouser still torn. No blood. He had no memory of going down.' },
          { type: 'para', text: '<strong>Azrael</strong> and <strong>Kalvorn</strong> saw it happen.' }
        ]
      },
      {
        label: 'Aside — The Ripple',
        blocks: [
          { type: 'para', text: 'In the moment of the ripple, <strong>Kalvorn</strong> reached into it. His patron drew him inward — and then a desperate cry. His mother\'s voice. He was pulled back into the fight immediately after.' }
        ]
      },
      {
        label: 'Part Two — The Carbon Archive',
        blocks: [
          { type: 'para', text: 'Short rest. <strong>Dirk</strong> searched the files.' },
          { type: 'para', text: 'The scrubbers missed the carbons. <strong>Halvorn</strong> weapons purchases confirmed — quantities three or more times the legal maximum, sustained over months.' },
          { type: 'para', text: '<strong>Dirk</strong> also identified the footprints from last session: shoes made only for people in the king\'s immediate circle. He suspects <strong>Byren Holt</strong> came down here personally — not to take anything. To check something was still there.' },
          { type: 'para', text: 'One more thing in the carbons: payments flowing into <strong>Halvorn</strong> from a group called the <strong>Brotherhood of the Patient Dawn</strong> — listed as a minor religious order, not in any Crown registry. Substantial, regular sums. <strong>Byren Holt\'s</strong> seal on the authorisation paperwork.' },
          { type: 'para', text: 'On the way out, <strong>Dirk</strong> found a second silver ink pot upstairs — engraved from <strong>House Halvorn</strong> to <strong>Aldenmere & Sons</strong>, thanking them for continued service. Both ink pots taken.' }
        ]
      },
      {
        label: 'Part Three — The Stillmark, Revisited',
        blocks: [
          { type: 'para', text: 'Before leaving <strong>Windfall</strong>, you returned to the site. The field was gone. The barrier where you\'d put your hands in — simply absent.' },
          { type: 'para', text: 'Whatever had been leaking out had stopped. The <strong>Stillmark</strong> itself is still broken. The wrongness hadn\'t normalised. It had vacated.' },
          { type: 'para', text: 'The flowers around the collapsed monolith could grow again.' }
        ]
      },
      {
        label: 'Part Four — Departure',
        blocks: [
          { type: 'para', text: 'You stayed one more night and left in the morning. Decision made: return to the capital, find <strong>Tessaly</strong>, present the evidence.' }
        ]
      },
      {
        label: 'Key Takeaways',
        blocks: [
          { type: 'takeaway', text: 'The carbons confirmed Halvorn\'s weapons purchases — three times the legal maximum.' },
          { type: 'takeaway', text: 'The Brotherhood of the Patient Dawn is funding Halvorn. Byren Holt is the conduit.' },
          { type: 'takeaway', text: 'Kalvorn heard his mother\'s voice in the distortion.' }
        ]
      }
    ]
  }
];

// ── PARTY NOTES ──
const PARTY_NOTES = [];

// ── PERSONAL COMPENDIUM ──
const PERSONAL_NOTES = [
  {
    playerId: 'kalvorn',
    passphrase: 'MAREN',
    compendium: [
      {
        type: 'npc',
        name: 'Aldus Corvath',
        subtitle: 'War General. Head of House Corvath.',
        image: 'Aldus Corvath.png',
        role: 'War General. Head of House Corvath.',
        body: 'You served under him for years. He was not a good man in the way that word is usually meant — but he was consistent. He had a code. He kept his word. He protected those loyal to him, and he was brutal to everyone else.\n\nThat was enough, for a long time.\n\nThe Voss campaign changed something. Not in him — in you. The family. The choice. Corvath gave the order and you did not carry it out. What happened next, you carry with you.\n\nHe knows what you did. He has not moved against you. You do not know why.'
      },
      {
        type: 'npc',
        name: 'Byren Holt',
        subtitle: 'Lord Chancellor. The Crown\'s right hand.',
        image: 'Byren Holt.png',
        role: 'Lord Chancellor. The Crown\'s right hand.',
        body: 'You have seen him once, in circumstances he does not know you witnessed. A meeting with Corvath — private, carefully arranged, the kind of meeting that does not go in any record.\n\nHolt is the king\'s chief advisor. A man of precise words and careful distances. He has never been publicly connected to anything improper.\n\nYou do not know what was discussed. You know the meeting happened. That is enough to make him interesting.'
      },
      {
        type: 'npc',
        name: 'Maltheus',
        subtitle: 'Your patron.',
        image: 'Maltheus-Kalvorn.png',
        role: 'Your patron.',
        body: 'You did not choose him. He chose you — or something like choosing happened, in the moment the blood was drawn and the blade first sang differently than it had before.\n\nHe is not a voice. He is not a presence in any comfortable sense. He is pressure. The feeling before a battle when everything goes quiet and the body knows what it is for.\n\nYou serve. He watches. So far, that arrangement has held.'
      }
    ],
    notes: [
      {
        title: 'Something to Consider',
        body: 'House Corvath moved against House Voss quickly. Very quickly. A house with strong walls and deep resources — and their defence collapsed faster than it should have. The people who knew how to hold their ground seemed to vanish before the siege began.\n\nYou were there. You saw what a prepared defence looks like when it falls apart from the inside. You have never fully accounted for why Voss went as easily as it did.'
      }
    ]
  },
  {
    playerId: 'azrael',
    passphrase: 'SAMAEL',
    compendium: [
      {
        type: 'npc',
        name: 'Cadriel',
        subtitle: 'Former superior. The one who cast you out.',
        image: 'Cadriel-Azrael.png',
        role: 'Former superior. The one who cast you out.',
        body: 'He did not explain himself. That was the worst of it — not the casting out, but the silence around it. No accusation. No hearing. Just the withdrawal of something you had always assumed was permanent.\n\nYou have tried to reconstruct what you did wrong. You have not arrived at an answer that satisfies.\n\nCadriel is not human. He does not move through the world the way humans do. When he communicated, it was not in words — it was in pressure, in certainty, in the overwhelming sense that something vast had turned its attention toward you.\n\nYou are not sure if what you felt from him was anger. You are not sure he is capable of anger in any form you would recognise.'
      },
      {
        type: 'npc',
        name: 'Sylvia',
        subtitle: 'The one you lost.',
        image: 'Sylvia.png',
        role: 'The one you lost.',
        body: 'She was the defining fight. Not because of what she was — but because of what she had been, and what it cost to end it.\n\nYou buried her yourself. You remember the weight of it. Not her weight — the other kind.\n\nShe is dead. That is not in question. What stays with you is harder to name: the moment just before, when she looked at you and something behind her eyes was still her. Whether that was real or whether you imagined it to make the grief mean something — you have never fully decided.'
      },
      {
        type: 'lore',
        name: 'The Descending Horizon',
        subtitle: 'What Cadriel showed you.',
        image: 'The Descending Horizon.png',
        role: 'What Cadriel showed you.',
        body: 'Cadriel showed you something before the end. Not in words. In feeling — the way he always communicated, which was less like speech and more like being made to understand something against your will.\n\nEternity. Not as a concept. As a fact. The sensation of time without end, of existing past every meaningful marker, of being present for so long that presence itself loses texture.\n\nYou do not have a name for what he showed you. The Descending Horizon is the closest thing — the point at which time stops arriving anywhere and simply continues. Beyond it, nothing changes. Things exist. They do not become.\n\nYou do not know why he showed you this. You know it was not comfort.'
      }
    ],
    notes: []
  },
  {
    playerId: 'dirk',
    passphrase: 'TEACHER',
    compendium: [
      {
        type: 'npc',
        name: 'Aldus Corvath',
        subtitle: 'War General. Your first significant patient.',
        image: 'Aldus Corvath.png',
        role: 'War General. Your first significant patient.',
        body: 'He came to you through an intermediary. The injury was severe — the kind that ends careers, or men. You saved the arm. It took most of a night and everything you had.\n\nHe said nothing when it was done. An arrangement was made: a property, quietly transferred. No public record. No acknowledgement of what had happened or how.\n\nYou have not spoken since. You are not sure what you are to him — asset, liability, or something he simply prefers not to think about. What you know is that he has not moved against you, and in your experience, that is a form of gratitude.'
      },
      {
        type: 'npc',
        name: 'The Teacher',
        subtitle: 'Your patron. The presence behind the gift.',
        image: 'The Teacher - Dirk.png',
        role: 'Your patron. The presence behind the gift.',
        body: 'You have never seen it. You are not sure "it" is the right word, but you have not found a better one.\n\nThe Teacher makes itself known as guidance — a pull in a particular direction, a certainty arriving before the reasoning does, a sense that a specific person in a specific moment requires your attention. You have learned to trust it. You have not learned to understand it.\n\nWhen you heal, sometimes the work feels less like skill and more like being used well. That is not a complaint. It is simply an observation you have made and set aside.\n\nYou have not asked who or what the Teacher is. That question has not felt urgent. So far, it has not led you anywhere you would not have chosen yourself.'
      }
    ],
    notes: [
      {
        title: 'The Arm',
        body: 'You saved a man\'s arm in a field tent during the Voss campaign. You do not advertise this. The arrangement that followed — the property, the silent payment — suits you. It is clean. It does not require conversation.\n\nWhat happened on the table that night was not entirely your doing. You are aware of this. You have not examined it too closely.\n\nThe arm healed. The man returned to public life within a month. No one asked questions. That is, in your experience, the best possible outcome.'
      }
    ]
  }
];

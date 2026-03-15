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
    description: 'The Crown is the ancient seat of power in Eberoth, holding the royal bloodline for over 2000 years. The king rules, but the houses circle.',
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
    description: 'The most powerful military house in Eberoth. House Corvath has long served as the Crown\'s strong arm — its soldiers disciplined, its general feared. They ended the Voss campaign swiftly, and have not stopped moving since.',
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
    body: 'Intermediary for House Gorrund. Professional. No wasted words.\n\nThe kind of person who gives you exactly as much information as you need and not one detail more.'
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
    body: 'Lord Chancellor of Eberoth. Runs the kingdom\'s bureaucracy on behalf of the king — appointments, records, the machinery of governance that keeps everything moving.\n\nPrecise. Careful. The kind of man who is never directly connected to anything.\n\nHis name has surfaced in places it should not be.'
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
          { bold: 'The job:', text: ' House Gorrund needed an operative extracted from a Halvorn ship called the Malchor, docked in the capital overnight. The contact was Tessaly — professional, minimal. She laid out the brief and left the party to work.' },
          { bold: 'Azrael', text: ' scouted the docks ahead of time and spotted Daven Halvorn leaving the ship with purpose before the party moved in. He did not engage.' },
          { bold: 'The party went below deck', text: ' and found the operative — Jorik — in rough shape. He had been worked over. Dirk stabilised him.' },
          { bold: 'A wife and daughter', text: ' were also being held below deck. They were alive. Halvorn had not bothered to kill them. The party got all three out.' },
          { bold: 'Daven had already left', text: ' before the party reached the lower deck. He did not see their faces.' },
          { bold: 'The three members of the party met each other for the first time', text: ' below deck — hired by the same woman, none of them knowing the others would be there.' }
        ]
      },
      {
        label: 'Part Two — The Ledger',
        events: [
          { bold: 'At the safehouse,', text: ' Tessaly paid on delivery. She was visibly — if briefly — surprised that Jorik was alive. The wife and daughter were taken to be looked after.' },
          { bold: 'Jorik debriefed the party:', text: ' House Halvorn had been accumulating weapons and armour at scale, through multiple contractors. The equipment on their guards was noticeably well-made. Tessaly confirmed she had noticed more Halvorn troops in the capital.' },
          { bold: 'Halvorn\'s official position is that the accumulation is procedural.', text: ' Jorik does not believe it.' },
          { bold: 'A ledger exists', text: ' — held at a third-party counting office — that could prove the scale of what Halvorn has been doing. Tessaly offered the party a second job: retrieve it, tonight, before Daven moved it.' },
          { bold: 'Dirk knew the building.', text: ' A patient had once mentioned where the safe was kept. The party moved immediately.' },
          { bold: 'Daven had already been and gone,', text: ' having ransacked the main space and found nothing. The private back room was untouched. Kalvorn found a false wall. Dirk cracked the safe.' },
          { bold: 'The ledger named Byren Holt', text: ' — Lord Chancellor of Eberoth — in documents he has no business being near. Kalvorn recognised the name. He had seen Holt before, in circumstances Holt does not know he was observed.' },
          { bold: 'The party navigated home through the capital', text: ' in the early hours, talking their way past a Kingsguard patrol.' },
          { bold: 'Tessaly paid the agreed sum', text: ' and indicated there may be more work. The party separated for the night.' },
          { bold: 'Each member returned home to find their property had been broken into.', text: ' Someone knows they were involved. Nothing was taken. The message was the point.' }
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

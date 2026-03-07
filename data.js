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
      { name: 'Tessaly', role: 'Intermediary. Handles sensitive work.' }
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
      { name: 'Orthon Halvorn', role: 'Head of House.' }
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
    image: 'Azrael.jpeg',
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
// Entries visible to all players under the Notes tab, above the passphrase.
const LORE = [
  {
    id: 'stillmarks',
    name: 'The Stillmarks',
    subtitle: 'Ancient sites. Older than any house.',
    image: 'Stillmarks.png',
    body: 'Ancient monolithic sites found across the known world. Three tall stone pillars, converging at the top, worn smooth by centuries of weather and attention. They predate any house, any kingdom, any name anyone alive can put to them.\n\nThe Stillkeepers tend them — monks who dedicate their lives to meditation at the base of the stones. No one knows exactly what they are meditating on. They do not speak of it. What is known: Stillkeepers tend to live far longer than their race would suggest. Some say twice as long. Others say more.\n\nThe sites are not holy in any formal sense. No church claims them. No doctrine governs them. They simply persist — and those who sit with them long enough seem, somehow, changed by it.'
  }
];

// ── SESSIONS ──
const SESSIONS = [
  // Add sessions here after each game.
];

// ── PARTY NOTES ──
// GM-authored, visible to all.
const PARTY_NOTES = [
  // Example: { title: 'The Job', body: 'You are employed by House Gorrund.' }
];

// ── PERSONAL COMPENDIUM ──
// Per-player content revealed after passphrase unlock.
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
    notes: []
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
    notes: []
  }
];

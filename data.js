// ===========================
// EBEROTH COMPENDIUM — DATA
// Edit this file to update the site
// ===========================

const FACTIONS = [
  {
    id: 'crown',
    name: 'The Crown',
    sigil: 'images/The Crown.png',
    tagline: 'The throne that holds Eberoth together. For now.',
    status: 'known',
    description: 'The Crown is the seat of power in Eberoth — ancient, contested, and increasingly fragile. The king rules, but the houses circle.',
    facts: [
      'King Gaelan Arveth currently sits the throne.',
      'The Kingsguard answer directly to the Crown.',
      'House loyalties to the Crown vary — some performative, some genuine.'
    ],
    members: [
      { name: 'King Gaelan Arveth', role: 'The King.' },
      { name: 'Prince Davan Arveth', role: 'Heir.' },
      { name: 'Princess Elowen Arveth', role: 'The younger.' },
      { name: 'Captain Aldric Fenn', role: 'Kingsguard. Loyal.' },
      { name: 'Byren Holt', role: 'Lord Chancellor.' }
    ]
  },
  {
    id: 'corvath',
    name: 'House Corvath',
    sigil: 'images/House Corvath.png',
    tagline: 'Dominant. Military. Loyal to the Crown — or so it claims.',
    status: 'known',
    description: 'The most powerful military house in Eberoth. House Corvath has long served as the Crown\'s strong arm — its soldiers disciplined, its general feared. They ended the Voss campaign swiftly, and have not stopped moving since.',
    facts: [
      'Controls significant territory in the north.',
      'Led by a general with a reputation for absolute loyalty to the king.',
      'House Voss now exists in their shadow.'
    ],
    members: [
      { name: 'Aldus Corvath', role: 'General. Head of House.' },
      { name: 'Petra Corvath', role: 'His wife.' },
      { name: 'Renn', role: 'Lieutenant. Inner circle.' }
    ]
  },
  {
    id: 'voss',
    name: 'House Voss',
    sigil: 'images/House Voss.png',
    tagline: 'Destroyed. Corvath\'s puppet state.',
    status: 'known',
    description: 'Once a well-governed house of farmers and merchants. House Voss fell quickly — too quickly, many say. They never had the soldiers for the fight that came to them.',
    facts: [
      'Their lands are administered under Corvath influence.',
      'The original Lord and Lady Voss died in the conflict.',
      'Whether any heirs survived is a matter of quiet speculation.'
    ],
    members: [
      { name: 'Theron Voss', role: 'Current head. A Corvath-friendly appointment.' },
      { name: 'Mira Voss', role: 'Elder advisor.' },
      { name: 'Cob', role: 'Household retainer.' }
    ]
  },
  {
    id: 'gorrund',
    name: 'House Gorrund',
    sigil: 'images/House Gorrund.png',
    tagline: 'Self-made. Transactional. Respects competence above lineage.',
    status: 'known',
    description: 'A house built on commerce and capability rather than birthright. House Gorrund operates in the grey — pragmatic, professional, always weighing the ledger. They did not inherit their position. They built it.',
    facts: [
      'Significant interests in the capital\'s docks and merchant networks.',
      'Led by a man who built the house himself from nothing.',
      'Currently employing the party.'
    ],
    members: [
      { name: 'Cael Gorrund', role: 'Head of House. Self-made.' },
      { name: 'Tessaly', role: 'Intermediary. Handles sensitive work.' },
      { name: 'Jorik', role: 'Right hand. Recently extracted from captivity.' }
    ]
  },
  {
    id: 'halvorn',
    name: 'House Halvorn',
    sigil: 'images/House Halvorn.png',
    tagline: 'Calculating. Never in the room when things go wrong.',
    status: 'known',
    description: 'A house that operates through layers of deniability. Halvorn is rarely directly connected to anything — which makes them difficult to pin down and very dangerous. Orthon leads from distance. His son Daven does not.',
    facts: [
      'Orthon Halvorn leads through intermediaries.',
      'His son Daven is the volatile element — impatient, emotional, makes it personal.',
      'Recently lost a significant prisoner from their custody.'
    ],
    members: [
      { name: 'Orthon Halvorn', role: 'Head of House. Calculating. Untraceable.' },
      { name: 'Daven Halvorn', role: 'Son. Wants to prove himself.' },
      { name: 'Syla', role: 'The fixer. Does the work nobody discusses.' }
    ]
  }
];

const PLAYERS = [
  {
    id: 'kalvorn',
    name: 'Kalvorn Valaro',
    image: 'images/Kalvorn Valaro.jpeg',
    player: 'Sam Baker',
    tagline: 'Tiefling Paladin. Stoic. More going on beneath the surface than he lets on.',
    description: 'A paladin who has spent years enforcing the will of those above him. Kalvorn is not a man of many words — but the ones he chooses land with weight. He is working out what loyalty means when the people you were loyal to turn out to be worth less than you thought.'
  },
  {
    id: 'azrael',
    name: 'Azrael',
    image: 'images/Azrael.jpeg',
    player: 'Butch',
    tagline: 'Bloodhunter. Formerly Samael. The name change means something.',
    description: 'A bloodhunter operating at the edge of what his order sanctions. Azrael has powers he doesn\'t fully understand yet, and a past that has not finished catching up with him.'
  },
  {
    id: 'dirk',
    name: 'Dr. Dirk Kaluuya',
    image: 'images/Dr Dirk Kaluuya.jpeg',
    player: 'Charlie',
    tagline: 'Cleric. The Dirkta. Warmer than the other two, which isn\'t saying much.',
    description: 'A cleric whose gifts come from somewhere he hasn\'t looked at too closely. Dirk moves through the world with more ease than his companions — which sometimes makes him useful, and sometimes makes him dangerous.'
  }
];

const SESSIONS = [
  // Add sessions here after each game. Example:
  // {
  //   number: 1,
  //   title: 'The Docks',
  //   date: 'March 2026',
  //   paragraphs: [
  //     'The party assembled at the docks as night fell over the capital.',
  //     'Jorik was found below deck, alive but barely.'
  //   ]
  // }
];

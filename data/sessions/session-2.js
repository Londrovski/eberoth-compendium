const SESSION_2 = {
  number: 2,
  title: 'The Inquest',
  date: 'Session 2',
  rowSummary: 'Questioned by High Inquisitor Dross over the ledger. Daven swore vengeance. Tessaly named your next target: Aldenmere & Sons in Windfall.',
  summary: [
    'You were questioned individually by <strong>High Inquisitor Mael Dross</strong> over the ledger.',
    '<strong>Dross</strong> ended the inquest with an unexplained question about the <strong>Stillmarks</strong>.',
    '<strong>Daven Halvorn</strong> was released alongside you and made his hatred personal.',
    '<strong>Azrael</strong> felt a strange recognition twice — on a Crown clerk, and on <strong>Orthon Halvorn</strong>.',
    '<strong>Tessaly</strong> named the next target: <strong>Aldenmere & Sons</strong> in <strong>Windfall</strong>.'
  ],
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
};

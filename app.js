// ===========================
// EBEROTH COMPENDIUM — APP
// ===========================

document.addEventListener('DOMContentLoaded', () => {

  // ── NAV ──
  const navBtns = document.querySelectorAll('.nav-btn');
  const sections = document.querySelectorAll('.section');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.section;
      navBtns.forEach(b => b.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('section-' + target).classList.add('active');
    });
  });

  // ── FACTIONS ──
  const crown = FACTIONS.find(f => f.id === 'crown');
  const houses = FACTIONS.filter(f => f.id !== 'crown');

  if (crown) {
    const slot = document.getElementById('crown-slot');
    const sigilHTML = crown.sigil
      ? `<img src="${crown.sigil}" alt="${crown.name}" onerror="this.parentElement.innerHTML=''">`
      : '';
    const el = document.createElement('div');
    el.className = 'crown-feature';
    el.innerHTML = `
      <div class="crown-sigil">${sigilHTML}</div>
      <div class="crown-name">${crown.name}</div>
      <div class="crown-desc">${crown.description}</div>
    `;
    el.addEventListener('click', () => openFactionDetail(crown));
    slot.appendChild(el);
  }

  const grid = document.getElementById('factions-grid');
  houses.forEach(f => {
    const card = document.createElement('div');
    card.className = 'faction-card' + (f.status === 'locked' ? ' locked' : '');

    const imgHTML = f.sigil
      ? `<img src="${f.sigil}" alt="${f.name}" onerror="this.parentElement.innerHTML='<span class=card-image-placeholder>${f.name[0]}</span>'">`
      : `<span class="card-image-placeholder">${f.name[0]}</span>`;

    card.innerHTML = `
      <div class="card-image-wrap">${imgHTML}</div>
      <div class="card-footer">
        <div class="card-name">${f.name}</div>
      </div>
    `;

    if (f.status === 'known') {
      card.addEventListener('click', () => openFactionDetail(f));
    }
    grid.appendChild(card);
  });

  // ── PARTY ──
  const partyGrid = document.getElementById('party-grid');

  PLAYERS.forEach(p => {
    const card = document.createElement('div');
    card.className = 'party-card';

    const imgHTML = p.image
      ? `<img src="${p.image}" alt="${p.name}" onerror="this.parentElement.innerHTML='<span class=party-image-placeholder>${p.name[0]}</span>'">`
      : `<span class="party-image-placeholder">${p.name[0]}</span>`;

    card.innerHTML = `
      <div class="party-image-wrap">${imgHTML}</div>
      <div class="party-footer">
        <div class="party-name">${p.name}</div>
        <div class="party-player">Played by ${p.player}</div>
      </div>
    `;

    card.addEventListener('click', () => openPlayerDetail(p));
    partyGrid.appendChild(card);
  });

  // ── DETAIL PANEL ──
  const overlay = document.getElementById('overlay');
  const detailContent = document.getElementById('detail-content');
  const closeBtn = document.getElementById('close-overlay');

  function openFactionDetail(f) {
    const sigilHTML = f.sigil
      ? `<img src="${f.sigil}" alt="${f.name}" onerror="this.parentElement.innerHTML=''">`
      : '';

    const factsHTML = f.facts && f.facts.length
      ? `<p class="detail-section-label">What is known</p>
         <ul class="detail-facts">${f.facts.map(fact => `<li>${fact}</li>`).join('')}</ul>`
      : '';

    const membersHTML = f.members && f.members.length
      ? `<p class="detail-section-label">Notable Figures</p>
         <ul class="members-list">
           ${f.members.map(m => `
             <li>
               <span class="member-name">${m.name}</span>
               <span class="member-role">${m.role}</span>
             </li>`).join('')}
         </ul>`
      : '';

    detailContent.innerHTML = `
      <div class="detail-sigil">${sigilHTML}</div>
      <div class="detail-title">${f.name}</div>
      <p class="detail-desc">${f.description}</p>
      ${factsHTML}
      ${membersHTML}
    `;

    openOverlay();
  }

  function openPlayerDetail(p) {
    detailContent.innerHTML = `
      <div class="detail-portrait">
        <img src="${p.image}" alt="${p.name}" onerror="this.parentElement.style.display='none'">
      </div>
      <div class="detail-title">${p.name}</div>
      <div class="detail-subtitle">Played by ${p.player}</div>
      <p class="detail-desc">${p.description}</p>
    `;
    openOverlay();
  }

  function openOverlay() {
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  closeBtn.addEventListener('click', closeDetail);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeDetail(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDetail(); });

  function closeDetail() {
    overlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // ── SESSIONS ──
  const sessionsList = document.getElementById('sessions-list');

  if (SESSIONS.length === 0) {
    sessionsList.innerHTML = '<p class="sessions-empty">The log is empty. No sessions have been recorded yet.</p>';
  } else {
    SESSIONS.forEach(s => {
      const card = document.createElement('div');
      card.className = 'session-card';
      card.innerHTML = `
        <div class="session-label">Session ${s.number}</div>
        <div class="session-title">${s.title}</div>
        <div class="session-date">${s.date}</div>
        <div class="session-body">${s.paragraphs.map(p => `<p>${p}</p>`).join('')}</div>
      `;
      sessionsList.appendChild(card);
    });
  }

  // ── PARTY NOTES ──
  const partyNotesList = document.getElementById('party-notes-list');

  if (!PARTY_NOTES || PARTY_NOTES.length === 0) {
    partyNotesList.innerHTML = '<p class="notes-empty">No party notes yet.</p>';
  } else {
    partyNotesList.innerHTML = PARTY_NOTES.map(n => `
      <div class="note-card gm-note">
        ${n.title ? `<div class="note-author">${n.title}</div>` : ''}
        <div class="note-body">${n.body}</div>
      </div>
    `).join('');
  }

  // ── PERSONAL NOTES ──
  const passphraseInput = document.getElementById('passphrase-input');
  const passphraseSubmit = document.getElementById('passphrase-submit');
  const passphraseError = document.getElementById('passphrase-error');
  const personalReveal = document.getElementById('personal-notes-reveal');
  const personalHeader = document.getElementById('personal-notes-header');
  const personalNotesList = document.getElementById('personal-notes-list');
  const lockBtn = document.getElementById('passphrase-lock');

  function attemptUnlock() {
    const attempt = passphraseInput.value.trim().toUpperCase();
    const match = PERSONAL_NOTES.find(p => p.passphrase.toUpperCase() === attempt);

    if (!match) {
      passphraseError.classList.remove('hidden');
      passphraseInput.classList.add('shake');
      passphraseInput.value = '';
      setTimeout(() => passphraseInput.classList.remove('shake'), 500);
      return;
    }

    passphraseError.classList.add('hidden');
    passphraseInput.value = '';

    const player = PLAYERS.find(p => p.id === match.playerId);
    const characterName = player ? player.name : 'Traveller';

    personalHeader.innerHTML = `<p class="personal-notes-welcome">Welcome, ${characterName}.</p>`;

    if (!match.notes || match.notes.length === 0) {
      personalNotesList.innerHTML = '<p class="notes-empty">No personal notes yet.</p>';
    } else {
      personalNotesList.innerHTML = match.notes.map(n => `
        <div class="note-card">
          ${n.title ? `<div class="note-author">${n.title}</div>` : ''}
          <div class="note-body">${n.body}</div>
        </div>
      `).join('');
    }

    document.getElementById('passphrase-form').classList.add('hidden');
    personalReveal.classList.remove('hidden');
  }

  passphraseSubmit.addEventListener('click', attemptUnlock);
  passphraseInput.addEventListener('keydown', e => { if (e.key === 'Enter') attemptUnlock(); });

  lockBtn.addEventListener('click', () => {
    personalReveal.classList.add('hidden');
    document.getElementById('passphrase-form').classList.remove('hidden');
    personalNotesList.innerHTML = '';
    personalHeader.innerHTML = '';
  });

});

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
  const grid = document.getElementById('factions-grid');

  FACTIONS.forEach(f => {
    const card = document.createElement('div');
    card.className = 'faction-card' + (f.status === 'locked' ? ' locked' : '');

    const sigilHTML = f.sigil
      ? `<img src="${f.sigil}" alt="${f.name}" onerror="this.parentElement.innerHTML='<span class=card-sigil-placeholder>${f.name[0]}</span>'">`
      : `<span class="card-sigil-placeholder">${f.name[0]}</span>`;

    card.innerHTML = `
      <div class="card-sigil">${sigilHTML}</div>
      <div class="card-name">${f.name}</div>
      <div class="card-tagline">${f.tagline}</div>
      <span class="card-badge ${f.status === 'known' ? 'badge-known' : 'badge-locked'}">
        ${f.status === 'known' ? 'Known' : 'Unknown'}
      </span>
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

    card.innerHTML = `
      <div class="party-portrait">
        <img src="${p.image}" alt="${p.name}" onerror="this.parentElement.innerHTML='<span class=party-portrait-placeholder>${p.name[0]}</span>'">
      </div>
      <div class="party-name">${p.name}</div>
      <div class="party-player">Played by ${p.player}</div>
      <div class="party-tagline">${p.tagline}</div>
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
      <div class="detail-subtitle">${f.tagline}</div>
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

  // ── NOTES ──
  const notesList = document.getElementById('notes-list');
  const noteAuthor = document.getElementById('note-author');
  const noteText = document.getElementById('note-text');
  const noteSubmit = document.getElementById('note-submit');

  let notes = [];

  try {
    const saved = sessionStorage.getItem('eberoth-notes');
    if (saved) notes = JSON.parse(saved);
  } catch(e) {}

  function renderNotes() {
    if (notes.length === 0) {
      notesList.innerHTML = '<p class="notes-empty">No notes yet. Add something the party should remember.</p>';
      return;
    }
    notesList.innerHTML = notes.slice().reverse().map(n => `
      <div class="note-card">
        <div class="note-meta">
          <span class="note-author">${n.author || 'Unknown'}</span>
          <span class="note-time">${n.time}</span>
        </div>
        <div class="note-body">${n.text}</div>
      </div>
    `).join('');
  }

  renderNotes();

  noteSubmit.addEventListener('click', () => {
    const text = noteText.value.trim();
    if (!text) return;
    const now = new Date();
    const time = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    notes.push({
      author: noteAuthor.value.trim() || 'Unknown',
      text,
      time
    });
    try { sessionStorage.setItem('eberoth-notes', JSON.stringify(notes)); } catch(e) {}
    noteText.value = '';
    renderNotes();
  });

});

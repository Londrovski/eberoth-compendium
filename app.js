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
  // Separate Crown from houses
  const crown = FACTIONS.find(f => f.id === 'crown');
  const houses = FACTIONS.filter(f => f.id !== 'crown');

  // Crown feature block
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

  // House cards
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

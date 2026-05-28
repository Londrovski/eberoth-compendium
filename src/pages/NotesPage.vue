<template>
  <q-page class="notes-page">
    <div class="notes-layout">
      <aside class="drawer">
        <section class="drawer-section threads">
          <ThreadsPanel />
        </section>
        <section class="drawer-section notes">
          <NotepadPanel />
        </section>
      </aside>

      <main class="main-pane">
        <div class="main-head">
          <span class="head-label">Sessions</span>
          <span class="head-sub">A record of what has passed.</span>
        </div>
        <div class="main-scroll">
          <SessionsListPanel />
        </div>
      </main>
    </div>
  </q-page>
</template>

<script setup>
import ThreadsPanel from 'components/notes/ThreadsPanel.vue';
import NotepadPanel from 'components/notes/NotepadPanel.vue';
import SessionsListPanel from 'components/notes/SessionsListPanel.vue';
</script>

<style scoped>
.notes-page {
  height: calc(100vh - 50px);
  padding: 0;
  background: var(--bg);
}
.notes-layout {
  display: flex;
  height: 100%;
  width: 100%;
}

/* Drawer mirrors the old site's left rail. */
.drawer {
  width: 340px;
  flex-shrink: 0;
  background: var(--bg-panel);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.drawer-section {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.drawer-section.threads { flex: 0 0 auto; max-height: 45%; }
.drawer-section.notes   { flex: 1 1 auto; border-top: 1px solid var(--border); min-height: 0; }

/* Main pane = sessions list. */
.main-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg);
}
.main-head {
  padding: 14px 18px 10px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-panel);
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.head-label {
  font-family: 'Cinzel Decorative', 'Cinzel', serif;
  font-size: 13
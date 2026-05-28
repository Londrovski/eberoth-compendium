<template>
  <q-page class="notes-page">
    <div class="notes-layout">
      <div class="left-pane column">
        <div class="threads-section">
          <ThreadsPanel />
        </div>
        <div class="notepad-section col">
          <NotepadPanel />
        </div>
      </div>

      <div class="pane-divider" />

      <div class="right-pane column">
        <div class="page-title-row q-px-md q-py-sm">
          <div class="text-h6">Sessions</div>
          <div class="text-caption text-grey-7">A record of what has passed.</div>
        </div>
        <q-scroll-area class="col">
          <SessionsListPanel />
        </q-scroll-area>
      </div>
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
  /* Topbar (q-header) is 50px; fill the rest of the viewport. */
  height: calc(100vh - 50px);
  padding: 0;
}
.notes-layout {
  display: flex;
  height: 100%;
  width: 100%;
}
.left-pane {
  width: 360px;
  min-width: 280px;
  max-width: 40%;
  background: #f8f1dd;
  border-right: 1px solid #e7dcc4;
}
.threads-section {
  flex: 0 0 auto;
  max-height: 45%;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e7dcc4;
  background: #faf3df;
}
.notepad-section {
  flex: 1;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}
.pane-divider { width: 1px; background: #e7dcc4; }
.right-pane { flex: 1; background: #fdfaf2; }
.page-title-row {
  border-bottom: 1px solid #e7dcc4;
  background: #faf3df;
}

@media (max-width: 700px) {
  .notes-layout { flex-direction: column; }
  .left-pane { width: 100%; max-width: 100%; }
  .threads-section { max-height: 30vh; }
}
</style>

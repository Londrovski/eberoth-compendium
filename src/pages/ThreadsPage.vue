<template>
  <q-page padding>
    <div class="page-title text-h6 q-mb-sm">Threads</div>
    <div class="text-caption text-grey-7 q-mb-md">
      Things you're chasing. Mark resolved when done.
    </div>

    <div v-if="!authed" class="text-grey-7 q-pa-md">
      Sign in to manage threads.
    </div>

    <template v-else>
      <q-input
        v-model="newThread"
        filled dense
        placeholder="A new thread to chase…"
        class="q-mb-md"
        @keyup.enter="addThread"
      >
        <template #append>
          <q-btn flat dense icon="add" :disable="!newThread.trim()" @click="addThread" />
        </template>
      </q-input>

      <q-list separator v-if="threads.length">
        <q-item v-for="t in threads" :key="t.id">
          <q-item-section side>
            <q-checkbox v-model="t.resolved" @update:model-value="onToggle(t)" />
          </q-item-section>
          <q-item-section>
            <q-item-label :class="{ 'text-strike text-grey-6': t.resolved }">
              {{ t.text }}
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-btn flat round dense icon="close" size="sm" @click="removeThread(t)" />
          </q-item-section>
        </q-item>
      </q-list>

      <div v-else class="text-center text-grey-7 q-pa-xl">
        Nothing on the line yet.
      </div>
    </template>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { supabase } from 'boot/supabase';

const auth = useAuthStore();
const authed = computed(() => !!auth.user);

const threads = ref([]);
const newThread = ref('');

async function load() {
  if (!authed.value) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data, error } = await supabase
    .from('user_threads')
    .select('*')
    .eq('user_email', user.email)
    .order('created_at', { ascending: false });
  if (error) { console.warn('[threads] load failed', error); return; }
  threads.value = data || [];
}

async function addThread() {
  const txt = newThread.value.trim();
  if (!txt) return;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const { data, error } = await supabase
    .from('user_threads')
    .insert({ user_email: user.email, text: txt, resolved: false })
    .select()
    .single();
  if (error) { console.warn('[threads] add failed', error); return; }
  threads.value.unshift(data);
  newThread.value = '';
}

async function onToggle(t) {
  const { error } = await supabase
    .from('user_threads')
    .update({ resolved: t.resolved })
    .eq('id', t.id);
  if (error) { console.warn('[threads] toggle failed', error); }
}

async function removeThread(t) {
  const { error } = await supabase
    .from('user_threads')
    .delete()
    .eq('id', t.id);
  if (error) { console.warn('[threads] delete failed', error); return; }
  threads.value = threads.value.filter(x => x.id !== t.id);
}

onMounted(load);
</script>

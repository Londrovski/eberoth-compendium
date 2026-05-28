<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="row items-center justify-center bg-dark">
        <q-card flat bordered class="landing-card q-pa-lg" style="min-width: 340px; max-width: 360px;">
          <div class="text-h5 app-title text-center q-mb-xs">Eberoth</div>
          <div class="text-caption text-center text-grey-7 q-mb-md">The Compendium</div>
          <q-form @submit.prevent="onSubmit">
            <q-input
              v-model="passphrase"
              label="Passphrase"
              filled
              autofocus
              class="input-upper"
              :error="!!error"
              :error-message="error"
              autocomplete="off"
              spellcheck="false"
              @update:model-value="onInput"
            />
            <q-btn
              type="submit"
              color="primary"
              label="Enter"
              class="full-width q-mt-md"
              :loading="loading"
              :disable="!passphrase.trim()"
            />
          </q-form>

          <div class="text-caption text-grey-6 q-mt-md text-center">
            Passphrases: Maren · Samael · Teacher · Thorebe
          </div>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth';

const router = useRouter();
const auth = useAuthStore();
const passphrase = ref('');
const error = ref(null);
const loading = ref(false);

// Force input to uppercase as user types. Keeps cursor sensible by
// only assigning when value actually differs.
function onInput(v) {
  const upper = String(v || '').toUpperCase();
  if (upper !== passphrase.value) passphrase.value = upper;
}

async function onSubmit() {
  error.value = null;
  loading.value = true;
  // eslint-disable-next-line no-console
  console.log('[landing] attempting sign-in with', JSON.stringify(passphrase.value));
  const result = await auth.signInWithPassphrase(passphrase.value);
  loading.value = false;
  if (result?.error) {
    error.value = result.error.message || 'Unable to sign in';
    // eslint-disable-next-line no-console
    console.warn('[landing] sign-in failed:', result.error);
    return;
  }
  router.push({ name: 'home' });
}
</script>

<style scoped>
.landing-card {
  background: #fdfaf2;
  color: #1f1b16;
  border-color: #d8cfb8;
}
.input-upper :deep(input) {
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>

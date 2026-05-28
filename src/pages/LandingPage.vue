<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="row items-center justify-center bg-dark text-white">
        <q-card flat bordered class="q-pa-lg" style="min-width: 320px;">
          <div class="text-h5 app-title text-center q-mb-md">Eberoth</div>
          <div class="text-caption text-center text-grey-5 q-mb-md">The Compendium</div>
          <q-form @submit.prevent="onSubmit">
            <q-input
              v-model="passphrase"
              label="Passphrase"
              dense filled dark
              autofocus
              :error="!!error"
              :error-message="error"
            />
            <q-btn
              type="submit"
              color="primary"
              label="Enter"
              class="full-width q-mt-md"
              :loading="loading"
            />
          </q-form>
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

async function onSubmit() {
  error.value = null;
  loading.value = true;
  const result = await auth.signInWithPassphrase(passphrase.value.trim().toLowerCase());
  loading.value = false;
  if (result?.error) {
    error.value = result.error.message || 'Unable to sign in';
    return;
  }
  router.push({ name: 'home' });
}
</script>

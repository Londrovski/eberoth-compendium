<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="row items-center justify-center">
        <div class="text-center">
          <div class="text-h6">404</div>
          <div class="text-body2 text-grey-7 q-mb-md">Page not found.</div>
          <q-btn flat color="primary" :to="{ name: 'home' }">Home</q-btn>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

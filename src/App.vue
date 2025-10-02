<template>
  <div class="min-h-screen">
    <div class="mx-auto px-6 py-8">
      <header class="mb-10">
        <div class="flex items-center gap-3 mb-3">
          <a href="" class="flex gap-3 cursor-pointer" @click="page = 'home'">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Time's flying
            </h1>
          </a>

          <IconButton v-if="page === 'home'" name="settings" class="ml-auto" @click="page = 'settings'" />
          <IconButton v-if="page === 'settings'" name="clock" class="ml-auto" @click="page = 'home'" />
        </div>
      </header>

      <Suspense>
        <div>
          <Home v-if="page === 'home'" />
          <Settings v-if="page === 'settings'" />
        </div>
      </Suspense>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import IconButton from './components/ui/IconButton.vue';
import Home from './pages/Home.vue';
import Settings from './pages/Settings.vue';

// TODO: use proper router
const page = ref<'home' | 'settings'>('home');
</script>

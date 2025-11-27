<template>
  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <!-- List Icon -->
    <path
      v-if="name === 'list'"
      fill-rule="evenodd"
      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
      clip-rule="evenodd"
    />

    <!-- Stop Icon -->
    <path
      v-if="name === 'stop'"
      fill-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
      clip-rule="evenodd"
    />

    <!-- Clock Icon -->
    <path
      v-if="name === 'clock'"
      fill-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
      clip-rule="evenodd"
    />

    <!-- Play Icon -->
    <path
      v-if="name === 'play'"
      fill-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
      clip-rule="evenodd"
    />

    <!-- Bookmark Icon -->
    <path v-if="name === 'bookmark'" d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />

    <!-- Trash Icon -->
    <path
      v-if="name === 'trash'"
      fill-rule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
      clip-rule="evenodd"
    />

    <!-- Settings Icon -->
    <path
      v-if="name === 'settings'"
      fill-rule="evenodd"
      d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
      clip-rule="evenodd"
    />

    <!-- Plus Icon -->
    <path
      v-if="name === 'plus'"
      fill-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
      clip-rule="evenodd"
    />

    <!-- Edit Icon -->
    <path
      v-if="name === 'edit'"
      d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
    />

    <!-- Download Icon -->
    <path
      v-if="name === 'download'"
      fill-rule="evenodd"
      d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
      clip-rule="evenodd"
    />

    <!-- Eye Icon -->
    <path v-if="name === 'eye'" d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
    <path
      v-if="name === 'eye'"
      fill-rule="evenodd"
      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
      clip-rule="evenodd"
    />

    <!-- Copy Icon -->
    <template v-if="name === 'copy'">
      <!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE -->
      <path
        fill="currentColor"
        d="M7.5 15q-.688 0-1.178-.49T5.833 13.333V3.333q0-.687.489-1.178T7.5 1.667h7.5q.688 0 1.178.488t.489 1.178v10q0 .688-.49 1.178T15 15.833zm-3.333 3.333q-.688 0-1.178-.49T2.5 16.667V5h1.667v11.667h9.166v1.666z"
      />
    </template>

    <!-- Chart Icon -->
    <path
      v-if="name === 'chart'"
      fill-rule="evenodd"
      d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
      clip-rule="evenodd"
    />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  name:
    | 'list'
    | 'stop'
    | 'clock'
    | 'play'
    | 'bookmark'
    | 'trash'
    | 'settings'
    | 'plus'
    | 'edit'
    | 'download'
    | 'eye'
    | 'copy'
    | 'chart';
}>();
</script>

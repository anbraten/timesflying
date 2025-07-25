<template>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
    <!-- Pinned Tasks -->
    <div class="lg:col-span-1">
      <PinnedTasks />
    </div>

    <!-- Time Entry List - Full width -->
    <div class="lg:col-span-3">
      <TimeEntryList />
    </div>
  </div>
</template>

<script setup lang="ts">
import PinnedTasks from '../components/PinnedTasks.vue';
import TimeEntryList from '../components/TimeEntryList.vue';
</script>

<template>
  <div class="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-gray-900/5 rounded-2xl p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-gray-900">Pinned Tasks</h2>
    </div>

    <div v-if="pinnedEntries?.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
        </svg>
      </div>
      <p class="text-gray-500 font-medium">No pinned tasks yet</p>
      <p class="text-gray-400 text-sm mt-1">Pin frequently used tasks for quick access</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="entry in pinnedEntries"
        :key="entry.id"
        class="bg-gradient-to-r from-amber-50/80 to-amber-100/60 border border-amber-200/60 rounded-xl p-4 hover:from-amber-100/80 hover:to-amber-200/60 hover:shadow-amber-500/10 transition-all duration-300"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 truncate">{{ entry.description }}</p>
            <div class="flex items-center gap-2 mt-1">
              <div
                class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                :style="{ backgroundColor: getProjectColor(entry.project) }"
              ></div>
              <span class="text-sm font-medium text-gray-600">{{ getProjectName(entry.project) }}</span>
            </div>
          </div>

          <div class="flex items-center gap-1 ml-4">
            <IconButton
              variant="primary"
              name="play"
              @click="continueTimeEntry(entry.id)"
              title="Start timer with this task"
            />

            <IconButton variant="warning" name="bookmark" @click="togglePinTimeEntry(entry.id)" title="Unpin task" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDb } from '../composables/useDb';
import { useTimeTracking } from '../composables/useTimeTracking';
import IconButton from './ui/IconButton.vue';

const { pinnedEntries, continueTimeEntry, togglePinTimeEntry } = useTimeTracking();

const db = useDb();
const { data: projects } = db.getProjects();

// TODO: move to composable
const getProjectName = (projectId: number) => {
  return projects.value?.find((p) => p.id === projectId)?.name || 'Unknown';
};

// TODO: move to composable
const getProjectColor = (projectId: number) => {
  return projects.value?.find((p) => p.id === projectId)?.color || '#6b7280';
};
</script>

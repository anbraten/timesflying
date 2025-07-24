<template>
  <div class="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-gray-900/5 rounded-2xl p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <Icon name="list" class="w-4 h-4 text-white" />
        </div>
        <h2 class="text-xl font-bold text-gray-900">Time Entries</h2>
      </div>
      <div class="bg-gray-100 px-4 py-2 rounded-xl">
        <span class="text-sm font-semibold text-gray-600">Today:</span>
        <span class="text-sm font-bold text-gray-900 ml-1">{{ formatDuration(todayTime) }}</span>
      </div>
    </div>

    <!-- Active Timer Row (if active) -->
    <div
      v-if="activeEntry"
      class="bg-gradient-to-r from-blue-50/80 to-blue-100/60 border border-blue-200/60 rounded-xl p-4 shadow-lg shadow-blue-500/10 mb-4 transition-all duration-300"
    >
      <div class="flex items-center gap-4">
        <div class="flex flex-1 min-w-0 items-center">
          <p class="font-semibold text-gray-900 truncate">{{ activeEntry.description }}</p>

          <div
            class="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-3 mr-1"
            :style="{ backgroundColor: getProjectColor(activeEntry.project) }"
          ></div>
          <span class="text-sm font-medium text-gray-600">{{ getProjectName(activeEntry.project) }}</span>
        </div>

        <div
          class="text-xl font-mono font-bold bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent"
        >
          {{ formatDuration(getElapsedTime(activeEntry), true) }}
        </div>

        <div class="flex items-center gap-2">
          <Button variant="error" @click="stopActiveEntry" title="Stop">
            <Icon name="stop" class="w-5 h-5" />
            <span class="hidden md:block ml-1">Stop</span>
          </Button>
        </div>
      </div>
    </div>

    <NewTimeEntry v-if="!activeEntry" />

    <div v-if="sortedEntries.length === 0" class="text-center py-16">
      <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon name="clock" class="w-10 h-10 text-gray-400" />
      </div>
      <p class="text-gray-500 font-semibold text-lg">No time entries yet</p>
      <p class="text-gray-400 mt-1">Start your first timer to begin tracking!</p>
    </div>

    <div v-else class="space-y-4 overflow-y-auto">
      <div
        v-for="entry in sortedEntries"
        :key="entry.id"
        class="bg-white/60 backdrop-blur-sm border border-gray-200/60 rounded-xl p-4 hover:bg-white/80 hover:shadow-gray-900/5 transition-all duration-300"
        :class="{
          'bg-gradient-to-r from-blue-50/80 to-blue-100/60 border-blue-200/60 shadow-lg shadow-blue-500/10':
            !entry.endTime,
        }"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex flex-1 min-w-0 items-center">
              <p class="font-semibold text-gray-900 truncate">{{ entry.description }}</p>

              <div
                class="w-2.5 h-2.5 rounded-full flex-shrink-0 ml-3 mr-1"
                :style="{ backgroundColor: getProjectColor(entry.project) }"
              ></div>
              <span class="text-sm font-medium text-gray-600">{{ getProjectName(entry.project) }}</span>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span class="font-medium">{{ formatTime(entry.startTime) }}</span>
                <span v-if="entry.endTime" class="font-medium">{{ formatTime(entry.endTime) }}</span>
              </div>
            </div>
          </div>

          <div class="font-bold text-gray-900 text-lg">
            {{ formatDuration(getElapsedTime(entry)) }}
          </div>

          <div class="flex items-center gap-1 ml-6">
            <IconButton variant="primary" name="play" @click="continueEntry(entry.id)" title="Continue this task" />

            <IconButton
              :variant="entry.isPinned ? 'warning' : 'ghost'"
              @click="togglePinEntry(entry.id)"
              :title="entry.isPinned ? 'Unpin task' : 'Pin task'"
              name="bookmark"
            />

            <IconButton variant="error" name="trash" @click="deleteEntry(entry.id)" title="Delete entry" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTimer } from '../composables/useTimer';
import { useTimeTracking } from '../composables/useTimeTracking';
import { toDate } from '../composables/utils';
import Button from './ui/Button.vue';
import IconButton from './ui/IconButton.vue';
import Icon from './ui/Icon.vue';
import NewTimeEntry from './NewTimeEntry.vue';
import { isEqual } from 'date-fns';

const { formatDuration, getElapsedTime } = useTimer();
const { timeEntries, projects, activeEntry, continueEntry, togglePinEntry, deleteEntry, stopActiveEntry } =
  useTimeTracking();

const sortedEntries = computed(() => {
  return [...(timeEntries.value ?? [])]
    .filter((entry) => entry.endTime) // Exclude active entry as it's shown separately
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
});

const todayTime = computed(() => {
  const today = new Date().setHours(0, 0, 0, 0);
  const cpyToDate = (d: Date) => toDate(new Date(d)).setHours(0, 0, 0, 0);
  return (timeEntries.value ?? [])
    .filter((entry) => isEqual(cpyToDate(entry.startTime), today))
    .reduce((total, entry) => {
      return total + getElapsedTime(entry);
    }, 0);
});

function getProjectName(projectId: string) {
  return projects.value.find((p) => p.id === projectId)?.name || 'Unknown';
}

function getProjectColor(projectId: string) {
  return projects.value.find((p) => p.id === projectId)?.color || '#6b7280';
}

function formatTime(date: Date | number) {
  return toDate(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}
</script>

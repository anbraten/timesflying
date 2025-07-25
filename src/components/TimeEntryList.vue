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

    <ActiveTimeEntry v-if="activeEntry" :activeTimeEntry="activeEntry" />
    <NewTimeEntry v-else />

    <div v-if="entriesByDay.length === 0" class="text-center py-16">
      <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Icon name="clock" class="w-10 h-10 text-gray-400" />
      </div>
      <p class="text-gray-500 font-semibold text-lg">No time entries yet</p>
      <p class="text-gray-400 mt-1">Start your first timer to begin tracking!</p>
    </div>

    <div v-else class="space-y-6 overflow-y-auto">
      <div v-for="dayGroup in entriesByDay" :key="dayGroup.date.toDateString()" class="space-y-3">
        <!-- Day Header -->
        <div class="flex items-center justify-between px-2 py-1">
          <h3 class="text-lg font-bold text-gray-900">
            {{ formatDayHeader(dayGroup.date) }}
          </h3>
          <div class="text-lg font-bold text-gray-700">
            {{ formatDuration(dayGroup.totalDuration) }}
          </div>
        </div>

        <!-- Day Entries -->
        <div class="space-y-3">
          <div
            v-for="entry in dayGroup.entries"
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
                <IconButton
                  variant="primary"
                  name="play"
                  @click="continueTimeEntry(entry.id)"
                  title="Continue this task"
                />

                <IconButton
                  :variant="entry.isPinned ? 'warning' : 'ghost'"
                  @click="togglePinTimeEntry(entry.id)"
                  :title="entry.isPinned ? 'Unpin task' : 'Pin task'"
                  name="bookmark"
                />

                <IconButton variant="error" name="trash" @click="deleteTimeEntry(entry.id)" title="Delete entry" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex w-full justify-center items-center px-2 py-1">
        <Button @click="perPage += 10">Load More</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useTimer } from '../composables/useTimer';
import { useTimeTracking } from '../composables/useTimeTracking';
import { formatTime, toDate, useProjectHelpers } from '../composables/utils';
import Button from './ui/Button.vue';
import IconButton from './ui/IconButton.vue';
import Icon from './ui/Icon.vue';
import NewTimeEntry from './NewTimeEntry.vue';
import { isEqual } from 'date-fns';
import { useDb } from '../composables/useDb';
import ActiveTimeEntry from './ActiveTimeEntry.vue';

const db = useDb();
const { formatDuration, getElapsedTime } = useTimer();
const { activeEntry, continueTimeEntry, togglePinTimeEntry, deleteTimeEntry } = useTimeTracking();
const { getProjectName, getProjectColor } = useProjectHelpers();

const perPage = ref(20);
const { data: timeEntries } = db.getAllTimeEntries(0, perPage);

const entriesByDay = computed(() => {
  const entries = [...(timeEntries.value ?? [])]
    .filter((entry) => entry.endTime) // Exclude active entry as it's shown separately
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const grouped = new Map<string, { date: Date; entries: typeof entries; totalDuration: number }>();

  entries.forEach((entry) => {
    const date = toDate(entry.startTime);
    const dateKey = date.toDateString(); // Use date string as key for grouping

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, {
        date,
        entries: [],
        totalDuration: 0,
      });
    }

    const group = grouped.get(dateKey)!;
    group.entries.push(entry);
    group.totalDuration += getElapsedTime(entry);
  });

  return Array.from(grouped.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
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

function formatDayHeader(date: Date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Check if it's today
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  // Check if it's yesterday
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  // Format as "Tue, Jul 20"
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
</script>

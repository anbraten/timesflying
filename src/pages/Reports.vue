<template>
  <div class="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl shadow-gray-900/5 rounded-2xl p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div
          class="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center"
        >
          <Icon name="chart" class="w-4 h-4 text-white" />
        </div>
        <h2 class="text-xl font-bold text-gray-900">Reports</h2>
      </div>

      <!-- Period Toggle -->
      <div class="flex gap-2 bg-gray-100 rounded-xl p-1">
        <button
          @click="period = 'week'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            period === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          Week
        </button>
        <button
          @click="period = 'month'"
          :class="[
            'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
            period === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
          ]"
        >
          Month
        </button>
      </div>
    </div>

    <!-- Period Navigation -->
    <div class="flex items-center justify-between mb-6">
      <button
        @click="navigatePeriod(-1)"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Previous period"
      >
        <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>

      <h3 class="text-lg font-bold text-gray-900">
        {{ periodLabel }}
      </h3>

      <button
        @click="navigatePeriod(1)"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        :disabled="!canNavigateForward"
        :class="{ 'opacity-50 cursor-not-allowed': !canNavigateForward }"
        aria-label="Next period"
      >
        <svg class="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>

    <!-- Bar Chart -->
    <div class="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <div class="text-sm font-semibold text-gray-600">Total Time</div>
        <div class="text-2xl font-bold text-gray-900">{{ formatDuration(totalTime) }}</div>
      </div>

      <div class="flex items-end justify-between gap-1 h-32">
        <div
          v-for="day in dailyData"
          :key="day.date.toISOString()"
          class="flex-1 flex flex-col items-center gap-1 group h-full"
        >
          <div class="relative w-full flex items-end" style="height: 120px">
            <div
              v-if="day.totalTime > 0"
              class="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all hover:from-purple-600 hover:to-purple-500 cursor-pointer relative"
              :style="{ height: Math.max(day.percentage, 3) + '%' }"
              :title="`${formatDayLabel(day.date)}: ${formatDuration(day.totalTime)}`"
            >
              <!-- Tooltip on hover -->
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10"
              >
                {{ formatDuration(day.totalTime) }}
              </div>
            </div>
          </div>
          <div class="text-xs text-gray-600 font-medium mt-1">
            {{ formatDayLabel(day.date) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Tickets Summary -->
    <div v-if="ticketGroups.length === 0" class="text-center py-12">
      <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
        <Icon name="clock" class="w-8 h-8 text-gray-400" />
      </div>
      <p class="text-gray-500 font-semibold">No time entries in this period</p>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="group in ticketGroups"
        :key="group.description"
        class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-3 h-3 rounded-full flex-shrink-0" :style="{ backgroundColor: group.color }"></div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-gray-900 truncate">{{ group.description }}</div>
              <div class="text-sm text-gray-500">{{ group.projectName }}</div>
            </div>
          </div>
          <div class="text-right ml-4 flex-shrink-0">
            <div class="font-bold text-gray-900">{{ formatDuration(group.totalTime) }}</div>
            <div class="text-sm text-gray-500">{{ group.count }} {{ group.count === 1 ? 'entry' : 'entries' }}</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-3">
          <div
            class="h-1.5 rounded-full transition-all"
            :style="{
              width: `${(group.totalTime / totalTime) * 100}%`,
              backgroundColor: group.color,
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDb } from '../composables/useDb';
import { useTimer } from '../composables/useTimer';
import { useProjectHelpers } from '../composables/utils';
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addWeeks,
  addMonths,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import Icon from '../components/ui/Icon.vue';

const db = useDb();
const { formatDuration, getElapsedTime } = useTimer();
const { getProjectName, getProjectColor } = useProjectHelpers();

const period = ref<'week' | 'month'>('week');
const currentOffset = ref(0);

const periodRange = computed(() => {
  const now = new Date();
  const baseDate = period.value === 'week' ? addWeeks(now, currentOffset.value) : addMonths(now, currentOffset.value);

  const start =
    period.value === 'week'
      ? startOfWeek(baseDate, { weekStartsOn: 1 }) // Monday
      : startOfMonth(baseDate);

  const end = period.value === 'week' ? endOfWeek(baseDate, { weekStartsOn: 1 }) : endOfMonth(baseDate);

  return { start, end };
});

const periodLabel = computed(() => {
  const { start, end } = periodRange.value;

  if (period.value === 'week') {
    // Check if it's current week
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    if (start.toDateString() === currentWeekStart.toDateString()) {
      return 'This Week';
    }

    const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startMonth} - ${endMonth}`;
  } else {
    // Check if it's current month
    const now = new Date();
    if (start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear()) {
      return 'This Month';
    }

    return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
});

const canNavigateForward = computed(() => {
  return currentOffset.value < 0;
});

function navigatePeriod(direction: number) {
  if (direction > 0 && !canNavigateForward.value) return;
  currentOffset.value += direction;
}

// Fetch time entries for the current period
const { data: allTimeEntries } = db.getAllTimeEntries(0, 1000);

const periodEntries = computed(() => {
  const { start, end } = periodRange.value;
  return (allTimeEntries.value || []).filter((entry) => {
    if (!entry.endTime) return false; // Exclude active entries
    const entryDate = new Date(entry.startTime);
    return entryDate >= start && entryDate <= end;
  });
});

const totalTime = computed(() => {
  return periodEntries.value.reduce((total, entry) => {
    return total + getElapsedTime(entry);
  }, 0);
});

const ticketGroups = computed(() => {
  const groups = new Map<
    string,
    {
      description: string;
      projectName: string;
      color: string;
      totalTime: number;
      count: number;
    }
  >();

  periodEntries.value.forEach((entry) => {
    const key = `${entry.description}-${entry.project}`;

    if (!groups.has(key)) {
      groups.set(key, {
        description: entry.description,
        projectName: getProjectName(entry.project),
        color: getProjectColor(entry.project),
        totalTime: 0,
        count: 0,
      });
    }

    const group = groups.get(key)!;
    group.totalTime += getElapsedTime(entry);
    group.count++;
  });

  // Sort by total time descending
  return Array.from(groups.values()).sort((a, b) => b.totalTime - a.totalTime);
});

const dailyData = computed(() => {
  const { start, end } = periodRange.value;
  const days = eachDayOfInterval({ start, end });

  const dailyTotals = days.map((day) => {
    const dayEntries = periodEntries.value.filter((entry) => isSameDay(new Date(entry.startTime), day));

    const totalTime = dayEntries.reduce((total, entry) => {
      return total + getElapsedTime(entry);
    }, 0);

    return { date: day, totalTime };
  });

  // Find max time in this period only
  const maxTime = Math.max(...dailyTotals.map((d) => d.totalTime), 0);

  return dailyTotals.map((day) => ({
    ...day,
    percentage: maxTime > 0 ? (day.totalTime / maxTime) * 100 : 0,
  }));
});

function formatDayLabel(date: Date) {
  if (period.value === 'week') {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  } else {
    return date.getDate().toString();
  }
}
</script>

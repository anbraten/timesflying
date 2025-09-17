<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
      <Icon name="download" class="w-5 h-5" />
      Export Data
    </h3>

    <form @submit.prevent="exportData" class="space-y-4">
      <!-- Date Range Selection -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1"> Start Date </label>
          <input
            id="startDate"
            v-model="startDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1"> End Date </label>
          <input
            id="endDate"
            v-model="endDate"
            type="date"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Quick Date Range Buttons -->
      <div class="flex flex-wrap gap-2">
        <Button type="button" variant="ghost" @click="setDateRange('today')" class="text-sm"> Today </Button>
        <Button type="button" variant="ghost" @click="setDateRange('thisWeek')" class="text-sm"> This Week </Button>
        <Button type="button" variant="ghost" @click="setDateRange('thisMonth')" class="text-sm"> This Month </Button>
        <Button type="button" variant="ghost" @click="setDateRange('lastMonth')" class="text-sm"> Last Month </Button>
        <Button type="button" variant="ghost" @click="setDateRange('thisYear')" class="text-sm"> This Year </Button>
      </div>

      <!-- Preview Info -->
      <div v-if="previewInfo" class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-medium text-gray-800 mb-2">Export Preview</h4>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>• Date range: {{ formatDate(new Date(startDate)) }} to {{ formatDate(new Date(endDate)) }}</li>
          <li>• Total entries: {{ previewInfo.totalEntries }}</li>
          <li>• Total duration: {{ formatDuration(previewInfo.totalDuration) }}</li>
        </ul>
      </div>

      <!-- Export Button -->
      <div class="flex gap-3">
        <Button type="button" variant="ghost" @click="loadPreview" :disabled="!startDate || !endDate || loading">
          <Icon name="eye" class="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button type="submit" variant="primary" :disabled="!startDate || !endDate || loading" class="flex-1">
          <Icon name="download" class="w-4 h-4 mr-2" />
          {{ loading ? 'Exporting...' : 'Export as JSON' }}
        </Button>
      </div>
    </form>

    <!-- Error Message -->
    <div v-if="error" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-700 text-sm">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDb } from '../composables/useDb';
import Button from './ui/Button.vue';
import Icon from './ui/Icon.vue';

const db = useDb();

// Form state
const startDate = ref('');
const endDate = ref('');
const loading = ref(false);
const error = ref('');
const previewInfo = ref<{
  totalEntries: number;
  totalDuration: number;
} | null>(null);

// Set default date range to current month
const now = new Date();
const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

startDate.value = firstDayOfMonth.toISOString().split('T')[0];
endDate.value = lastDayOfMonth.toISOString().split('T')[0];

function setDateRange(range: 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear') {
  const today = new Date();

  switch (range) {
    case 'today':
      startDate.value = today.toISOString().split('T')[0];
      endDate.value = today.toISOString().split('T')[0];
      break;

    case 'thisWeek':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      startDate.value = startOfWeek.toISOString().split('T')[0];
      endDate.value = endOfWeek.toISOString().split('T')[0];
      break;

    case 'thisMonth':
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      startDate.value = firstDay.toISOString().split('T')[0];
      endDate.value = lastDay.toISOString().split('T')[0];
      break;

    case 'lastMonth':
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

      startDate.value = firstDayLastMonth.toISOString().split('T')[0];
      endDate.value = lastDayLastMonth.toISOString().split('T')[0];
      break;

    case 'thisYear':
      const firstDayYear = new Date(today.getFullYear(), 0, 1);
      const lastDayYear = new Date(today.getFullYear(), 11, 31);

      startDate.value = firstDayYear.toISOString().split('T')[0];
      endDate.value = lastDayYear.toISOString().split('T')[0];
      break;
  }

  // Clear preview when date range changes
  previewInfo.value = null;
}

async function loadPreview() {
  if (!startDate.value || !endDate.value) return;

  try {
    loading.value = true;
    error.value = '';

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    const entries = await db.getTimeEntriesInRange(start, end);

    const totalDuration = entries.reduce((total, entry) => {
      if (entry.endTime) {
        return total + (entry.endTime.getTime() - entry.startTime.getTime());
      }
      return total;
    }, 0);

    previewInfo.value = {
      totalEntries: entries.length,
      totalDuration,
    };
  } catch (err) {
    error.value = 'Failed to load preview data';
    console.error('Preview error:', err);
  } finally {
    loading.value = false;
  }
}

async function exportData() {
  if (!startDate.value || !endDate.value) return;

  try {
    loading.value = true;
    error.value = '';

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999); // Include the entire end date

    if (start > end) {
      error.value = 'Start date must be before end date';
      return;
    }

    const jsonData = await db.exportTimeEntriesAsJson(start, end);

    // Create and download the file
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const filename = `timesflying-export-${startDate.value}-to-${endDate.value}.json`;
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  } catch (err) {
    error.value = 'Failed to export data. Please try again.';
    console.error('Export error:', err);
  } finally {
    loading.value = false;
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
</script>

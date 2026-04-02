<template>
  <div class="bg-white shadow-sm border border-gray-100 rounded-2xl p-6">
    <h3 class="font-semibold text-gray-900 mb-4">Export Data</h3>

    <form @submit.prevent="exportRange" class="space-y-4">
      <!-- Quick Date Range Chips -->
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="range in dateRanges"
          :key="range.key"
          type="button"
          @click="setDateRange(range.key)"
          class="px-3 py-1 text-xs font-medium rounded-full border transition-colors cursor-pointer
                 border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50"
        >
          {{ range.label }}
        </button>
      </div>

      <!-- Date Range Inputs -->
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="startDate" class="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">From</label>
          <input
            id="startDate"
            v-model="startDate"
            type="date"
            required
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label for="endDate" class="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">To</label>
          <input
            id="endDate"
            v-model="endDate"
            type="date"
            required
            class="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Preview Info -->
      <div v-if="previewInfo" class="flex items-center gap-4 px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-600">
        <span>{{ previewInfo.totalEntries }} entries</span>
        <span class="text-gray-300">·</span>
        <span>{{ formatDuration(previewInfo.totalDuration) }} total</span>
        <span class="text-gray-300">·</span>
        <span>{{ formatDate(new Date(startDate)) }} – {{ formatDate(new Date(endDate)) }}</span>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <Button type="button" variant="ghost" @click="loadPreview" :disabled="!startDate || !endDate || loading">
          <Icon name="eye" class="w-4 h-4 mr-1.5" />
          Preview
        </Button>
        <Button type="submit" variant="primary" :disabled="!startDate || !endDate || loading" class="flex-1">
          <Icon name="download" class="w-4 h-4 mr-1.5" />
          {{ loading ? 'Exporting…' : 'Export as JSON' }}
        </Button>
      </div>
    </form>

    <div v-if="exportError" class="mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
      <p class="text-red-700 text-sm">{{ exportError }}</p>
    </div>

    <!-- Backup & Restore (secondary) -->
    <details class="group mt-5">
      <summary class="cursor-pointer list-none flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 select-none">
        <Icon name="chevron-right" class="w-3 h-3 transition-transform group-open:rotate-90" />
        Backup &amp; Restore
      </summary>

      <div class="mt-3 space-y-2">
        <input ref="fileInputRef" type="file" accept=".json,application/json" class="hidden" @change="onFileSelected" />
        <div class="flex gap-2">
          <Button type="button" variant="ghost" @click="exportAll" :disabled="loading" class="flex-1 text-sm">
            <Icon name="download" class="w-4 h-4 mr-1.5" />
            Export All
          </Button>
          <Button type="button" variant="ghost" @click="fileInputRef?.click()" :disabled="loading" class="flex-1 text-sm">
            <Icon name="upload" class="w-4 h-4 mr-1.5" />
            {{ loading ? 'Importing…' : 'Import' }}
          </Button>
        </div>
        <div v-if="importResult" class="px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
          <p class="text-green-700 text-sm">Imported {{ importResult.timeEntries }} entries and {{ importResult.projects }} projects.</p>
        </div>
        <div v-if="importError" class="px-3 py-2 bg-red-50 border border-red-200 rounded-xl">
          <p class="text-red-700 text-sm">{{ importError }}</p>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { useExportImport } from '../composables/useExportImport';
import Button from './ui/Button.vue';
import Icon from './ui/Icon.vue';

const {
  loading,
  exportError,
  importError,
  previewInfo,
  importResult,
  startDate,
  endDate,
  setDateRange,
  loadPreview,
  exportRange,
  exportAll,
  importFile,
} = useExportImport();

const fileInputRef = useTemplateRef<HTMLInputElement>('fileInputRef');

const dateRanges = [
  { key: 'today', label: 'Today' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'thisYear', label: 'This Year' },
] as const;

async function onFileSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  await importFile(file);
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDuration(milliseconds: number): string {
  const hours = Math.floor(milliseconds / (1000 * 60 * 60));
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}
</script>

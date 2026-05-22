import { ref } from 'vue';
import { useDb } from './useDb';
import { subBusinessDays } from 'date-fns'

function downloadJson(json: string, filename: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function useExportImport() {
  const db = useDb();

  const loading = ref(false);
  const exportError = ref('');
  const importError = ref('');
  const previewInfo = ref<{ totalEntries: number; totalDuration: number } | null>(null);
  const importResult = ref<{ timeEntries: number; projects: number } | null>(null);

  const now = new Date();
  const startDate = ref(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]);
  const endDate = ref(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]);

  function setDateRange(range: 'previous workday' | 'today' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear') {
    const today = new Date();

    switch (range) {
      case 'today':
        startDate.value = today.toISOString().split('T')[0];
        endDate.value = today.toISOString().split('T')[0];
        break;
      case 'previous workday':
        const previousWorkday = subBusinessDays (today, 1)
        startDate.value = previousWorkday.toISOString().split('T')[0];
        endDate.value = previousWorkday.toISOString().split('T')[0];
        break;
      case 'thisWeek': {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        startDate.value = start.toISOString().split('T')[0];
        endDate.value = end.toISOString().split('T')[0];
        break;
      }
      case 'thisMonth': {
        startDate.value = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        endDate.value = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      }
      case 'lastMonth': {
        startDate.value = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
        endDate.value = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
        break;
      }
      case 'thisYear': {
        startDate.value = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate.value = new Date(today.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
      }
    }

    previewInfo.value = null;
  }

  async function loadPreview() {
    if (!startDate.value || !endDate.value) return;

    try {
      loading.value = true;
      exportError.value = '';

      const start = new Date(startDate.value);
      const end = new Date(endDate.value);
      end.setHours(23, 59, 59, 999);

      const entries = await db.getTimeEntriesInRange(start, end);
      const totalDuration = entries.reduce((total, entry) => {
        if (entry.endTime) return total + (entry.endTime.getTime() - entry.startTime.getTime());
        return total;
      }, 0);

      previewInfo.value = { totalEntries: entries.length, totalDuration };
    } catch (err) {
      exportError.value = 'Failed to load preview data';
      console.error('Preview error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function exportRange() {
    if (!startDate.value || !endDate.value) return;

    const start = new Date(startDate.value);
    const end = new Date(endDate.value);
    end.setHours(23, 59, 59, 999);

    if (start > end) {
      exportError.value = 'Start date must be before end date';
      return;
    }

    try {
      loading.value = true;
      exportError.value = '';

      const json = await db.exportTimeEntriesAsJson(start, end);
      downloadJson(json, `timesflying-export-${startDate.value}-to-${endDate.value}.json`);
    } catch (err) {
      exportError.value = 'Failed to export data. Please try again.';
      console.error('Export error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function exportAll() {
    try {
      loading.value = true;
      exportError.value = '';

      const json = await db.exportAllAsJson();
      const today = new Date().toISOString().split('T')[0];
      downloadJson(json, `timesflying-export-all-${today}.json`);
    } catch (err) {
      exportError.value = 'Failed to export data. Please try again.';
      console.error('Export error:', err);
    } finally {
      loading.value = false;
    }
  }

  async function importFile(file: File) {
    try {
      loading.value = true;
      importError.value = '';
      importResult.value = null;

      const text = await file.text();
      importResult.value = await db.importFromJson(text);
    } catch (err) {
      importError.value = err instanceof Error ? err.message : 'Failed to import file. Please check the file format.';
      console.error('Import error:', err);
    } finally {
      loading.value = false;
    }
  }

  return {
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
  };
}

import { ref, onUnmounted, onMounted, computed } from 'vue';
import type { TimeEntry } from '../types';
import { toDate } from './utils';

export function useTimer() {
  const currentTime = ref(new Date());
  let interval: number | null = null;

  onMounted(() => {
    if (interval) return;

    interval = setInterval(() => {
      currentTime.value = new Date();
    }, 1000);
  });

  onUnmounted(() => {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  });

  function getElapsedTime(entry: TimeEntry): number {
    const startTime = toDate(entry.startTime);
    const endTime = entry.endTime ? toDate(entry.endTime) : currentTime.value;
    return Math.max(endTime.getTime() - startTime.getTime(), 0);
  }

  function formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return [formatNumber(hours), formatNumber(minutes % 60), formatNumber(seconds % 60)].join(':');
  }

  return {
    currentTime: computed(() => currentTime.value),
    getElapsedTime,
    formatDuration,
  };
}

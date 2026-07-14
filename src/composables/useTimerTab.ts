import { watch } from 'vue';
import { useTimeTracking } from './useTimeTracking';
import { useTimer } from './useTimer';

const makeFavicon = (badge: boolean) => {
  const dot = badge
    ? `<circle cx="15" cy="15" r="4.5" fill="white"/><circle cx="15" cy="15" r="3.5" fill="#ef4444"/>`
    : '';
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">` +
    `<circle cx="10" cy="10" r="10" fill="#3b82f6"/>` +
    `<path fill="white" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>` +
    dot +
    `</svg>`,
  )}`;
};

const FAVICON_IDLE = makeFavicon(false);
const FAVICON_RUNNING = makeFavicon(true);

export function useTimerTab() {
  const { activeEntry } = useTimeTracking();
  const { currentTime, getElapsedTime, formatDuration } = useTimer();

  watch(
    [activeEntry, currentTime],
    ([entry]) => {
      document.title = entry
        ? `${formatDuration(getElapsedTime(entry))} · Time's flying`
        : "Time's flying";

      const el = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (el) el.href = entry ? FAVICON_RUNNING : FAVICON_IDLE;
    },
    { immediate: true },
  );
}

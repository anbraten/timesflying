import type { TimeEntry } from '../types';
import { useDb } from './useDb';

export function useTimeTracking() {
  const db = useDb();

  const { data: activeEntry } = db.getActiveTimeEntry();

  async function startNewTimeEntry(description: string, project: number) {
    // Stop any active entry first
    if (activeEntry.value) {
      stopActiveTimeEntry();
    }

    const newEntry: TimeEntry = {
      id: Date.now(),
      startTime: new Date(),
      description,
      project,
      isPinned: false,
    };

    await db.timeEntries.add(newEntry);
  }

  async function stopActiveTimeEntry() {
    if (!activeEntry.value) return;

    await db.timeEntries.update(activeEntry.value.id, {
      endTime: new Date(),
    });
  }

  async function continueTimeEntry(entryId: number) {
    const entry = await db.timeEntries.get(entryId);
    if (!entry) return;

    startNewTimeEntry(entry.description, entry.project);
  }

  async function togglePinTimeEntry(entryId: number) {
    const entry = await db.timeEntries.get(entryId);
    if (!entry) throw new Error('Entry not found');

    await db.timeEntries.update(entryId, {
      isPinned: !entry.isPinned,
    });
  }

  async function deleteTimeEntry(entryId: number) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    await db.timeEntries.delete(entryId);
  }

  async function updateTimeEntry(entryId: number, updates: Partial<TimeEntry>) {
    await db.timeEntries.update(entryId, updates);
  }

  return {
    activeEntry,
    startNewTimeEntry,
    stopActiveTimeEntry,
    continueTimeEntry,
    togglePinTimeEntry,
    deleteTimeEntry,
    updateTimeEntry,
  };
}

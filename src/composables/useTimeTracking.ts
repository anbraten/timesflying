import { computed } from 'vue';
import type { TimeEntry, Project } from '../types';
import { useDb } from './usDb';

export function useTimeTracking() {
  const db = useDb();

  const projects = computed<Project[]>(() => [{ id: '1', name: 'Meetings', color: '#FF5733' }]);

  const { data: activeEntry } = db.getActiveTimeEntry();
  const { data: pinnedEntries } = db.getPinnedTimeEntries();
  const { data: recentDescriptions } = db.searchTimeEntries('', 10);
  const { data: lastProject } = db.lastProject();

  async function startNewTimeEntry(description: string, project: string) {
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

  return {
    getAllTimeEntries: db.getAllTimeEntries,
    projects,
    activeEntry,
    pinnedEntries,
    recentDescriptions,
    lastProject,
    startNewTimeEntry,
    stopActiveTimeEntry,
    continueTimeEntry,
    togglePinTimeEntry,
    deleteTimeEntry,
  };
}

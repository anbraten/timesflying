import { computed } from 'vue';
import type { TimeEntry, Project } from '../types';
import { useDb } from './usDb';

export function useTimeTracking() {
  const db = useDb();

  const projects = computed<Project[]>(() => [{ id: '1', name: 'Meetings', color: '#FF5733' }]);

  const { data: timeEntries } = db.getAllEntries();
  const { data: activeEntry } = db.getActiveEntry();
  const { data: pinnedEntries } = db.getPinnedEntries();
  const { data: recentDescriptions } = db.searchEntries('', 10);
  const { data: lastProject } = db.lastProject();

  async function startNewEntry(description: string, project: string) {
    // Stop any active entry first
    if (activeEntry.value) {
      stopActiveEntry();
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

  async function stopActiveEntry() {
    if (!activeEntry.value) return;

    await db.timeEntries.update(activeEntry.value.id, {
      endTime: new Date(),
    });
  }

  async function continueEntry(entryId: number) {
    const entry = await db.timeEntries.get(entryId);
    if (!entry) return;

    startNewEntry(entry.description, entry.project);
  }

  async function togglePinEntry(entryId: number) {
    const entry = await db.timeEntries.get(entryId);
    if (!entry) throw new Error('Entry not found');

    await db.timeEntries.update(entryId, {
      isPinned: !entry.isPinned,
    });
  }

  async function deleteEntry(entryId: number) {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    await db.timeEntries.delete(entryId);
  }

  return {
    timeEntries,
    projects,
    activeEntry,
    pinnedEntries,
    recentDescriptions,
    lastProject,
    startNewEntry,
    stopActiveEntry,
    continueEntry,
    togglePinEntry,
    deleteEntry,
  };
}

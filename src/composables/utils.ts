import { useDb } from './useDb';

export function toDate(value: Date | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export function formatTime(date: Date | number) {
  return toDate(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function useProjectHelpers() {
  const db = useDb();
  const { data: projects } = db.getProjects();

  function getProjectName(projectId: number) {
    return projects.value?.find((p) => p.id === projectId)?.name || 'Unknown';
  }

  function getProjectColor(projectId: number) {
    return projects.value?.find((p) => p.id === projectId)?.color || '#6b7280';
  }

  return {
    getProjectName,
    getProjectColor,
  };
}

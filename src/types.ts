export interface TimeEntry {
  id: number;
  startTime: Date;
  endTime?: Date;
  description: string;
  project: number;
  isPinned: boolean;
}

export interface Project {
  id: number;
  name: string;
  color: string;
}
